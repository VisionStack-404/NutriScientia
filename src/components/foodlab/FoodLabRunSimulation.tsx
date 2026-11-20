import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Circle, FlaskConical } from 'lucide-react';

interface FoodLabRunSimulationProps {
  experimentName?: string;
  foodSummary?: string;
  isSimulationReady: boolean;
  onSimulationCompleted: () => void;
  onBack: () => void;
}

export const FoodLabRunSimulation: React.FC<FoodLabRunSimulationProps> = ({
  experimentName,
  foodSummary,
  isSimulationReady,
  onSimulationCompleted,
  onBack,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(20);

  const steps = [
    'Analysing food combination',
    'Calculating nutrition profile',
    'Checking scientific interactions',
    'Evaluating safety risks',
    'Assessing health impact',
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 240);

    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => (prev < 92 ? Math.min(92, prev + 16) : prev));
    }, 180);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  useEffect(() => {
    if (!isSimulationReady) return;
    setActiveStep(steps.length);
    setProgressPercent(100);
    const autoAdvance = setTimeout(() => {
      onSimulationCompleted();
    }, 350);
    return () => clearTimeout(autoAdvance);
  }, [isSimulationReady, steps.length, onSimulationCompleted]);

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4 justify-between text-slate-900">
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
            <h2 className="font-extrabold text-sm text-slate-900 leading-tight">Run Simulation</h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
              Step 4 of 5
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Big Rotating Scientific Flask & Pulsating Green Progress Ring */}
        <div className="flex flex-col items-center justify-center pt-3 pb-2">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-100"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-emerald-500 transition-all duration-300"
                strokeWidth="6"
                fill="none"
                strokeDasharray="276.4"
                strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-18 h-18 rounded-full bg-emerald-50/80 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md animate-pulse">
                <FlaskConical
                  className="w-9 h-9 stroke-[2] animate-bounce"
                  style={{ animationDuration: '1.6s' }}
                />
              </div>
            </div>

            <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="absolute bottom-4 right-5 w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </div>

          <h3 className="font-extrabold text-base text-slate-900 mt-2 text-center">
            {isSimulationReady ? 'Analysis Complete!' : `Testing ${experimentName || 'Mix'}...`}
          </h3>
          <p className="text-[11px] text-slate-500 text-center mt-0.5 line-clamp-1 px-2">
            {foodSummary || 'Evaluating biochemical interaction matrices via backend'}
          </p>
        </div>

        {/* 5 Sequential Processing Stages */}
        <div className="space-y-2 pt-2">
          {steps.map((step, idx) => {
            const isDone = activeStep > idx || isSimulationReady;
            const isCurrent = !isSimulationReady && activeStep === idx;

            return (
              <div
                key={step}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-slate-900 font-semibold'
                    : isCurrent
                    ? 'bg-blue-50/80 border-blue-200 text-blue-950 font-semibold'
                    : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-200 shrink-0" />
                  )}
                  <span>{step}</span>
                </div>

                {isDone && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar & Continue Button */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Simulation Progress</span>
            <span className="text-emerald-700 tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={onSimulationCompleted}
          disabled={!isSimulationReady}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          {isSimulationReady ? (
            <span>Opening Results &amp; Analysis...</span>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Computing Backend Verdict...</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
