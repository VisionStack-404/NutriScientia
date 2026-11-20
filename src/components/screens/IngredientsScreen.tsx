import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { ScreenId, FoodAnalysisResponse, IngredientItem } from '../../types/food';
import { AnalysisHeader } from './AnalysisHeader';
import { resolveIngredientImage } from '../../data/categoryMedia';
import ingFallbackImg from '../../assets/images/ing_aromatic_spices_1795019001866.jpg';

interface IngredientsScreenProps {
  analysis: FoodAnalysisResponse;
  onNavigate: (screen: ScreenId) => void;
}

export const IngredientsScreen: React.FC<IngredientsScreenProps> = ({ analysis, onNavigate }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientItem>(
    analysis.ingredients[0]
  );

  useEffect(() => {
    setSelectedIngredient(analysis.ingredients[0]);
  }, [analysis.analysisId, analysis.ingredients]);

  const activeIngredient = selectedIngredient || analysis.ingredients[0];
  const selectedImgSrc = activeIngredient
    ? resolveIngredientImage(
        activeIngredient.name,
        activeIngredient.imageUrl || analysis.imageUrl || ingFallbackImg
      )
    : ingFallbackImg;

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4">
      <AnalysisHeader
        analysis={analysis}
        activeTab="ingredients"
        onNavigate={onNavigate}
        backTarget="overview"
      />

      {/* Ingredients List Section */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Ingredients (estimated)
          </h3>
          <span className="text-[11px] text-slate-400">
            Total: {analysis.ingredients.length} components
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {analysis.ingredients.map((ing) => {
            const isSelected = activeIngredient?.id === ing.id && activeIngredient?.name === ing.name;
            const ingThumb = resolveIngredientImage(
              ing.name,
              ing.imageUrl || analysis.imageUrl || ingFallbackImg
            );

            return (
              <div
                key={ing.id || ing.name}
                onClick={() => setSelectedIngredient(ing)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                {/* Ingredient Image Thumbnail */}
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={ingThumb}
                    alt={ing.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== ingFallbackImg) img.src = ingFallbackImg;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name, Subname & Percentage Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-slate-900 truncate">{ing.name}</span>
                      {ing.subname && (
                        <span className="text-slate-400 text-[10px] truncate">({ing.subname})</span>
                      )}
                    </div>
                    <span className="font-black text-slate-800 text-xs ml-2 shrink-0">{ing.percentage}%</span>
                  </div>

                  {/* Percentage Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ing.percentage >= 30
                          ? 'bg-emerald-500'
                          : ing.percentage >= 15
                          ? 'bg-teal-500'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, ing.percentage * 1.8)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ingredient Details Spotlight Card */}
      {activeIngredient && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ingredient Details</span>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
              <img
                src={selectedImgSrc}
                alt={activeIngredient.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== ingFallbackImg) img.src = ingFallbackImg;
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm text-slate-900">{activeIngredient.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeIngredient.percentage}% share
                </span>
              </div>
              {activeIngredient.subname && (
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {activeIngredient.subname}
                </p>
              )}
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {activeIngredient.description ||
                  `${activeIngredient.name} contributes primary nutrition and culinary flavor in ${analysis.foodName}.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

