import React, { useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, X, Flame, Zap } from 'lucide-react';
import { FOOD_CATALOGUE, FoodCatalogueItem } from '../../data/foodCatalogue';
import { getUniqueDishImageUrl } from '../../data/categoryMedia';
import { SelectedFoodItem } from '../../types/foodlab';
import { FoodCategoryBrowser } from '../FoodCategoryBrowser';

interface FoodLabSelectFoodsProps {
  selectedFoods: SelectedFoodItem[];
  onToggleFood: (food: FoodCatalogueItem) => void;
  onApplyQuickMix?: (foods: FoodCatalogueItem[], mixName: string) => void;
  onProceedToCombine: () => void;
  onBack: () => void;
}

const QUICK_LAB_PRESETS = [
  { label: 'Milk + Orange', ids: ['d_milk', 'f_orange'], name: 'Milk & Orange Compatibility Test', badge: 'Acid Reaction' },
  { label: 'Spinach + Orange', ids: ['FOOD_ID_0017', 'f_orange'], name: 'Spinach & Orange Iron Boost', badge: 'Synergy' },
  { label: 'Chai + Spinach', ids: ['FOOD_ID_0024', 'FOOD_ID_0017'], name: 'Masala Chai & Spinach Test', badge: 'Tannin Check' },
  { label: 'Oats + Banana', ids: ['g_oats', 'FOOD_ID_0016'], name: 'Yogurt Oats & Banana Mix', badge: 'Balanced' },
];

export const FoodLabSelectFoods: React.FC<FoodLabSelectFoodsProps> = ({
  selectedFoods,
  onToggleFood,
  onApplyQuickMix,
  onProceedToCombine,
  onBack,
}) => {
  const [inspectingFood, setInspectingFood] = useState<FoodCatalogueItem | null>(null);

  const catalogueMap = useMemo(() => {
    const map = new Map<string, FoodCatalogueItem>();
    for (const item of FOOD_CATALOGUE) {
      map.set(item.id, item);
    }
    return map;
  }, []);

  const isSelected = (id: string) => selectedFoods.some((f) => f.food.id === id);

  const handlePresetClick = (preset: typeof QUICK_LAB_PRESETS[number]) => {
    const resolved = preset.ids
      .map((id) => catalogueMap.get(id))
      .filter((item): item is FoodCatalogueItem => Boolean(item));
    if (resolved.length >= 2 && onApplyQuickMix) {
      onApplyQuickMix(resolved, preset.name);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-3 justify-between relative">
      <div>
        <div className="flex items-center justify-between pt-1 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Back to FoodLab Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-sm text-slate-900 leading-tight">
              Select Foods to Combine
            </h2>
            <span className="text-[11px] text-slate-500">
              Step 1 of 5 · Pick 2 or more items to formulate
            </span>
          </div>
          <div className="w-11" />
        </div>

        {/* 1-Tap Quick Lab Mixes */}
        {onApplyQuickMix && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-slate-700">Quick Lab Tests</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_LAB_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-slate-900 whitespace-nowrap">
                    {preset.label}
                  </div>
                  <div className="text-[9px] font-semibold text-emerald-700 whitespace-nowrap">
                    {preset.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <FoodCategoryBrowser
          mode="experiment"
          selectedFoodIds={selectedFoods.map((f) => f.food.id)}
          onToggleFood={onToggleFood}
          onInspectFood={(dish) => setInspectingFood(dish)}
        />
      </div>

      {/* Food Details Modal */}
      {inspectingFood && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-slate-500">
                  {inspectingFood.foodType} · {inspectingFood.dietaryType}
                </span>
                <button
                  type="button"
                  onClick={() => setInspectingFood(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-100 border border-slate-100 relative">
                <img
                  src={getUniqueDishImageUrl(inspectingFood)}
                  alt={inspectingFood.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 tabular-nums">
                  <Flame className="w-3 h-3 text-amber-400" />
                  {inspectingFood.caloriesPer100g} kcal / 100g
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-tight mb-1">
                {inspectingFood.name}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {inspectingFood.description}
              </p>

              <div className="bg-slate-50 rounded-xl p-2.5 mb-3 border border-slate-100 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cooking Method</span>
                  <span className="font-semibold text-slate-800">{inspectingFood.cookingMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Category</span>
                  <span className="font-semibold text-slate-800">{inspectingFood.foodType}</span>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Main Ingredients
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {inspectingFood.mainIngredients.join(' · ')}
                </p>
              </div>

              <div className="mb-4">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Nutritional Profile (per 100g)
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] tabular-nums">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-1.5">
                    <span className="block text-slate-500 text-[9px]">Protein</span>
                    <strong className="text-emerald-800 font-bold">
                      {inspectingFood.proteinPer100g}g
                    </strong>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-1.5">
                    <span className="block text-slate-500 text-[9px]">Carbs</span>
                    <strong className="text-amber-800 font-bold">
                      {inspectingFood.carbsPer100g}g
                    </strong>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-1.5">
                    <span className="block text-slate-500 text-[9px]">Fats</span>
                    <strong className="text-blue-800 font-bold">
                      {inspectingFood.fatPer100g}g
                    </strong>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-1.5">
                    <span className="block text-slate-500 text-[9px]">Fiber</span>
                    <strong className="text-purple-800 font-bold">
                      {inspectingFood.fiberPer100g}g
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectingFood(null)}
                className="flex-1 min-h-[44px] py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleFood(inspectingFood);
                  setInspectingFood(null);
                }}
                className={`flex-1 min-h-[44px] py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                  isSelected(inspectingFood.id)
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isSelected(inspectingFood.id) ? 'Remove from Mix' : 'Add to Mix'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-20 pt-2 border-t border-slate-200 bg-white/95 backdrop-blur-md -mx-4 -mb-6 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-900 tabular-nums">
            {selectedFoods.length} items selected
          </div>
          <div className="flex items-center gap-1 mt-1">
            {selectedFoods.slice(0, 4).map((f) => (
              <img
                key={f.food.id}
                src={getUniqueDishImageUrl(f.food)}
                alt={f.food.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-400"
                title={f.food.name}
              />
            ))}
            {selectedFoods.length > 4 && (
              <span className="text-[10px] text-slate-500 font-bold ml-1 tabular-nums">
                +{selectedFoods.length - 4}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToCombine}
          disabled={selectedFoods.length < 2}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
