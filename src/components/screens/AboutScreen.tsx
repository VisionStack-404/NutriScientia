import React from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  FlaskConical,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ScreenId } from '../../types/food';

const NUTRISICENTIA_LOGO_URL = '/assets/aistudio/WA_1795017645854_f49b3ef0.jpeg';

interface AboutScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50/70">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="font-display font-bold text-sm text-slate-900 leading-tight">
            About NutriScientia
          </h1>
          <p className="text-[11px] text-slate-500">Product &amp; Company Information</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          aria-label="Open Settings"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Hero Brand Card */}
        <section className="rounded-3xl bg-white border border-emerald-200/80 p-5 text-center space-y-3 shadow-xs">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white border border-emerald-200 p-1.5 shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src={NUTRISICENTIA_LOGO_URL}
              alt="NutriScientia Emblem"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
              NutriScientia
            </h2>
            <p className="text-xs font-bold text-emerald-700">
              Food Insight AI Virtual Lab
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Powered by 6 Monkeys Inc.</span>
          </div>
        </section>

        {/* Official Product Identity Table */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Platform Identity
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Application Name</span>
              <span className="font-bold text-slate-900">NutriScientia</span>
            </div>
            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Product</span>
              <span className="font-bold text-emerald-700 text-right">
                Food Insight AI Virtual Lab
              </span>
            </div>
            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Company</span>
              <span className="font-bold text-slate-900">6 Monkeys Inc.</span>
            </div>
            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Architecture</span>
              <span className="font-semibold text-slate-700">Installable Full-Stack PWA</span>
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Core Capabilities</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">AI Food Photo &amp; Meal Analysis</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Instant identification of prepared dishes, macro/micronutrient profiles, ingredient
                  percentages, health benefits, and food safety risks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">FoodLab Virtual Simulation</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Combine multiple ingredients in grams to evaluate biochemical incompatibilities,
                  digestive risks, nutrient bioavailability, and risk weightings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Professional PDF Reports</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Generate multi-section PDF reports containing your captured food photograph,
                  nutritional metrics, safety checklist, and evidence references.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Personalized Allergy &amp; Profile Guardrails</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tailored scoring against your dietary preferences, target meal calories, and
                  allergen exclusions with optional cloud synchronization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scientific Evidence Grounding */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>Scientific Reference Benchmarks</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-700">
            {[
              'USDA FoodData Central — Standard Nutrient Composition',
              'NIH Office of Dietary Supplements — Daily Intake Guidelines',
              'FAO / WHO Codex Alimentarius — Hygiene & Allergen Standards',
              'ICMR-NIN Indian Food Composition Tables',
            ].map((source) => (
              <div key={source} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{source}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Company Footer Banner */}
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-emerald-900">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Powered by 6 Monkeys Inc.</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            NutriScientia · Food Insight AI Virtual Lab
          </p>
        </div>
      </div>
    </div>
  );
};
