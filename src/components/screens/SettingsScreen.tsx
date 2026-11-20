import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Building2,
  ChevronRight,
  Info,
  KeyRound,
  LogIn,
  LogOut,
  Moon,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { AppSettings, NotificationPreferences, ScreenId, UserProfile } from '../../types/food';
import { dispatchAppNotification } from '../../services/settingsService';
import { getInitials } from '../../services/userStorageService';

interface SettingsScreenProps {
  profile: UserProfile;
  settings: AppSettings;
  isSignedIn: boolean;
  authEmail?: string | null;
  onNavigate: (screen: ScreenId) => void;
  onUpdateSettings: (next: AppSettings) => Promise<void>;
  onSendPasswordReset: (email: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onResetGuestSession: () => void;
}

interface ToggleRowMeta {
  key: keyof NotificationPreferences;
  label: string;
  desc: string;
}

const NOTIFICATION_ROWS: ToggleRowMeta[] = [
  {
    key: 'foodAnalysisAlerts',
    label: 'Food Analysis Alerts',
    desc: 'Alert when meal photo or dish scans complete.',
  },
  {
    key: 'foodLabNotifications',
    label: 'Food Lab Notifications',
    desc: 'Notify when virtual compatibility experiments finish.',
  },
  {
    key: 'reportNotifications',
    label: 'Report Notifications',
    desc: 'Confirm when PDF meal or FoodLab reports download.',
  },
  {
    key: 'appUpdates',
    label: 'Application Updates',
    desc: 'Notify when new NutriScientia PWA updates or offline assets are ready.',
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  settings,
  isSignedIn,
  authEmail,
  onNavigate,
  onUpdateSettings,
  onSendPasswordReset,
  onClearHistory,
  onSignOut,
  onResetGuestSession,
}) => {
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    const next: AppSettings = {
      ...settings,
      theme,
    };
    await onUpdateSettings(next);
    setStatusFeedback(`Switched to ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'}.`);
  };

  const handleToggleNotification = async (key: keyof NotificationPreferences) => {
    const nextVal = !settings.notifications[key];
    const next: AppSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: nextVal,
      },
    };
    await onUpdateSettings(next);

    if (
      nextVal &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().catch(() => {});
    }
  };

  const handlePasswordRecovery = async () => {
    const targetEmail = (authEmail || profile.email || '').trim();
    if (!targetEmail || targetEmail.endsWith('.local')) {
      onNavigate('auth');
      return;
    }

    setIsBusy(true);
    try {
      await onSendPasswordReset(targetEmail);
      setStatusFeedback(`Password recovery link sent to ${targetEmail}.`);
    } catch {
      onNavigate('auth');
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogoutOrReset = async () => {
    setIsBusy(true);
    try {
      if (isSignedIn) {
        await onSignOut();
        setStatusFeedback('Logged out successfully.');
      } else {
        onResetGuestSession();
        setStatusFeedback('Guest session reset on this device.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="font-display font-bold text-sm text-slate-900 leading-tight">
            Application Settings
          </h1>
          <p className="text-[11px] text-slate-500">Preferences, Alerts &amp; Security</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('about')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          aria-label="About NutriScientia"
          title="About"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {statusFeedback && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-medium text-emerald-900 flex items-center justify-between gap-2">
            <span>{statusFeedback}</span>
            <button
              type="button"
              onClick={() => setStatusFeedback(null)}
              className="text-emerald-700 font-bold text-[11px] cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {/* 01: Profile & Account */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            01 · Profile &amp; Account
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-200 bg-emerald-50 shrink-0 flex items-center justify-center">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center">
                  {getInitials(profile.name || 'User')}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 truncate">{profile.name}</div>
              <div className="text-xs text-slate-500 truncate">
                {authEmail || profile.email}
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                {isSignedIn ? 'Signed In Account' : 'Local Device Profile'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="min-h-[42px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="min-h-[42px] px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isSignedIn ? 'Account Status' : 'Sign In / Sign Up'}</span>
            </button>
          </div>
        </section>

        {/* 02: Appearance (Light / Dark Mode) */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            02 · Appearance &amp; Theme
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`min-h-[58px] p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  settings.theme === 'light'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs">Light Mode</div>
                <div className="text-[10px] opacity-75">Daylight clarity</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`min-h-[58px] p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/25 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  settings.theme === 'dark'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs">Dark Mode</div>
                <div className="text-[10px] opacity-75">Low-light comfort</div>
              </div>
            </button>
          </div>
        </section>

        {/* 03: Notification Toggles */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>03 · Notifications</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const fired = dispatchAppNotification({
                  category: 'appUpdates',
                  title: 'NutriScientia Alerts Active',
                  message: 'Preferences saved. Active notification categories will alert you here.',
                });
                if (!fired) {
                  setStatusFeedback(
                    'Application Updates toggle is OFF — turn it ON to preview live notifications.'
                  );
                }
              }}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Test Alert
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {NOTIFICATION_ROWS.map((row) => {
              const enabled = settings.notifications[row.key];
              return (
                <div key={row.key} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900">{row.label}</div>
                    <div className="text-[11px] text-slate-500 leading-snug">{row.desc}</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={row.label}
                    onClick={() => handleToggleNotification(row.key)}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                      enabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 04: Privacy & Security */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>04 · Privacy &amp; Security</span>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Client-Side Secret Exposure</span>
            </div>
            <p className="leading-relaxed">
              Gemini API keys and SMTP email credentials are restricted to backend environment
              variables. Service Worker caches static assets only and excludes private API &amp;
              authentication data.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={handlePasswordRecovery}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>Send Password Recovery Email</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {!confirmClearHistory ? (
              <button
                type="button"
                onClick={() => setConfirmClearHistory(true)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-800 hover:text-rose-700 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Clear Saved Meal History</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ) : (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 space-y-2 text-xs">
                <div className="font-bold text-rose-900">
                  Confirm clearing all saved meal history entries?
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={async () => {
                      setIsBusy(true);
                      try {
                        await onClearHistory();
                        setStatusFeedback('Meal scan history cleared cleanly.');
                      } finally {
                        setIsBusy(false);
                        setConfirmClearHistory(false);
                      }
                    }}
                    className="flex-1 min-h-[38px] rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                  >
                    Yes, Clear History
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearHistory(false)}
                    className="min-h-[38px] px-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 05: About & Logout */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5 shadow-xs">
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className="w-full min-h-[46px] px-3.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-left flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  About NutriScientia · Food Insight AI Virtual Lab
                </div>
                <div className="text-[11px] text-emerald-800 flex items-center gap-1 font-semibold">
                  <Building2 className="w-3 h-3" />
                  <span>Powered by 6 Monkeys Inc.</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={handleLogoutOrReset}
            className="w-full min-h-[46px] px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSignedIn ? 'Logout of NutriScientia' : 'Reset Guest Session'}</span>
          </button>
        </section>
      </div>
    </div>
  );
};
