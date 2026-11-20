import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, CheckCircle2, Calendar, HardDrive, Eye } from 'lucide-react';
import { FoodLabExperimentResult } from '../../types/foodlab';

interface FoodLabReportsViewProps {
  onViewReportDetails: (experimentId: string) => void;
  onBack: () => void;
}

export const FoodLabReportsView: React.FC<FoodLabReportsViewProps> = ({
  onViewReportDetails,
  onBack,
}) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const reports = [
    {
      id: 'FL-00276',
      title: 'Orange Milk Drink - Scientific Report',
      date: 'Today',
      size: '142 KB',
      format: 'PDF / Text Certified',
      verdict: 'UNEATABLE (Unsafe)',
      isUnsafe: true,
      summary: 'Acidic curdling of bovine casein micelles by fruit citric acid.',
    },
    {
      id: 'FL-00277',
      title: 'Oats & Almonds Formulation Report',
      date: 'Yesterday',
      size: '168 KB',
      format: 'PDF / Text Certified',
      verdict: 'HIGHLY COMPATIBLE',
      isUnsafe: false,
      summary: 'Cardiovascular lipid lowering through beta-glucan and MUFA synergy.',
    },
    {
      id: 'FL-00271',
      title: 'Paneer & Spinach Mineral Assessment',
      date: '3 days ago',
      size: '135 KB',
      format: 'PDF / Text Certified',
      verdict: 'BENEFICIAL',
      isUnsafe: false,
      summary: 'Calcium and iron transport kinetics in cooked green dairy matrix.',
    },
  ];

  const handleDownloadReport = (rep: typeof reports[0]) => {
    const text = `========================================================================
FOOD LAB™ - CERTIFIED VIRTUAL EXPERIMENT REPORT
========================================================================
Report Identifier: ${rep.id}
Product Formulation: ${rep.title}
Date of Generation: ${rep.date}
Biochemical Verdict: ${rep.verdict}
Core Finding: ${rep.summary}

Status: Certified by NutriScientia Scientific Engine
========================================================================
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rep.title.replace(/\s+/g, '_')}_${rep.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadNotice(rep.id);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

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
            <h2 className="font-extrabold text-sm text-slate-900 leading-tight">Experiment Reports</h2>
            <span className="text-[10px] text-slate-400 font-semibold">{reports.length} Generated Documents</span>
          </div>
          <div className="w-9" />
        </div>

        {downloadNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Re-downloaded report <strong>{downloadNotice}</strong></span>
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-3 pt-1">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{rep.id}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                        rep.isUnsafe
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {rep.verdict}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 truncate mt-0.5">{rep.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {rep.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {rep.size}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                {rep.summary}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <button
                  onClick={() => onViewReportDetails(rep.id)}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => handleDownloadReport(rep)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Again</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Done Button */}
      <div className="pt-2">
        <button
          onClick={onBack}
          className="w-full py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
        >
          Back to FoodLab
        </button>
      </div>

    </div>
  );
};
