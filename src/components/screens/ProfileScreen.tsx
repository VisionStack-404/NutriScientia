import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  Mail,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Upload,
  User as UserIcon,
  X,
  Settings,
} from 'lucide-react';
import { ScreenId, UserProfile } from '../../types/food';
import {
  compressDataUrlToSquareAvatar,
  compressFileToSquareAvatar,
  getInitials,
} from '../../services/userStorageService';
import { ALLOWED_DIETARY_PREFERENCES } from '../../services/cloudSyncService';

interface ProfileScreenProps {
  profile: UserProfile;
  isSignedIn: boolean;
  authEmail?: string | null;
  isSyncing: boolean;
  onNavigate: (screen: ScreenId) => void;
  onSaveProfile: (updated: UserProfile) => Promise<void>;
  onSignInGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSyncLocalHistory?: () => Promise<number>;
}

const COMMON_ALLERGENS = [
  'Peanut',
  'Milk',
  'Gluten',
  'Soy',
  'Egg',
  'Tree Nuts',
  'Shellfish',
  'Sesame',
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  isSignedIn,
  authEmail,
  isSyncing,
  onNavigate,
  onSaveProfile,
  onSignInGoogle,
  onSignOut,
  onSyncLocalHistory,
}) => {
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [customAllergy, setCustomAllergy] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Camera selfie modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setDraft(profile);
    setAvatarLoadError(false);
  }, [profile]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCameraStream();
  }, []);

  const hasUnsavedChanges =
    draft.name !== profile.name ||
    draft.email !== profile.email ||
    (draft.age ?? null) !== (profile.age ?? null) ||
    (draft.photoUrl ?? null) !== (profile.photoUrl ?? null) ||
    draft.dietaryPreference !== profile.dietaryPreference ||
    JSON.stringify(draft.allergies) !== JSON.stringify(profile.allergies);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const compressed = await compressFileToSquareAvatar(file, 256);
      setAvatarLoadError(false);
      setDraft((prev) => ({ ...prev, photoUrl: compressed }));
      setStatusMessage('Photo updated in draft — tap Save All Changes to apply.');
    } catch {
      setErrorMessage('Could not process the selected image. Please choose a valid JPG or PNG.');
    }
  };

  const openSelfieCamera = async () => {
    setErrorMessage(null);
    setCameraError(null);
    setIsCameraOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError('Camera permission was denied. You can upload a photo from your device instead.');
    }
  };

  const closeSelfieCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const captureSelfiePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 480;
    const height = video.videoHeight || 480;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    try {
      const compressed = await compressDataUrlToSquareAvatar(rawDataUrl, 256);
      setAvatarLoadError(false);
      setDraft((prev) => ({ ...prev, photoUrl: compressed }));
      setStatusMessage('Selfie captured — tap Save All Changes to apply.');
    } catch {
      setErrorMessage('Could not capture photo from camera.');
    } finally {
      closeSelfieCamera();
    }
  };

  const toggleAllergen = (allergen: string) => {
    setErrorMessage(null);
    setDraft((prev) => {
      const exists = prev.allergies.some(
        (item) => item.toLowerCase() === allergen.toLowerCase()
      );
      if (exists) {
        return {
          ...prev,
          allergies: prev.allergies.filter(
            (item) => item.toLowerCase() !== allergen.toLowerCase()
          ),
        };
      }
      if (prev.allergies.length >= 15) {
        setErrorMessage('You can select up to 15 allergies.');
        return prev;
      }
      return {
        ...prev,
        allergies: [...prev.allergies, allergen],
      };
    });
  };

  const handleAddCustomAllergy = () => {
    const trimmed = customAllergy.trim().slice(0, 40);
    if (!trimmed) return;
    setErrorMessage(null);
    if (draft.allergies.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setCustomAllergy('');
      return;
    }
    if (draft.allergies.length >= 15) {
      setErrorMessage('Maximum 15 allergies allowed.');
      return;
    }
    setDraft((prev) => ({
      ...prev,
      allergies: [...prev.allergies, trimmed],
    }));
    setCustomAllergy('');
  };

  const validateAndSave = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    const trimmedName = draft.name.trim();
    const trimmedEmail = draft.email.trim();

    if (!trimmedName || trimmedName.length > 80) {
      setErrorMessage('Please enter your name (1 to 80 characters).');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (draft.age !== null && (draft.age < 1 || draft.age > 120 || !Number.isFinite(draft.age))) {
      setErrorMessage('Age must be between 1 and 120, or left blank.');
      return;
    }

    const safeHealthGoals = draft.healthGoals?.trim() || 'Balanced nutrition';
    const rawCal = Number(draft.calorieTargetPerMeal);
    const safeCalorieTarget =
      Number.isFinite(rawCal) && rawCal >= 100 && rawCal <= 3000 ? Math.round(rawCal) : 600;

    setIsSaving(true);
    try {
      await onSaveProfile({
        ...draft,
        name: trimmedName,
        email: trimmedEmail,
        healthGoals: safeHealthGoals,
        calorieTargetPerMeal: safeCalorieTarget,
      });
      setStatusMessage(
        isSignedIn
          ? 'Profile details, photo & dietary preferences saved to cloud.'
          : 'Profile & dietary preferences saved on this device.'
      );
    } catch {
      setErrorMessage('Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsAuthBusy(true);
    try {
      await onSignInGoogle();
      setStatusMessage('Signed in with Google. Your profile and meal history are now synced.');
    } catch {
      setErrorMessage('Google sign-in was cancelled or blocked. Local mode remains active.');
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleSignOutClick = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsAuthBusy(true);
    try {
      await onSignOut();
      setStatusMessage('Signed out. Switched back to device local storage.');
    } catch {
      setErrorMessage('Could not sign out right now.');
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleSyncLocalClick = async () => {
    if (!onSyncLocalHistory) return;
    setErrorMessage(null);
    setIsAuthBusy(true);
    try {
      const count = await onSyncLocalHistory();
      setStatusMessage(
        count > 0
          ? `Uploaded ${count} local meal scan${count === 1 ? '' : 's'} to your cloud history.`
          : 'Your cloud meal history is already up to date.'
      );
    } catch {
      setErrorMessage('Could not upload local history right now.');
    } finally {
      setIsAuthBusy(false);
    }
  };

  const showPhoto = Boolean(draft.photoUrl && !avatarLoadError);

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70">
      {/* Sticky Screen Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="font-bold text-sm text-slate-900 leading-tight">My Profile</h1>
          <p className="text-[11px] text-slate-500">Account, Photo &amp; Dietary Rules</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
            aria-label="Open Settings"
            title="Application Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="min-h-[44px] px-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            History
          </button>
        </div>
      </div>

      <div className="p-4 pb-8 space-y-5">
        {/* Inline Feedback Banners */}
        {errorMessage && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 flex items-start justify-between gap-2 text-xs text-rose-800">
            <span className="font-medium leading-snug">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-start justify-between gap-2 text-xs text-emerald-800">
            <span className="font-medium leading-snug">{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 1: ACCOUNT & PHOTO */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              01 · Account &amp; Photo
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isSignedIn
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {isSignedIn ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
              {isSyncing ? 'Syncing...' : isSignedIn ? 'Cloud Synced' : 'Device Only'}
            </span>
          </div>

          {/* Avatar & Live Summary */}
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center">
                {showPhoto ? (
                  <img
                    src={draft.photoUrl!}
                    alt={draft.name || 'Profile Photo'}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarLoadError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg flex items-center justify-center">
                    {getInitials(draft.name || 'User')}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={openSelfieCamera}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-sm hover:bg-slate-800 cursor-pointer"
                title="Take Selfie"
                aria-label="Take Selfie"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-base text-slate-900 truncate">
                {draft.name.trim() || 'Your Name'}
              </h2>
              <p className="text-xs text-slate-500 truncate">{draft.email.trim() || 'you@example.com'}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 tabular-nums">
                {draft.dietaryPreference} · {draft.allergies.length} allergen
                {draft.allergies.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Photo Action Buttons */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoFileChange}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[115px] min-h-[44px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <button
              type="button"
              onClick={openSelfieCamera}
              className="flex-1 min-w-[115px] min-h-[44px] px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Selfie</span>
            </button>
            {draft.photoUrl && (
              <button
                type="button"
                onClick={() => {
                  setAvatarLoadError(false);
                  setDraft((prev) => ({ ...prev, photoUrl: null }));
                  setStatusMessage('Photo removed in draft — tap Save All Changes to confirm.');
                }}
                className="min-h-[44px] px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                aria-label="Remove Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {/* Google Cloud Sync Controls */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            {isSignedIn ? (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {authEmail || profile.email}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Backed up automatically to Firestore
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onSyncLocalHistory && (
                    <button
                      type="button"
                      onClick={handleSyncLocalClick}
                      disabled={isAuthBusy}
                      className="min-h-[40px] px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold cursor-pointer disabled:opacity-60"
                    >
                      Sync Local
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOutClick}
                    disabled={isAuthBusy}
                    className="min-h-[40px] px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-600 leading-snug">
                  Sign in or register an account to sync your profile, photo &amp; meal history across devices.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('auth')}
                    className="min-h-[44px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthBusy}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isAuthBusy ? 'Signing in...' : 'Google'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: BASIC INFORMATION */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              02 · Basic Information
            </span>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="profile-name" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name</span>
            </label>
            <input
              id="profile-name"
              type="text"
              value={draft.name}
              maxLength={80}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="profile-email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              id="profile-email"
              type="email"
              value={draft.email}
              maxLength={160}
              onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Age */}
          <div className="space-y-1">
            <label htmlFor="profile-age" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Age (years)</span>
              <span className="text-[11px] font-normal text-slate-400">Optional (1–120)</span>
            </label>
            <input
              id="profile-age"
              type="number"
              min={1}
              max={120}
              value={draft.age ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  setDraft((prev) => ({ ...prev, age: null }));
                  return;
                }
                const parsed = parseInt(raw, 10);
                setDraft((prev) => ({
                  ...prev,
                  age: Number.isNaN(parsed) ? null : parsed,
                }));
              }}
              placeholder="e.g. 26"
              className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        </section>

        {/* SECTION 3: DIETARY REQUIREMENTS */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              03 · Dietary Requirements
            </span>
          </div>

          {/* Dietary Preference Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Dietary Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ALLOWED_DIETARY_PREFERENCES.map((diet) => {
                const active = draft.dietaryPreference === diet;
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, dietaryPreference: diet }))}
                    className={`min-h-[44px] px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies & Restrictions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Allergies</span>
              </label>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {draft.allergies.length}/15 selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGENS.map((allergen) => {
                const selected = draft.allergies.some(
                  (a) => a.toLowerCase() === allergen.toLowerCase()
                );
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`min-h-[36px] px-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected ? `✓ ${allergen}` : allergen}
                  </button>
                );
              })}
            </div>

            {/* Active custom allergies not in common list */}
            {draft.allergies.some(
              (a) => !COMMON_ALLERGENS.some((c) => c.toLowerCase() === a.toLowerCase())
            ) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {draft.allergies
                  .filter(
                    (a) => !COMMON_ALLERGENS.some((c) => c.toLowerCase() === a.toLowerCase())
                  )
                  .map((custom) => (
                    <button
                      key={custom}
                      type="button"
                      onClick={() => toggleAllergen(custom)}
                      className="min-h-[34px] px-2.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{custom}</span>
                      <X className="w-3 h-3" />
                    </button>
                  ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customAllergy}
                maxLength={40}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAllergy();
                  }
                }}
                placeholder="Add custom allergy (e.g. Mustard)"
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={handleAddCustomAllergy}
                className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* UNIFIED SAVE ACTIONS BAR */}
        <div className="sticky bottom-3 z-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 p-3 shadow-lg flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={() => {
                setDraft(profile);
                setErrorMessage(null);
                setStatusMessage('Unsaved edits discarded.');
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}
          <button
            type="button"
            onClick={validateAndSave}
            disabled={isSaving}
            className="flex-1 min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            <span>
              {isSaving
                ? 'Saving Changes...'
                : hasUnsavedChanges
                  ? 'Save All Changes'
                  : 'All Changes Saved'}
            </span>
          </button>
        </div>
      </div>

      {/* Inline Camera Selfie Modal */}
      {isCameraOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col justify-between p-4 text-white">
          <div className="flex items-center justify-between pt-2">
            <h3 className="font-bold text-sm">Take Profile Photo</h3>
            <button
              type="button"
              onClick={closeSelfieCamera}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              aria-label="Close camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-4">
            {cameraError ? (
              <div className="rounded-2xl bg-rose-950/80 border border-rose-500/40 p-4 text-center space-y-3 max-w-xs">
                <p className="text-xs text-rose-100 leading-relaxed">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    closeSelfieCamera();
                    fileInputRef.current?.click();
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-white text-slate-900 text-xs font-bold cursor-pointer"
                >
                  Choose Image Instead
                </button>
              </div>
            ) : (
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-emerald-400 bg-black shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
            )}
          </div>

          {!cameraError && (
            <div className="flex items-center justify-center gap-3 pb-4">
              <button
                type="button"
                onClick={closeSelfieCamera}
                className="min-h-[44px] px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureSelfiePhoto}
                className="min-h-[48px] px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
