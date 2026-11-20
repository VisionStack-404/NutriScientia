import React, { useState } from 'react';
import { ArrowLeft, X, Flame, FlaskConical } from 'lucide-react';
import { FoodCatalogueItem } from '../../data/foodCatalogue';
import { getUniqueDishImageUrl } from '../../data/categoryMedia';
import { FoodCategoryBrowser } from '../FoodCategoryBrowser';

interface FoodLabCatalogueViewProps {
  onBack: () => void;
  onStartExperimentWithFood: (food: FoodCatalogueItem) => void;
}

export const FoodLabCatalogueView: React.FC<FoodLabCatalogueViewProps> = ({
  onBack,
  onStartExperimentWithFood,
}) => {
  const [inspectingFood, setInspectingFood] = useState<FoodCatalogueItem | null>(null);

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-3 relative">
      {/* Top Header */}
      <header className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
          aria-label="Back to FoodLab Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0">
          <h2 className="font-bold text-sm text-slate-900 leading-tight truncate">
            Food Categories
          </h2>
          <p className="text-[11px] text-slate-500 truncate">
            7 clear sections · Unique food photography
          </p>
        </div>

        <div className="w-11 shrink-0" />
      </header>

      <FoodCategoryBrowser
        mode="catalogue"
        onInspectFood={(dish) => setInspectingFood(dish)}
      />

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
                  aria-label="Close food details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-100 border border-slate-100 relative">
                <img
                  src={inspectingFood.imageUrl || getUniqueDishImageUrl(inspectingFood)}
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
                  <span className="text-slate-500">Cuisine</span>
                  <span className="font-semibold text-slate-800">
                    {inspectingFood.cuisine || 'Global'}
                  </span>
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
                className="flex-1 min-h-[44px] py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const dish = inspectingFood;
                  setInspectingFood(null);
                  onStartExperimentWithFood(dish);
                }}
                className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Mix in Lab</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
