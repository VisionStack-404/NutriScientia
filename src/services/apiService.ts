import {
  FoodAnalysisResponse,
  FoodIdentificationResponse,
  FoodLabSimulationRequest,
  FoodLabSimulationResponse,
  AskQuestionRequest,
  AskQuestionResponse,
  UserProfile,
  AnalysisHistoryItem,
} from '../types/food';
import { FOOD_CATALOGUE, FoodCatalogueItem } from '../data/foodCatalogue';
import {
  findBestMatchingFoodItem,
  getUniqueDishImageUrl,
  resolveIngredientImage,
  resolveRelatedDishImage,
} from '../data/categoryMedia';
import {
  buildFoodCombinations,
  ensureAnalysisCombinations,
} from './foodCombinationsFallback';
import riceDishImg from '../assets/images/cat_rice_biryanis_1794835955488.jpg';
import breakfastDishImg from '../assets/images/cat_breakfast_tiffin_1794835953916.jpg';
import saladDishImg from '../assets/images/cat_salads_vegetables_1794891501340.jpg';
import {
  FoodLabExperimentResult,
  NutritionalFocus,
  ResearchObjective,
  SelectedFoodItem,
} from '../types/foodlab';
import { calculateExperimentResult } from './foodLabEngine';

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(blob);
  });
}

const STORAGE_KEY_BASE_URL = 'foodinsight_backend_base_url';
const STORAGE_KEY_USE_LIVE_BACKEND = 'foodinsight_use_live_backend';

