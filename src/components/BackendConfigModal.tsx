import React, { useState } from 'react';
import { X, Server, Activity, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { apiService, DEFAULT_BASE_URL } from '../services/apiService';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [baseUrlInput, setBaseUrlInput] = useState<string>(apiService.getBaseUrl());
  const [isLiveEnabled, setIsLiveEnabled] = useState<boolean>(apiService.isLiveBackendEnabled());
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    apiService.setBaseUrl(baseUrlInput);
    apiService.setLiveBackendEnabled(isLiveEnabled);
    onConfigChanged();
    onClose();
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    // Temporarily save base URL for the test
    apiService.setBaseUrl(baseUrlInput);
    const result = await apiService.testConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleResetDefault = () => {
    setBaseUrlInput(DEFAULT_BASE_URL);
    apiService.setBaseUrl(DEFAULT_BASE_URL);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Backend API Configuration</h3>
              <p className="text-xs text-slate-500">Connect to your Python REST API & test endpoints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Base URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Backend Base URL (ApiConfig.BASE_URL)
              </label>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
              >
                Reset to default
              </button>
            </div>
            <div className="relative">
              <input
                type="url"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder="http://localhost:8000/v1/"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Connects to <code className="text-slate-700 font-semibold">/food/analyze</code>, <code className="text-slate-700 font-semibold">/food/analyze-text</code>, <code className="text-slate-700 font-semibold">/foodlab/experiment</code>, and <code className="text-slate-700 font-semibold">/intelligence/ask</code>. Use HTTPS in production or <code className="text-slate-700">http://localhost:8000/v1/</code> locally.
            </p>
          </div>

          {/* Live vs Built-in Server Mode Toggle */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm text-slate-900">Route to Custom External Backend</div>
              <div className="text-xs text-slate-500 mt-0.5">
                When enabled, routes both Food Analysis and FoodLab experiments to your custom URL above (falling back to built-in Express <code className="text-slate-700">/api/*</code> routes).
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={isLiveEnabled}
                onChange={(e) => setIsLiveEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Test Ping Action */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Health Check &amp; Latency Test
              </span>
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isTesting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {isTesting ? 'Pinging...' : 'Ping /health Endpoint'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{testResult.message}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    Roundtrip Latency: <strong>{testResult.latencyMs} ms</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Guarantee Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-emerald-950">Zero-Secret Android Client Policy</span>
              <p className="text-emerald-800 leading-normal text-[11px]">
                No private API keys (Groq, HuggingFace, OpenAI, Gemini) are embedded into this Android client. All AI model credentials and RAG vector search pipelines run securely within your Python backend server.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};
