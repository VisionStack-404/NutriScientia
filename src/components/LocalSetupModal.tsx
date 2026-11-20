import React, { useState } from 'react';
import { X, Smartphone, Terminal, Laptop, Copy, Check, Download, ExternalLink, Code } from 'lucide-react';

interface LocalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalSetupModal: React.FC<LocalSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'web_deploy' | 'android' | 'flutter'>('web_deploy');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Local Integration, Backend &amp; Deployment Guide</h3>
              <p className="text-xs text-slate-400">Run locally, connect Food Analysis &amp; FoodLab backend, and publish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('web_deploy')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'web_deploy'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Local Web, Backend &amp; Deploy</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'android'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android Studio (Kotlin)</span>
          </button>
          <button
            onClick={() => setActiveTab('flutter')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'flutter'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Flutter &amp; Dart</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300">

          {activeTab === 'web_deploy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 leading-relaxed">
                <strong>Full-Stack Ready:</strong> Both <strong>Food Analysis</strong> (<code className="text-white">/api/food/*</code>) and <strong>FoodLab</strong> (<code className="text-white">/api/foodlab/experiment</code>) run on the Express backend in <code className="text-white">server.ts</code> and can also be routed to your own external Python/Node API via <strong>Backend API Configuration</strong>.
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 1: Run Full-Stack App Locally (Node 22+)
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 flex items-center justify-between gap-2">
                  <pre className="overflow-x-auto">{`npm install
cp .env.example .env   # add GEMINI_API_KEY="your_key"
npm run dev            # runs Vite + Express backend on http://localhost:3000`}</pre>
                  <button
                    onClick={() => handleCopy('npm install && npm run dev', 10)}
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    {copiedIndex === 10 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 2: Connect Your External Backend (Food Analysis + FoodLab)
                </span>
                <p className="text-slate-400">
                  Open <strong>Backend API</strong> in the Dev Toolbar, set <code className="text-emerald-400">http://localhost:8000/v1/</code> (or your HTTPS Cloud Run URL), and toggle <strong>Route to Custom External Backend</strong>. Implement these endpoints:
                </p>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
                  <pre>{`GET  /v1/health
POST /v1/food/analyze          (photo multipart -> FoodAnalysisResponse + combinations)
POST /v1/food/analyze-text     (foodName JSON  -> FoodAnalysisResponse + combinations)
POST /v1/foodlab/experiment    (selectedFoods, researchObjective, nutritionalFocus -> verdict/risks)
POST /v1/intelligence/ask      (foodName, question, analysisContext -> answer/sources)`}</pre>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 3: Build, Deploy &amp; Publish
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 flex items-center justify-between gap-2">
                  <pre className="overflow-x-auto">{`npm run build          # builds production frontend into dist/
NODE_ENV=production npm start   # serves dist/ + /api/* on port 3000`}</pre>
                  <button
                    onClick={() => handleCopy('npm run build && NODE_ENV=production npm start', 11)}
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    {copiedIndex === 11 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  To publish live immediately, click <strong>Deploy / Share</strong> in Google AI Studio or deploy to Google Cloud Run (<code className="text-white">gcloud run deploy nutriscientia --source . --port 3000</code>).
                </p>
              </div>
            </div>
          )}
          
          {/* TAB 2: NATIVE ANDROID IN ANDROID STUDIO */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 leading-relaxed">
                <strong>Full APK Ready:</strong> Open the <code className="text-white font-mono">/android</code> folder in Android Studio to run all NutriScientia screens (Food Scan, Combinations, Evidence, FoodLab) with camera/gallery upload and generate an installable <code className="text-white font-mono">.apk</code>.
              </div>

              {/* Step 1 */}
              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 1: Open /android in Android Studio
                </span>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400">
                  <li>Download or clone this repository to your computer.</li>
                  <li>Open <strong>Android Studio</strong> (Koala / Ladybug or newer) &rarr; <strong>File &rarr; Open</strong>.</li>
                  <li>Select the <code className="text-emerald-400 font-mono">android</code> folder (not the outer web root) and wait for Gradle Sync.</li>
                </ol>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 2: Deploy Backend to AWS &amp; Set URL in ApiConfig.kt
                </span>
                <p className="text-slate-400">
                  Deploy this Node/Express server (<code className="text-white">npm run build && npm start</code>, port <code className="text-white">3000</code>, env <code className="text-white">GEMINI_API_KEY</code>) on <strong>AWS App Runner</strong> or <strong>EC2 + Nginx HTTPS</strong>, then update <code className="text-emerald-400 font-mono">app/src/main/java/com/foodinsightai/app/api/ApiConfig.kt</code>:
                </p>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 relative">
                  <pre>{`// Point Android APK to your AWS HTTPS server:
const val AWS_APP_URL: String = "https://your-app.us-east-1.awsapprunner.com"
const val BASE_URL: String = "$AWS_APP_URL/api/"`}</pre>
                </div>
                <p className="text-[11px] text-slate-400">
                  <strong>Note:</strong> Android requires HTTPS (<code className="text-white">usesCleartextTraffic="false"</code>). Keep <code className="text-white">GEMINI_API_KEY</code> strictly on AWS, never inside the APK.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 3: Build &amp; Share APK File for Other Users&apos; Devices
                </span>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400">
                  <li><strong>Quick test APK:</strong> Click <strong>Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)</strong> (<code className="text-emerald-400 font-mono">android/app/build/outputs/apk/debug/app-debug.apk</code>).</li>
                  <li><strong>Release APK for distribution:</strong> Click <strong>Build &rarr; Generate Signed App Bundle / APK &rarr; APK</strong>, create a <code className="text-white">.jks</code> keystore, pick <strong>release</strong>, and export <code className="text-emerald-400 font-mono">app-release.apk</code>.</li>
                  <li>Send the <code className="text-white">.apk</code> to other Android users and enable <strong>Install unknown apps</strong> when prompted on their phone.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: FLUTTER & DART */}
          {activeTab === 'flutter' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-900/60 text-blue-200 leading-relaxed">
                If you prefer <strong>Flutter &amp; Dart</strong>, you can create a cross-platform mobile app that calls your Python backend with the following steps:
              </div>

              {/* Flutter Step 1 */}
              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 1: Create Flutter Project in Terminal
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 flex items-center justify-between">
                  <code>flutter create food_insight_ai && cd food_insight_ai</code>
                  <button
                    onClick={() => handleCopy('flutter create food_insight_ai && cd food_insight_ai', 1)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Flutter Step 2 */}
              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 2: Add Packages to pubspec.yaml
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 relative">
                  <pre>{`dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.2
  camera: ^0.11.0+2
  image_picker: ^1.1.2
  google_fonts: ^6.2.1
  pdf: ^3.11.1
  path_provider: ^2.1.4`}</pre>
                </div>
              </div>

              {/* Flutter Step 3 */}
              <div className="space-y-1.5">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Step 3: Run the Flutter App
                </span>
                <p className="text-slate-400">
                  Launch your Android emulator first, or run directly in Chrome:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 flex items-center justify-between">
                  <code>flutter run -d chrome</code>
                  <button
                    onClick={() => handleCopy('flutter run -d chrome', 2)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Troubleshooting Box */}
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-2">
                <div className="font-bold text-xs flex items-center gap-1.5 text-amber-300">
                  <span>Fixing: "Unable to find suitable Visual Studio toolchain"</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90">
                  This happens when you select <strong>[1]: Windows (windows)</strong> in PowerShell. Option 1 builds a Windows C++ desktop program, which needs Visual Studio C++ installed.
                </p>
                <div className="text-[11px] space-y-1 text-slate-300">
                  <div><strong>To fix &amp; run:</strong></div>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-400">
                    <li><strong>Instant test on web:</strong> Type <code className="text-emerald-400">2</code> for Chrome, or run <code className="text-emerald-400">flutter run -d chrome</code>.</li>
                    <li><strong>To test as mobile app:</strong> Open Android Studio &rarr; Device Manager &rarr; start an Android emulator first. Then run <code className="text-emerald-400">flutter run</code>.</li>
                    <li><strong>Physical phone:</strong> Turn on USB Debugging on your phone, plug in via USB, and run <code className="text-emerald-400">flutter run</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Detailed instructions also written in <code className="text-white font-mono">/RUNNING_LOCAL_APP.md</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
