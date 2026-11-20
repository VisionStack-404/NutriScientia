import React, { useState } from 'react';
import { ScreenId, FoodAnalysisResponse } from '../../types/food';
import { AnalysisHeader } from './AnalysisHeader';

interface NutritionScreenProps {
  analysis: FoodAnalysisResponse;
  onNavigate: (screen: ScreenId) => void;
}

export const NutritionScreen: React.FC<NutritionScreenProps> = ({ analysis, onNavigate }) => {
  const [activeNutrientTab, setActiveNutrientTab] = useState<'macronutrients' | 'micronutrients'>('macronutrients');

  const { nutrition } = analysis;
  const { macronutrients, micronutrients } = nutrition;

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4">
      <AnalysisHeader
        analysis={analysis}
        activeTab="nutrition"
        onNavigate={onNavigate}
        backTarget="overview"
      />

      {/* Nutrition Circular Donut Gauge Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 leading-tight">Nutrition Profile</h3>
          <p className="text-[11px] text-slate-500">(per serving - {analysis.servingSize || '250g'})</p>
        </div>

        {/* Circular Donut & Macro Badges Container */}
        <div className="flex items-center justify-between gap-4 py-2">
          
          {/* Calorie Ring SVG */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="38"
                className="stroke-slate-100"
                strokeWidth="10"
                fill="none"
              />
              {/* Carbs segment (50%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                className="stroke-emerald-500"
                strokeWidth="10"
                fill="none"
                strokeDasharray="238.7"
                strokeDashoffset="119.3"
              />
              {/* Protein segment (27%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                className="stroke-blue-500"
                strokeWidth="10"
                fill="none"
                strokeDasharray="238.7"
                strokeDashoffset="174.2"
                style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }}
              />
              {/* Fat segment (23%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                className="stroke-rose-500"
                strokeWidth="10"
                fill="none"
                strokeDasharray="238.7"
                strokeDashoffset="183.8"
                style={{ transform: 'rotate(277deg)', transformOrigin: 'center' }}
              />
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 leading-none">{nutrition.calories}</span>
              <span className="text-xs font-semibold text-slate-500 mt-0.5">kcal</span>
            </div>
          </div>

          {/* Macro Metric Labels with Colored Dots */}
          <div className="space-y-2 text-xs flex-1">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-blue-50/70">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-blue-950 text-[11px]">Protein</span>
              </div>
              <span className="font-bold text-blue-800">{macronutrients.proteinGrams}g</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/70">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-950 text-[11px]">Carbs</span>
              </div>
              <span className="font-bold text-emerald-800">{macronutrients.carbsGrams}g</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50/70">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-semibold text-rose-950 text-[11px]">Fat</span>
              </div>
              <span className="font-bold text-rose-800">{macronutrients.fatGrams}g</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50/70">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-amber-950 text-[11px]">Fiber</span>
              </div>
              <span className="font-bold text-amber-800">{macronutrients.fiberGrams || 3}g</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs: Macronutrients vs Micronutrients */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveNutrientTab('macronutrients')}
            className={`text-xs font-bold pb-1 border-b-2 transition-colors cursor-pointer ${
              activeNutrientTab === 'macronutrients'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Macronutrients
          </button>
          <button
            onClick={() => setActiveNutrientTab('micronutrients')}
            className={`text-xs font-bold pb-1 border-b-2 transition-colors cursor-pointer ${
              activeNutrientTab === 'micronutrients'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Micronutrients
          </button>
        </div>

        {activeNutrientTab === 'macronutrients' ? (() => {
          const pCal = macronutrients.proteinGrams * 4;
          const cCal = macronutrients.carbsGrams * 4;
          const fCal = macronutrients.fatGrams * 9;
          const totalCal = Math.max(1, pCal + cCal + fCal);
          const proteinPct = Math.round((pCal / totalCal) * 100);
          const carbsPct = Math.round((cCal / totalCal) * 100);
          const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

          return (
            <div className="space-y-3 text-xs">
              {/* Protein */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Protein</span>
                  <span className="text-slate-900 font-bold">{macronutrients.proteinGrams}g <span className="text-slate-400 font-normal">({proteinPct}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${proteinPct}%` }} />
                </div>
              </div>

              {/* Carbohydrates */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Carbohydrates</span>
                  <span className="text-slate-900 font-bold">{macronutrients.carbsGrams}g <span className="text-slate-400 font-normal">({carbsPct}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${carbsPct}%` }} />
                </div>
              </div>

              {/* Fat */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Fat</span>
                  <span className="text-slate-900 font-bold">{macronutrients.fatGrams}g <span className="text-slate-400 font-normal">({fatPct}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${fatPct}%` }} />
                </div>
              </div>
            </div>
          );
        })() : (
          <div className="space-y-2.5 text-xs">
            {micronutrients.map((micro) => (
              <div key={micro.name} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                <div>
                  <span className="font-semibold text-slate-800">{micro.name}</span>
                  <span className="text-[11px] text-slate-400 ml-2">{micro.amount}</span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  {micro.dailyValuePercentage}% DV
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
