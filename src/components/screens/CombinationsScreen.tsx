import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldAlert,
  BookOpen,
  ExternalLink,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { ScreenId, FoodAnalysisResponse } from '../../types/food';
import { AnalysisHeader } from './AnalysisHeader';
import { ensureAnalysisCombinations } from '../../services/foodCombinationsFallback';
import { resolveIngredientImage } from '../../data/categoryMedia';
import fallbackImg from '../../assets/images/ing_aromatic_spices_1795019001866.jpg';

interface CombinationsScreenProps {
  analysis: FoodAnalysisResponse;
  onNavigate: (screen: ScreenId) => void;
}

export const CombinationsScreen: React.FC<CombinationsScreenProps> = ({
  analysis,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'safe' | 'unsafe'>('all');
  const enriched = ensureAnalysisCombinations(analysis);
  const safeCombos = enriched.combinations?.safeCombinations || [];
  const unsafeCombos = enriched.combinations?.unsafeCombinations || [];
  const totalCombos = safeCombos.length + unsafeCombos.length;

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4">
      <AnalysisHeader
        analysis={analysis}
        activeTab="combinations"
        onNavigate={onNavigate}
        backTarget="overview"
      />

      {/* Combinations Hero Summary Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Food Combinations &amp; Pairing Audit
        </h3>
        <div className="flex items-center gap-3 pt-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-sm text-slate-900 leading-tight truncate">
              {safeCombos.length} Safe · {unsafeCombos.length} Avoid for {analysis.foodName}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Nutrient synergy &amp; digestive compatibility backed by evidence
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar: All | Safe to Eat | Unsafe / Avoid */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({totalCombos})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('safe')}
          className={`flex-1 py-2 px-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'safe'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Safe ({safeCombos.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unsafe')}
          className={`flex-1 py-2 px-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'unsafe'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Avoid ({unsafeCombos.length})
        </button>
      </div>

      {/* Safe to Eat With Section */}
      {(activeTab === 'all' || activeTab === 'safe') && safeCombos.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Safe to Eat With</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {safeCombos.length} pairings
            </span>
          </div>

          <div className="space-y-2.5">
            {safeCombos.map((combo) => (
              <div
                key={combo.foodName}
                className="p-3 rounded-2xl bg-emerald-50/55 border border-emerald-200/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white border border-emerald-200 overflow-hidden shrink-0">
                      <img
                        src={resolveIngredientImage(combo.foodName)}
                        alt={combo.foodName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src !== fallbackImg) img.src = fallbackImg;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900">
                          {analysis.foodName} + {combo.foodName}
                        </h4>
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                        {combo.summary}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 whitespace-nowrap">
                    Safe
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  {combo.scientificReason}
                </p>

                <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-emerald-900">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">Evidence: {combo.evidenceSource}</span>
                  </div>
                  {combo.referenceUrl && (
                    <a
                      href={combo.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-0.5 shrink-0"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unsafe / Avoid Combining With Section */}
      {(activeTab === 'all' || activeTab === 'unsafe') && unsafeCombos.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Unsafe / Avoid Combining With</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {unsafeCombos.length} warnings
            </span>
          </div>

          <div className="space-y-2.5">
            {unsafeCombos.map((combo) => (
              <div
                key={combo.foodName}
                className="p-3 rounded-2xl bg-rose-50/55 border border-rose-200/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white border border-rose-200 overflow-hidden shrink-0">
                      <img
                        src={resolveIngredientImage(combo.foodName)}
                        alt={combo.foodName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src !== fallbackImg) img.src = fallbackImg;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900">
                        {analysis.foodName} + {combo.foodName}
                      </h4>
                      <p className="text-[11px] font-semibold text-rose-800 mt-0.5">
                        {combo.summary}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200 shrink-0 whitespace-nowrap">
                    {combo.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  {combo.scientificReason}
                </p>

                <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-rose-900">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookOpen className="w-3 h-3 text-rose-600 shrink-0" />
                    <span className="truncate">Evidence: {combo.evidenceSource}</span>
                  </div>
                  {combo.referenceUrl && (
                    <a
                      href={combo.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-700 hover:text-rose-900 inline-flex items-center gap-0.5 shrink-0"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask AI about a specific pairing */}
      <button
        type="button"
        onClick={() => onNavigate('ask')}
        className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>Ask AI About Another {analysis.foodName} Pairing</span>
      </button>
    </div>
  );
};
