import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { AnalysisHistoryItem, AppSettings, FoodAnalysisResponse, UserProfile } from '../types/food';
import { DEFAULT_USER_PROFILE } from './apiService';
import {
  hasSentWelcomeEmail,
  loadAppSettings,
  markWelcomeEmailSent,
  sanitizeAppSettings,
} from './settingsService';
import { compressDataUrlThumbnail, formatHistoryTimestamp } from './userStorageService';

export const ALLOWED_DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Omnivore',
  'Keto',
  'Gluten-Free',
] as const;

export type DietaryPreferenceOption = (typeof ALLOWED_DIETARY_PREFERENCES)[number];

export function normalizeDietaryPreference(value?: string | null): DietaryPreferenceOption {
  const match = ALLOWED_DIETARY_PREFERENCES.find(
    (opt) => opt.toLowerCase() === (value || '').trim().toLowerCase()
  );
  return match || 'Vegetarian';
}

export function sanitizeDocId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length >= 1 ? cleaned : `id_${Date.now()}`;
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) {
        result[key] = stripUndefinedDeep(val);
      }
    }
    return result as T;
  }
  return value;
}

function sanitizeProfilePayload(uid: string, profile: UserProfile) {
  const cleanName = (profile.name || 'FoodInsight User').trim().slice(0, 80) || 'FoodInsight User';
  const cleanEmail = (profile.email || 'user@example.com').trim().slice(0, 160);
  const validEmail = cleanEmail.length >= 3 ? cleanEmail : 'user@example.com';

  const cleanAge =
    profile.age !== null &&
    profile.age !== undefined &&
    Number.isFinite(Number(profile.age)) &&
    Number(profile.age) >= 1 &&
    Number(profile.age) <= 120
      ? Math.round(Number(profile.age))
      : null;

  const cleanPhotoUrl =
    typeof profile.photoUrl === 'string' &&
    profile.photoUrl.trim().length > 0 &&
    profile.photoUrl.length <= 200000
      ? profile.photoUrl
      : null;

  const cleanAllergies = (Array.isArray(profile.allergies) ? profile.allergies : [])
    .map((a) => String(a).trim().slice(0, 40))
    .filter((a) => a.length > 0)
    .slice(0, 15);

  const cleanGoals = (profile.healthGoals || 'High protein').trim().slice(0, 80) || 'High protein';

  const rawCalories = Number(profile.calorieTargetPerMeal);
  const cleanCalories = Number.isFinite(rawCalories)
    ? Math.min(3000, Math.max(100, Math.round(rawCalories)))
    : 600;

  const cleanPreferences: AppSettings = sanitizeAppSettings(
    profile.preferences || loadAppSettings()
  );

  return {
    uid,
    name: cleanName,
    email: validEmail,
    age: cleanAge,
    photoUrl: cleanPhotoUrl,
    dietaryPreference: normalizeDietaryPreference(profile.dietaryPreference),
    allergies: cleanAllergies,
    healthGoals: cleanGoals,
    calorieTargetPerMeal: cleanCalories,
    preferences: cleanPreferences,
  };
}

function firestoreDocToUserProfile(uid: string, data: Record<string, unknown>): UserProfile {
  const updatedAtRaw = data.updatedAt;
  let updatedAtIso: string | undefined;
  if (updatedAtRaw instanceof Timestamp) {
    updatedAtIso = updatedAtRaw.toDate().toISOString();
  } else if (typeof updatedAtRaw === 'string') {
    updatedAtIso = updatedAtRaw;
  }

  const parsedPreferences =
    data.preferences && typeof data.preferences === 'object'
      ? sanitizeAppSettings(data.preferences as Partial<AppSettings>)
      : undefined;

  return {
    id: uid,
    uid,
    name: typeof data.name === 'string' ? data.name : DEFAULT_USER_PROFILE.name,
    email: typeof data.email === 'string' ? data.email : DEFAULT_USER_PROFILE.email,
    age: typeof data.age === 'number' ? data.age : null,
    photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : null,
    dietaryPreference:
      typeof data.dietaryPreference === 'string'
        ? normalizeDietaryPreference(data.dietaryPreference)
        : DEFAULT_USER_PROFILE.dietaryPreference,
    allergies: Array.isArray(data.allergies) ? data.allergies.map(String) : [],
    healthGoals:
      typeof data.healthGoals === 'string' ? data.healthGoals : DEFAULT_USER_PROFILE.healthGoals,
    calorieTargetPerMeal:
      typeof data.calorieTargetPerMeal === 'number'
        ? data.calorieTargetPerMeal
        : DEFAULT_USER_PROFILE.calorieTargetPerMeal,
    ...(parsedPreferences ? { preferences: parsedPreferences } : {}),
    updatedAt: updatedAtIso,
  };
}

