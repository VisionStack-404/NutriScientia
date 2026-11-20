import React from 'react';
import { Wifi, Battery, Signal, Home, Camera, FlaskConical, History, User } from 'lucide-react';
import { ScreenId } from '../types/food';

interface PhoneFrameProps {
  children: React.ReactNode;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isFramed?: boolean;
  isStandalone?: boolean;
  isNativeAndroid?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  currentScreen,
  onNavigate,
  isFramed = true,
  isStandalone = false,
  isNativeAndroid = false,
}) => {
  // Screens that show the standard bottom navigation bar
  const showBottomNav = ['home', 'foodlab', 'history', 'profile', 'settings', 'about'].includes(
    currentScreen
  );

  const navItems: { id: ScreenId; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'capture', label: 'Scan', icon: Camera },
    { id: 'foodlab', label: 'FoodLab', icon: FlaskConical },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const content = (
    <div className="app-shell-surface flex flex-col h-full bg-white dark:bg-slate-900 relative overflow-hidden select-none">
      {/* Android System Status Bar (dev frame preview only) */}
      <div
        className={`h-8 bg-slate-900/95 text-white px-6 items-center justify-between text-xs font-medium shrink-0 z-30 ${
          isNativeAndroid || isStandalone ? 'hidden' : 'flex'
        }`}
      >
        <span className="tracking-tight text-[11px]">9:41</span>
        <div className="flex items-center gap-2 text-white/90">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Main Screen Content Scroll View */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-slate-50/50">
        {children}
      </div>

      {/* Bottom Navigation Bar */}
      {showBottomNav && (
        <nav
          aria-label="Primary Navigation"
          className="h-16 border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-2 flex items-center justify-around shrink-0 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[44px] min-w-[52px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
                  isActive ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Android Gesture Navigation Bar indicator (dev frame preview only) */}
      <div
        className={`h-4 bg-white items-center justify-center shrink-0 ${
          isNativeAndroid || isStandalone ? 'hidden' : 'flex'
        }`}
      >
        <div className="w-32 h-1 bg-slate-300 rounded-full" />
      </div>
    </div>
  );

  if (isNativeAndroid) {
    return (
      <div className="w-full h-[100dvh] bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
        {content}
      </div>
    );
  }

  // Pure standalone app view: clean edge-to-edge app canvas with no phone bezel or simulated system bars
  if (isStandalone) {
    return (
      <div className="w-full h-[100dvh] max-w-md mx-auto bg-white dark:bg-slate-900 sm:shadow-lg sm:border-x sm:border-slate-200/80 dark:sm:border-slate-800 flex flex-col overflow-hidden">
        {content}
      </div>
    );
  }

  if (!isFramed) {
    return <div className="w-full h-full max-w-md mx-auto shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">{content}</div>;
  }

  return (
    <div className="relative mx-auto my-auto p-3 bg-slate-900 rounded-[44px] shadow-2xl border-4 border-slate-800 ring-1 ring-slate-950/20 max-w-[390px] w-full h-[810px] flex flex-col">
      {/* Front camera punch hole */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40 ring-1 ring-white/10" />

      {/* Phone Screen Bezels */}
      <div className="flex-1 rounded-[34px] overflow-hidden flex flex-col relative bg-white">
        {content}
      </div>
    </div>
  );
};
