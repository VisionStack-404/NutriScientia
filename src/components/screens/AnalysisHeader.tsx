import React from 'react';
import { ArrowLeft, Camera } from 'lucide-react';
import { ScreenId, FoodAnalysisResponse } from '../../types/food';
import fallbackMealImg from '../../assets/images/cat_rice_biryanis_1794835955488.jpg';

type AnalysisTabId = 'overview' | 'nutrition' | 'safety' | 'ingredients' | 'combinations' | 'evidence';

interface AnalysisHeaderProps {
  analysis: FoodAnalysisResponse;
  activeTab: AnalysisTabId;
  onNavigate: (screen: ScreenId) => void;
  backTarget?: ScreenId;
}

const TABS: { id: AnalysisTabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'safety', label: 'Safety' },
  { id: 'combinations', label: 'Combinations' },
  { id: 'evidence', label: 'Evidence' },
];

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  analysis,
  activeTab,
  onNavigate,
  backTarget = 'home',
}) => {
  return (
    <>
      {/* Top Bar with Food Thumbnail and Meta */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onNavigate(backTarget)}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 flex-1 mx-2.5 min-w-0">
          <img
            src={analysis.imageUrl || fallbackMealImg}
            alt={analysis.foodName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-slate-900 truncate leading-tight">
              {analysis.foodName}
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              {analysis.cuisine} · {analysis.category}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('capture')}
          className="px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          title="Scan another food"
        >
          <Camera className="w-3 h-3" />
          <span>Rescan</span>
        </button>
      </div>

      {/* Unified 6-Tab Subnav: Overview | Nutrition | Ingredients | Safety | Combinations | Evidence */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </>
  );
};
