import { FoodCatalogueItem } from '../data/foodCatalogue';

export interface SelectedFoodItem {
  food: FoodCatalogueItem;
  quantityGrams: number;
}

export type ResearchObjective =
  | 'Complete scientific assessment'
  | 'Nutritional analysis'
  | 'Food compatibility'
  | 'Food safety'
  | 'Health suitability';

export type NutritionalFocus =
  | 'Analyse complete nutrition'
  | 'Low sugar'
  | 'Low fat'
  | 'High protein'
  | 'Rich in vitamins & minerals';

export interface SafetyRiskDetail {
  type: 'Chemical Interaction' | 'Digestive Risk' | 'Nutrient Loss' | 'Stability Issue' | 'Contamination Risk';
  title: string;
  description: string;
  severity: 'High' | 'Moderate' | 'Low';
}

export interface HealthImpactDetail {
  text: string;
  status: 'critical' | 'warning' | 'positive';
}

export interface FoodLabExperimentResult {
  experimentId: string;
  experimentName: string;
  selectedFoods: SelectedFoodItem[];
  totalWeightGrams: number;
  combinationType: string;
  ratioSummary: string;
  researchObjective: ResearchObjective;
  nutritionalFocus: NutritionalFocus[];
  
  // Overall Verdict
  verdict: 'UNEATABLE' | 'SAFE' | 'CAUTION' | 'BENEFICIAL';
  verdictTitle: string;
  verdictSubtitle: string;
  riskWeight: number; // 0 - 100
  safetyRiskWeight: number; // 0 - 100
  healthRiskWeight: number; // 0 - 100
  keyReason: string;
  
  // Nutrition Totals (scaled to selected quantities)
  nutrition: {
    calories: number;
    carbsGrams: number;
    proteinGrams: number;
    fatGrams: number;
    sugarGrams: number;
    fiberGrams: number;
    calciumMg: number;
    vitaminCMg: number;
    nutritionNote?: string;
  };

  // Detailed Analysis
  safetyRisks: SafetyRiskDetail[];
  healthImpacts: HealthImpactDetail[];
  finalConclusion: string;
  createdAt: string;
}

export type FoodLabScreenStep =
  | 'home'
  | 'catalogue'
  | 'select_foods'
  | 'combine_formulate'
  | 'set_requirements'
  | 'run_simulation'
  | 'results'
  | 'report'
  | 'my_experiments'
  | 'reports_view'
  | 'help';

export type ResultsTab = 'Overview' | 'Nutrition' | 'Safety' | 'Health';
