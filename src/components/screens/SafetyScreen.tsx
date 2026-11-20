import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { ScreenId, FoodAnalysisResponse } from '../../types/food';
import { AnalysisHeader } from './AnalysisHeader';
import { ensureAnalysisCombinations } from '../../services/foodCombinationsFallback';
import { resolveIngredientImage } from '../../data/categoryMedia';

interface SafetyScreenProps {
  analysis: FoodAnalysisResponse;
  onNavigate: (screen: ScreenId) => void;
}

export const SafetyScreen: React.FC<SafetyScreenProps> = ({ analysis, onNavigate }) => {
  const [comboTab, setComboTab] = useState<'all' | 'safe' | 'unsafe'>('all');
  const enriched = ensureAnalysisCombinations(analysis);
  const { safety } = enriched;
  const safeCombos = enriched.combinations?.safeCombinations || [];
  const unsafeCombos = enriched.combinations?.unsafeCombinations || [];

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4">
      <AnalysisHeader
        analysis={analysis}
        activeTab="safety"
        onNavigate={onNavigate}
        backTarget="overview"
      />

      {/* Safety Assessment Hero Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Safety Assessment</h3>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-emerald-700 leading-tight">
              {safety.overallRisk}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {safety.riskSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Safe to Eat & Unsafe to Avoid Food Combinations */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Combinations for {analysis.foodName}
          </h3>
          <button
            onClick={() => onNavigate('evidence')}
            className="text-[11px] font-bold text-purple-700 hover:text-purple-800 cursor-pointer shrink-0"
          >
            Evidence &rarr;
          </button>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setComboTab('all')}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
              comboTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            All ({safeCombos.length + unsafeCombos.length})
          </button>
          <button
            type="button"
            onClick={() => setComboTab('safe')}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
              comboTab === 'safe' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Safe ({safeCombos.length})
          </button>
          <button
            type="button"
            onClick={() => setComboTab('unsafe')}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
              comboTab === 'unsafe' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Avoid ({unsafeCombos.length})
          </button>
        </div>

        {(comboTab === 'all' || comboTab === 'safe') && safeCombos.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Safe to Eat With</span>
            </div>

            {safeCombos.map((combo) => (
              <div
                key={combo.foodName}
                className="p-3 rounded-xl bg-emerald-50/55 border border-emerald-200/80 space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 overflow-hidden shrink-0">
                    <img
                      src={resolveIngredientImage(combo.foodName)}
                      alt={combo.foodName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        + {combo.foodName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        Safe to Eat
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-900 mt-0.5">
                      {combo.summary}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {combo.scientificReason}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium pt-0.5">
                  <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Evidence: {combo.evidenceSource}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {(comboTab === 'all' || comboTab === 'unsafe') && unsafeCombos.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Unsafe / Avoid Combining With</span>
            </div>

            {unsafeCombos.map((combo) => (
              <div
                key={combo.foodName}
                className="p-3 rounded-xl bg-rose-50/55 border border-rose-200/80 space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 overflow-hidden shrink-0">
                    <img
                      src={resolveIngredientImage(combo.foodName)}
                      alt={combo.foodName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        &times; {combo.foodName}
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200 shrink-0">
                        {combo.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-rose-900 mt-0.5">
                      {combo.summary}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {combo.scientificReason}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium pt-0.5">
                  <BookOpen className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>Evidence: {combo.evidenceSource}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allergens Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Allergens</h3>

        <div className="space-y-2 text-xs">
          {safety.allergens.map((allergen) => (
            <div
              key={allergen.allergenName}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                {allergen.isPresent ? (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                <span className="font-semibold text-slate-800">{allergen.allergenName}</span>
              </div>
              <span
                className={`font-medium text-[11px] px-2 py-0.5 rounded-full ${
                  allergen.isPresent
                    ? 'bg-amber-100 text-amber-800 font-bold'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {allergen.warningLevel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Food Safety Quality Checks Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Food Safety</h3>

        <div className="space-y-2 text-xs">
          {safety.qualityChecks.map((check) => (
            <div key={check.title} className="flex items-center gap-2.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">{check.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Risk Factors</h3>

        <div className="space-y-2 text-xs">
          {safety.riskFactors.map((factor) => (
            <div
              key={factor.factor}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50/40 border border-amber-100 text-slate-800"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium text-[11px]">{factor.factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
