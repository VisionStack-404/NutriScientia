import React from 'react';
import { ArrowLeft, ChevronRight, Info, CheckSquare, Square, Sparkles } from 'lucide-react';
import { ResearchObjective, NutritionalFocus } from '../../types/foodlab';

interface FoodLabSetRequirementsProps {
  researchObjective: ResearchObjective;
  onUpdateObjective: (objective: ResearchObjective) => void;
  nutritionalFocus: NutritionalFocus[];
  onToggleFocus: (focus: NutritionalFocus) => void;
  onProceedToSimulation: () => void;
  onBack: () => void;
}

export const FoodLabSetRequirements: React.FC<FoodLabSetRequirementsProps> = ({
  researchObjective,
  onUpdateObjective,
  nutritionalFocus,
  onToggleFocus,
  onProceedToSimulation,
  onBack,
}) => {
  const objectiveOptions: ResearchObjective[] = [
    'Complete scientific assessment',
    'Nutritional analysis',
    'Food compatibility',
    'Food safety',
    'Health suitability',
  ];

  const focusOptions: NutritionalFocus[] = [
    'Analyse complete nutrition',
    'Low sugar',
    'Low fat',
    'High protein',
    'Rich in vitamins & minerals',
  ];

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
            <h2 className="font-extrabold text-sm text-slate-900 leading-tight">Set Requirements</h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
              Step 3 of 5
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Research Objective Dropdown */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Research Objective
          </label>
          <select
            value={researchObjective}
            onChange={(e) => onUpdateObjective(e.target.value as ResearchObjective)}
            className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs cursor-pointer"
          >
            {objectiveOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Nutritional Focus Checkboxes */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Nutritional Focus <span className="text-slate-400 font-normal lowercase">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400">Multiple allowed</span>
          </div>

          <div className="space-y-2">
            {focusOptions.map((item) => {
              const isChecked = nutritionalFocus.includes(item);
              return (
                <div
                  key={item}
                  onClick={() => onToggleFocus(item)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs">{item}</span>
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Callout Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2.5 text-blue-900 text-xs shadow-xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            The system will evaluate edibility, safety risks and health impact of the combination based on chemical interactions and trusted scientific nutrition databases.
          </p>
        </div>
      </div>

      {/* Next Step Button */}
      <div className="pt-2">
        <button
          onClick={onProceedToSimulation}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