function getApiBaseRoot(): string {
  if (typeof window !== 'undefined') {
    const nativeBridge = (
      window as unknown as {
        NutrisicentiaNative?: { getApiBaseUrl?: () => string };
      }
    ).NutrisicentiaNative;
    const nativeUrl = nativeBridge?.getApiBaseUrl?.();
    if (nativeUrl && nativeUrl.trim()) {
      return nativeUrl.trim().replace(/\/+$/, '');
    }
  }
  const envUrl =
    (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env
      ?.VITE_API_BASE_URL || '';
  return envUrl.replace(/\/+$/, '');
}

export interface WelcomeEmailDispatchResult {
  sent: boolean;
  alreadySent?: boolean;
  code?: string;
  message?: string;
  missingFields?: string[];
}

export interface SmtpStatusResult {
  configured: boolean;
  sourceEmail: string;
  host?: string;
  port?: number;
  missingFields: string[];
}

export async function fetchSmtpStatus(): Promise<SmtpStatusResult> {
  try {
    const response = await fetch(`${getApiBaseRoot()}/api/auth/smtp-status`);
    if (!response.ok) {
      return {
        configured: false,
        sourceEmail: 'varunvadlakonda1577@gmail.com',
        missingFields: ['SMTP_PASS'],
      };
    }
    const data = (await response.json()) as Partial<SmtpStatusResult>;
    return {
      configured: Boolean(data.configured),
      sourceEmail: data.sourceEmail || 'varunvadlakonda1577@gmail.com',
      host: data.host || 'smtp.gmail.com',
      port: data.port || 587,
      missingFields: Array.isArray(data.missingFields) ? data.missingFields : [],
    };
  } catch {
    return {
      configured: false,
      sourceEmail: 'varunvadlakonda1577@gmail.com',
      missingFields: ['SMTP_PASS'],
    };
  }
}

export async function triggerWelcomeEmail(params: {
  email: string;
  name: string;
  uid?: string;
  force?: boolean;
}): Promise<WelcomeEmailDispatchResult> {
  const cleanEmail = params.email.trim().toLowerCase();
  const dedupeKey = params.uid || cleanEmail;
  if (
    !cleanEmail ||
    (!params.force && (hasSentWelcomeEmail(dedupeKey) || hasSentWelcomeEmail(cleanEmail)))
  ) {
    return { sent: false, alreadySent: true };
  }

  try {
    const response = await fetch(`${getApiBaseRoot()}/api/auth/welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        name: params.name.trim() || 'Explorer',
        uid: params.uid,
        force: Boolean(params.force),
      }),
    });

    const data = (await response.json().catch(() => ({}))) as WelcomeEmailDispatchResult;
    if (response.ok && data.sent) {
      markWelcomeEmailSent(dedupeKey);
      markWelcomeEmailSent(cleanEmail);
      return { sent: true };
    }
    if (data.alreadySent) {
      markWelcomeEmailSent(dedupeKey);
      markWelcomeEmailSent(cleanEmail);
    }
    return data;
  } catch {
    return {
      sent: false,
      code: 'NETWORK_ERROR',
      message: 'Welcome email service unreachable right now.',
    };
  }
}

export async function signInWithGoogleCloud(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const info = getAdditionalUserInfo(credential);
  if (info?.isNewUser && credential.user.email) {
    void triggerWelcomeEmail({
      email: credential.user.email,
      name: credential.user.displayName || 'NutriScientia Explorer',
      uid: credential.user.uid,
    });
  }
  return credential.user;
}

export async function signUpWithEmailCloud(params: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User; welcomeEmail: WelcomeEmailDispatchResult; verificationSent: boolean }> {
  const cleanName = params.name.trim().slice(0, 80);
  const cleanEmail = params.email.trim().toLowerCase();

  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
  if (cleanName) {
    await updateProfile(credential.user, { displayName: cleanName }).catch(() => {});
  }

  let verificationSent = false;
  try {
    await sendEmailVerification(credential.user);
    verificationSent = true;
  } catch {
    // non-fatal if Firebase verification rate-limits or isn't configured
  }

  const welcomeEmail = await triggerWelcomeEmail({
    email: cleanEmail,
    name: cleanName || 'NutriScientia Explorer',
    uid: credential.user.uid,
  });

  return { user: credential.user, welcomeEmail, verificationSent };
}

export async function signInWithEmailCloud(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  return credential.user;
}

export async function sendPasswordResetCloud(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function resendVerificationEmailCloud(): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('No signed-in user.');
  }
  await sendEmailVerification(auth.currentUser);
}

export async function signOutFromCloud(): Promise<void> {
  await signOut(auth);
}

export async function ensureCloudUserProfile(
  user: User,
  localFallback?: UserProfile
): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  const docRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return firestoreDocToUserProfile(user.uid, snap.data() as Record<string, unknown>);
    }

    const base: UserProfile = {
      ...(localFallback || DEFAULT_USER_PROFILE),
      id: user.uid,
      uid: user.uid,
      name:
        user.displayName?.trim() ||
        localFallback?.name ||
        DEFAULT_USER_PROFILE.name,
      email:
        user.email?.trim() ||
        localFallback?.email ||
        DEFAULT_USER_PROFILE.email,
      photoUrl:
        localFallback?.photoUrl && localFallback.photoUrl.length <= 200000
          ? localFallback.photoUrl
          : user.photoURL && user.photoURL.length <= 200000
            ? user.photoURL
            : null,
    };

    const sanitized = sanitizeProfilePayload(user.uid, base);
    await setDoc(docRef, {
      ...sanitized,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...sanitized,
      id: user.uid,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCloudUserProfile(uid: string, profile: UserProfile): Promise<UserProfile> {
  const path = `users/${uid}`;
  const docRef = doc(db, 'users', uid);
  const sanitized = sanitizeProfilePayload(uid, profile);

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        ...sanitized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        name: sanitized.name,
        email: sanitized.email,
        age: sanitized.age,
        photoUrl: sanitized.photoUrl,
        dietaryPreference: sanitized.dietaryPreference,
        allergies: sanitized.allergies,
        healthGoals: sanitized.healthGoals,
        calorieTargetPerMeal: sanitized.calorieTargetPerMeal,
        preferences: sanitized.preferences,
        updatedAt: serverTimestamp(),
      });
    }
    return {
      ...sanitized,
      id: uid,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

function compactSnapshotForFirestore(
  snapshot?: FoodAnalysisResponse,
  thumbnailUrl?: string | null
): Record<string, unknown> | undefined {
  if (!snapshot) return undefined;
  const cleanedSnapshot: FoodAnalysisResponse = {
    ...snapshot,
    imageUrl: thumbnailUrl || (snapshot.imageUrl?.startsWith('data:') ? undefined : snapshot.imageUrl),
    ingredients: (snapshot.ingredients || []).map((ing) => ({
      ...ing,
      imageUrl: ing.imageUrl?.startsWith('data:') ? undefined : ing.imageUrl,
    })),
  };
  return stripUndefinedDeep(cleanedSnapshot) as unknown as Record<string, unknown>;
}

export async function saveCloudHistoryEntry(
  uid: string,
  item: AnalysisHistoryItem,
  fallbackProfile?: UserProfile
): Promise<void> {
  const entryId = sanitizeDocId(item.id || `scan_${Date.now()}`);
  const path = `users/${uid}/history/${entryId}`;

  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists() && auth.currentUser) {
      await ensureCloudUserProfile(auth.currentUser, fallbackProfile);
    }

    const entryRef = doc(db, 'users', uid, 'history', entryId);
    const existing = await getDoc(entryRef);
    if (existing.exists()) {
      return;
    }

    let safeThumb: string | null = null;
    if (item.imageUrl) {
      if (item.imageUrl.startsWith('data:image/')) {
        const compressed = await compressDataUrlThumbnail(item.imageUrl, 320);
        safeThumb = compressed && compressed.length <= 195000 ? compressed : null;
      } else if (item.imageUrl.length <= 195000) {
        safeThumb = item.imageUrl;
      }
    }

    const compactSnapshot = compactSnapshotForFirestore(item.analysisSnapshot, safeThumb);

    const payload: Record<string, unknown> = {
      id: entryId,
      userId: uid,
      foodName: (item.foodName || 'Scanned Meal').trim().slice(0, 120) || 'Scanned Meal',
      calories: Math.min(10000, Math.max(0, Number(item.calories) || 0)),
      proteinGrams: Math.min(1000, Math.max(0, Number(item.proteinGrams) || 0)),
      thumbnailUrl: safeThumb,
      createdAt: serverTimestamp(),
    };

    if (item.cuisine) payload.cuisine = item.cuisine.slice(0, 80);
    if (item.category) payload.category = item.category.slice(0, 80);
    if (typeof item.carbsGrams === 'number') {
      payload.carbsGrams = Math.min(1000, Math.max(0, item.carbsGrams));
    }
    if (typeof item.fatGrams === 'number') {
      payload.fatGrams = Math.min(1000, Math.max(0, item.fatGrams));
    }
    if (typeof item.matchScore === 'number') {
      payload.matchScore = Math.min(100, Math.max(0, Math.round(item.matchScore)));
    }
    if (item.overallRisk) payload.overallRisk = item.overallRisk.slice(0, 40);
    if (compactSnapshot) payload.analysisSnapshot = compactSnapshot;

    await setDoc(entryRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCloudHistoryEntry(uid: string, entryId: string): Promise<void> {
  const cleanId = sanitizeDocId(entryId);
  const path = `users/${uid}/history/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'history', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeCloudUserProfile(
  uid: string,
  onData: (profile: UserProfile) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = `users/${uid}`;
  const docRef = doc(db, 'users', uid);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(firestoreDocToUserProfile(uid, snapshot.data() as Record<string, unknown>));
      }
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Error already logged by handleFirestoreError
      }
    }
  );
}

