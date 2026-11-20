import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Zap,
  ZapOff,
  Image as ImageIcon,
  RefreshCw,
  Scan,
  Camera,
  Upload,
} from 'lucide-react';
import { ScreenId } from '../../types/food';
import biryaniSampleImg from '../../assets/images/cat_rice_biryanis_1794835955488.jpg';
import dosaSampleImg from '../../assets/images/cat_breakfast_tiffin_1794835953916.jpg';
import bowlSampleImg from '../../assets/images/cat_global_bowls_1794891500484.jpg';
import saladSampleImg from '../../assets/images/cat_salads_vegetables_1794891501340.jpg';

interface CaptureScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onImageCaptured: (imageFile?: File, previewUrl?: string, hintName?: string) => void;
}

const SAMPLE_VIEWFINDER_MEALS = [
  {
    name: 'Masala Dosa',
    url: dosaSampleImg,
  },
  {
    name: 'Salmon Poke Rice Bowl',
    url: bowlSampleImg,
  },
  {
    name: 'Classic Greek Village Salad',
    url: saladSampleImg,
  },
  {
    name: 'Paneer Biryani',
    url: biryaniSampleImg,
  },
];

function compressImageToDataUrl(file: File, maxDim = 720): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const resultUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(resultUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.74));
      };
      img.onerror = () => resolve(resultUrl);
      img.src = resultUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const CaptureScreen: React.FC<CaptureScreenProps> = ({
  onNavigate,
  onImageCaptured,
}) => {
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasLiveCamera, setHasLiveCamera] = useState(false);
  const [cameraChecking, setCameraChecking] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashPulse, setFlashPulse] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopCamera();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasLiveCamera(false);
      setCameraChecking(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setHasLiveCamera(true);
      setCameraChecking(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setHasLiveCamera(false);
      setCameraChecking(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, [facingMode, startCamera, stopCamera]);

  useEffect(() => {
    if (hasLiveCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [hasLiveCamera]);

  const handleShutterClick = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setFlashPulse(true);

    setTimeout(() => {
      setFlashPulse(false);
    }, 220);

    setTimeout(() => {
      if (hasLiveCamera && videoRef.current && videoRef.current.videoWidth > 0) {
        const video = videoRef.current;
        const maxDim = 720;
        const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
        const width = Math.max(1, Math.round(video.videoWidth * scale));
        const height = Math.max(1, Math.round(video.videoHeight * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.74);
          canvas.toBlob(
            (blob) => {
              const file = blob
                ? new File([blob], `food_scan_${Date.now()}.jpg`, { type: 'image/jpeg' })
                : undefined;
              stopCamera();
              setIsCapturing(false);
              onImageCaptured(file, dataUrl);
            },
            'image/jpeg',
            0.74
          );
          return;
        }
      }

      // Fallback when camera hardware/permission isn't available in preview
      const sample = SAMPLE_VIEWFINDER_MEALS[sampleIndex];
      stopCamera();
      setIsCapturing(false);
      onImageCaptured(undefined, sample.url, sample.name);
    }, 140);
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsCapturing(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, 720);
      stopCamera();
      setIsCapturing(false);
      onImageCaptured(file, dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        stopCamera();
        setIsCapturing(false);
        onImageCaptured(file, dataUrl || undefined);
      };
      reader.onerror = () => {
        stopCamera();
        setIsCapturing(false);
        onImageCaptured(file, undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFlipOrCycle = () => {
    if (hasLiveCamera) {
      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    } else {
      setSampleIndex((prev) => (prev + 1) % SAMPLE_VIEWFINDER_MEALS.length);
    }
  };

  const activeSample = SAMPLE_VIEWFINDER_MEALS[sampleIndex];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white relative h-full">
      {/* Hidden File Input for Gallery or Mobile Camera Capture */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Shutter Flash Effect */}
      {flashPulse && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none opacity-80 transition-opacity" />
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 z-20">
        <button
          onClick={() => {
            stopCamera();
            onNavigate('home');
          }}
          className="w-9 h-9 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/65 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm tracking-wide">Scan Meal</span>
        <button
          onClick={() => setFlashOn(!flashOn)}
          className={`w-9 h-9 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
            flashOn ? 'text-amber-400 bg-amber-400/20' : 'text-white hover:bg-black/65'
          }`}
          title="Toggle Flash"
        >
          {flashOn ? <Zap className="w-4 h-4 fill-amber-400" /> : <ZapOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-5">
        {hasLiveCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={activeSample.url}
            alt={activeSample.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover filter brightness-90 transition-all duration-300"
          />
        )}

        {/* Viewfinder Dark Overlay Vignette */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        {/* Target Bounding Box Brackets */}
        <div className="relative w-64 h-64 border border-white/40 rounded-3xl p-3 flex flex-col justify-between shadow-[0_0_24px_rgba(0,0,0,0.45)]">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

          {/* Scanning animation bar */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse mt-2" />

          <div className="self-center mb-1">
            <div className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg border border-white/15">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {cameraChecking
                  ? 'Starting camera...'
                  : hasLiveCamera
                  ? 'Center food inside frame'
                  : `Sample View: ${activeSample.name}`}
              </span>
            </div>
          </div>
        </div>

        {/* Upload CTA when no webcam */}
        {!hasLiveCamera && !cameraChecking && (
          <button
            onClick={handleGalleryClick}
            className="relative z-10 mt-4 px-3.5 py-1.5 rounded-full bg-white/95 text-slate-900 font-bold text-[11px] flex items-center gap-1.5 shadow-lg hover:bg-white transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upload Your Food Photo</span>
          </button>
        )}
      </div>

      {/* Mode Indicator */}
      <div className="flex justify-center pb-3 z-20">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white text-[11px] tracking-wide uppercase">
            {hasLiveCamera ? 'Live Camera Ready' : 'Tap Shutter or Upload'}
          </span>
        </div>
      </div>

      {/* Bottom Shutter & Gallery Controls */}
      <div className="px-8 pb-8 pt-2 flex items-center justify-between z-20">
        {/* Gallery Upload Button */}
        <button
          onClick={handleGalleryClick}
          className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center text-white hover:bg-black/65 transition-transform active:scale-95 cursor-pointer"
          title="Upload food photo from device"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Big Circular Shutter Button */}
        <button
          onClick={handleShutterClick}
          disabled={isCapturing}
          aria-label="Capture food photo"
          className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-full bg-white group-hover:scale-95 transition-transform flex items-center justify-center shadow-lg">
            {isCapturing && <Scan className="w-6 h-6 text-emerald-600 animate-spin" />}
          </div>
        </button>

        {/* Camera Flip / Next Sample Button */}
        <button
          onClick={handleFlipOrCycle}
          className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-black/65 transition-transform active:scale-95 cursor-pointer"
          title={hasLiveCamera ? 'Flip camera' : 'Switch sample food'}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
