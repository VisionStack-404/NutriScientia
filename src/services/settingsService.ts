import { AppSettings, NotificationPreferences } from '../types/food';

const SETTINGS_STORAGE_KEY = 'nutriscientia_app_settings_v1';
const WELCOME_SENT_PREFIX = 'nutriscientia_welcome_sent_';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  foodAnalysisAlerts: true,
  foodLabNotifications: true,
  reportNotifications: true,
  appUpdates: true,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'light',
  notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES },
};

export type NotificationCategory = keyof NotificationPreferences;

export interface AppNotificationEventDetail {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
}

export function sanitizeAppSettings(raw?: Partial<AppSettings> | null): AppSettings {
  const theme = raw?.theme === 'dark' ? 'dark' : 'light';
  const notif = raw?.notifications || ({} as Partial<NotificationPreferences>);
  return {
    theme,
    notifications: {
      foodAnalysisAlerts:
        typeof notif.foodAnalysisAlerts === 'boolean'
          ? notif.foodAnalysisAlerts
          : DEFAULT_NOTIFICATION_PREFERENCES.foodAnalysisAlerts,
      foodLabNotifications:
        typeof notif.foodLabNotifications === 'boolean'
          ? notif.foodLabNotifications
          : DEFAULT_NOTIFICATION_PREFERENCES.foodLabNotifications,
      reportNotifications:
        typeof notif.reportNotifications === 'boolean'
          ? notif.reportNotifications
          : DEFAULT_NOTIFICATION_PREFERENCES.reportNotifications,
      appUpdates:
        typeof notif.appUpdates === 'boolean'
          ? notif.appUpdates
          : DEFAULT_NOTIFICATION_PREFERENCES.appUpdates,
    },
  };
}

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    return sanitizeAppSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function applyThemeToDocument(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

export function saveAppSettings(nextSettings: AppSettings): AppSettings {
  const clean = sanitizeAppSettings(nextSettings);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(clean));
    } catch (err) {
      console.warn('Could not persist app settings:', err);
    }
  }
  applyThemeToDocument(clean.theme);
  return clean;
}

export function dispatchAppNotification(params: {
  category: NotificationCategory;
  title: string;
  message: string;
}): boolean {
  if (typeof window === 'undefined') return false;
  const settings = loadAppSettings();
  if (!settings.notifications[params.category]) {
    return false;
  }

  const detail: AppNotificationEventDetail = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    category: params.category,
    title: params.title,
    message: params.message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  window.dispatchEvent(
    new CustomEvent<AppNotificationEventDetail>('nutriscientia:notify', { detail })
  );

  if (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    typeof document !== 'undefined' &&
    document.visibilityState === 'hidden'
  ) {
    try {
      new Notification(params.title, {
        body: params.message,
        icon: '/pwa-192x192.png',
      });
    } catch {
      // ignore sandbox Notification API restrictions
    }
  }

  return true;
}

export function hasSentWelcomeEmail(identifier: string): boolean {
  if (typeof window === 'undefined' || !identifier) return false;
  try {
    return localStorage.getItem(`${WELCOME_SENT_PREFIX}${identifier.toLowerCase()}`) === '1';
  } catch {
    return false;
  }
}

export function markWelcomeEmailSent(identifier: string): void {
  if (typeof window === 'undefined' || !identifier) return;
  try {
    localStorage.setItem(`${WELCOME_SENT_PREFIX}${identifier.toLowerCase()}`, '1');
  } catch {
    // ignore storage quota errors
  }
}
