import React from 'react';
import {
  ArrowLeft,
  Plus,
  BookOpen,
  FlaskConical,
  FileText,
  HelpCircle,
  Atom,
} from 'lucide-react';
import { FoodLabLogo } from './FoodLabLogo';
import labHeroImg from '../../assets/images/cat_salads_vegetables_1794891501340.jpg';

interface FoodLabHomeProps {
  onStartNewExperiment: () => void;
  onOpenCatalogue: () => void;
  onOpenMyExperiments: () => void;
  onOpenReports: () => void;
  onOpenHelp: () => void;
  onBackToMainApp: () => void;
}

export const FoodLabHome: React.FC<FoodLabHomeProps> = ({
  onStartNewExperiment,
  onOpenCatalogue,
  onOpenMyExperiments,
  onOpenReports,
  onOpenHelp,
  onBackToMainApp,
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4 justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-1 mb-2">
          <button
            onClick={onBackToMainApp}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Back to NutriScientia"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <FoodLabLogo size="md" />
          <div className="w-9" />
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 border border-emerald-200/80 p-5 shadow-xs mb-3">
          <div className="relative z-10 space-y-2 max-w-[210px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-200">
              <Atom className="w-3 h-3 text-emerald-600" />
              Biochemical Simulator
            </span>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              Create, Combine and Test Foods
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Experiment with food combinations and analyse nutrition, safety and health impact.
            </p>
          </div>

          {/* Hero Visual Imagery */}
          <div className="absolute right-2 bottom-3 w-28 h-28 shrink-0 pointer-events-none">
            <img
              src={labHeroImg}
              alt="Virtual Experimentation"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white/80 rotate-3"
            />
          </div>
        </div>

        {/* Primary Action Button: + New Experiment */}
        <button
          onClick={onStartNewExperiment}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer group mb-3"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Plus className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <span>New Experiment</span>
        </button>

        {/* 4 Feature Action Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Food Catalogue */}
          <button
            onClick={onOpenCatalogue}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-all shadow-xs flex flex-col justify-between h-28 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Food Catalogue</div>
              <div className="text-[10px] text-emerald-600 font-semibold">7 clear food categories</div>
            </div>
          </button>

          {/* My Experiments */}
          <button
            onClick={onOpenMyExperiments}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-all shadow-xs flex flex-col justify-between h-28 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">My Experiments</div>
              <div className="text-[10px] text-slate-500">History &amp; formulations</div>
            </div>
          </button>

          {/* Reports */}
          <button
            onClick={onOpenReports}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-all shadow-xs flex flex-col justify-between h-28 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Reports</div>
              <div className="text-[10px] text-slate-500">Downloaded documents</div>
            </div>
          </button>

          {/* Help & Science */}
          <button
            onClick={onOpenHelp}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-all shadow-xs flex flex-col justify-between h-28 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Help &amp; Guide</div>
              <div className="text-[10px] text-slate-500">User tutorial &amp; FAQs</div>
            </div>
          </button>

        </div>
      </div>

      {/* Subtle Bottom Mission statement */}
      <div className="text-center text-[11px] text-slate-400 py-1">
        Virtual Food Experimentation Engine · ISO Standard Food Safety Guidelines
      </div>

    </div>
  );
};
