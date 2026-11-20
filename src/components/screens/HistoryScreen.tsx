import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Cloud,
  CloudOff,
  Search,
  Trash2,
  Utensils,
} from 'lucide-react';
import { AnalysisHistoryItem, ScreenId } from '../../types/food';

interface HistoryScreenProps {
  historyItems: AnalysisHistoryItem[];
  isSignedIn: boolean;
  onNavigate: (screen: ScreenId) => void;
  onSelectPastMeal: (item: AnalysisHistoryItem) => void;
  onDeleteItem: (entryId: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

type RiskFilter = 'all' | 'low' | 'elevated';

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyItems,
  isSignedIn,
  onNavigate,
  onSelectPastMeal,
  onDeleteItem,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return historyItems.filter((item) => {
      const matchesQuery =
        !q ||
        item.foodName.toLowerCase().includes(q) ||
        (item.cuisine || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (riskFilter === 'low') {
        return !item.overallRisk || item.overallRisk.toLowerCase().includes('low');
      }
      if (riskFilter === 'elevated') {
        const risk = (item.overallRisk || '').toLowerCase();
        return risk.includes('moderate') || risk.includes('high');
      }
      return true;
    });
  }, [historyItems, searchQuery, riskFilter]);

  const metrics = useMemo(() => {
    if (filteredItems.length === 0) {
      return { count: 0, avgCalories: 0, avgProtein: 0 };
    }
    const totalCal = filteredItems.reduce((sum, item) => sum + (item.calories || 0), 0);
    const totalProt = filteredItems.reduce((sum, item) => sum + (item.proteinGrams || 0), 0);
    return {
      count: filteredItems.length,
      avgCalories: Math.round(totalCal / filteredItems.length),
      avgProtein: Math.round(totalProt / filteredItems.length),
    };
  }, [filteredItems]);

  const handleDeleteSingle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBusyId(id);
    try {
      await onDeleteItem(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      await onClearAll();
      setConfirmClearAll(false);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="font-bold text-sm text-slate-900 leading-tight">Meal History</h1>
          <p className="text-[11px] text-slate-500">Scanned Analyses &amp; Nutrition Log</p>
        </div>

        {historyItems.length > 0 ? (
          <button
            type="button"
            onClick={() => setConfirmClearAll((prev) => !prev)}
            className="min-h-[44px] px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Clear
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('capture')}
            className="min-h-[44px] px-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Scan
          </button>
        )}
      </div>

      <div className="p-4 pb-6 space-y-4">
        {/* Inline Clear-All Confirmation */}
        {confirmClearAll && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 space-y-2.5">
            <p className="text-xs font-semibold text-rose-900">
              Remove all {historyItems.length} meal scan{historyItems.length === 1 ? '' : 's'} from your history?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="min-h-[40px] px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearConfirm}
                disabled={isClearing}
                className="min-h-[40px] px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {isClearing ? 'Clearing...' : 'Confirm Clear All'}
              </button>
            </div>
          </div>
        )}

        {/* 3-Metric Summary Strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white border border-slate-200 p-3">
            <div className="text-[11px] font-medium text-slate-500">Meals Logged</div>
            <div className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">
              {metrics.count}
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-3">
            <div className="text-[11px] font-medium text-slate-500">Avg Calories</div>
            <div className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">
              {metrics.avgCalories} <span className="text-[11px] font-semibold text-slate-400">kcal</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-3">
            <div className="text-[11px] font-medium text-slate-500">Avg Protein</div>
            <div className="text-lg font-extrabold text-emerald-700 tabular-nums mt-0.5">
              {metrics.avgProtein}<span className="text-[11px] font-semibold text-emerald-600/80">g</span>
            </div>
          </div>
        </div>

        {/* Search & Risk Filters */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meals, cuisines, or categories..."
              className="w-full min-h-[44px] pl-10 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'low', label: 'Low Risk' },
                  { id: 'elevated', label: 'Moderate / High' },
                ] as { id: RiskFilter; label: string }[]
              ).map((tab) => {
                const active = riskFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRiskFilter(tab.id)}
                    className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-emerald-700 cursor-pointer"
            >
              {isSignedIn ? <Cloud className="w-3.5 h-3.5 text-emerald-600" /> : <CloudOff className="w-3.5 h-3.5" />}
              <span>{isSignedIn ? 'Cloud' : 'Local'}</span>
            </button>
          </div>
        </div>

        {/* Chronological Meal List */}
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">
                {historyItems.length === 0 ? 'No meals scanned yet' : 'No matching meals found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {historyItems.length === 0
                  ? 'Scan any dish with your camera to automatically log calories, macros, and safety insights.'
                  : 'Try clearing your search text or switching the safety filter.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (historyItems.length === 0) {
                  onNavigate('capture');
                } else {
                  setSearchQuery('');
                  setRiskFilter('all');
                }
              }}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{historyItems.length === 0 ? 'Scan Your First Meal' : 'Reset Filters'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const riskText = item.overallRisk || 'Low Risk';
              const isHighRisk = riskText.toLowerCase().includes('high');
              const isModerateRisk = riskText.toLowerCase().includes('moderate');

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectPastMeal(item);
                    onNavigate('overview');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectPastMeal(item);
                      onNavigate('overview');
                    }
                  }}
                  className="rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 p-3 flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  {/* Meal Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.foodName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Utensils className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Meal Summary & Unboxed Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {item.foodName}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                          isHighRisk
                            ? 'bg-rose-50 text-rose-700'
                            : isModerateRisk
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {riskText}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 tabular-nums truncate">
                      {item.calories} kcal · {item.proteinGrams}g protein
                      {typeof item.matchScore === 'number' ? ` · ${item.matchScore}% match` : ''}
                    </p>

                    <p className="text-[11px] text-slate-400 truncate">
                      {item.cuisine || item.category || 'Analyzed Meal'} · {item.timestamp}
                    </p>
                  </div>

                  {/* Delete & Open Chevron */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSingle(e, item.id)}
                      disabled={busyId === item.id}
                      className="w-10 h-11 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete meal entry"
                      aria-label={`Delete ${item.foodName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
