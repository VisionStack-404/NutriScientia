import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import {
  applyThemeToDocument,
  dispatchAppNotification,
  loadAppSettings,
} from './services/settingsService';

if (typeof window !== 'undefined') {
  applyThemeToDocument(loadAppSettings().theme);

  if ('serviceWorker' in navigator) {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        dispatchAppNotification({
          category: 'appUpdates',
          title: 'NutriScientia Update Ready',
          message: 'A newer version of NutriScientia is cached and ready to use.',
        });
      },
      onOfflineReady() {
        dispatchAppNotification({
          category: 'appUpdates',
          title: 'Offline Shell Ready',
          message: 'NutriScientia app shell & assets are ready for offline access.',
        });
      },
      onRegisterError(error) {
        console.warn('Service worker registration skipped:', error);
      },
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
