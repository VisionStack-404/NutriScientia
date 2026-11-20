import React from 'react';
import { ArrowLeft, FlaskConical, XCircle, CheckCircle2, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { FoodLabExperimentResult } from '../../types/foodlab';
import { getUniqueDishImageUrl } from '../../data/categoryMedia';
import milkAsset from '../../assets/images/food_fresh_milk_1795016934740.jpg';
import orangeAsset from '../../assets/images/food_fresh_orange_1795016933596.jpg';
import oatsAsset from '../../assets/images/dish_nuts_dairy_bowl_1794975849288.jpg';
import almondsAsset from '../../assets/images/food_roasted_almonds_1795016935512.jpg';

interface FoodLabMyExperimentsProps {
  onSelectExperiment: (exp: FoodLabExperimentResult) => void;
  onStartNew: () => void;
  onBack: () => void;
}

export const FoodLabMyExperiments: React.FC<FoodLabMyExperimentsProps> = ({
  onSelectExperiment,
  onStartNew,
  onBack,
}) => {
  // Load saved experiments or provide initial verified benchmarks
  const savedList: FoodLabExperimentResult[] = (() => {
    try {
      const stored = localStorage.getItem('foodlab_saved_experiments');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        experimentId: 'FL-00276',
        experimentName: 'Orange Milk Drink',
        selectedFoods: [
          {
            food: {
              id: 'd_milk',
              name: 'Milk',
              category: 'DAIRY',
              defaultGrams: 100,
              unit: 'ml',
              caloriesPer100g: 61,
              proteinPer100g: 3.2,
              carbsPer100g: 4.8,
              fatPer100g: 3.3,
              sugarPer100g: 5.0,
              fiberPer100g: 0,
              calciumMgPer100g: 120,
              vitaminCMgPer100g: 0,
              imageUrl: milkAsset,
            },
            quantityGrams: 100,
          },
          {
            food: {
              id: 'f_orange',
              name: 'Orange',
              category: 'FRUITS',
              defaultGrams: 100,
              unit: 'g',
              caloriesPer100g: 47,
              proteinPer100g: 0.9,
              carbsPer100g: 11.8,
              fatPer100g: 0.1,
              sugarPer100g: 9.4,
              fiberPer100g: 2.4,
              calciumMgPer100g: 40,
              vitaminCMgPer100g: 53.2,
              imageUrl: orangeAsset,
            },
            quantityGrams: 100,
          },
        ],
        totalWeightGrams: 200,
        combinationType: 'Beverage / Drink',
        ratioSummary: 'Milk (50%) : Orange (50%)',
        researchObjective: 'Complete scientific assessment',
        nutritionalFocus: ['Analyse complete nutrition'],
        verdict: 'UNEATABLE',
        verdictTitle: 'Uneatable (Unsafe)',
        verdictSubtitle: 'Not recommended for consumption.',
        riskWeight: 85,
        safetyRiskWeight: 85,
        healthRiskWeight: 78,
        keyReason: 'Acidic fruit (orange) and milk can react, causing curdling, digestive discomfort and reduced nutrient absorption.',
        nutrition: {
          calories: 108,
          carbsGrams: 16.6,
          proteinGrams: 4.1,
          fatGrams: 3.4,
          sugarGrams: 14.4,
          fiberGrams: 2.4,
          calciumMg: 160,
          vitaminCMg: 53.2,
          nutritionNote: 'Vitamin C from orange reacts with milk casein proteins, reducing its absorption and nutritional benefit.',
        },
        safetyRisks: [
          {
            type: 'Chemical Interaction',
            title: 'Casein Coagulation & Curdling',
            description: 'Acid (citric acid) from orange reacts with milk proteins (casein), causing curdling.',
            severity: 'High',
          },
          {
            type: 'Digestive Risk',
            title: 'Gastric Distress & Acidity',
            description: 'May cause stomach discomfort, acidity, bloating or indigestion.',
            severity: 'High',
          },
        ],
        healthImpacts: [
          { text: 'May cause digestive discomfort (curdling and gas).', status: 'critical' },
          { text: 'Not advisable for people with sensitive stomach or acidity issues.', status: 'critical' },
        ],
        finalConclusion:
          'The combination of Milk + Orange is classified as UNEATABLE (Unsafe) for human consumption due to acid-induced casein curdling and digestive irritation.',
        createdAt: 'Today',
      },
      {
        experimentId: 'FL-00277',
        experimentName: 'Oats & Almond Milk Bowl',
        selectedFoods: [
          {
            food: {
              id: 'g_oats',
              name: 'Oats',
              category: 'GRAINS',
              defaultGrams: 60,
              unit: 'g',
              caloriesPer100g: 389,
              proteinPer100g: 16.9,
              carbsPer100g: 66.3,
              fatPer100g: 6.9,
              sugarPer100g: 0.9,
              fiberPer100g: 10.6,
              calciumMgPer100g: 54,
              vitaminCMgPer100g: 0,
              imageUrl: oatsAsset,
            },
            quantityGrams: 60,
          },
          {
            food: {
              id: 'ns_almonds',
              name: 'Almonds',
              category: 'NUTS AND SEEDS',
              defaultGrams: 30,
              unit: 'g',
              caloriesPer100g: 579,
              proteinPer100g: 21.2,
              carbsPer100g: 21.6,
              fatPer100g: 49.9,
              sugarPer100g: 4.4,
              fiberPer100g: 12.5,
              calciumMgPer100g: 269,
              vitaminCMgPer100g: 0,
              imageUrl: almondsAsset,
            },
            quantityGrams: 30,
          },
        ],
        totalWeightGrams: 90,
        combinationType: 'Solid Meal / Formulation',
        ratioSummary: 'Oats : Almonds',
        researchObjective: 'Nutritional analysis',
        nutritionalFocus: ['High protein', 'High fibre'],
        verdict: 'BENEFICIAL',
        verdictTitle: 'Highly Compatible',
        verdictSubtitle: 'Nutritionally synergistic superfood formulation.',
        riskWeight: 10,
        safetyRiskWeight: 8,
        healthRiskWeight: 12,
        keyReason: 'Soluble beta-glucan fibers combine with monounsaturated healthy fats for optimal cardiovascular and metabolic support.',
        nutrition: {
          calories: 407,
          carbsGrams: 46.2,
          proteinGrams: 16.5,
          fatGrams: 19.1,
          sugarGrams: 1.8,
          fiberGrams: 10.1,
          calciumMg: 113,
          vitaminCMg: 0,
        },
        safetyRisks: [],
        healthImpacts: [
          { text: 'High prebiotic dietary fiber promotes robust microbiome health.', status: 'positive' },
          { text: 'Stable postprandial glucose curve.', status: 'positive' },
        ],
        finalConclusion:
          'The combination of Oats + Almonds is classified as HIGHLY COMPATIBLE and beneficial for human consumption.',
        createdAt: 'Yesterday',
      },
    ];
  })();

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4 justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-1 mb-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="font-extrabold text-sm text-slate-900 leading-tight">My Experiments</h2>
            <span className="text-[10px] text-slate-400 font-semibold">{savedList.length} Formulations Tested</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Experiment Cards List */}
        <div className="space-y-3 pt-2">
          {savedList.map((exp) => {
            const isUneatable = exp.verdict === 'UNEATABLE';
            const isCaution = exp.verdict === 'CAUTION';

            return (
              <div
                key={exp.experimentId}
                onClick={() => onSelectExperiment(exp)}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-1.5 py-0.2 rounded-md">
                        {exp.experimentId}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exp.createdAt}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors pt-0.5">
                      {exp.experimentName}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isUneatable
                        ? 'bg-red-100 text-red-800'
                        : isCaution
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {exp.verdict}
                  </span>
                </div>

                {/* Foods combined thumbnail preview */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-2">
                    {exp.selectedFoods.map((f, i) => (
                      <img
                        key={i}
                        src={getUniqueDishImageUrl(f.food)}
                        alt={f.food.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                        title={f.food.name}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-600 font-medium">
                    {exp.selectedFoods.map((f) => f.food.name).join(' + ')}
                  </span>
                </div>

                {/* Risk Bar Preview */}
                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Risk Weight: <strong className={isUneatable ? 'text-red-600' : 'text-emerald-700'}>{exp.riskWeight} / 100</strong>
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                    <span>View Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start New Experiment Button */}
      <div className="pt-2">
        <button
          onClick={onStartNew}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FlaskConical className="w-4 h-4" />
          <span>Start New Experiment</span>
        </button>
      </div>

    </div>
  );
};
