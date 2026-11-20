import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  ShieldCheck,
  HeartPulse,
  FileText,
  Download,
  CheckCircle2,
  ShieldAlert,
  X,
} from 'lucide-react';
import { ScreenId, FoodAnalysisResponse } from '../../types/food';
import { AnalysisHeader } from './AnalysisHeader';
import { ensureAnalysisCombinations } from '../../services/foodCombinationsFallback';
import { resolveIngredientImage } from '../../data/categoryMedia';
import {
  buildScientificPapersForFood,
  normalizeEvidenceReferenceUrl,
  ScientificPaper,
} from '../../services/evidenceLinks';

interface EvidenceScreenProps {
  analysis: FoodAnalysisResponse;
  onNavigate: (screen: ScreenId) => void;
}

export const EvidenceScreen: React.FC<EvidenceScreenProps> = ({ analysis, onNavigate }) => {
  const [viewMode, setViewMode] = useState<'sources' | 'combinations' | 'papers'>('sources');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Nutrition' | 'Safety' | 'General'>('All');
  const [selectedPaper, setSelectedPaper] = useState<ScientificPaper | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const enriched = ensureAnalysisCombinations(analysis);
  const safeCombos = enriched.combinations?.safeCombinations || [];
  const unsafeCombos = enriched.combinations?.unsafeCombinations || [];
  const totalCombos = safeCombos.length + unsafeCombos.length;

  const papers = buildScientificPapersForFood(analysis);

  const filteredEvidence = analysis.evidence.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.category === activeFilter;
  });

  const handleDownloadPaperSummary = (paper: ScientificPaper) => {
    const paperSummary = `SCIENTIFIC EVIDENCE PAPER SUMMARY
======================================================
Food Analyzed: ${analysis.foodName}
Title: ${paper.title}
Journal: ${paper.journal} (${paper.year})
DOI: ${paper.doi}
Public Paper URL: ${paper.publicUrl}
Authors: ${paper.authors}
Category: ${paper.category}

ABSTRACT:
${paper.abstract}

KEY SCIENTIFIC FINDING:
${paper.keyFinding}

Verified by NutriScientia Evidence Engine
Powered by 6 Monkeys Inc.
======================================================
`;
    const blob = new Blob([paperSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Evidence_${paper.id}_${analysis.foodName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(paper.title);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 space-y-4">
      <AnalysisHeader
        analysis={analysis}
        activeTab="evidence"
        onNavigate={onNavigate}
        backTarget="overview"
      />

      {/* Evidence Summary Hero Card (matching Nutrition & Safety cards) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Scientific Evidence Summary
        </h3>
        <div className="flex items-center gap-3 pt-1">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
              {analysis.evidence.length} Verified Sources for {analysis.foodName}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded in USDA, NIH, FAO/WHO &amp; peer-reviewed literature
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle: Evidence Sources | Safe/Unsafe Combinations | Research Papers */}
      <div className="flex items-center p-1 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] gap-0.5">
        <button
          onClick={() => setViewMode('sources')}
          className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            viewMode === 'sources'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-900 hover:text-emerald-950'
          }`}
        >
          Evidence ({analysis.evidence.length})
        </button>
        <button
          onClick={() => setViewMode('combinations')}
          className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            viewMode === 'combinations'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-900 hover:text-emerald-950'
          }`}
        >
          Pairings ({totalCombos})
        </button>
        <button
          onClick={() => setViewMode('papers')}
          className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            viewMode === 'papers'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-900 hover:text-emerald-950'
          }`}
        >
          Papers ({papers.length})
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Downloaded summary for <strong>{downloadSuccess}</strong>
          </span>
        </div>
      )}

      {/* VIEW 1: SUPPORTING EVIDENCE SOURCES */}
      {viewMode === 'sources' && (
        <div className="space-y-3">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {(['All', 'Nutrition', 'Safety', 'General'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
                  activeFilter === f
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Evidence Cards */}
          <div className="space-y-2.5">
            {filteredEvidence.map((ev) => {
              const isNutrition = ev.category === 'Nutrition';
              const isSafety = ev.category === 'Safety';

              return (
                <div
                  key={ev.id}
                  className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isNutrition
                            ? 'bg-blue-100 text-blue-700'
                            : isSafety
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {isNutrition ? (
                          <HeartPulse className="w-4 h-4" />
                        ) : isSafety ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">
                          {ev.sourceName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-md inline-block ${
                              isNutrition
                                ? 'bg-blue-50 text-blue-700'
                                : isSafety
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {ev.category}
                          </span>
                          {ev.confidenceScore !== undefined && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {Math.round(ev.confidenceScore * 100)}% relevance
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <a
                      href={normalizeEvidenceReferenceUrl(
                        ev.sourceName,
                        ev.category,
                        ev.referenceUrl
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 p-1 flex items-center gap-1 text-[10px] font-bold shrink-0"
                      title="Open public reference source"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {ev.snippet}
                  </p>
                  <a
                    href={normalizeEvidenceReferenceUrl(
                      ev.sourceName,
                      ev.category,
                      ev.referenceUrl
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:underline break-all"
                  >
                    <span>
                      {normalizeEvidenceReferenceUrl(
                        ev.sourceName,
                        ev.category,
                        ev.referenceUrl
                      )}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: SAFE & UNSAFE COMBINATION EVIDENCE */}
      {viewMode === 'combinations' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            Evidence-based pairing guide showing which foods are{' '}
            <strong className="text-emerald-700">safe to combine</strong> and which are{' '}
            <strong className="text-rose-700">unsafe to avoid</strong> with{' '}
            <strong className="text-slate-800">{analysis.foodName}</strong>.
          </p>

          {/* Safe to Eat Combinations */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Safe to Eat With ({safeCombos.length})</span>
            </div>

            {safeCombos.map((combo) => (
              <div
                key={combo.foodName}
                className="rounded-2xl bg-white border border-emerald-200 p-3.5 space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 overflow-hidden shrink-0">
                      <img
                        src={resolveIngredientImage(combo.foodName)}
                        alt={combo.foodName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {analysis.foodName} + {combo.foodName}
                      </h4>
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Safe Combination
                      </span>
                    </div>
                  </div>
                  {combo.referenceUrl && (
                    <a
                      href={combo.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-700 p-1 shrink-0"
                      title="Open reference source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  {combo.scientificReason}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800">
                  <BookOpen className="w-3 h-3 shrink-0" />
                  <span>Source: {combo.evidenceSource}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Unsafe / Avoid Combining With */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Unsafe / Avoid With ({unsafeCombos.length})</span>
            </div>

            {unsafeCombos.map((combo) => (
              <div
                key={combo.foodName}
                className="rounded-2xl bg-white border border-rose-200 p-3.5 space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 overflow-hidden shrink-0">
                      <img
                        src={resolveIngredientImage(combo.foodName)}
                        alt={combo.foodName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {analysis.foodName} + {combo.foodName}
                      </h4>
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        {combo.status} Combination
                      </span>
                    </div>
                  </div>
                  {combo.referenceUrl && (
                    <a
                      href={combo.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-700 p-1 shrink-0"
                      title="Open reference source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                  {combo.scientificReason}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-800">
                  <BookOpen className="w-3 h-3 shrink-0" />
                  <span>Source: {combo.evidenceSource}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: SCIENTIFIC RESEARCH PAPERS */}
      {viewMode === 'papers' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            Peer-reviewed research supporting the biochemical, nutritional, and safety profile of{' '}
            <strong className="text-slate-700">{analysis.foodName}</strong>.
          </p>

          <div className="space-y-3">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {paper.journal} ({paper.year})
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug pt-1">
                      {paper.title}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {paper.authors} · DOI: {paper.doi}
                    </p>
                    <a
                      href={paper.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:underline break-all pt-0.5"
                    >
                      <span>{paper.publicUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 text-[11px] block mb-0.5">
                    Key Finding:
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{paper.keyFinding}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedPaper(paper)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Abstract</span>
                  </button>

                  <button
                    onClick={() => handleDownloadPaperSummary(paper)}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Summary</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paper Abstract Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {selectedPaper.journal}
              </span>
              <button
                onClick={() => setSelectedPaper(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
              {selectedPaper.title}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">Authors: {selectedPaper.authors}</p>
            <a
              href={selectedPaper.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline break-all"
            >
              <span>Public Paper URL: {selectedPaper.publicUrl}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-800">Abstract:</span>
              <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedPaper.abstract}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-emerald-800">Clinical / Nutritional Conclusion:</span>
              <p className="text-emerald-950 text-[11px] bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 leading-relaxed">
                {selectedPaper.keyFinding}
              </p>
            </div>

            <button
              onClick={() => {
                handleDownloadPaperSummary(selectedPaper);
                setSelectedPaper(null);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Full Summary</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
