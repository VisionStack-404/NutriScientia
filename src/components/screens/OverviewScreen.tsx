import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  BookOpen,
  ChevronRight,
  HeartPulse,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { ScreenId, FoodAnalysisResponse } from '../../types/food';
import { AnalysisHeader } from './AnalysisHeader';
import fallbackMealImg from '../../assets/images/cat_rice_biryanis_1794835955488.jpg';
import { deriveHealthBenefits, generateMealAnalysisPdf } from '../../services/pdfReportService';
import { dispatchAppNotification } from '../../services/settingsService';

interface OverviewScreenProps {
  analysis: FoodAnalysisResponse;
  backTarget?: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  analysis,
  backTarget = 'home',
  onNavigate,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<string | null>(null);
  const healthBenefits = deriveHealthBenefits(analysis);
  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4">
      <AnalysisHeader
        analysis={analysis}
        activeTab="overview"
        onNavigate={onNavigate}
        backTarget={backTarget}
      />

      {/* Identified Food Name & Captured Photo Hero Card */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="relative h-36 w-full">
          <img
            src={analysis.imageUrl || fallbackMealImg}
            alt={analysis.foodName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-bold shadow-md flex items-center gap-1 border border-emerald-400/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>{analysis.confidence}% Match</span>
          </div>
          <div className="absolute bottom-2.5 left-3 right-3 text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Identified Food Name
            </span>
            <h3 className="text-lg font-extrabold leading-tight truncate">{analysis.foodName}</h3>
            <p className="text-[11px] text-slate-200">
              {analysis.cuisine} · {analysis.category} · {analysis.servingSize}
            </p>
          </div>
        </div>
      </div>

      {/* Quick 4-Macro Stats Row */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div
          onClick={() => onNavigate('nutrition')}
          className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 cursor-pointer hover:bg-amber-100/60 transition-colors"
        >
          <div className="text-base font-extrabold text-amber-700">{analysis.nutrition.calories}</div>
          <div className="text-[10px] text-amber-800 font-medium">kcal</div>
          <div className="text-[9px] text-amber-600">(per serving)</div>
        </div>

        <div
          onClick={() => onNavigate('nutrition')}
          className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200/80 cursor-pointer hover:bg-blue-100/60 transition-colors"
        >
          <div className="text-base font-extrabold text-blue-700">
            {analysis.nutrition.macronutrients.proteinGrams}g
          </div>
          <div className="text-[10px] text-blue-800 font-medium">Protein</div>
          <div className="text-[9px] text-blue-600">
            ({analysis.nutrition.macronutrients.proteinTag})
          </div>
        </div>

        <div
          onClick={() => onNavigate('nutrition')}
          className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 cursor-pointer hover:bg-emerald-100/60 transition-colors"
        >
          <div className="text-base font-extrabold text-emerald-700">
            {analysis.nutrition.macronutrients.carbsGrams}g
          </div>
          <div className="text-[10px] text-emerald-800 font-medium">Carbs</div>
          <div className="text-[9px] text-emerald-600">
            ({analysis.nutrition.macronutrients.carbsTag})
          </div>
        </div>

        <div
          onClick={() => onNavigate('nutrition')}
          className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200/80 cursor-pointer hover:bg-rose-100/60 transition-colors"
        >
          <div className="text-base font-extrabold text-rose-700">
            {analysis.nutrition.macronutrients.fatGrams}g
          </div>
          <div className="text-[10px] text-rose-800 font-medium">Fat</div>
          <div className="text-[9px] text-rose-600">
            ({analysis.nutrition.macronutrients.fatTag})
          </div>
        </div>
      </div>

      {/* Overall Assessment Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Overall Assessment
        </div>

        <div className="flex items-center justify-between">
          <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{analysis.overallAssessment.matchStatus}</span>
          </div>
          <span className="text-lg font-black text-emerald-700">
            {analysis.overallAssessment.scorePercentage}%
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {analysis.overallAssessment.summary}
        </p>

        <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
          <div
            onClick={() => onNavigate('nutrition')}
            className="flex items-start justify-between gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800">Nutritional Value</div>
                <div className="text-[11px] text-slate-500">
                  {analysis.overallAssessment.nutritionalValueSummary}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          </div>

          <div
            onClick={() => onNavigate('safety')}
            className="flex items-start justify-between gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800">Safety Status</div>
                <div className="text-[11px] text-slate-500">
                  {analysis.overallAssessment.safetyStatusSummary}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          </div>

          <div
            onClick={() => onNavigate('evidence')}
            className="flex items-start justify-between gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800">Scientific Evidence</div>
                <div className="text-[11px] text-slate-500">
                  {analysis.evidence.length} verified references (USDA, NIH, FAO/WHO)
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          </div>
        </div>
      </div>

      {/* Your Profile Match Card */}
      <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-3.5 flex items-start gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-xs text-emerald-950">Your Profile Match</div>
          <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
            {analysis.profileMatch.dietaryFit}
          </p>
        </div>
      </div>

      {/* Health Benefits Card */}
      {healthBenefits.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span>Health Benefits</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {healthBenefits.length} Key Insights
            </span>
          </div>

          <ul className="space-y-1.5">
            {healthBenefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety Risks & Allergen Highlights Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle
              className={`w-4 h-4 ${
                analysis.safety.overallRisk === 'High Risk'
                  ? 'text-rose-600'
                  : analysis.safety.overallRisk === 'Moderate Risk'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
              }`}
            />
            <span>Safety Risks &amp; Allergens</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('safety')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Full audit &rarr;
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">{analysis.safety.overallRisk}:</strong>{' '}
          {analysis.safety.riskSummary}
        </p>

        {analysis.safety.riskFactors.length > 0 && (
          <div className="space-y-1">
            {analysis.safety.riskFactors.slice(0, 2).map((rf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-950"
              >
                <span className="font-medium">{rf.factor}</span>
                <span className="text-[10px] font-bold uppercase text-amber-700">{rf.severity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safe to Eat & Unsafe to Avoid Combinations Preview */}
      {(() => {
        const safeList = analysis.combinations?.safeCombinations || [];
        const unsafeList = analysis.combinations?.unsafeCombinations || [];
        if (safeList.length === 0 && unsafeList.length === 0) return null;

        return (
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Food Combinations Guide
              </div>
              <button
                onClick={() => onNavigate('combinations')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                See all &rarr;
              </button>
            </div>

            {safeList.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Safe to Eat With ({safeList.length})</span>
                </div>
                <div className="space-y-1.5">
                  {safeList.slice(0, 2).map((item) => (
                    <div
                      key={item.foodName}
                      onClick={() => onNavigate('combinations')}
                      className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 cursor-pointer hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.foodName}</span>
                        <span className="text-[10px] font-bold text-emerald-700">Safe</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unsafeList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Unsafe / Avoid With ({unsafeList.length})</span>
                </div>
                <div className="space-y-1.5">
                  {unsafeList.slice(0, 2).map((item) => (
                    <div
                      key={item.foodName}
                      onClick={() => onNavigate('combinations')}
                      className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/70 cursor-pointer hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.foodName}</span>
                        <span className="text-[10px] font-bold text-rose-700">{item.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Deep Dives Action Grid */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
        <button
          onClick={() => onNavigate('combinations')}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex flex-col items-center cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="font-semibold text-[11px] text-slate-800">Combinations</span>
          <span className="text-[9px] text-slate-400">Safe &amp; unsafe foods</span>
        </button>

        <button
          onClick={() => onNavigate('evidence')}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex flex-col items-center cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-purple-600 mb-1" />
          <span className="font-semibold text-[11px] text-slate-800">Evidence</span>
          <span className="text-[9px] text-slate-400">Scientific basis</span>
        </button>

        <button
          onClick={() => onNavigate('safety')}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex flex-col items-center cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="font-semibold text-[11px] text-slate-800">Safety</span>
          <span className="text-[9px] text-slate-400">Allergens &amp; risk</span>
        </button>

        <button
          onClick={() => onNavigate('ask')}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex flex-col items-center cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-600 mb-1" />
          <span className="font-semibold text-[11px] text-slate-800">Ask AI</span>
          <span className="text-[9px] text-slate-400">Contextual Q&amp;A</span>
        </button>
      </div>

      {/* Download Complete Meal Report (PDF) Section */}
      <div className="pt-1 space-y-2">
        <button
          type="button"
          disabled={isGeneratingPdf}
          onClick={async () => {
            setIsGeneratingPdf(true);
            setPdfFeedback(null);
            try {
              const { filename } = await generateMealAnalysisPdf(analysis);
              setPdfFeedback(`Downloaded ${filename}`);
              dispatchAppNotification({
                category: 'reportNotifications',
                title: 'PDF Meal Report Ready',
                message: `${analysis.foodName} report (${filename}) saved to your device.`,
              });
            } catch {
              setPdfFeedback('Could not generate PDF report. Please retry.');
            } finally {
              setIsGeneratingPdf(false);
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>
            {isGeneratingPdf ? 'Generating PDF Report...' : 'Download Report (PDF with Photo)'}
          </span>
        </button>

        {pdfFeedback && (
          <p className="text-center text-[11px] font-semibold text-emerald-700">{pdfFeedback}</p>
        )}
      </div>
    </div>
  );
};
