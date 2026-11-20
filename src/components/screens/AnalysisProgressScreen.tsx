import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  Circle,
  Scan,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ScreenId } from '../../types/food';

interface AnalysisProgressScreenProps {
  imageUrl?: string;
  detectedFoodName?: string;
  isAnalysisReady: boolean;
  errorMessage?: string | null;
  backTarget?: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onAnalysisCompleted: () => void;
  onRetryScan?: () => void;
  onAnalyzeByName?: (foodName: string) => void;
}

export const AnalysisProgressScreen: React.FC<AnalysisProgressScreenProps> = ({
  imageUrl,
  detectedFoodName,
  isAnalysisReady,
  errorMessage,
  backTarget = 'capture',
  onNavigate,
  onAnalysisCompleted,
  onRetryScan,
  onAnalyzeByName,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedAll, setCompletedAll] = useState(false);
  const [manualName, setManualName] = useState('');

  const isIdentifying = !detectedFoodName || detectedFoodName === 'Scanning food...';

  const steps = [
    {
      title: 'Understanding food image',
      subtitle: isIdentifying ? 'Analyzing visual structure...' : `Identified: ${detectedFoodName}`,
    },
    { title: 'Resolving ingredients', subtitle: 'Mapping primary dish components' },
    { title: 'Retrieving nutrition data', subtitle: 'Calculating calories & macros' },
    { title: 'Checking safety and allergens', subtitle: 'Scanning potential dietary risks' },
    { title: 'Evaluating safe & unsafe pairings', subtitle: 'Checking compatible vs incompatible foods' },
    { title: 'Finding relevant evidence', subtitle: 'Matching USDA / NIH / FAO sources' },
    { title: 'Generating insights', subtitle: 'Finalizing your meal intelligence report' },
  ];

  useEffect(() => {
    setCurrentStepIndex(0);
    setCompletedAll(false);
    setManualName('');
  }, [imageUrl, errorMessage]);

  useEffect(() => {
    if (completedAll || errorMessage) return;

    if (isAnalysisReady) {
      setCurrentStepIndex(steps.length - 1);
      setCompletedAll(true);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 2 ? prev + 1 : prev));
    }, 220);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isAnalysisReady, completedAll, errorMessage, steps.length]);

  useEffect(() => {
    if (!completedAll || errorMessage) return;
    const redirectTimer = setTimeout(() => {
      onAnalysisCompleted();
    }, 180);
    return () => clearTimeout(redirectTimer);
  }, [completedAll, errorMessage, onAnalysisCompleted]);

  const progressPct = errorMessage
    ? 60
    : completedAll
    ? 100
    : Math.min(95, Math.round(((currentStepIndex + 1) / steps.length) * 95));

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pt-1 mb-3">
          <button
            onClick={() => onNavigate(backTarget)}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-700">Live Food Analysis</span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              errorMessage
                ? 'text-rose-700 bg-rose-50 border-rose-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}
          >
            {errorMessage ? 'Retry' : `${progressPct}%`}
          </span>
        </div>

        {/* Captured Photo Scanning Banner */}
        <div className="rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-md mb-4 relative">
          <div className="h-32 w-full relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Captured meal"
                className="w-full h-full object-cover opacity-85"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                <Scan className="w-8 h-8 animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {!completedAll && !errorMessage && (
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            )}

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {errorMessage
                      ? 'Could Not Auto-Identify'
                      : completedAll
                      ? 'Food Identified'
                      : 'Scanning Captured Photo'}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white truncate">
                  {errorMessage
                    ? 'Confirm dish or retry scan'
                    : isIdentifying
                    ? 'Detecting dish name...'
                    : detectedFoodName}
                </div>
              </div>
              {!isIdentifying && !errorMessage && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shrink-0">
                  Matched
                </span>
              )}
            </div>
          </div>

          <div className="h-1.5 w-full bg-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                errorMessage ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl bg-white border border-rose-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">Scan Detection Interrupted</h3>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>

            {onAnalyzeByName && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualName.trim()) onAnalyzeByName(manualName.trim());
                }}
                className="space-y-2 pt-1"
              >
                <label className="block text-[11px] font-semibold text-slate-700">
                  Or type the food name shown in your photo:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Masala Dosa, Banana, Chicken Curry..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!manualName.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Analyze</span>
                  </button>
                </div>
              </form>
            )}

            <div className="flex items-center gap-2 pt-1">
              {onRetryScan && (
                <button
                  type="button"
                  onClick={onRetryScan}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Image Scan</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('capture')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Retake / Upload
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, idx) => {
              const isCompleted = completedAll || idx < currentStepIndex;
              const isInProgress = !completedAll && idx === currentStepIndex;
              const isPending = !completedAll && idx > currentStepIndex;

              return (
                <div
                  key={step.title}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                      : isInProgress
                      ? 'bg-blue-50/90 border-blue-200 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="shrink-0">
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isInProgress && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                    {isPending && <Circle className="w-4 h-4 text-slate-300" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-semibold text-xs leading-tight ${
                        isPending ? 'text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isCompleted
                          ? 'text-emerald-700 font-medium'
                          : isInProgress
                          ? 'text-blue-700 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Proceed Button */}
      {!errorMessage && (
        <div className="pt-4 space-y-2">
          <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>
              {completedAll
                ? `Opening ${detectedFoodName || 'meal'} results...`
                : 'Flowing through nutrition, pairings & evidence pipeline...'}
            </span>
          </div>

          <button
            onClick={onAnalysisCompleted}
            disabled={!isAnalysisReady}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            {isAnalysisReady ? 'View Food Name & Analysis →' : 'Analyzing Captured Photo...'}
          </button>
        </div>
      )}
    </div>
  );
};
