import React, { useMemo } from 'react';
import { ArrowLeft, Trash2, ChevronRight, Scale, Sparkles, Check, Zap } from 'lucide-react';
import { SelectedFoodItem } from '../../types/foodlab';
import { getUniqueDishImageUrl } from '../../data/categoryMedia';
import { calculateExperimentResult } from '../../services/foodLabEngine';

interface FoodLabCombineFormulateProps {
  selectedFoods: SelectedFoodItem[];
  productName: string;
  onUpdateProductName: (name: string) => void;
  onRemoveFood: (foodId: string) => void;
  onProceedToRequirements: () => void;
  onRunQuickSimulation?: () => void;
  onBack: () => void;
}

export const FoodLabCombineFormulate: React.FC<FoodLabCombineFormulateProps> = ({
  selectedFoods,
  productName,
  onUpdateProductName,
  onRemoveFood,
  onProceedToRequirements,
  onRunQuickSimulation,
  onBack,
}) => {
  const isBeverage = selectedFoods.some(
    (f) => f.food.unit === 'ml' || (f.food.category === 'DAIRY' && f.food.name.includes('Milk'))
  );

  const instantPreview = useMemo(
    () =>
      calculateExperimentResult(
        selectedFoods,
        productName || 'Formulation Mix',
        'Complete scientific assessment',
        ['Analyse complete nutrition']
      ),
    [selectedFoods, productName]
  );

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
            <h2 className="font-extrabold text-sm text-slate-900 leading-tight">Combine &amp; Formulate</h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
              Step 2 of 5
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Selected Foods List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Selected Food Ingredients
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {selectedFoods.length} Items Active
            </span>
          </div>

          <div className="space-y-2">
            {selectedFoods.map(({ food, quantityGrams }) => (
              <div
                key={food.id}
                className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getUniqueDishImageUrl(food)}
                    alt={food.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">{food.name}</h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {food.category.toLowerCase().replace(/_/g, ' ')} · {quantityGrams}{food.unit}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-semibold mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Standard Formulated Serving</span>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                {selectedFoods.length > 2 && (
                  <button
                    onClick={() => onRemoveFood(food.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove ingredient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulation Summary + Instant Live Macro Preview */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 space-y-2.5 mt-4">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-900">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Formulation Overview</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 tabular-nums">
              {instantPreview.totalWeightGrams}g total
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-2 py-1 border-b border-slate-200/60">
              <span className="text-slate-500 shrink-0">Active Blend</span>
              <span className="font-bold text-slate-800 text-right truncate">
                {selectedFoods.map((f) => f.food.name).join(' + ')}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Combination Type</span>
              <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[11px]">
                {isBeverage ? 'Beverage / Drink' : 'Solid Food / Formulation'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-200/70 text-center tabular-nums">
            <div className="rounded-xl bg-white border border-slate-200/70 p-1.5">
              <div className="text-[9px] text-slate-500">Energy</div>
              <div className="text-[11px] font-extrabold text-amber-700">
                {instantPreview.nutrition.calories} kcal
              </div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200/70 p-1.5">
              <div className="text-[9px] text-slate-500">Protein</div>
              <div className="text-[11px] font-extrabold text-blue-700">
                {instantPreview.nutrition.proteinGrams}g
              </div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200/70 p-1.5">
              <div className="text-[9px] text-slate-500">Carbs</div>
              <div className="text-[11px] font-extrabold text-emerald-700">
                {instantPreview.nutrition.carbsGrams}g
              </div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200/70 p-1.5">
              <div className="text-[9px] text-slate-500">Fat</div>
              <div className="text-[11px] font-extrabold text-rose-700">
                {instantPreview.nutrition.fatGrams}g
              </div>
            </div>
          </div>
        </div>

        {/* New Product Name Field */}
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            New Product Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={productName}
              onChange={(e) => onUpdateProductName(e.target.value)}
              placeholder="e.g. Orange Milk Drink"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
            />
            <Sparkles className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Action Buttons: Fast Run or Customize Requirements */}
      <div className="pt-2 space-y-2">
        {onRunQuickSimulation && (
          <button
            type="button"
            onClick={onRunQuickSimulation}
            disabled={selectedFoods.length < 2 || !productName.trim()}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Run Lab Analysis Now</span>
          </button>
        )}
        <button
          type="button"
          onClick={onProceedToRequirements}
          disabled={selectedFoods.length < 2 || !productName.trim()}
          className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 ${
            onRunQuickSimulation
              ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 py-3.5 text-sm'
          }`}
        >
          <span>Customize Objective &amp; Focus</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
