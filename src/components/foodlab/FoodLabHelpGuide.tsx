import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Atom,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface FoodLabHelpGuideProps {
  onBack: () => void;
  onStartExperiment: () => void;
}

export const FoodLabHelpGuide: React.FC<FoodLabHelpGuideProps> = ({
  onBack,
  onStartExperiment,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const guideSteps = [
    {
      num: '1',
      title: 'Select 2 or More Foods',
      desc: 'Browse through our catalogue of Fruits, Dairy, Vegetables, Grains, Nuts & Seeds, Proteins, Oils, and Prepared Foods.',
    },
    {
      num: '2',
      title: 'Combine & Formulate',
      desc: 'Combine items directly into a custom product name (e.g. Orange Milk Drink, Oats Almond Mix) without needing to manually fiddle with gram quantities.',
    },
    {
      num: '3',
      title: 'Set Research Objective',
      desc: 'Specify whether you want a Complete Scientific Assessment, Nutritional Analysis, Food Compatibility, or Food Safety Focus.',
    },
    {
      num: '4',
      title: 'Run Simulation Pipeline',
      desc: 'Our biochemical engine evaluates chemical precipitation, acid-casein reactions, nutrient bioavailability loss, and digestive distress.',
    },
    {
      num: '5',
      title: 'Review Verdict & Safety',
      desc: 'Inspect Risk Weight (0-100), Curdling Warnings, Allergen interactions, and Health Suitability breakdowns.',
    },
    {
      num: '6',
      title: 'Download Certified PDF Report',
      desc: 'Export a professional, downloadable scientific report with full chemical interaction breakdown and conclusion.',
    },
  ];

  const faqs = [
    {
      q: 'Why is the Milk + Orange combination classified as UNEATABLE?',
      a: 'Oranges contain organic citric acid (pH ~3.3). When mixed with milk, the acid lowers the pH below the isoelectric point of casein (pH 4.6), causing immediate aggregation, coagulation, and curdling. This can induce severe gastrointestinal cramping and significantly impairs calcium and protein absorption.',
    },
    {
      q: 'Do I need to enter gram quantities for foods?',
      a: 'No! In this version of FoodLab, quantities are balanced automatically by standard serving benchmarks so you can experiment freely with food combinations without micromanaging weights.',
    },
    {
      q: 'How is the Risk Weight (0 to 100) calculated?',
      a: 'The Risk Weight aggregates 4 biochemical dimensions: 1) Chemical Interaction Severity, 2) Acute Gastrointestinal Distress, 3) Bioavailability / Nutrient Degradation, and 4) Phase Stability and Spoilage Hazard.',
    },
    {
      q: 'Can I test safe and beneficial formulations?',
      a: 'Absolutely! Pair ingredients like Oats + Almonds, Paneer + Spinach, or Yogurt + Berries to discover synergistic nutrient enhancements and positive glycemic modulations.',
    },
  ];

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
            <h2 className="font-extrabold text-sm text-slate-900 leading-tight">FoodLab User Guide</h2>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
              Biochemical Help &amp; FAQ
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Step-by-Step Tutorial Cards */}
        <div className="space-y-2.5 pt-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            How Virtual Experimentation Works
          </span>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {guideSteps.map((step) => (
              <div
                key={step.num}
                className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scientific FAQs Accordion */}
        <div className="space-y-2 pt-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Scientific FAQs
          </span>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3 text-left font-bold text-xs text-slate-900 flex items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 text-[11px] text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start Experiment CTA */}
      <div className="pt-2">
        <button
          onClick={onStartExperiment}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FlaskConical className="w-4 h-4" />
          <span>Launch Your First Experiment</span>
        </button>
      </div>

    </div>
  );
};
