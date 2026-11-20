import React, { useEffect, useState } from 'react';
import {
  Camera,
  MessageSquareText,
  FlaskConical,
  User,
  ChevronRight,
  Menu,
  X,
  FileText,
  Info,
  LogOut,
  Cloud,
  CloudOff,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Settings,
  LogIn,
} from 'lucide-react';
import { ScreenId, UserProfile } from '../../types/food';
import { FoodLabScreenStep } from '../../types/foodlab';
import { getInitials } from '../../services/userStorageService';
import { PWAInstallButton } from '../PWAInstallButton';

const NUTRISICENTIA_LOGO_URL = '/assets/aistudio/WA_1795017645854_f49b3ef0.jpeg';

interface HomeScreenProps {
  userProfile?: UserProfile;
  isSignedIn?: boolean;
  onNavigate: (screen: ScreenId) => void;
  onSelectPhotoMode: () => void;
  onOpenFoodLab: (step?: FoodLabScreenStep) => void;
  onSignOut?: () => Promise<void>;
  onResetGuestSession?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  isSignedIn = false,
  onNavigate,
  onSelectPhotoMode,
  onOpenFoodLab,
  onSignOut,
  onResetGuestSession,
}) => {
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<'terms' | 'about' | null>(null);
  const [drawerFeedback, setDrawerFeedback] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [userProfile?.photoUrl]);

  const showPhoto = Boolean(userProfile?.photoUrl && !avatarLoadError);

  const handleOpenProfile = () => {
    setIsDrawerOpen(false);
    onNavigate('profile');
  };

  const handleOpenAuth = () => {
    setIsDrawerOpen(false);
    onNavigate('auth');
  };

  const handleOpenSettings = () => {
    setIsDrawerOpen(false);
    onNavigate('settings');
  };

  const handleOpenTerms = () => {
    setIsDrawerOpen(false);
    setActiveInfoModal('terms');
  };

  const handleOpenAbout = () => {
    setIsDrawerOpen(false);
    onNavigate('about');
  };

  const handleDrawerLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (isSignedIn && onSignOut) {
        await onSignOut();
        setDrawerFeedback('Signed out of cloud sync. Switched to device mode.');
      } else {
        if (onResetGuestSession) {
          onResetGuestSession();
        }
        setDrawerFeedback('Guest session reset cleanly on this device.');
      }
    } catch {
      setDrawerFeedback('Could not complete sign out right now.');
    } finally {
      setIsLoggingOut(false);
      setIsDrawerOpen(false);
    }
  };

  const renderBrandMark = (sizeClass = 'w-8 h-8 rounded-xl') => (
    <div
      className={`${sizeClass} bg-white border border-emerald-200/80 shadow-2xs overflow-hidden flex items-center justify-center shrink-0`}
    >
      {!logoLoadError ? (
        <img
          src={NUTRISICENTIA_LOGO_URL}
          alt="NutriScientia logo"
          referrerPolicy="no-referrer"
          onError={() => setLogoLoadError(true)}
          className="w-full h-full object-contain p-0.5"
        />
      ) : (
        <Sparkles className="w-4 h-4 text-emerald-600" />
      )}
    </div>
  );

  return (
    <div className="flex-1 min-h-full relative flex flex-col bg-slate-50/70">
      <div className="flex-1 flex flex-col px-4 pt-3 pb-6 space-y-4">
        {/* Clean 3-Slot Top Bar: Menu Icon | NutriScientia Logo + Wordmark | User Avatar */}
        <header className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {renderBrandMark('w-8 h-8 rounded-xl')}
            <span className="font-display font-bold text-[19px] text-slate-900 tracking-tight whitespace-nowrap truncate">
              NutriScientia
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="w-11 h-11 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden shrink-0"
            title="My Profile & Preferences"
            aria-label="Open User Profile"
          >
            {showPhoto ? (
              <img
                src={userProfile!.photoUrl!}
                alt={userProfile?.name || 'User Avatar'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarLoadError(true)}
                className="w-full h-full object-cover"
              />
            ) : userProfile?.name ? (
              <span className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-xs font-bold flex items-center justify-center">
                {getInitials(userProfile.name)}
              </span>
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>
        </header>

        {/* Inline Feedback Banner after Logout / Session Reset */}
        {drawerFeedback && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-950">
            <span className="font-medium leading-snug">{drawerFeedback}</span>
            <button
              type="button"
              onClick={() => setDrawerFeedback(null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-700 hover:bg-emerald-100 shrink-0 cursor-pointer"
              aria-label="Dismiss status message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Botanical Science Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-emerald-200/75 p-4 shadow-xs">
          <div className="absolute -top-16 -right-14 w-44 h-44 bg-emerald-100/70 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-14 -left-10 w-36 h-36 bg-lime-100/60 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-emerald-700">
                Botanical &amp; Culinary Science
              </div>
              <h1 className="font-display text-[21px] font-bold text-slate-900 leading-[1.18] text-balance">
                Know what nourishes every plate
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Analyze meal photos in seconds or explore curated categories inside FoodLab.
              </p>
            </div>

            <div className="w-20 h-20 rounded-2xl bg-white border border-emerald-100 shadow-sm p-1.5 shrink-0 flex items-center justify-center">
              <img
                src={NUTRISICENTIA_LOGO_URL}
                alt="NutriScientia Emblem"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="relative z-10 mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-display text-sm font-bold text-slate-900 tabular-nums">7</div>
              <div className="text-[10px] text-slate-500 font-medium">Food categories</div>
            </div>
            <div className="border-x border-slate-100">
              <div className="font-display text-sm font-bold text-emerald-700 tabular-nums">26</div>
              <div className="text-[10px] text-slate-500 font-medium">Unique foods</div>
            </div>
            <div>
              <div className="font-display text-sm font-bold text-slate-900">AI + Lab</div>
              <div className="text-[10px] text-slate-500 font-medium">Safety audit</div>
            </div>
          </div>
        </section>

        {/* PILLAR 1: FOOD ANALYSIS */}
        <section className="rounded-3xl bg-white border border-slate-200/85 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <h2 className="font-display font-bold text-[15px] text-slate-900">Food Analysis</h2>
                <span className="text-[11px] text-slate-400">· Vision &amp; Q&amp;A</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug truncate">
                Scan meal photos, audit allergens &amp; ask nutrition questions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onSelectPhotoMode}
              className="min-h-[68px] p-3 rounded-2xl bg-emerald-50/75 hover:bg-emerald-100/80 border border-emerald-200/80 text-left transition-colors flex flex-col justify-between cursor-pointer group"
            >
              <Camera className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
              <div className="mt-2">
                <div className="font-display font-bold text-xs text-slate-900 leading-tight">
                  Scan Meal
                </div>
                <div className="text-[10px] text-emerald-800 font-medium truncate">
                  Camera or upload photo
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('ask')}
              className="min-h-[68px] p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex flex-col justify-between cursor-pointer group"
            >
              <MessageSquareText className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
              <div className="mt-2">
                <div className="font-display font-bold text-xs text-slate-900 leading-tight">
                  Ask AI
                </div>
                <div className="text-[10px] text-slate-600 font-medium truncate">
                  Nutrition &amp; safety Q&amp;A
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* PILLAR 2: FOOD LAB (Unified Card Architecture Matching Food Analysis) */}
        <section className="rounded-3xl bg-white border border-slate-200/85 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <h2 className="font-display font-bold text-[15px] text-slate-900">FoodLab</h2>
                <span className="text-[11px] text-slate-400">· Categories &amp; Mixing</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug truncate">
                Open FoodLab to start experiments or browse food categories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onOpenFoodLab('home')}
              className="min-h-[68px] p-3 rounded-2xl bg-teal-50/75 hover:bg-teal-100/80 border border-teal-200/80 text-left transition-colors flex flex-col justify-between cursor-pointer group"
            >
              <FlaskConical className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
              <div className="mt-2">
                <div className="font-display font-bold text-xs text-slate-900 leading-tight">
                  Open FoodLab
                </div>
                <div className="text-[10px] text-teal-800 font-medium truncate">
                  Start &amp; run experiments
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenFoodLab('catalogue')}
              className="min-h-[68px] p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex flex-col justify-between cursor-pointer group"
            >
              <BookOpen className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
              <div className="mt-2">
                <div className="font-display font-bold text-xs text-slate-900 leading-tight">
                  Food Categories
                </div>
                <div className="text-[10px] text-slate-600 font-medium truncate">
                  7 clear culinary sections
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Native App Install Prompt (visible on mobile/desktop Chrome or iOS Safari; hidden once installed) */}
        <PWAInstallButton variant="banner" />

        {/* Company Attribution Footer */}
        <footer className="pt-1 text-center space-y-1">
          <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-500">
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="hover:text-emerald-700 cursor-pointer"
            >
              Settings
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-emerald-700 cursor-pointer"
            >
              About NutriScientia
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="hover:text-emerald-700 cursor-pointer"
            >
              {isSignedIn ? 'Account' : 'Sign In'}
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-400 tracking-wide">
            Powered by 6 Monkeys Inc.
          </p>
        </footer>
      </div>

      {/* Left-Side Slide-Out App Drawer (Scoped Inside Mobile Frame) */}
      <div
        className={`absolute inset-0 z-50 transition-opacity duration-200 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isDrawerOpen}
      >
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        />

        <aside
          aria-label="App Navigation Drawer"
          className={`relative z-10 h-full w-[82%] max-w-[300px] bg-white shadow-2xl border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-out ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Drawer Header */}
            <div className="p-4 pt-5 border-b border-slate-200/80 bg-slate-50/70">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-200 bg-emerald-50 shrink-0 flex items-center justify-center">
                    {showPhoto ? (
                      <img
                        src={userProfile!.photoUrl!}
                        alt={userProfile?.name || 'User Avatar'}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarLoadError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-sm flex items-center justify-center">
                        {getInitials(userProfile?.name || 'Guest User')}
                      </span>
                    )}
                  </div>
                  {renderBrandMark('w-9 h-9 rounded-xl')}
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 min-w-0">
                <div className="font-display font-bold text-sm text-slate-900 truncate">
                  {userProfile?.name || 'Guest User'}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {userProfile?.email || 'Local device profile'}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-slate-600">
                  {isSignedIn ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-semibold">Cloud Synced</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Device Mode</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Navigation Rows */}
            <nav className="p-2 divide-y divide-slate-100">
              <button
                type="button"
                onClick={handleOpenAuth}
                className="w-full min-h-[54px] px-3 py-2 flex items-center justify-between gap-3 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">
                      {isSignedIn ? 'Account & Cloud Status' : 'Sign In / Sign Up'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {isSignedIn ? 'Manage login & password recovery' : 'Email registration, login & reset'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleOpenProfile}
                className="w-full min-h-[54px] px-3 py-2 flex items-center justify-between gap-3 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">User Profile</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Account, photo &amp; dietary rules
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleOpenSettings}
                className="w-full min-h-[54px] px-3 py-2 flex items-center justify-between gap-3 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">Application Settings</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Theme, notifications, privacy &amp; security
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleOpenAbout}
                className="w-full min-h-[54px] px-3 py-2 flex items-center justify-between gap-3 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">About</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      NutriScientia · Powered by 6 Monkeys Inc.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleOpenTerms}
                className="w-full min-h-[54px] px-3 py-2 flex items-center justify-between gap-3 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">Terms &amp; Conditions</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Disclaimers &amp; privacy terms
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <PWAInstallButton
                variant="drawer"
                onInstalledOrAction={() => setIsDrawerOpen(false)}
              />
            </nav>
          </div>

          {/* Drawer Footer: Logout */}
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
            <button
              type="button"
              onClick={handleDrawerLogout}
              disabled={isLoggingOut}
              className="w-full min-h-[48px] px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              <span>
                {isLoggingOut
                  ? 'Signing out...'
                  : isSignedIn
                  ? 'Logout'
                  : 'Reset Guest Session'}
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* Terms & Conditions / About Modal Sheet */}
      {activeInfoModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[82vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {activeInfoModal === 'terms' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  renderBrandMark('w-6 h-6 rounded-lg')
                )}
                <h2 className="font-display font-bold text-sm text-slate-900">
                  {activeInfoModal === 'terms' ? 'Terms & Conditions' : 'About NutriScientia'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-600 leading-relaxed">
              {activeInfoModal === 'terms' ? (
                <>
                  <section className="space-y-1">
                    <h3 className="font-bold text-slate-900">1. Medical &amp; Nutrition Disclaimer</h3>
                    <p>
                      NutriScientia provides estimated macronutrient, micronutrient, allergen, and
                      food compatibility insights for informational and educational exploration. It
                      is not a substitute for professional medical diagnosis, clinical dietetics, or
                      emergency allergy guidance.
                    </p>
                  </section>

                  <section className="space-y-1">
                    <h3 className="font-bold text-slate-900">2. Local &amp; Cloud Data Storage</h3>
                    <p>
                      Without signing in, your profile, dietary preferences, and meal analysis
                      history are stored locally in your browser. When you choose Google Sign-In,
                      your profile and scan history sync securely to your private cloud account and
                      remain isolated to your user identity.
                    </p>
                  </section>

                  <section className="space-y-1">
                    <h3 className="font-bold text-slate-900">3. Fair Usage &amp; Verification</h3>
                    <p>
                      Dish nutrition figures vary with preparation style, portion weight, and local
                      ingredients. Always verify kitchen ingredients directly if you manage severe
                      food allergies.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-1">
                    <h3 className="font-bold text-slate-900">NutriScientia Intelligence</h3>
                    <p>
                      NutriScientia combines two specialized systems: Food Analysis (instant meal
                      photo recognition, allergen detection, and nutrition scoring) and FoodLab (a
                      virtual compatibility &amp; formulation simulator).
                    </p>
                  </section>

                  <section className="space-y-1">
                    <h3 className="font-bold text-slate-900">Curated Food Categories</h3>
                    <p>
                      Inside FoodLab, browse clearly organized Indian dishes, international bowls,
                      fresh produce, whole grains, proteins, and pantry staples with unique food
                      imagery and instant related-food matching.
                    </p>
                  </section>

                  <section className="space-y-1">
                    <h3 className="font-bold text-slate-900">Scientific Reference Grounding</h3>
                    <p>
                      Nutrient estimates and safety assessments align with USDA FoodData Central,
                      NIH Office of Dietary Supplements, FAO/WHO Codex Alimentarius, and ICMR-NIN
                      reference benchmarks.
                    </p>
                  </section>
                </>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-200/80 bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
