import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, ChevronRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'drawer';
  onInstalledOrAction?: () => void;
}

const APP_LOGO_ICON = '/pwa-192x192.png';

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'banner',
  onInstalledOrAction,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Auto-hide once launched as an installed standalone app
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      onInstalledOrAction?.();
      return;
    }
    setShowGuideModal(true);
  };

  const renderModal = () =>
    showGuideModal && (
      <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={APP_LOGO_ICON}
                alt="NutriScientia Logo"
                className="w-11 h-11 rounded-2xl object-cover border border-emerald-200 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-display font-bold text-sm text-slate-900 truncate">
                  {isIOS ? 'Install NutriScientia on iPhone' : 'Download NutriScientia App'}
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  Install with NutriScientia icon &amp; full-screen mode
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Close install guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isIOS ? (
            <ol className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <Share className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Tap the <strong>Share</strong> button in your Safari toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <PlusSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                </span>
              </li>
            </ol>
          ) : (
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p>
                Install <strong>NutriScientia</strong> directly onto your phone or computer with its app icon and standalone window:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                <li>
                  <strong>Android Chrome / Edge:</strong> Tap browser menu (<strong>⋮</strong>) → <strong>Install app</strong> (or <strong>Add to Home screen</strong>).
                </li>
                <li>
                  <strong>Desktop Chrome / Edge:</strong> Click the <strong>Install</strong> icon on the right side of the address bar.
                </li>
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowGuideModal(false)}
            className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    );

  if (variant === 'drawer') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full min-h-[56px] px-3 py-2.5 flex items-center justify-between gap-3 rounded-xl hover:bg-emerald-50/70 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={APP_LOGO_ICON}
              alt="NutriScientia"
              className="w-9 h-9 rounded-xl object-cover border border-emerald-200/80 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900">Install NutriScientia App</div>
              <div className="text-[11px] text-slate-500 truncate">
                {isInstallable
                  ? 'One-tap install with logo'
                  : isIOS
                  ? 'Safari Add to Home Screen'
                  : 'Download for mobile & desktop'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
        {renderModal()}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-xs transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={APP_LOGO_ICON}
            alt="NutriScientia App Icon"
            className="w-10 h-10 rounded-xl object-cover border border-white/15 bg-white shrink-0"
          />
          <div className="text-left min-w-0">
            <div className="font-display font-bold text-xs text-white truncate">
              {isIOS
                ? 'Download NutriScientia on iPhone'
                : 'Download NutriScientia App'}
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {isInstallable
                ? 'Tap to install with NutriScientia icon & name'
                : 'Install as a full-screen standalone app'}
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500 text-slate-950 px-2.5 py-1.5 rounded-xl shrink-0">
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </span>
      </button>
      {renderModal()}
    </>
  );
};
