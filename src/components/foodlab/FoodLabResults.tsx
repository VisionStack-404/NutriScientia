import React, { useState } from 'react';
import {
  ArrowLeft,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Flame,
  HeartPulse,
  Info,
} from 'lucide-react';
import { FoodLabExperimentResult, ResultsTab } from '../../types/foodlab';
import { getUniqueDishImageUrl } from '../../data/categoryMedia';
import resultFallbackImg from '../../assets/images/cat_salads_vegetables_1794891501340.jpg';

interface FoodLabResultsProps {
  result: FoodLabExperimentResult;
  onOpenReport: () => void;
  onBack: () => void;
}

export const FoodLabResults: React.FC<FoodLabResultsProps> = ({
  result,
  onOpenReport,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<ResultsTab>('Overview');

  const isUneatable = result.verdict === 'UNEATABLE';
  const isCaution = result.verdict === 'CAUTION';

  const tabs: ResultsTab[] = ['Overview', 'Nutrition', 'Safety', 'Health'];

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
            <h2 className="font-extrabold text-sm text-slate-900 leading-tight">
              {activeTab === 'Overview' ? 'Results Overview' : `${activeTab} Analysis`}
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
              Step 5 of 5
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Subnav Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold mb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-center whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="space-y-3.5">
            {/* Product Hero Banner */}
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
              <div className="h-32 w-full relative bg-slate-100">
                <img
                  src={
                    result.selectedFoods[0]?.food
                      ? getUniqueDishImageUrl(result.selectedFoods[0].food)
                      : resultFallbackImg
                  }
                  alt={result.experimentName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-white">
                  <h3 className="font-black text-base leading-tight drop-shadow-sm">
                    {result.experimentName}
                  </h3>
                  <p className="text-[11px] text-white/90 font-medium">
                    {result.selectedFoods.map((f) => f.food.name).join(' + ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Verdict Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-xs ${
                isUneatable
                  ? 'bg-red-50 border-red-200 text-red-950'
                  : isCaution
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isUneatable
                    ? 'bg-red-600 text-white'
                    : isCaution
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isUneatable ? (
                  <XCircle className="w-5 h-5 stroke-[2.5]" />
                ) : isCaution ? (
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight">{result.verdictTitle}</h4>
                <p className="text-xs opacity-90 mt-0.5">{result.verdictSubtitle}</p>
              </div>
            </div>

            {/* Risk Weight (Overall) */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">Risk Weight (Overall)</span>
                <span
                  className={`font-black text-sm ${
                    isUneatable ? 'text-red-600' : isCaution ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {result.riskWeight} / 100{' '}
                  <span className="text-[11px] font-bold">
                    ({isUneatable ? 'Very High Risk' : isCaution ? 'Moderate Risk' : 'Low Risk'})
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isUneatable ? 'bg-red-500' : isCaution ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${result.riskWeight}%` }}
                />
              </div>
            </div>

            {/* Key Reason Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-950 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Key Reason</span>
                <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                  {result.keyReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NUTRITION ANALYSIS */}
        {activeTab === 'Nutrition' && (
          <div className="space-y-3.5">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                  Nutritional Composition
                </h3>
                <p className="text-[11px] text-slate-500">
                  (Per Serving: {result.totalWeightGrams} g)
                </p>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Energy', value: `${result.nutrition.calories} kcal`, icon: Flame, color: 'text-amber-600' },
                  { label: 'Carbohydrates', value: `${result.nutrition.carbsGrams} g`, icon: Flame, color: 'text-emerald-600' },
                  { label: 'Protein', value: `${result.nutrition.proteinGrams} g`, icon: Flame, color: 'text-blue-600' },
                  { label: 'Total Fat', value: `${result.nutrition.fatGrams} g`, icon: Flame, color: 'text-rose-600' },
                  { label: 'Total Sugar', value: `${result.nutrition.sugarGrams} g`, icon: Flame, color: 'text-purple-600' },
                  { label: 'Fibre', value: `${result.nutrition.fiberGrams} g`, icon: Flame, color: 'text-teal-600' },
                  { label: 'Calcium', value: `${result.nutrition.calciumMg} mg`, icon: Flame, color: 'text-sky-600' },
                  { label: 'Vitamin C', value: `${result.nutrition.vitaminCMg} mg`, icon: Flame, color: 'text-orange-600' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-none"
                  >
                    <span className="font-semibold text-slate-700">{row.label}</span>
                    <span className={`font-black text-xs ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chemical Nutrition Interaction Note */}
            {result.nutrition.nutritionNote && (
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900 shadow-xs">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Note:</strong> {result.nutrition.nutritionNote}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FOOD SAFETY ANALYSIS */}
        {activeTab === 'Safety' && (
          <div className="space-y-3.5">
            {/* Safety Verdict Card */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-xs ${
                isUneatable
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <span className="font-extrabold text-xs">Safety Verdict:</span>
              </div>
              <span className="font-black text-xs uppercase">
                {isUneatable ? 'Unsafe / Not Recommended' : 'Verified Safe'}
              </span>
            </div>

            {/* Identified Risks */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Identified Risks
              </h3>

              <div className="space-y-2.5 text-xs">
                {result.safetyRisks.map((risk, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{risk.title}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          risk.severity === 'High'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Risk Weight Card */}
            <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Safety Risk Weight</span>
                <span
                  className={`font-black ${
                    result.safetyRiskWeight >= 70
                      ? 'text-red-700'
                      : result.safetyRiskWeight >= 40
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {result.safetyRiskWeight} / 100 (
                  {result.safetyRiskWeight >= 70
                    ? 'Very High'
                    : result.safetyRiskWeight >= 40
                    ? 'Moderate'
                    : 'Low'}
                  )
                </span>
              </div>
              <div className="w-full bg-red-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    result.safetyRiskWeight >= 70
                      ? 'bg-red-600'
                      : result.safetyRiskWeight >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${result.safetyRiskWeight}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HEALTH ANALYSIS */}
        {activeTab === 'Health' && (
          <div className="space-y-3.5">
            {/* Health Suitability Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-xs ${
                isUneatable
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-600" />
                <span className="font-extrabold text-xs">Health Suitability:</span>
              </div>
              <span className="font-black text-xs uppercase">
                {isUneatable ? 'Not Suitable' : 'Suitable'}
              </span>
            </div>

            {/* Health Impact Breakdown */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Health Impact
              </h3>

              <div className="space-y-2 text-xs">
                {result.healthImpacts.map((impact, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-800 py-1">
                    {impact.status === 'critical' ? (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    ) : impact.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[11px] leading-relaxed font-medium">{impact.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Health Weight */}
            <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Overall Health Weight</span>
                <span
                  className={`font-black ${
                    result.healthRiskWeight >= 70
                      ? 'text-red-700'
                      : result.healthRiskWeight >= 40
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {result.healthRiskWeight} / 100 (
                  {result.healthRiskWeight >= 70
                    ? 'High Risk'
                    : result.healthRiskWeight >= 40
                    ? 'Moderate Risk'
                    : 'Low Risk'}
                  )
                </span>
              </div>
              <div className="w-full bg-red-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    result.healthRiskWeight >= 70
                      ? 'bg-red-600'
                      : result.healthRiskWeight >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${result.healthRiskWeight}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer: View Full PDF Report */}
      <div className="pt-2">
        <button
          onClick={onOpenReport}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Experiment Report (PDF) →</span>
        </button>
      </div>

    </div>
  );
};
