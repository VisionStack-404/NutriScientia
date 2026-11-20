export type ScreenId =
  | 'home'
  | 'capture'
  | 'identification'
  | 'analysis_progress'
  | 'overview'
  | 'ingredients'
  | 'nutrition'
  | 'safety'
  | 'combinations'
  | 'evidence'
  | 'foodlab'
  | 'ask'
  | 'history'
  | 'profile'
  | 'auth'
  | 'settings'
  | 'about';

export interface FoodIdentificationMatch {
  name: string;
  confidence: number; // percentage
  thumbnailUrl?: string;
}

export interface DetectedComponent {
  name: string;
  prominence: 'High' | 'Medium' | 'Low';
}

export interface FoodIdentificationResponse {
  detectedFood: string;
  confidence: number;
  cuisine: string;
  category: string;
  possibleMatches: FoodIdentificationMatch[];
  detectedComponents: DetectedComponent[];
}

export interface Macronutrients {
  proteinGrams: number;
  proteinTag: string;
  carbsGrams: number;
  carbsTag: string;
  fatGrams: number;
  fatTag: string;
  fiberGrams?: number;
}

export interface MicronutrientItem {
  name: string;
  amount: string;
  dailyValuePercentage: number;
}

export interface NutritionData {
  calories: number;
  servingWeightGrams: number;
  macronutrients: Macronutrients;
  micronutrients: MicronutrientItem[];
}

export interface IngredientItem {
  id: string;
  name: string;
  subname?: string;
  percentage: number;
  isKeyIngredient?: boolean;
  description?: string;
  imageUrl?: string;
}

export interface AllergenStatus {
  allergenName: string;
  isPresent: boolean;
  warningLevel: 'Contains' | 'Not detected' | 'May Contain';
}

export interface QualityCheckItem {
  title: string;
  isSafe: boolean;
}

export interface RiskFactorItem {
  factor: string;
  severity: 'Low' | 'Moderate' | 'High';
}

export interface SafetyAssessment {
  overallRisk: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  riskSummary: string;
  allergens: AllergenStatus[];
  qualityChecks: QualityCheckItem[];
  riskFactors: RiskFactorItem[];
}

export interface EvidenceSource {
  id: string;
  sourceName: string;
  category: 'Nutrition' | 'Safety' | 'General';
  snippet: string;
  confidenceScore?: number;
  referenceUrl?: string;
}

export interface OverallAssessment {
  matchStatus: string;
  scorePercentage: number;
  summary: string;
  nutritionalValueSummary: string;
  safetyStatusSummary: string;
}

export interface ProfileMatchInfo {
  dietaryFit: string;
  calorieFit: string;
  notes?: string;
}

export interface FoodCombinationAdvice {
  foodName: string;
  status: 'Safe' | 'Avoid' | 'Unsafe';
  summary: string;
  scientificReason: string;
  evidenceSource: string;
  referenceUrl?: string;
}

export interface FoodCombinationsData {
  safeCombinations: FoodCombinationAdvice[];
  unsafeCombinations: FoodCombinationAdvice[];
}

export interface FoodAnalysisResponse {
  analysisId: string;
  foodName: string;
  cuisine: string;
  category: string;
  imageUrl?: string;
  confidence: number;
  servingSize: string;
  overallAssessment: OverallAssessment;
  nutrition: NutritionData;
  ingredients: IngredientItem[];
  safety: SafetyAssessment;
  evidence: EvidenceSource[];
  profileMatch: ProfileMatchInfo;
  healthBenefits?: string[];
  combinations?: FoodCombinationsData;
  createdAt: string;
}

export interface FoodLabSimulationRequest {
  originalFoodId: string;
  originalIngredient: string;
  replacementIngredient: string;
  quantityGrams: number;
}

export interface FoodLabSimulationResponse {
  simulationId: string;
  originalName: string;
  originalCalories: number;
  modifiedName: string;
  modifiedCalories: number;
  calorieDiff: number;
  modifiedMacros: Macronutrients;
  safetyImpact: string;
  explanation: string;
}

export interface AskQuestionRequest {
  foodId?: string;
  foodName?: string;
  question: string;
  userDietaryProfile?: string;
}

export interface AskQuestionResponse {
  answer: string;
  sources: string[];
  relatedQuestions: string[];
}

export interface NotificationPreferences {
  foodAnalysisAlerts: boolean;
  foodLabNotifications: boolean;
  reportNotifications: boolean;
  appUpdates: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: NotificationPreferences;
}

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  age: number | null;
  photoUrl?: string | null;
  dietaryPreference: string;
  allergies: string[];
  healthGoals: string;
  calorieTargetPerMeal: number;
  preferences?: AppSettings;
  updatedAt?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  foodName: string;
  cuisine?: string;
  category?: string;
  calories: number;
  proteinGrams: number;
  carbsGrams?: number;
  fatGrams?: number;
  matchScore?: number;
  overallRisk?: string;
  timestamp: string;
  createdAtIso?: string;
  imageUrl?: string;
  analysisSnapshot?: FoodAnalysisResponse;
}

export interface PipelineStep {
  id: string;
  title: string;
  subtitle: string;
  status: 'pending' | 'in_progress' | 'completed';
}
