import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, Scale, ShieldCheck } from 'lucide-react';
import { ScreenId, FoodLabSimulationResponse } from '../../types/food';
import { apiService } from '../../services/apiService';
import biryaniImg from '../../assets/images/cat_rice_biryanis_1794835955488.jpg';
import saladBowlImg from '../../assets/images/cat_salads_vegetables_1794891501340.jpg';

interface FoodLabScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const FoodLabScreen: React.FC<FoodLabScreenProps> = ({ onNavigate }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>('Paneer');
  const [replacement, setReplacement] = useState<string>('Tofu');
  const [quantity, setQuantity] = useState<number>(100);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<FoodLabSimulationResponse>({
    simulationId: 'sim_default',
    originalName: 'Paneer Biryani',
    originalCalories: 520,
    modifiedName: 'Tofu Biryani',
    modifiedCalories: 470,
    calorieDiff: -50,
    modifiedMacros: {
      proteinGrams: 16,
      proteinTag: 'High',
      carbsGrams: 65,
      carbsTag: 'Moderate',
      fatGrams: 14,
      fatTag: 'Low',
      fiberGrams: 3,
    },
    safetyImpact: 'Eliminates dairy allergen risk for lactose intolerance.',
    explanation: 'Replacing 100g Paneer with 100g Tofu lowers saturated fats by ~30% and reduces total meal calories by 50 kcal.',
  });

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await apiService.simulateFoodModification({
        originalFoodId: 'biryani_01',
        originalIngredient: selectedIngredient,
        replacementIngredient: replacement,
        quantityGrams: quantity,
      });
      setSimulationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onNavigate('home')}
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-slate-900">FoodLab</span>
        <div className="w-9" />
      </div>

      {/* Screen Title & Description */}
      <div>
        <h2 className="text-base font-bold text-slate-900">FoodLab - What-If Analysis</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Compare and simulate changes to see how they affect nutrition and safety.
        </p>
      </div>

      {/* Original vs Modified Comparison Cards */}
      <div className="grid grid-cols-2 gap-3 items-center relative">
        {/* Original Card */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Original</span>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs mb-2">
            <img
              src={biryaniImg}
              alt="Original Dish"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-xs text-slate-900 leading-tight">Paneer Biryani</span>
          <span className="text-xs font-black text-amber-600 mt-1">520 kcal</span>
        </div>

        {/* Center Arrow Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Modified Card */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300 shadow-xs flex flex-col items-center text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Modified</span>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-400 shadow-xs mb-2">
            <img
              src={saladBowlImg}
              alt="Modified Dish"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-xs text-slate-900 leading-tight">{simulationResult.modifiedName}</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-black text-emerald-700">{simulationResult.modifiedCalories} kcal</span>
            {simulationResult.calorieDiff < 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded-sm">
                {simulationResult.calorieDiff}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modify Ingredient Section */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Modify Ingredient</h3>

        {/* Replacement Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Replace {selectedIngredient} with</label>
          <select
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          >
            <option value="Tofu">Tofu (Soy-based, Low saturated fat)</option>
            <option value="Chicken Breast">Chicken Breast (High lean protein)</option>
            <option value="Mushrooms">Portobello Mushrooms (Low calorie)</option>
            <option value="Tempeh">Tempeh (Fermented whole soy)</option>
            <option value="Cauliflower">Cauliflower Florets (Low carb)</option>
          </select>
        </div>

        {/* Quantity Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 font-medium">Quantity</span>
            <span className="font-bold text-slate-900">{quantity} g</span>
          </div>
          <input
            type="range"
            min="25"
            max="250"
            step="25"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>25g</span>
            <span>100g</span>
            <span>250g</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {isSimulating ? (
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-400" />
          )}
          <span>{isSimulating ? 'Simulating impact...' : 'Simulate Changes →'}</span>
        </button>
      </div>

      {/* Simulation Result Impact Insights */}
      {simulationResult && (
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 space-y-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Simulation Impact Insights</span>
          </div>

          <p className="text-slate-700 leading-relaxed text-[11px]">
            {simulationResult.explanation}
          </p>

          <div className="flex items-center gap-2 text-emerald-800 text-[11px] pt-1 border-t border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{simulationResult.safetyImpact}</span>
          </div>
        </div>
      )}

    </div>
  );
};