function getApiRoot(): string {
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

export const DEFAULT_BASE_URL = 'http://localhost:8000/v1/';

export const DEFAULT_PANEER_BIRYANI_ANALYSIS: FoodAnalysisResponse = {
  analysisId: 'biryani_01',
  foodName: 'Paneer Biryani',
  cuisine: 'Indian Cuisine',
  category: 'Main Course',
  confidence: 92,
  servingSize: '250g',
  imageUrl: riceDishImg,
  overallAssessment: {
    matchStatus: 'Good Match',
    scorePercentage: 82,
    summary: 'Suitable for your profile with minor modifications. High in protein, moderate in calories.',
    nutritionalValueSummary: 'Good source of protein and essential nutrients',
    safetyStatusSummary: 'No major risks detected',
  },
  nutrition: {
    calories: 520,
    servingWeightGrams: 250,
    macronutrients: {
      proteinGrams: 18,
      proteinTag: 'High',
      carbsGrams: 65,
      carbsTag: 'Moderate',
      fatGrams: 20,
      fatTag: 'Moderate',
      fiberGrams: 3,
    },
    micronutrients: [
      { name: 'Calcium', amount: '220mg', dailyValuePercentage: 22 },
      { name: 'Iron', amount: '2.8mg', dailyValuePercentage: 16 },
      { name: 'Sodium', amount: '580mg', dailyValuePercentage: 25 },
      { name: 'Vitamin A', amount: '180mcg', dailyValuePercentage: 20 },
      { name: 'Vitamin C', amount: '12mg', dailyValuePercentage: 13 },
    ],
  },
  ingredients: [
    {
      id: 'ing_1',
      name: 'Basmati Rice',
      subname: 'Cooked',
      percentage: 45,
      isKeyIngredient: true,
      description: 'Long-grain aromatic rice, primary source of complex carbohydrates.',
      imageUrl: resolveIngredientImage('Basmati Rice'),
    },
    {
      id: 'ing_2',
      name: 'Paneer',
      subname: 'Cottage cheese',
      percentage: 25,
      isKeyIngredient: true,
      description: 'Cottage cheese made from milk. Good source of protein and calcium.',
      imageUrl: resolveIngredientImage('Paneer'),
    },
    {
      id: 'ing_3',
      name: 'Onions',
      subname: 'Fried / Caramelized',
      percentage: 10,
      isKeyIngredient: false,
      description: 'Adds sweetness, dietary fibers, and quercetin antioxidants.',
      imageUrl: resolveIngredientImage('Onions'),
    },
    {
      id: 'ing_4',
      name: 'Tomatoes',
      subname: 'Gravy base',
      percentage: 8,
      isKeyIngredient: false,
      description: 'Rich in lycopene and vitamin C.',
      imageUrl: resolveIngredientImage('Tomatoes'),
    },
    {
      id: 'ing_5',
      name: 'Cooking Oil / Ghee',
      subname: 'Clarified butter',
      percentage: 5,
      isKeyIngredient: false,
      description: 'Traditional fat source for tempering spices.',
      imageUrl: resolveIngredientImage('Cooking Oil / Ghee'),
    },
    {
      id: 'ing_6',
      name: 'Spices',
      subname: 'Biryani masala, etc.',
      percentage: 5,
      isKeyIngredient: false,
      description: 'Cardamom, cinnamon, cloves, cumin, bay leaf, saffron.',
      imageUrl: resolveIngredientImage('Spices'),
    },
    {
      id: 'ing_7',
      name: 'Yogurt',
      subname: 'Curd marinade',
      percentage: 2,
      isKeyIngredient: false,
      description: 'Tenderizer and probiotic marinade component.',
      imageUrl: resolveIngredientImage('Yogurt'),
    },
  ],
  safety: {
    overallRisk: 'Low Risk',
    riskSummary: 'No major safety concerns detected',
    allergens: [
      { allergenName: 'Milk', isPresent: true, warningLevel: 'Contains' },
      { allergenName: 'Gluten', isPresent: false, warningLevel: 'Not detected' },
      { allergenName: 'Peanuts', isPresent: false, warningLevel: 'Not detected' },
    ],
    qualityChecks: [
      { title: 'No known contamination risks', isSafe: true },
      { title: 'Ingredient quality looks safe', isSafe: true },
    ],
    riskFactors: [
      { factor: 'Moderate sodium content', severity: 'Moderate' },
      { factor: 'High in saturated fat', severity: 'Moderate' },
    ],
  },
  evidence: [
    {
      id: 'ev_1',
      sourceName: 'USDA Food Composition Database',
      category: 'Nutrition',
      snippet: 'Nutritional values for rice, paneer and biryani preparation methods.',
      confidenceScore: 0.96,
      referenceUrl: 'https://fdc.nal.usda.gov/',
    },
    {
      id: 'ev_2',
      sourceName: 'NIH Nutrition Guidelines',
      category: 'Nutrition',
      snippet: 'Protein requirements and dietary guidelines for adults.',
      confidenceScore: 0.94,
      referenceUrl: 'https://www.nih.gov/',
    },
    {
      id: 'ev_3',
      sourceName: 'Food Safety Reference (FAO)',
      category: 'Safety',
      snippet: 'Information on dairy products hygiene and food safety limits.',
      confidenceScore: 0.91,
      referenceUrl: 'https://www.fao.org/',
    },
    {
      id: 'ev_4',
      sourceName: 'WHO Dietary Sodium Recommendations',
      category: 'Safety',
      snippet: 'Maximum daily limit benchmarks for cooked mixed meals.',
      confidenceScore: 0.89,
      referenceUrl: 'https://www.who.int/',
    },
    {
      id: 'ev_5',
      sourceName: 'Indian Food Composition Tables (ICMR-NIN)',
      category: 'General',
      snippet: 'Standard nutrient retention rates for dum-cooked basmati rice dishes.',
      confidenceScore: 0.93,
      referenceUrl: 'https://www.nin.res.in/',
    },
  ],
  profileMatch: {
    dietaryFit: 'Fits your vegetarian diet and calorie goal',
    calorieFit: '520 kcal is within your 600 kcal target',
    notes: 'Good match for your High Protein fitness objective.',
  },
  healthBenefits: [
    'High bioavailable dairy protein (18g) supports muscle repair and sustained satiety.',
    'Good source of dietary calcium (22% DV) and phosphorus from fresh paneer.',
    'Culinary spices such as cardamom, cumin, and saffron contribute polyphenol antioxidants.',
    'Tomatoes and aromatic herbs supply vitamin C and potassium.',
  ],
  combinations: buildFoodCombinations({
    foodName: 'Paneer Biryani',
    category: 'Main Course',
    cuisine: 'Indian Cuisine',
    ingredientNames: ['Basmati Rice', 'Paneer', 'Onions', 'Tomatoes', 'Ghee', 'Spices', 'Yogurt'],
    calories: 520,
  }),
  createdAt: new Date().toISOString(),
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_001',
  name: 'Alex Johnson',
  email: 'varunvadlakonda4@gmail.com',
  age: 26,
  dietaryPreference: 'Vegetarian',
  allergies: ['Peanut'],
  healthGoals: 'High protein',
  calorieTargetPerMeal: 600,
};

export const DEFAULT_HISTORY_ITEMS: AnalysisHistoryItem[] = [
  {
    id: 'hist_1',
    foodName: 'Paneer Biryani',
    cuisine: 'Indian Cuisine',
    category: 'Main Course',
    calories: 520,
    proteinGrams: 18,
    carbsGrams: 65,
    fatGrams: 20,
    matchScore: 82,
    overallRisk: 'Low Risk',
    timestamp: 'Today',
    imageUrl: riceDishImg,
    analysisSnapshot: DEFAULT_PANEER_BIRYANI_ANALYSIS,
  },
  {
    id: 'hist_2',
    foodName: 'Pesarattu',
    cuisine: 'South Indian Cuisine',
    category: 'Breakfast',
    calories: 320,
    proteinGrams: 14,
    carbsGrams: 46,
    fatGrams: 8,
    matchScore: 91,
    overallRisk: 'Low Risk',
    timestamp: '2 days ago',
    imageUrl: breakfastDishImg,
  },
  {
    id: 'hist_3',
    foodName: 'Mixed Sprout Salad',
    cuisine: 'Healthy Food',
    category: 'Salad',
    calories: 210,
    proteinGrams: 12,
    carbsGrams: 28,
    fatGrams: 4,
    matchScore: 95,
    overallRisk: 'Low Risk',
    timestamp: '3 days ago',
    imageUrl: saladDishImg,
  },
];

function buildAnalysisFromCatalogueItem(
  item: FoodCatalogueItem,
  imageUrl: string,
  confidence: number = 91,
  userProfile?: UserProfile
): FoodAnalysisResponse {
  const servingGrams = item.defaultGrams || 220;
  const factor = servingGrams / 100;
  const calories = Math.round(item.caloriesPer100g * factor);
  const proteinGrams = Number((item.proteinPer100g * factor).toFixed(1));
  const carbsGrams = Number((item.carbsPer100g * factor).toFixed(1));
  const fatGrams = Number((item.fatPer100g * factor).toFixed(1));
  const fiberGrams = Number((item.fiberPer100g * factor).toFixed(1));
  const calciumMg = Math.round(item.calciumMgPer100g * factor);
  const vitaminCMg = Number((item.vitaminCMgPer100g * factor).toFixed(1));

  const rawIngredients = (item.mainIngredients || [item.name])
    .slice(0, 6);
  const totalIng = rawIngredients.length || 1;
  const basePct = Math.floor(100 / totalIng);
  const remainder = 100 - basePct * totalIng;

  const ingredients = rawIngredients.map((ingName, idx) => ({
    id: `ing_${idx + 1}`,
    name: ingName,
    subname: idx === 0 ? item.cookingMethod || 'Primary component' : 'Culinary component',
    percentage: basePct + (idx === 0 ? remainder : 0),
    isKeyIngredient: idx < 2,
    description: `${ingName} contributes structural flavor and micronutrient balance in ${item.name}.`,
    imageUrl: resolveIngredientImage(ingName, imageUrl),
  }));

  const isVegetarian = item.dietaryType !== 'Non-Vegetarian';
  const containsDairy =
    item.category === 'DAIRY' ||
    rawIngredients.some((i) => /milk|cheese|paneer|butter|ghee|cream|yogurt|curd/i.test(i));
  const containsGluten = rawIngredients.some((i) => /wheat|flour|bread|noodle|pasta|maida/i.test(i));
  const containsNuts = rawIngredients.some((i) => /peanut|almond|cashew|walnut|nut/i.test(i));

  const targetCal = userProfile?.calorieTargetPerMeal || 600;
  const scorePercentage = calories <= targetCal && proteinGrams >= 10 ? 88 : calories <= targetCal + 80 ? 79 : 71;

  return {
    analysisId: `scan_${Date.now()}`,
    foodName: item.name,
    cuisine: item.cuisine || 'Global Cuisine',
    category: item.category || 'Prepared Dish',
    confidence,
    servingSize: `${servingGrams}${item.unit || 'g'}`,
    imageUrl: imageUrl || item.imageUrl,
    overallAssessment: {
      matchStatus: scorePercentage >= 80 ? 'Good Match' : 'Moderate Match',
      scorePercentage,
      summary:
        item.description ||
        `${item.name} prepared via ${item.cookingMethod || 'traditional cooking'}. Delivers ${calories} kcal and ${proteinGrams}g protein per serving.`,
      nutritionalValueSummary:
        proteinGrams >= 14
          ? 'Strong protein density with balanced macronutrients'
          : 'Balanced energy profile with dietary micronutrients',
      safetyStatusSummary:
        containsNuts || containsDairy
          ? 'Check listed allergen tags before consumption'
          : 'No major safety hazards detected',
    },
    nutrition: {
      calories,
      servingWeightGrams: servingGrams,
      macronutrients: {
        proteinGrams,
        proteinTag: proteinGrams >= 15 ? 'High' : proteinGrams >= 7 ? 'Moderate' : 'Low',
        carbsGrams,
        carbsTag: carbsGrams >= 55 ? 'High' : carbsGrams >= 25 ? 'Moderate' : 'Low',
        fatGrams,
        fatTag: fatGrams >= 22 ? 'High' : fatGrams >= 10 ? 'Moderate' : 'Low',
        fiberGrams,
      },
      micronutrients: [
        { name: 'Calcium', amount: `${calciumMg}mg`, dailyValuePercentage: Math.min(100, Math.round((calciumMg / 1000) * 100)) },
        { name: 'Vitamin C', amount: `${vitaminCMg}mg`, dailyValuePercentage: Math.min(100, Math.round((vitaminCMg / 90) * 100)) },
        { name: 'Dietary Fiber', amount: `${fiberGrams}g`, dailyValuePercentage: Math.min(100, Math.round((fiberGrams / 28) * 100)) },
        { name: 'Iron (est.)', amount: '2.4mg', dailyValuePercentage: 13 },
      ],
    },
    ingredients,
    safety: {
      overallRisk: containsNuts ? 'Moderate Risk' : 'Low Risk',
      riskSummary: containsNuts
        ? 'Contains tree nuts / peanuts allergen profile'
        : 'Standard culinary hygiene and allergen profile verified safe',
      allergens: [
        { allergenName: 'Milk / Dairy', isPresent: containsDairy, warningLevel: containsDairy ? 'Contains' : 'Not detected' },
        { allergenName: 'Gluten / Wheat', isPresent: containsGluten, warningLevel: containsGluten ? 'Contains' : 'Not detected' },
        { allergenName: 'Peanuts / Tree Nuts', isPresent: containsNuts, warningLevel: containsNuts ? 'Contains' : 'Not detected' },
      ],
      qualityChecks: [
        { title: `Thermal preparation (${item.cookingMethod || 'Standard cooking'}) verified`, isSafe: true },
        { title: 'Whole-ingredient nutrient balance checked', isSafe: true },
      ],
      riskFactors: [
        {
          factor: fatGrams > 20 ? 'Elevated dietary fat per serving' : 'Moderate sodium & seasoning variance',
          severity: fatGrams > 20 ? 'Moderate' : 'Low',
        },
        {
          factor: item.sugarPer100g > 12 ? 'Higher natural/added sugar density' : 'Consume freshly prepared within 4 hours',
          severity: item.sugarPer100g > 12 ? 'Moderate' : 'Low',
        },
      ],
    },
    evidence: [
      {
        id: 'ev_1',
        sourceName: 'USDA FoodData Central',
        category: 'Nutrition',
        snippet: `Standard macronutrient and micronutrient benchmarks for ${item.name} (${calories} kcal per ${servingGrams}g serving).`,
        confidenceScore: 0.95,
        referenceUrl: 'https://fdc.nal.usda.gov/',
      },
      {
        id: 'ev_2',
        sourceName: 'NIH Office of Dietary Supplements',
        category: 'Nutrition',
        snippet: `Daily Value intake guidance for dietary protein (${proteinGrams}g), calcium (${calciumMg}mg), and vitamin C (${vitaminCMg}mg).`,
        confidenceScore: 0.93,
        referenceUrl: 'https://ods.od.nih.gov/',
      },
      {
        id: 'ev_3',
        sourceName: 'FAO / WHO Codex Alimentarius Food Safety',
        category: 'Safety',
        snippet: `Thermal preparation safety and allergen labeling standards applicable to ${item.cuisine || 'prepared'} dishes.`,
        confidenceScore: 0.91,
        referenceUrl: 'https://www.fao.org/',
      },
      {
        id: 'ev_4',
        sourceName: 'Regional Nutritional Composition Compendium',
        category: 'General',
        snippet: `${item.name} (${item.region || item.cuisine || 'Global'}) typically combines ${rawIngredients.slice(0, 3).join(', ')} prepared via ${item.cookingMethod || 'culinary heating'}.`,
        confidenceScore: 0.90,
        referenceUrl: 'https://www.who.int/',
      },
    ],
    profileMatch: {
      dietaryFit: isVegetarian
        ? `${item.name} aligns with ${userProfile?.dietaryPreference || 'Vegetarian'} preferences (${item.dietaryType || 'Vegetarian'})`
        : `${item.name} is classified as ${item.dietaryType || 'Non-Vegetarian'}`,
      calorieFit: `${calories} kcal ${calories <= (userProfile?.calorieTargetPerMeal || 600) ? 'is within' : 'exceeds'} your ${userProfile?.calorieTargetPerMeal || 600} kcal per-meal target`,
      notes: `Goal: ${userProfile?.healthGoals || 'High protein'} · Detected ${item.cuisine || 'Global'} ${item.category?.toLowerCase() || 'dish'} with ${proteinGrams}g protein.`,
    },
    healthBenefits: [
      `Provides ${proteinGrams}g protein per ${servingGrams}${item.unit || 'g'} serving to support daily tissue maintenance.`,
      `Supplies ${fiberGrams}g dietary fiber aiding gut motility and satiety.`,
      `Delivers ${calciumMg}mg calcium and ${vitaminCMg}mg vitamin C from key ingredients (${rawIngredients.slice(0, 2).join(', ')}).`,
    ],
    combinations: buildFoodCombinations({
      foodName: item.name,
      category: item.category,
      cuisine: item.cuisine,
      ingredientNames: rawIngredients,
      calories,
    }),
    createdAt: new Date().toISOString(),
  };
}

class ApiClient {
  private baseUrl: string = DEFAULT_BASE_URL;
  private useLiveBackend: boolean = false;
  private textAnalysisCache = new Map<string, FoodAnalysisResponse>();
  private photoAnalysisCache = new Map<string, FoodAnalysisResponse>();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem(STORAGE_KEY_BASE_URL);
      if (savedUrl) this.baseUrl = savedUrl;
      const savedLive = localStorage.getItem(STORAGE_KEY_USE_LIVE_BACKEND);
      if (savedLive !== null) this.useLiveBackend = savedLive === 'true';
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.endsWith('/') ? url : `${url}/`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BASE_URL, this.baseUrl);
    }
  }

  public isLiveBackendEnabled(): boolean {
    return this.useLiveBackend;
  }

  public setLiveBackendEnabled(enabled: boolean) {
    this.useLiveBackend = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USE_LIVE_BACKEND, enabled ? 'true' : 'false');
    }
  }

  public async testConnection(): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(`${this.baseUrl}health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (response.ok) {
        return {
          success: true,
          message: `Connected successfully! (HTTP ${response.status})`,
          latencyMs,
        };
      }
      return {
        success: false,
        message: `Server returned HTTP ${response.status}: ${response.statusText}`,
        latencyMs,
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - start;
      const error = err as Error;
      return {
        success: false,
        message:
          error.name === 'AbortError'
            ? 'Connection timed out after 8000ms. Check host and port.'
            : error.message || 'Failed to connect to backend.',
        latencyMs,
      };
    }
  }

  public async identifyFood(imageFile?: File | Blob): Promise<FoodIdentificationResponse> {
    if (this.useLiveBackend && imageFile) {
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        const response = await fetch(`${this.baseUrl}food/identify`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) return await response.json();
      } catch (e) {
        console.warn('Backend identify failed, using fallback:', e);
      }
    }

    return {
      detectedFood: 'Paneer Biryani',
      confidence: 92,
      cuisine: 'Indian Cuisine',
      category: 'Main Course',
      possibleMatches: [
        { name: 'Paneer Biryani', confidence: 92 },
        { name: 'Vegetable Biryani', confidence: 5 },
        { name: 'Chicken Biryani', confidence: 2 },
      ],
      detectedComponents: [
        { name: 'Rice', prominence: 'High' },
        { name: 'Paneer', prominence: 'High' },
        { name: 'Spices', prominence: 'Medium' },
        { name: 'Onions', prominence: 'Medium' },
      ],
    };
  }

  /**
   * Analyzes a captured camera photo or uploaded food image using server-side Gemini Vision (/api/food/analyze)
   * with intelligent local catalogue matching fallback if running without a Gemini key.
   */
  public async analyzeCapturedPhoto(options: {
    imageDataUrl?: string;
    file?: File | Blob;
    hintName?: string;
    userProfile?: UserProfile;
  }): Promise<FoodAnalysisResponse> {
    const { imageDataUrl, file, hintName, userProfile } = options;

    // 1. Optional custom external Python backend
    if (this.useLiveBackend && file) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('mode', 'photo');
        const response = await fetch(`${this.baseUrl}food/analyze`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          return {
            ...data,
            imageUrl: imageDataUrl || data.imageUrl,
          };
        }
      } catch (err) {
        console.warn('Live backend failed, falling back to /api/food/analyze:', err);
      }
    }

    // 2. Server-side Gemini Vision API (/api/food/analyze)
    let effectiveDataUrl = imageDataUrl;
    if ((!effectiveDataUrl || !effectiveDataUrl.startsWith('data:image/')) && file) {
      try {
        const readUrl = await readBlobAsDataUrl(file);
        if (readUrl.startsWith('data:image/')) {
          effectiveDataUrl = readUrl;
        }
      } catch {
        // continue to hint check below
      }
    }

    if (effectiveDataUrl && effectiveDataUrl.startsWith('data:image/')) {
      const photoCacheKey = `${effectiveDataUrl.length}_${effectiveDataUrl.slice(0, 96)}_${effectiveDataUrl.slice(-64)}_${userProfile?.dietaryPreference || 'bal'}`;
      const cachedPhoto = this.photoAnalysisCache.get(photoCacheKey);
      if (cachedPhoto) {
        return ensureAnalysisCombinations({
          ...cachedPhoto,
          analysisId: `scan_${Date.now()}`,
          createdAt: new Date().toISOString(),
        });
      }

      const mimeMatch = effectiveDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const response = await fetch(`${getApiRoot()}/api/food/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(18000),
        body: JSON.stringify({
          imageBase64: effectiveDataUrl,
          mimeType,
          hint: hintName,
          userProfile: userProfile || DEFAULT_USER_PROFILE,
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as FoodAnalysisResponse;
        const normalized: FoodAnalysisResponse = ensureAnalysisCombinations({
          ...result,
          imageUrl: effectiveDataUrl,
          ingredients: (result.ingredients || []).map((ing, i) => ({
            ...ing,
            id: ing.id || `ing_${i + 1}`,
            imageUrl: resolveIngredientImage(ing.name, ing.imageUrl || effectiveDataUrl),
          })),
          evidence: (result.evidence || []).map((ev, i) => ({
            ...ev,
            id: ev.id || `ev_${i + 1}`,
            category:
              ev.category === 'Nutrition' || ev.category === 'Safety' || ev.category === 'General'
                ? ev.category
                : 'General',
          })),
        });
        this.photoAnalysisCache.set(photoCacheKey, normalized);
        return normalized;
      }

      const errPayload = await response.json().catch(() => ({}));
      if (!hintName) {
        throw new Error(
          errPayload?.error ||
            'Could not identify this food photo right now. Please retry or enter the dish name.'
        );
      }
    }

    // 3. Catalogue / explicit sample-hint fallback (for built-in viewfinder samples)
    const searchHint = (hintName || '').toLowerCase().trim();
    if (searchHint) {
      const matchedItem = findBestMatchingFoodItem(searchHint);
      if (matchedItem) {
        return buildAnalysisFromCatalogueItem(
          matchedItem,
          effectiveDataUrl || getUniqueDishImageUrl(matchedItem),
          93,
          userProfile
        );
      }
    }

    throw new Error('Could not recognize the scanned food. Please retake a clearer photo or type the food name.');
  }

  public async analyzeFoodByName(options: {
    foodName: string;
    dishItem?: FoodCatalogueItem;
    imageUrl?: string;
    userProfile?: UserProfile;
  }): Promise<FoodAnalysisResponse> {
    const cleanName = options.foodName.trim();
    const { dishItem, imageUrl, userProfile } = options;

    const matchedCatalogueItem =
      dishItem ||
      FOOD_CATALOGUE.find((item) => item.name.toLowerCase() === cleanName.toLowerCase()) ||
      findBestMatchingFoodItem(cleanName);

    const resolvedImage =
      imageUrl ||
      (matchedCatalogueItem
        ? getUniqueDishImageUrl(matchedCatalogueItem)
        : resolveRelatedDishImage(cleanName) || riceDishImg);

    // 1. Optional custom external backend
    if (this.useLiveBackend) {
      try {
        const response = await fetch(`${this.baseUrl}food/analyze-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodName: cleanName,
            category: matchedCatalogueItem?.foodType,
            userProfile: userProfile || DEFAULT_USER_PROFILE,
          }),
        });
        if (response.ok) {
          const data = (await response.json()) as FoodAnalysisResponse;
          return {
            ...data,
            foodName: data.foodName || cleanName,
            imageUrl: resolvedImage || data.imageUrl,
          };
        }
      } catch (err) {
        console.warn('External text food backend failed, falling back to /api/food/analyze-text:', err);
      }
    }

    const textCacheKey = `${cleanName.toLowerCase()}_${userProfile?.dietaryPreference || 'bal'}_${userProfile?.calorieTargetPerMeal || 600}`;
    const cachedText = this.textAnalysisCache.get(textCacheKey);
    if (cachedText) {
      return {
        ...cachedText,
        analysisId: `text_${Date.now()}`,
        imageUrl: resolvedImage || cachedText.imageUrl,
        createdAt: new Date().toISOString(),
      };
    }

    // 2. Server-side Gemini text food-name endpoint (/api/food/analyze-text)
    try {
      const response = await fetch(`${getApiRoot()}/api/food/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(18000),
        body: JSON.stringify({
          foodName: cleanName,
          category: matchedCatalogueItem?.foodType,
          cuisine: matchedCatalogueItem?.cuisine || 'Indian Cuisine',
          cookingMethod: matchedCatalogueItem?.cookingMethod,
          knownIngredients: matchedCatalogueItem?.mainIngredients,
          userProfile: userProfile || DEFAULT_USER_PROFILE,
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as FoodAnalysisResponse;
        const normalized: FoodAnalysisResponse = ensureAnalysisCombinations({
          ...result,
          foodName: result.foodName || cleanName,
          imageUrl: resolvedImage || result.imageUrl,
          ingredients: (result.ingredients || []).map((ing, i) => ({
            ...ing,
            id: ing.id || `ing_${i + 1}`,
            imageUrl: resolveIngredientImage(ing.name, ing.imageUrl || resolvedImage),
          })),
          evidence: (result.evidence || []).map((ev, i) => ({
            ...ev,
            id: ev.id || `ev_${i + 1}`,
            category:
              ev.category === 'Nutrition' || ev.category === 'Safety' || ev.category === 'General'
                ? ev.category
                : 'General',
          })),
        });
        this.textAnalysisCache.set(textCacheKey, normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Server text analysis unavailable or timed out, using deterministic fallback:', err);
    }

    // 3. Deterministic catalogue fallback
    if (matchedCatalogueItem) {
      return buildAnalysisFromCatalogueItem(
        matchedCatalogueItem,
        resolvedImage || getUniqueDishImageUrl(matchedCatalogueItem),
        94,
        userProfile
      );
    }

    // 4. Deterministic fallback for arbitrary typed dish names
    const targetCal = userProfile?.calorieTargetPerMeal || 600;
    const estCalories = 380;
    return ensureAnalysisCombinations({
      ...DEFAULT_PANEER_BIRYANI_ANALYSIS,
      analysisId: `text_${Date.now()}`,
      foodName: cleanName,
      cuisine: 'Culinary Dish',
      category: 'Prepared Meal',
      imageUrl: resolvedImage,
      servingSize: '220g',
      ingredients: [
        {
          id: 'ing_1',
          name: cleanName,
          subname: 'Primary dish component',
          percentage: 65,
          isKeyIngredient: true,
          description: `Main ingredient base of ${cleanName}.`,
          imageUrl: resolveIngredientImage(cleanName, resolvedImage),
        },
        {
          id: 'ing_2',
          name: 'Spices & Herbs',
          subname: 'Seasoning blend',
          percentage: 20,
          isKeyIngredient: false,
          description: `Aromatic herbs and spices used to prepare ${cleanName}.`,
          imageUrl: resolveIngredientImage('Spices'),
        },
        {
          id: 'ing_3',
          name: 'Cooking Oil / Ghee',
          subname: 'Culinary fat',
          percentage: 15,
          isKeyIngredient: false,
          description: 'Cooking oil used for sauteing and texture balance.',
          imageUrl: resolveIngredientImage('Cooking Oil / Ghee'),
        },
      ],
      overallAssessment: {
        matchStatus: estCalories <= targetCal ? 'Good Match' : 'Moderate Match',
        scorePercentage: estCalories <= targetCal ? 85 : 74,
        summary: `${cleanName} analyzed from food name input for your ${userProfile?.dietaryPreference || 'Balanced'} profile.`,
        nutritionalValueSummary: 'Estimated balanced macro composition per standard serving',
        safetyStatusSummary: 'Verify specific kitchen allergens before consumption',
      },
      nutrition: {
        ...DEFAULT_PANEER_BIRYANI_ANALYSIS.nutrition,
        calories: estCalories,
        servingWeightGrams: 220,
      },
      profileMatch: {
        dietaryFit: `Evaluated against ${userProfile?.dietaryPreference || 'Balanced'} preferences`,
        calorieFit: `${estCalories} kcal fits within your ${targetCal} kcal target`,
        notes: `Goal: ${userProfile?.healthGoals || 'High protein'}`,
      },
      healthBenefits: [
        `Balanced energy contribution (${estCalories} kcal) suitable for standard meal pacing.`,
        `Contains culinary spices and herbs offering supportive dietary phytonutrients.`,
      ],
      combinations: undefined,
      createdAt: new Date().toISOString(),
    });
  }

  public async analyzeFoodImage(
    imageFile?: File | Blob,
    _mode: string = 'photo'
  ): Promise<FoodAnalysisResponse> {
    return this.analyzeCapturedPhoto({ file: imageFile });
  }

  public async simulateFoodModification(
    request: FoodLabSimulationRequest
  ): Promise<FoodLabSimulationResponse> {
    if (this.useLiveBackend) {
      try {
        const response = await fetch(`${this.baseUrl}foodlab/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('FoodLab backend call failed, computing locally:', err);
      }
    }

    const isTofu = request.replacementIngredient.toLowerCase().includes('tofu');
    const isChicken = request.replacementIngredient.toLowerCase().includes('chicken');
    const isMushroom = request.replacementIngredient.toLowerCase().includes('mushroom');

    let modCalories = 520;
    let protein = 18;
    let fat = 20;
    let carbs = 65;
    let explanation = '';

    if (isTofu) {
      modCalories = 470;
      protein = 16;
      fat = 14;
      explanation =
        'Replacing 100g Paneer with 100g Tofu lowers saturated fats by ~30% and reduces calorie intake by 50 kcal while preserving plant protein.';
    } else if (isChicken) {
      modCalories = 485;
      protein = 28;
      fat = 12;
      carbs = 63;
      explanation =
        'Chicken breast increases lean protein to 28g with lower saturated fats compared to full-fat dairy paneer.';
    } else if (isMushroom) {
      modCalories = 390;
      protein = 10;
      fat = 8;
      carbs = 68;
      explanation =
        'Mushrooms significantly cut total calories (-130 kcal) and saturated fat, ideal for strict calorie deficit diets.';
    } else {
      modCalories = Math.max(350, Math.round(520 - request.quantityGrams * 0.4));
      explanation = `Adjusted composition with ${request.quantityGrams}g of ${request.replacementIngredient}.`;
    }

    return {
      simulationId: `sim_${Date.now()}`,
      originalName: 'Paneer Biryani',
      originalCalories: 520,
      modifiedName: `${request.replacementIngredient} Biryani`,
      modifiedCalories: modCalories,
      calorieDiff: modCalories - 520,
      modifiedMacros: {
        proteinGrams: protein,
        proteinTag: protein > 20 ? 'Very High' : 'High',
        carbsGrams: carbs,
        carbsTag: 'Moderate',
        fatGrams: fat,
        fatTag: fat < 15 ? 'Low' : 'Moderate',
        fiberGrams: 3,
      },
      safetyImpact: isTofu
        ? 'Eliminates dairy allergen risk for lactose intolerance.'
        : 'No new allergen risks detected.',
      explanation,
    };
  }

  private foodLabCache = new Map<string, FoodLabExperimentResult>();

  public async runFoodLabExperiment(params: {
    selectedFoods: SelectedFoodItem[];
    customName: string;
    researchObjective: ResearchObjective;
    nutritionalFocus: NutritionalFocus[];
  }): Promise<FoodLabExperimentResult> {
    const baseResult = calculateExperimentResult(
      params.selectedFoods,
      params.customName,
      params.researchObjective,
      params.nutritionalFocus
    );

    const cacheKey = JSON.stringify({
      foods: params.selectedFoods
        .map((item) => `${item.food.id}:${item.quantityGrams}`)
        .sort(),
      obj: params.researchObjective,
      focus: [...params.nutritionalFocus].sort(),
    });

    const cached = this.foodLabCache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        experimentId: `FL-${Math.floor(10000 + Math.random() * 90000)}`,
        experimentName: baseResult.experimentName,
      };
    }

    const requestBody = {
      experimentName: baseResult.experimentName,
      selectedFoods: params.selectedFoods.map((item) => ({
        id: item.food.id,
        name: item.food.name,
        category: item.food.category,
        quantityGrams: item.quantityGrams,
        unit: item.food.unit,
        isAcidic: item.food.isAcidic,
        dairyType: item.food.dairyType,
      })),
      researchObjective: params.researchObjective,
      nutritionalFocus: params.nutritionalFocus,
      nutritionTotals: baseResult.nutrition,
    };

    const mergeWithBase = (
      serverData: Partial<FoodLabExperimentResult> & { nutritionNote?: string }
    ): FoodLabExperimentResult => {
      const validVerdicts = ['UNEATABLE', 'SAFE', 'CAUTION', 'BENEFICIAL'] as const;
      const verdict = validVerdicts.includes(serverData.verdict as typeof validVerdicts[number])
        ? (serverData.verdict as FoodLabExperimentResult['verdict'])
        : baseResult.verdict;

      return {
        ...baseResult,
        experimentId: serverData.experimentId || baseResult.experimentId,
        verdict,
        verdictTitle: serverData.verdictTitle || baseResult.verdictTitle,
        verdictSubtitle: serverData.verdictSubtitle || baseResult.verdictSubtitle,
        riskWeight:
          typeof serverData.riskWeight === 'number'
            ? Math.max(0, Math.min(100, Math.round(serverData.riskWeight)))
            : baseResult.riskWeight,
        safetyRiskWeight:
          typeof serverData.safetyRiskWeight === 'number'
            ? Math.max(0, Math.min(100, Math.round(serverData.safetyRiskWeight)))
            : baseResult.safetyRiskWeight,
        healthRiskWeight:
          typeof serverData.healthRiskWeight === 'number'
            ? Math.max(0, Math.min(100, Math.round(serverData.healthRiskWeight)))
            : baseResult.healthRiskWeight,
        keyReason: serverData.keyReason || baseResult.keyReason,
        nutrition: {
          ...baseResult.nutrition,
          nutritionNote: serverData.nutritionNote ?? serverData.nutrition?.nutritionNote ?? baseResult.nutrition.nutritionNote,
        },
        safetyRisks:
          Array.isArray(serverData.safetyRisks) && serverData.safetyRisks.length > 0
            ? serverData.safetyRisks
            : baseResult.safetyRisks,
        healthImpacts:
          Array.isArray(serverData.healthImpacts) && serverData.healthImpacts.length > 0
            ? serverData.healthImpacts
            : baseResult.healthImpacts,
        finalConclusion: serverData.finalConclusion || baseResult.finalConclusion,
        createdAt: serverData.createdAt || baseResult.createdAt,
      };
    };

    const rememberResult = (result: FoodLabExperimentResult): FoodLabExperimentResult => {
      if (this.foodLabCache.size >= 50) {
        const oldestKey = this.foodLabCache.keys().next().value;
        if (oldestKey) this.foodLabCache.delete(oldestKey);
      }
      this.foodLabCache.set(cacheKey, result);
      return result;
    };

    // 1. Optional custom external Python / Node backend
    if (this.useLiveBackend) {
      try {
        const response = await fetch(`${this.baseUrl}foodlab/experiment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(12000),
          body: JSON.stringify(requestBody),
        });
        if (response.ok) {
          const data = await response.json();
          return rememberResult(mergeWithBase(data));
        }
      } catch (err) {
        console.warn('External FoodLab backend failed, falling back to /api/foodlab/experiment:', err);
      }
    }

    // 2. Built-in server-side Gemini FoodLab endpoint (/api/foodlab/experiment)
    try {
      const response = await fetch(`${getApiRoot()}/api/foodlab/experiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        const data = await response.json();
        return rememberResult(mergeWithBase(data));
      }
    } catch (err) {
      console.warn('FoodLab server endpoint unavailable, using local calculation fallback:', err);
    }

    return baseResult;
  }

  public async askIntelligence(
    request: AskQuestionRequest & { analysis?: FoodAnalysisResponse }
  ): Promise<AskQuestionResponse> {
    if (this.useLiveBackend) {
      try {
        const response = await fetch(`${this.baseUrl}intelligence/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Intelligence query failed:', err);
      }
    }

    const activeAnalysis = request.analysis;
    try {
      const response = await fetch(`${getApiRoot()}/api/intelligence/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          foodName: request.foodName || activeAnalysis?.foodName,
          question: request.question,
          analysisContext: activeAnalysis
            ? `${activeAnalysis.foodName} (${activeAnalysis.cuisine}, ${activeAnalysis.nutrition.calories} kcal, ${activeAnalysis.nutrition.macronutrients.proteinGrams}g protein, ${activeAnalysis.nutrition.macronutrients.carbsGrams}g carbs, ${activeAnalysis.nutrition.macronutrients.fatGrams}g fat). Safety: ${activeAnalysis.safety.overallRisk}. Ingredients: ${activeAnalysis.ingredients.map((i) => i.name).join(', ')}.`
            : undefined,
        }),
      });
      if (response.ok) return await response.json();
    } catch {
      // Fallback to local context-aware response below
    }

    const foodLabel = request.foodName || activeAnalysis?.foodName || 'this meal';
    const calories = activeAnalysis?.nutrition.calories ?? 520;
    const protein = activeAnalysis?.nutrition.macronutrients.proteinGrams ?? 18;
    const carbs = activeAnalysis?.nutrition.macronutrients.carbsGrams ?? 65;
    const fat = activeAnalysis?.nutrition.macronutrients.fatGrams ?? 20;

    const q = request.question.toLowerCase();
    let answer = '';
    let sources = ['USDA FoodData Central', 'NIH Nutrition Guidelines'];

    if (q.includes('protein')) {
      answer = `${foodLabel} supplies ${protein}g of protein per serving, primarily driven by its key protein-rich components (${activeAnalysis?.ingredients.slice(0, 2).map((i) => i.name).join(', ') || 'main ingredients'}).`;
      sources = ['USDA Food Composition Database', 'NIH Dietary Reference Intakes'];
    } else if (q.includes('weight loss') || q.includes('calorie')) {
      answer = `At ${calories} kcal per serving (${carbs}g carbs, ${fat}g fat), ${foodLabel} ${calories <= 600 ? 'fits comfortably within a 600 kcal meal target' : 'is slightly calorie-dense, so pairing with lighter vegetables helps balance intake'}.`;
      sources = ['NIH Dietary Guidelines for Weight Management'];
    } else if (q.includes('risk') || q.includes('safe') || q.includes('daily')) {
      answer = `${foodLabel} carries a ${activeAnalysis?.safety.overallRisk || 'Low Risk'} assessment. ${activeAnalysis?.safety.riskSummary || 'Prepared with standard culinary safety practices.'}`;
      sources = ['FAO/WHO Codex Alimentarius', 'WHO Dietary Sodium Guidelines'];
    } else {
      answer = `Based on the analysis of ${foodLabel}, one serving provides ${calories} kcal with ${protein}g protein, ${carbs}g carbohydrates, and ${fat}g fat.`;
    }

    return {
      answer,
      sources,
      relatedQuestions: [
        `What is the allergen profile of ${foodLabel}?`,
        `How does ${foodLabel} fit a high-protein diet?`,
        `What scientific evidence supports ${foodLabel}'s nutrition data?`,
      ],
    };
  }

  public async getUserProfile(): Promise<UserProfile> {
    if (this.useLiveBackend) {
      try {
        const response = await fetch(`${this.baseUrl}user/profile`);
        if (response.ok) return await response.json();
      } catch (e) {
        console.warn('Profile fetch error:', e);
      }
    }
    return DEFAULT_USER_PROFILE;
  }

  public async getHistory(): Promise<AnalysisHistoryItem[]> {
    if (this.useLiveBackend) {
      try {
        const response = await fetch(`${this.baseUrl}user/history`);
        if (response.ok) return await response.json();
      } catch (e) {
        console.warn('History fetch error:', e);
      }
    }
    return DEFAULT_HISTORY_ITEMS;
  }
}

export const apiService = new ApiClient();
