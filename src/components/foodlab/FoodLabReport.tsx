import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { FoodLabExperimentResult } from '../../types/foodlab';
import { generateFoodLabPdf } from '../../services/pdfReportService';
import { dispatchAppNotification } from '../../services/settingsService';

interface FoodLabReportProps {
  result: FoodLabExperimentResult;
  onBackToResults: () => void;
  onBackToHome: () => void;
}

export const FoodLabReport: React.FC<FoodLabReportProps> = ({
  result,
  onBackToResults,
  onBackToHome,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isUneatable = result.verdict === 'UNEATABLE';

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const { filename } = await generateFoodLabPdf(result);
      dispatchAppNotification({
        category: 'reportNotifications',
        title: 'FoodLab PDF Report Downloaded',
        message: `${result.experimentName} (${filename}) exported as PDF.`,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveExperiment = () => {
    setIsSaved(true);
    // save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('foodlab_saved_experiments') || '[]');
      existing.unshift(result);
      localStorage.setItem('foodlab_saved_experiments', JSON.stringify(existing.slice(0, 20)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4 justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-1 mb-3">
          <button
            onClick={onBackToResults}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm text-slate-900">Experiment Report</span>
          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Big Red PDF Icon & Title Header */}
        <div className="flex flex-col items-center text-center space-y-2 py-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-red-500 text-white flex flex-col items-center justify-center shadow-lg shadow-red-500/25 ring-4 ring-red-100">
            <FileText className="w-8 h-8 stroke-[2.2]" />
            <span className="text-[9px] font-black tracking-wider uppercase mt-0.5">PDF</span>
          </div>

          <div>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              {result.experimentName}
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Scientific Experiment Report
            </p>
            <span className="inline-block mt-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Experiment ID: {result.experimentId}
            </span>
          </div>
        </div>

        {/* Included Report Sections Checklist */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2 mt-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Verified Report Contents
          </span>

          <div className="space-y-1.5 text-xs text-slate-700">
            {[
              'Experiment Overview & Objectives',
              'Formulation Details & Gram Ratios',
              'Nutritional Analysis & Macronutrients',
              'Food Safety Assessment & Curdling Checks',
              'Health Suitability Analysis',
              'Risk Weight & Biochemical Conclusions',
            ].map((sec) => (
              <div key={sec} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-[11px]">{sec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Download PDF and Save Experiment */}
        <div className="space-y-2 pt-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>

          <button
            onClick={handleSaveExperiment}
            className={`w-full py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? 'Saved to My Experiments!' : 'Save to My Experiments'}</span>
          </button>
        </div>
      </div>

      {/* Final Conclusion Banner at Bottom */}
      <div
        className={`p-4 rounded-3xl border text-xs shadow-md space-y-2.5 ${
          isUneatable
            ? 'bg-red-50/95 border-red-300 text-red-950'
            : 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isUneatable ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isUneatable ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <span className="font-black text-sm uppercase tracking-wide">Final Conclusion</span>
            <p className="text-[11px] leading-relaxed mt-1 opacity-95">
              {result.finalConclusion}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-red-200/80 flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-700">Overall Assessment</span>
          <div className="flex items-center gap-2">
            <span className="font-bold">
              Risk Weight: <strong>{result.riskWeight} / 100</strong>
            </span>
            <span
              className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px] ${
                isUneatable
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {result.verdict}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
