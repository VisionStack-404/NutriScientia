import { UserProfile, AnalysisHistoryItem, FoodAnalysisResponse } from '../types/food';
import { DEFAULT_USER_PROFILE, DEFAULT_HISTORY_ITEMS } from './apiService';

const PROFILE_STORAGE_KEY = 'foodinsight_user_profile_v2';
const HISTORY_STORAGE_KEY = 'foodinsight_meal_history_v2';
const MAX_HISTORY_ITEMS = 40;
const MAX_FIRESTORE_IMAGE_CHARS = 150000;

export function loadStoredUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies : DEFAULT_USER_PROFILE.allergies,
      age:
        parsed.age === null
          ? null
          : typeof parsed.age === 'number' && parsed.age >= 1 && parsed.age <= 120
            ? Math.round(parsed.age)
            : DEFAULT_USER_PROFILE.age,
      photoUrl: typeof parsed.photoUrl === 'string' || parsed.photoUrl === null ? parsed.photoUrl : null,
      calorieTargetPerMeal:
        typeof parsed.calorieTargetPerMeal === 'number' &&
        parsed.calorieTargetPerMeal >= 100 &&
        parsed.calorieTargetPerMeal <= 3000
          ? Math.round(parsed.calorieTargetPerMeal)
          : DEFAULT_USER_PROFILE.calorieTargetPerMeal,
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredUserProfile(profile: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not persist profile to localStorage:', err);
    }
  }
  return updated;
}

export function loadStoredHistory(): AnalysisHistoryItem[] {
  if (typeof window === 'undefined') return DEFAULT_HISTORY_ITEMS;
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return DEFAULT_HISTORY_ITEMS;
    const parsed = JSON.parse(raw) as AnalysisHistoryItem[];
    return Array.isArray(parsed) ? parsed : DEFAULT_HISTORY_ITEMS;
  } catch {
    return DEFAULT_HISTORY_ITEMS;
  }
}

export function saveStoredHistory(items: AnalysisHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
  } catch (err) {
    console.warn('Could not persist history cleanly, pruning older entries:', err);
    try {
      const compact = items.slice(0, 15).map((item) => ({
        ...item,
        analysisSnapshot: item.analysisSnapshot
          ? {
              ...item.analysisSnapshot,
              imageUrl: item.imageUrl,
            }
          : undefined,
      }));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // ignore if storage quota strictly exceeded
    }
  }
}

export function formatHistoryTimestamp(date: Date = new Date()): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function createHistoryItemFromAnalysis(
  analysis: FoodAnalysisResponse,
  thumbnailUrl?: string
): AnalysisHistoryItem {
  const safeImage = thumbnailUrl || analysis.imageUrl;
  const rawId = analysis.analysisId || `scan_${Date.now()}`;
  const cleanId = `${rawId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Math.random().toString(36).slice(2, 6)}`.slice(0, 120);
  const nowIso = new Date().toISOString();
  return {
    id: cleanId,
    foodName: analysis.foodName,
    cuisine: analysis.cuisine,
    category: analysis.category,
    calories: analysis.nutrition.calories,
    proteinGrams: analysis.nutrition.macronutrients.proteinGrams,
    carbsGrams: analysis.nutrition.macronutrients.carbsGrams,
    fatGrams: analysis.nutrition.macronutrients.fatGrams,
    matchScore: analysis.overallAssessment.scorePercentage,
    overallRisk: analysis.safety.overallRisk,
    timestamp: formatHistoryTimestamp(),
    createdAtIso: nowIso,
    imageUrl: safeImage,
    analysisSnapshot: {
      ...analysis,
      imageUrl: safeImage,
      ingredients: (analysis.ingredients || []).map((ing) => ({
        ...ing,
        imageUrl: ing.imageUrl?.startsWith('data:') ? undefined : ing.imageUrl,
      })),
    },
  };
}

function encodeSquareCanvasBounded(
  img: HTMLImageElement,
  size: number,
  maxChars: number = MAX_FIRESTORE_IMAGE_CHARS
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const minSide = Math.min(img.width, img.height);
  const sx = (img.width - minSide) / 2;
  const sy = (img.height - minSide) / 2;
  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

  let quality = 0.82;
  let result = canvas.toDataURL('image/jpeg', quality);
  while (result.length > maxChars && quality > 0.35) {
    quality -= 0.12;
    result = canvas.toDataURL('image/jpeg', quality);
  }
  return result;
}

export function compressDataUrlToSquareAvatar(dataUrl: string, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const encoded = encodeSquareCanvasBounded(img, size);
      resolve(encoded || dataUrl);
    };
    img.onerror = () => reject(new Error('Could not decode captured photo'));
    img.src = dataUrl;
  });
}

export function compressFileToSquareAvatar(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const encoded = encodeSquareCanvasBounded(img, size);
        resolve(encoded || dataUrl);
      };
      img.onerror = () => reject(new Error('Unsupported image format'));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function compressDataUrlThumbnail(dataUrl?: string, maxWidth = 320): Promise<string | undefined> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return Promise.resolve(dataUrl);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl.length <= MAX_FIRESTORE_IMAGE_CHARS ? dataUrl : undefined);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      let quality = 0.72;
      let encoded = canvas.toDataURL('image/jpeg', quality);
      while (encoded.length > MAX_FIRESTORE_IMAGE_CHARS && quality > 0.32) {
        quality -= 0.12;
        encoded = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(encoded.length <= MAX_FIRESTORE_IMAGE_CHARS ? encoded : undefined);
    };
    img.onerror = () => resolve(dataUrl.length <= MAX_FIRESTORE_IMAGE_CHARS ? dataUrl : undefined);
    img.src = dataUrl;
  });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
