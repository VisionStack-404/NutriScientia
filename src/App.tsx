import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Sparkles,
  Server,
  FileCode,
  Smartphone,
  Maximize2,
  ChevronDown,
  Layers,
  Laptop,
  Bell,
  X,
} from 'lucide-react';
import {
  ScreenId,
  FoodAnalysisResponse,
  AnalysisHistoryItem,
  UserProfile,
  AppSettings,
} from './types/food';
import { FoodLabScreenStep } from './types/foodlab';
import { DEFAULT_PANEER_BIRYANI_ANALYSIS, apiService } from './services/apiService';
import { ensureAnalysisCombinations } from './services/foodCombinationsFallback';
import { auth } from './firebase';
import {
  compressDataUrlThumbnail,
  createHistoryItemFromAnalysis,
  loadStoredHistory,
  loadStoredUserProfile,
  saveStoredHistory,
  saveStoredUserProfile,
} from './services/userStorageService';
import {
  deleteCloudHistoryEntry,
  ensureCloudUserProfile,
  resendVerificationEmailCloud,
  saveCloudHistoryEntry,
  saveCloudUserProfile,
  sendPasswordResetCloud,
  signInWithEmailCloud,
  signInWithGoogleCloud,
  signOutFromCloud,
  signUpWithEmailCloud,
  subscribeCloudHistory,
  subscribeCloudUserProfile,
  triggerWelcomeEmail,
} from './services/cloudSyncService';
import {
  AppNotificationEventDetail,
  applyThemeToDocument,
  dispatchAppNotification,
  loadAppSettings,
  saveAppSettings,
} from './services/settingsService';
import { PhoneFrame } from './components/PhoneFrame';
import { BackendConfigModal } from './components/BackendConfigModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { LocalSetupModal } from './components/LocalSetupModal';
import { OfflineIndicator } from './components/OfflineIndicator';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { CaptureScreen } from './components/screens/CaptureScreen';
import { IdentificationScreen } from './components/screens/IdentificationScreen';
import { AnalysisProgressScreen } from './components/screens/AnalysisProgressScreen';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { IngredientsScreen } from './components/screens/IngredientsScreen';
import { NutritionScreen } from './components/screens/NutritionScreen';
import { SafetyScreen } from './components/screens/SafetyScreen';
import { CombinationsScreen } from './components/screens/CombinationsScreen';
import { EvidenceScreen } from './components/screens/EvidenceScreen';
import { FoodLabMaster } from './components/foodlab/FoodLabMaster';
import { AskIntelligenceScreen } from './components/screens/AskIntelligenceScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AboutScreen } from './components/screens/AboutScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [foodLabInitialStep, setFoodLabInitialStep] = useState<FoodLabScreenStep>('home');
  const [analysisData, setAnalysisData] = useState<FoodAnalysisResponse>(
    DEFAULT_PANEER_BIRYANI_ANALYSIS
  );
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | undefined>(
    DEFAULT_PANEER_BIRYANI_ANALYSIS.imageUrl
  );
  const [isAnalysisReady, setIsAnalysisReady] = useState<boolean>(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastCapturePayload, setLastCapturePayload] = useState<{
    file?: File;
    previewUrl?: string;
    hintName?: string;
  } | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isAndroidCodeModalOpen, setIsAndroidCodeModalOpen] = useState<boolean>(false);
  const [isLocalSetupModalOpen, setIsLocalSetupModalOpen] = useState<boolean>(false);
  const isNativeAndroid =
    typeof window !== 'undefined' &&
    Boolean(
      (window as unknown as { NutrisicentiaNative?: unknown }).NutrisicentiaNative
    );
  const isDevQueryEnabled =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('dev') === '1';
  const [isStandaloneAppMode, setIsStandaloneAppMode] = useState<boolean>(!isDevQueryEnabled);
  const [isFramed, setIsFramed] = useState<boolean>(true);
  const [, setConfigCounter] = useState<number>(0);

  // Auth, User Profile, Settings & Meal History State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadStoredUserProfile());
  const [appSettings, setAppSettings] = useState<AppSettings>(() => loadAppSettings());
  const [activeToast, setActiveToast] = useState<AppNotificationEventDetail | null>(null);
  const [welcomeBanner, setWelcomeBanner] = useState<{
    name: string;
    email: string;
    emailSent: boolean;
    missingFields?: string[];
  } | null>(null);
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>(() =>
    loadStoredHistory()
  );
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  const userProfileRef = useRef<UserProfile>(userProfile);
  userProfileRef.current = userProfile;
  const appSettingsRef = useRef<AppSettings>(appSettings);
  appSettingsRef.current = appSettings;

  useEffect(() => {
    applyThemeToDocument(appSettings.theme);
  }, [appSettings.theme]);

  useEffect(() => {
    let hideTimer: number | undefined;
    const handleNotify = (e: Event) => {
      const detail = (e as CustomEvent<AppNotificationEventDetail>).detail;
      if (!detail) return;
      setActiveToast(detail);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setActiveToast(null), 4500);
    };
    window.addEventListener('nutriscientia:notify', handleNotify);
    return () => {
      window.removeEventListener('nutriscientia:notify', handleNotify);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let unsubHistory: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }
      if (unsubHistory) {
        unsubHistory();
        unsubHistory = undefined;
      }

      setFirebaseUser(user);

      if (!user) {
        setIsCloudSyncing(false);
        setUserProfile(loadStoredUserProfile());
        setHistoryItems(loadStoredHistory());
        return;
      }

      if (!user.emailVerified) {
        const localProfile = saveStoredUserProfile({
          ...userProfileRef.current,
          uid: user.uid,
          name: user.displayName || userProfileRef.current.name,
          email: user.email || userProfileRef.current.email,
          preferences: appSettingsRef.current,
        });
        setUserProfile(localProfile);
        setIsCloudSyncing(false);
        return;
      }

      setIsCloudSyncing(true);
      try {
        const cloudProfile = await ensureCloudUserProfile(user, {
          ...userProfileRef.current,
          preferences: appSettingsRef.current,
        });
        setUserProfile(cloudProfile);
        saveStoredUserProfile(cloudProfile);
        if (cloudProfile.preferences) {
          const synced = saveAppSettings(cloudProfile.preferences);
          setAppSettings(synced);
        }

        unsubProfile = subscribeCloudUserProfile(
          user.uid,
          (liveProfile) => {
            setUserProfile(liveProfile);
            saveStoredUserProfile(liveProfile);
            if (liveProfile.preferences) {
              const synced = saveAppSettings(liveProfile.preferences);
              setAppSettings(synced);
            }
          },
          () => setIsCloudSyncing(false)
        );

        unsubHistory = subscribeCloudHistory(
          user.uid,
          (liveHistory) => {
            setHistoryItems(liveHistory);
            saveStoredHistory(liveHistory);
            setIsCloudSyncing(false);
          },
          () => setIsCloudSyncing(false)
        );
      } catch (err) {
        console.warn('Cloud initialization fallback to local storage:', err);
        setIsCloudSyncing(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubHistory) unsubHistory();
    };
  }, []);

  const screensList: { id: ScreenId; num: number; label: string; desc: string }[] = [
    { id: 'home', num: 1, label: 'Home', desc: 'Food Intelligence Hub' },
    { id: 'capture', num: 2, label: 'Food Capture', desc: 'Scan or upload food' },
    { id: 'identification', num: 3, label: 'Food Identification', desc: 'AI visual recognition' },
    { id: 'analysis_progress', num: 4, label: 'Analysis Progress', desc: 'Real-time multi-step pipeline' },
    { id: 'overview', num: 5, label: 'Overview Dashboard', desc: 'Complete meal summary' },
    { id: 'ingredients', num: 6, label: 'Detailed Composition', desc: 'Ingredients breakdown & %' },
    { id: 'nutrition', num: 7, label: 'Nutrition Intelligence', desc: 'Calorie ring & macros' },
    { id: 'safety', num: 8, label: 'Food Safety & Risk', desc: 'Allergens & quality checks' },
    { id: 'combinations', num: 9, label: 'Combinations', desc: 'Safe & unsafe pairings' },
    { id: 'evidence', num: 10, label: 'Evidence Explorer', desc: 'Scientific USDA/NIH sources' },
    { id: 'foodlab', num: 11, label: 'FoodLab', desc: 'Virtual combination & formulation lab' },
    { id: 'ask', num: 12, label: 'Ask Intelligence', desc: 'Context-aware food Q&A' },
    { id: 'history', num: 13, label: 'Meal History', desc: 'Chronological past scans & metrics' },
    { id: 'profile', num: 14, label: 'User Profile', desc: 'Photo, personal info & dietary rules' },
    { id: 'auth', num: 15, label: 'Account Access', desc: 'Sign up, login & password reset' },
    { id: 'settings', num: 16, label: 'Settings', desc: 'Theme, alerts, privacy & logout' },
    { id: 'about', num: 17, label: 'About', desc: 'NutriScientia & 6 Monkeys Inc.' },
  ];

  const currentScreenMeta =
    screensList.find((s) => s.id === currentScreen) || screensList[0];

  const recordMealToHistory = async (analysis: FoodAnalysisResponse) => {
    const thumbnail = await compressDataUrlThumbnail(analysis.imageUrl, 320);
    const entry = createHistoryItemFromAnalysis(analysis, thumbnail || analysis.imageUrl);

    setHistoryItems((prev) => {
      const updated = [entry, ...prev.filter((item) => item.id !== entry.id)].slice(0, 40);
      saveStoredHistory(updated);
      return updated;
    });

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await saveCloudHistoryEntry(firebaseUser.uid, entry, userProfileRef.current);
      } catch (err) {
        console.warn('Could not sync scanned meal to Firestore:', err);
      }
    }
  };

  const handleImageCaptured = async (file?: File, previewUrl?: string, hintName?: string) => {
    const activePreview = previewUrl;
    setLastCapturePayload({ file, previewUrl, hintName });
    setCapturedImageUrl(activePreview);
    setAnalysisError(null);
    setIsAnalysisReady(false);
    setAnalysisData((prev) => ({
      ...prev,
      analysisId: `pending_${Date.now()}`,
      foodName: 'Scanning food...',
      imageUrl: activePreview,
      ingredients: [],
      combinations: undefined,
    }));
    setCurrentScreen('analysis_progress');

    try {
      const result = await apiService.analyzeCapturedPhoto({
        imageDataUrl: previewUrl,
        file,
        hintName,
        userProfile: userProfileRef.current,
      });
      const finalAnalysis = ensureAnalysisCombinations({
        ...result,
        imageUrl: activePreview || result.imageUrl,
      });
      setAnalysisData(finalAnalysis);
      setIsAnalysisReady(true);
      void recordMealToHistory(finalAnalysis);
      dispatchAppNotification({
        category: 'foodAnalysisAlerts',
        title: `Analysis Ready: ${finalAnalysis.foodName}`,
        message: `${finalAnalysis.nutrition.calories} kcal · ${finalAnalysis.safety.overallRisk}`,
      });
    } catch (e) {
      const errMsg =
        e instanceof Error && e.message
          ? e.message
          : 'Could not identify this food photo right now. Please retry or enter the dish name.';
      console.error('Photo analysis error:', e);
      setAnalysisError(errMsg);
      setIsAnalysisReady(false);
    }
  };

  const handleAnalyzeManualName = async (foodName: string) => {
    setAnalysisError(null);
    setIsAnalysisReady(false);
    setAnalysisData((prev) => ({
      ...prev,
      foodName,
    }));
    try {
      const result = await apiService.analyzeFoodByName({
        foodName,
        imageUrl: capturedImageUrl,
        userProfile: userProfileRef.current,
      });
      const finalAnalysis = ensureAnalysisCombinations({
        ...result,
        imageUrl: capturedImageUrl || result.imageUrl,
      });
      setAnalysisData(finalAnalysis);
      setIsAnalysisReady(true);
      void recordMealToHistory(finalAnalysis);
      dispatchAppNotification({
        category: 'foodAnalysisAlerts',
        title: `Analysis Ready: ${finalAnalysis.foodName}`,
        message: `${finalAnalysis.nutrition.calories} kcal · ${finalAnalysis.safety.overallRisk}`,
      });
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : 'Unable to analyze food name.');
    }
  };

  const handleContinueAnalysis = async () => {
    setIsAnalysisReady(true);
    setCurrentScreen('overview');
  };

  const handleAnalysisCompleted = () => {
    setCurrentScreen('overview');
  };

  const handleSelectPastMeal = (item: AnalysisHistoryItem) => {
    if (item.analysisSnapshot) {
      setAnalysisData(
        ensureAnalysisCombinations({
          ...item.analysisSnapshot,
          imageUrl: item.imageUrl || item.analysisSnapshot.imageUrl,
        })
      );
      setCapturedImageUrl(item.imageUrl || item.analysisSnapshot.imageUrl);
      return;
    }

    setAnalysisData((prev) =>
      ensureAnalysisCombinations({
        ...prev,
        analysisId: item.id,
        foodName: item.foodName,
        cuisine: item.cuisine || prev.cuisine,
        category: item.category || prev.category,
        imageUrl: item.imageUrl || prev.imageUrl,
        overallAssessment: {
          ...prev.overallAssessment,
          scorePercentage: item.matchScore ?? prev.overallAssessment.scorePercentage,
        },
        nutrition: {
          ...prev.nutrition,
          calories: item.calories,
          macronutrients: {
            ...prev.nutrition.macronutrients,
            proteinGrams: item.proteinGrams,
            carbsGrams: item.carbsGrams ?? prev.nutrition.macronutrients.carbsGrams,
            fatGrams: item.fatGrams ?? prev.nutrition.macronutrients.fatGrams,
          },
        },
        safety: {
          ...prev.safety,
          overallRisk:
            item.overallRisk === 'Moderate Risk' || item.overallRisk === 'High Risk'
              ? item.overallRisk
              : 'Low Risk',
        },
        combinations: undefined,
      })
    );
    setCapturedImageUrl(item.imageUrl);
  };



  const handleSaveUserProfile = async (updated: UserProfile) => {
    const withPrefs: UserProfile = {
      ...updated,
      preferences: appSettingsRef.current,
    };
    const savedLocal = saveStoredUserProfile(withPrefs);
    setUserProfile(savedLocal);

    if (firebaseUser && firebaseUser.emailVerified) {
      const savedCloud = await saveCloudUserProfile(firebaseUser.uid, savedLocal);
      setUserProfile(savedCloud);
      saveStoredUserProfile(savedCloud);
    }
  };

  const handleUpdateAppSettings = async (next: AppSettings) => {
    const saved = saveAppSettings(next);
    setAppSettings(saved);
    const updatedProfile = saveStoredUserProfile({
      ...userProfileRef.current,
      preferences: saved,
    });
    setUserProfile(updatedProfile);

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await saveCloudUserProfile(firebaseUser.uid, updatedProfile);
      } catch (err) {
        console.warn('Could not sync settings to Firestore:', err);
      }
    }
  };

  const handleDeleteHistoryItem = async (entryId: string) => {
    setHistoryItems((prev) => {
      const next = prev.filter((item) => item.id !== entryId);
      saveStoredHistory(next);
      return next;
    });

    if (firebaseUser && firebaseUser.emailVerified) {
      await deleteCloudHistoryEntry(firebaseUser.uid, entryId);
    }
  };

  const handleClearHistory = async () => {
    const idsToDelete = historyItems.map((item) => item.id);
    setHistoryItems([]);
    saveStoredHistory([]);

    if (firebaseUser && firebaseUser.emailVerified) {
      await Promise.all(
        idsToDelete.map((id) => deleteCloudHistoryEntry(firebaseUser.uid, id))
      );
    }
  };

  const handleSyncLocalHistoryToCloud = async (): Promise<number> => {
    if (!firebaseUser || !firebaseUser.emailVerified) return 0;
    const localItems = loadStoredHistory();
    const existingIds = new Set(historyItems.map((i) => i.id));
    const missing = localItems.filter((item) => !existingIds.has(item.id));
    for (const item of missing) {
      await saveCloudHistoryEntry(firebaseUser.uid, item, userProfileRef.current);
    }
    return missing.length;
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-emerald-500/30 ${
        isStandaloneAppMode
          ? 'bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Optional Developer Inspection Toolbar (visible when isStandaloneAppMode is false) */}
      {!isStandaloneAppMode && (
        <>
          <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-40 shrink-0">
            {/* Brand & Active Screen Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                    NutriScientia
                  </span>
                  <span className="text-xs text-emerald-400 font-mono ml-2 hidden md:inline">
                    Android v1.0.0
                  </span>
                </div>
              </div>

              <div className="h-5 w-px bg-slate-800 hidden sm:block" />

              {/* Screen Quick-Jump Dropdown */}
              <div className="relative">
                <select
                  value={currentScreen}
                  onChange={(e) => setCurrentScreen(e.target.value as ScreenId)}
                  className="appearance-none bg-slate-800/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer max-w-[210px] truncate"
                >
                  {screensList.map((screen) => (
                    <option key={screen.id} value={screen.id}>
                      {screen.num}. {screen.label} ({screen.desc})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Global Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLocalSetupModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Step-by-step instructions to run as a real mobile app on Android Studio or Flutter"
              >
                <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Run on Laptop (Mobile App)</span>
                <span className="sm:hidden">Run App</span>
              </button>

              <button
                onClick={() => setIsBackendModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Configure and test Python backend connection"
              >
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Backend API</span>
              </button>

              <button
                onClick={() => setIsAndroidCodeModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="View Retrofit, OkHttp, Models, Repository and ViewModels in Kotlin"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Android Kotlin Code</span>
                <span className="sm:hidden">Kotlin</span>
              </button>

              <button
                onClick={() => setIsFramed(!isFramed)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer hidden lg:flex"
                title={isFramed ? 'Expanded View' : 'Phone Frame View'}
              >
                {isFramed ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </header>

          {/* Screen Sequence Quick Bar */}
          <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 overflow-x-auto flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-2 shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" />
              {screensList.length} Screens:
            </span>
            {screensList.map((s) => {
              const isActive = s.id === currentScreen;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentScreen(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`text-[10px] ${
                      isActive ? 'text-emerald-200 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.num}.
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Main Workspace Stage */}
      <main
        className={`flex-1 flex flex-col items-center justify-center overflow-y-auto ${
          isNativeAndroid || isStandaloneAppMode ? 'p-0' : 'p-3 sm:p-6'
        }`}
      >
        <div
          className={`w-full flex flex-col items-center ${
            isNativeAndroid || isStandaloneAppMode ? '' : 'max-w-5xl'
          }`}
        >
          {/* Active Screen Subtitle Banner (only in dev mode) */}
          {!isStandaloneAppMode && (
            <div className="mb-4 text-center">
              <h1 className="text-sm font-semibold text-slate-300">
                Screen {currentScreenMeta.num} of {screensList.length}:{' '}
                <span className="text-white font-bold">{currentScreenMeta.label}</span>
              </h1>
              <p className="text-xs text-slate-500">{currentScreenMeta.desc}</p>
            </div>
          )}

          {/* Android Mobile Frame Container */}
          <PhoneFrame
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            isFramed={isFramed}
            isStandalone={isStandaloneAppMode}
            isNativeAndroid={isNativeAndroid}
          >
            {currentScreen === 'home' && (
              <HomeScreen
                userProfile={userProfile}
                isSignedIn={Boolean(firebaseUser)}
                onNavigate={(screen) => {
                  if (screen === 'foodlab') setFoodLabInitialStep('home');
                  setCurrentScreen(screen);
                }}
                onSelectPhotoMode={() => setCurrentScreen('capture')}
                onOpenFoodLab={(step = 'home') => {
                  setFoodLabInitialStep(step);
                  setCurrentScreen('foodlab');
                }}
                onSignOut={async () => {
                  await signOutFromCloud();
                }}
                onResetGuestSession={() => {
                  const resetProfile = saveStoredUserProfile({
                    ...userProfile,
                    name: 'Guest User',
                    email: 'guest@foodinsight.local',
                    age: null,
                    photoUrl: null,
                    allergies: [],
                  });
                  setUserProfile(resetProfile);
                }}
              />
            )}

            {currentScreen === 'capture' && (
              <CaptureScreen
                onNavigate={(screen) => setCurrentScreen(screen)}
                onImageCaptured={handleImageCaptured}
              />
            )}

            {currentScreen === 'identification' && (
              <IdentificationScreen
                analysis={analysisData}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onContinueAnalysis={handleContinueAnalysis}
              />
            )}

            {currentScreen === 'analysis_progress' && (
              <AnalysisProgressScreen
                imageUrl={capturedImageUrl || analysisData.imageUrl}
                detectedFoodName={analysisData.foodName}
                isAnalysisReady={isAnalysisReady}
                errorMessage={analysisError}
                backTarget="capture"
                onNavigate={(screen) => setCurrentScreen(screen)}
                onAnalysisCompleted={handleAnalysisCompleted}
                onRetryScan={
                  lastCapturePayload
                    ? () =>
                        handleImageCaptured(
                          lastCapturePayload.file,
                          lastCapturePayload.previewUrl,
                          lastCapturePayload.hintName
                        )
                    : undefined
                }
                onAnalyzeByName={handleAnalyzeManualName}
              />
            )}

            {currentScreen === 'overview' && (
              <OverviewScreen
                analysis={analysisData}
                backTarget="home"
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {currentScreen === 'ingredients' && (
              <IngredientsScreen
                analysis={analysisData}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {currentScreen === 'nutrition' && (
              <NutritionScreen
                analysis={analysisData}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {currentScreen === 'safety' && (
              <SafetyScreen
                analysis={analysisData}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {currentScreen === 'combinations' && (
              <CombinationsScreen
                analysis={analysisData}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {currentScreen === 'evidence' && (
              <EvidenceScreen
                analysis={analysisData}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {currentScreen === 'foodlab' && (
              <FoodLabMaster
                key={foodLabInitialStep}
                initialStep={foodLabInitialStep}
                onBackToMainApp={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'ask' && (
              <AskIntelligenceScreen
                onNavigate={(screen) => setCurrentScreen(screen)}
                foodName={analysisData.foodName}
                analysis={analysisData}
              />
            )}

            {currentScreen === 'history' && (
              <HistoryScreen
                historyItems={historyItems}
                isSignedIn={Boolean(firebaseUser)}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onSelectPastMeal={handleSelectPastMeal}
                onDeleteItem={handleDeleteHistoryItem}
                onClearAll={handleClearHistory}
              />
            )}

            {currentScreen === 'profile' && (
              <ProfileScreen
                profile={userProfile}
                isSignedIn={Boolean(firebaseUser)}
                authEmail={firebaseUser?.email}
                isSyncing={isCloudSyncing}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onSaveProfile={handleSaveUserProfile}
                onSignInGoogle={async () => {
                  await signInWithGoogleCloud();
                }}
                onSignOut={async () => {
                  await signOutFromCloud();
                }}
                onSyncLocalHistory={handleSyncLocalHistoryToCloud}
              />
            )}

            {currentScreen === 'auth' && (
              <AuthScreen
                profile={userProfile}
                isSignedIn={Boolean(firebaseUser)}
                authEmail={firebaseUser?.email}
                emailVerified={Boolean(firebaseUser?.emailVerified)}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onSignInEmail={async (email, password) => {
                  const user = await signInWithEmailCloud(email, password);
                  dispatchAppNotification({
                    category: 'appUpdates',
                    title: `Welcome back, ${user.displayName || userProfileRef.current.name || 'Explorer'}!`,
                    message: 'NutriScientia · Food Insight AI Virtual Lab is ready — Powered by 6 Monkeys Inc.',
                  });
                }}
                onSignUpEmail={async (params) => {
                  const res = await signUpWithEmailCloud(params);
                  const savedLocal = saveStoredUserProfile({
                    ...userProfileRef.current,
                    uid: res.user.uid,
                    name: params.name,
                    email: params.email,
                    preferences: appSettingsRef.current,
                  });
                  setUserProfile(savedLocal);
                  setWelcomeBanner({
                    name: params.name,
                    email: params.email,
                    emailSent: Boolean(res.welcomeEmail.sent),
                    missingFields: res.welcomeEmail.missingFields,
                  });
                  dispatchAppNotification({
                    category: 'appUpdates',
                    title: `Welcome to NutriScientia, ${params.name}!`,
                    message: res.welcomeEmail.sent
                      ? `Welcome email sent to ${params.email}. Powered by 6 Monkeys Inc.`
                      : 'Food Insight AI Virtual Lab account activated! Powered by 6 Monkeys Inc.',
                  });
                  return {
                    welcomeEmail: res.welcomeEmail,
                    verificationSent: res.verificationSent,
                  };
                }}
                onSendPasswordReset={async (email) => {
                  await sendPasswordResetCloud(email);
                }}
                onSignInGoogle={async () => {
                  const user = await signInWithGoogleCloud();
                  dispatchAppNotification({
                    category: 'appUpdates',
                    title: `Welcome to NutriScientia, ${user.displayName || 'Explorer'}!`,
                    message: 'Signed in cleanly — Powered by 6 Monkeys Inc.',
                  });
                }}
                onResendWelcomeEmail={async (force = true) => {
                  const targetEmail = firebaseUser?.email || userProfileRef.current.email;
                  const targetName =
                    firebaseUser?.displayName || userProfileRef.current.name || 'Explorer';
                  const res = await triggerWelcomeEmail({
                    email: targetEmail,
                    name: targetName,
                    uid: firebaseUser?.uid,
                    force,
                  });
                  if (res.sent) {
                    dispatchAppNotification({
                      category: 'appUpdates',
                      title: 'Welcome Email Delivered',
                      message: `Sent to ${targetEmail} from NutriScientia (6 Monkeys Inc.).`,
                    });
                  }
                  return res;
                }}
                onResendVerification={async () => {
                  await resendVerificationEmailCloud();
                }}
                onRefreshVerification={async () => {
                  if (!auth.currentUser) return false;
                  await auth.currentUser.reload();
                  const verified = Boolean(auth.currentUser.emailVerified);
                  if (verified) {
                    const refreshed = { ...auth.currentUser } as User;
                    setFirebaseUser(refreshed);
                    const cloudProfile = await ensureCloudUserProfile(auth.currentUser, {
                      ...userProfileRef.current,
                      preferences: appSettingsRef.current,
                    });
                    setUserProfile(cloudProfile);
                    saveStoredUserProfile(cloudProfile);
                  }
                  return verified;
                }}
                onSignOut={async () => {
                  await signOutFromCloud();
                }}
              />
            )}

            {currentScreen === 'settings' && (
              <SettingsScreen
                profile={userProfile}
                settings={appSettings}
                isSignedIn={Boolean(firebaseUser)}
                authEmail={firebaseUser?.email}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onUpdateSettings={handleUpdateAppSettings}
                onSendPasswordReset={async (email) => {
                  await sendPasswordResetCloud(email);
                }}
                onClearHistory={handleClearHistory}
                onSignOut={async () => {
                  await signOutFromCloud();
                }}
                onResetGuestSession={() => {
                  const resetProfile = saveStoredUserProfile({
                    ...userProfile,
                    name: 'Guest User',
                    email: 'guest@foodinsight.local',
                    age: null,
                    photoUrl: null,
                    allergies: [],
                  });
                  setUserProfile(resetProfile);
                }}
              />
            )}

            {currentScreen === 'about' && (
              <AboutScreen onNavigate={(screen) => setCurrentScreen(screen)} />
            )}
          </PhoneFrame>
        </div>
      </main>

      {/* Backend API Configuration Modal */}
      <BackendConfigModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onConfigChanged={() => setConfigCounter((c) => c + 1)}
      />

      {/* Android Kotlin Architecture Explorer Modal */}
      <AndroidCodeModal
        isOpen={isAndroidCodeModalOpen}
        onClose={() => setIsAndroidCodeModalOpen(false)}
      />

      {/* Run on Laptop Setup Guide Modal */}
      <LocalSetupModal
        isOpen={isLocalSetupModalOpen}
        onClose={() => setIsLocalSetupModalOpen(false)}
      />

      {/* Active In-App Notification Toast Banner */}
      {activeToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-24px)] max-w-sm rounded-2xl bg-slate-900/95 text-white border border-emerald-500/50 shadow-2xl px-3.5 py-3 flex items-start gap-2.5 backdrop-blur-md"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold leading-tight">{activeToast.title}</div>
            <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {activeToast.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveToast(null)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Official Welcome Message Modal (on new registration) */}
      {welcomeBanner && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-5 text-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Welcome to NutriScientia
                  </span>
                  <h2 className="font-display font-extrabold text-lg mt-0.5 leading-snug">
                    Hello, {welcomeBanner.name}!
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setWelcomeBanner(null)}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
                  aria-label="Close welcome message"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
                Welcome to <strong>Food Insight AI Virtual Lab</strong>. Your account is now
                active and ready for clinical nutrition, safety checks, FoodLab simulations, and
                2-page PDF reporting.
              </p>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-200">
              <ul className="space-y-1.5">
                <li>• <strong>AI Food &amp; Photo Analysis:</strong> Macros, benefits &amp; allergens.</li>
                <li>• <strong>FoodLab™ Simulator:</strong> Test chemical interactions &amp; safety.</li>
                <li>• <strong>2-Page PDF Reports:</strong> High-res dish visuals &amp; public paper URLs.</li>
              </ul>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-[11px]">
                {welcomeBanner.emailSent ? (
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                    ✓ Welcome email also dispatched to {welcomeBanner.email}.
                  </span>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300">
                    Registered as <strong>{welcomeBanner.email}</strong>. (Add{' '}
                    <strong>{welcomeBanner.missingFields?.join(', ') || 'SMTP_PASS'}</strong> in
                    server <code>.env</code> for Gmail inbox delivery.)
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Powered by 6 Monkeys Inc.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setWelcomeBanner(null);
                    setCurrentScreen('home');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Floating Mode Switcher (only shown when explicitly launched with ?dev=1) */}
      {!isNativeAndroid && isDevQueryEnabled && (
        <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5">
          <button
            onClick={() => setIsStandaloneAppMode(!isStandaloneAppMode)}
            className="text-[11px] font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer select-none"
            title={
              isStandaloneAppMode
                ? 'Show Developer Inspection Bar'
                : 'Switch to Pure Clean App View'
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isStandaloneAppMode ? 'Show Dev Tools' : 'Pure App View'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
