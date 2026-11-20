import React from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { ScreenId, FoodAnalysisResponse } from '../../types/food';
import fallbackMealImg from '../../assets/images/cat_rice_biryanis_1794835955488.jpg';

interface IdentificationScreenProps {
  analysis: FoodAnalysisResponse;
  onNavigate: (screen: ScreenId) => void;
  onContinueAnalysis: () => void;
}

export const IdentificationScreen: React.FC<IdentificationScreenProps> = ({
  analysis,
  onNavigate,
  onContinueAnalysis,
}) => {
  const topComponents = analysis.ingredients.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onNavigate('capture')}
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-slate-900">Identified Food</span>
        <div className="w-9" />
      </div>

      {/* Food Visual Preview & Primary Identification Card */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="relative h-44 w-full">
          <img
            src={analysis.imageUrl || fallbackMealImg}
            alt={analysis.foodName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center gap-1 border border-emerald-400/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{analysis.confidence}% Confidence</span>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-bold text-slate-900 leading-tight">{analysis.foodName}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {analysis.cuisine} · {analysis.category}
          </p>
        </div>
      </div>

      {/* Recognition Details Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recognition Details
          </h3>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
            Vision AI Confirmed
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Food Name</span>
            <span className="font-bold text-slate-900 text-xs truncate block">{analysis.foodName}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Cuisine</span>
            <span className="font-bold text-slate-900 text-xs truncate block">{analysis.cuisine}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Course Type</span>
            <span className="font-bold text-slate-900 text-xs truncate block">{analysis.category}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Estimated Serving</span>
            <span className="font-bold text-slate-900 text-xs">{analysis.servingSize}</span>
          </div>
        </div>
      </div>

      {/* Detected Components Section */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Detected components
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          {topComponents.map((comp) => (
            <div
              key={comp.id || comp.name}
              className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center"
            >
              <span className="font-semibold text-[11px] text-slate-900 line-clamp-1">
                {comp.name}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-1 bg-emerald-100 text-emerald-800 border-emerald-200">
                {comp.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          onClick={() => onNavigate('ingredients')}
          className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
        >
          View all ingredients
        </button>

        <button
          onClick={onContinueAnalysis}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>View Full Analysis</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