export function subscribeCloudHistory(
  uid: string,
  onData: (items: AnalysisHistoryItem[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = `users/${uid}/history`;
  const q = query(collection(db, 'users', uid, 'history'), where('userId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const parsed: { item: AnalysisHistoryItem; sortMs: number }[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const createdAtRaw = data.createdAt;
        let dateObj = new Date();
        if (createdAtRaw instanceof Timestamp) {
          dateObj = createdAtRaw.toDate();
        } else if (typeof createdAtRaw === 'string') {
          const parsedDate = new Date(createdAtRaw);
          if (!Number.isNaN(parsedDate.getTime())) dateObj = parsedDate;
        }

        const item: AnalysisHistoryItem = {
          id: typeof data.id === 'string' ? data.id : docSnap.id,
          foodName: typeof data.foodName === 'string' ? data.foodName : 'Scanned Meal',
          cuisine: typeof data.cuisine === 'string' ? data.cuisine : undefined,
          category: typeof data.category === 'string' ? data.category : undefined,
          calories: typeof data.calories === 'number' ? data.calories : 0,
          proteinGrams: typeof data.proteinGrams === 'number' ? data.proteinGrams : 0,
          carbsGrams: typeof data.carbsGrams === 'number' ? data.carbsGrams : undefined,
          fatGrams: typeof data.fatGrams === 'number' ? data.fatGrams : undefined,
          matchScore: typeof data.matchScore === 'number' ? data.matchScore : undefined,
          overallRisk: typeof data.overallRisk === 'string' ? data.overallRisk : undefined,
          timestamp: formatHistoryTimestamp(dateObj),
          createdAtIso: dateObj.toISOString(),
          imageUrl: typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : undefined,
          analysisSnapshot:
            data.analysisSnapshot && typeof data.analysisSnapshot === 'object'
              ? (data.analysisSnapshot as FoodAnalysisResponse)
              : undefined,
        };

        return { item, sortMs: dateObj.getTime() };
      });

      parsed.sort((a, b) => b.sortMs - a.sortMs);
      onData(parsed.map((p) => p.item));
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Error already logged by handleFirestoreError
      }
    }
  );
}
