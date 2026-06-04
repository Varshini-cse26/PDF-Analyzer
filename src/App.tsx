import React, { useState, useEffect } from "react";
import { Cpu, FileText, Sparkles, AlertTriangle, RotateCcw, ShieldCheck, CheckCircle } from "lucide-react";
import PdfAnalyzerForm from "./components/PdfAnalyzerForm";
import AnalysisDisplay from "./components/AnalysisDisplay";
import ErrorAlert from "./components/ErrorAlert";
import { ApiService } from "./services/api";
import { AnalysisResult } from "./types";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // A list of friendly loading steps to display dynamically while parsing
  const loadingMessages = [
    "Contacting raw PDF host server...",
    "Retrieving document byte stream securely...",
    "Executing high-speed text extraction...",
    "Measuring document character metrics...",
    "Sending material to Gemini 3.5-Flash...",
    "Parsing AI structured JSON output schema...",
    "Formulating metadata cards and takeaways..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 4500); // Shift state messaging every 4.5s
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleStartAnalysis = async (pdfUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await ApiService.analyzePdf(pdfUrl);
      setResult(data);
    } catch (err: any) {
      console.error("Analysis handler exception:", err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(serverMsg || "An unknown network error occurred while performing analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold font-display">
            P
          </div>
          <h1 id="header-title" className="text-xl font-bold text-slate-900 tracking-tight">
            PDF Insight <span className="text-indigo-600">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Service Online</span>
          </div>
          <span className="hidden sm:inline text-slate-450 font-mono text-sm">v1.0.4-stable</span>
        </div>
      </nav>

      {/* Main High Density Workspace Grid */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section (Column span 4) - Input panel and Engine indicators */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Main Document submission input card */}
          <PdfAnalyzerForm onAnalyze={handleStartAnalysis} isLoading={isLoading} />

          {/* Engine Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Processing Engine</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-600">Text Extraction (Parser Engine)</span>
                  <span className={`text-[10px] font-bold ${isLoading ? 'text-amber-500 animate-pulse' : 'text-green-600'}`}>
                    {isLoading ? "EXTRACTING" : "ACTIVE"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isLoading ? 'bg-amber-400 w-[70%]' : 'bg-green-500 w-full'
                    }`}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-600">AI Inference (Gemini 3.5 Core)</span>
                  <span className={`text-[10px] font-bold ${isLoading ? 'text-indigo-500 animate-pulse' : 'text-indigo-600'}`}>
                    {isLoading && loadingStep >= 4 ? "RUNNING INFERENCE" : "READY"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isLoading && loadingStep >= 4 
                        ? 'bg-indigo-600 w-[90%]' 
                        : isLoading 
                        ? 'bg-indigo-300 w-[35%]' 
                        : 'bg-indigo-500 w-full'
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center py-1 mt-2 border-t border-slate-100 pt-3 text-[10px] text-slate-400 text-center font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>SERVER-SIDE KEYS SECURED</span>
              </div>
            </div>
          </div>

        </section>

        {/* Right Section (Column span 8) - Primary Content viewports */}
        <section className="lg:col-span-8 h-full">

          {/* Case 1: Active Loading representation */}
          {isLoading && (
            <div id="loading-overlay" className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center space-y-6 animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-indigo-100 opacity-60"></div>
                <div className="relative h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                  <FileText className="h-6 w-6 animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-lg">Document Summarizer Active</h3>
                <p className="text-xs text-slate-500 font-semibold h-5 italic transition-all leading-relaxed">
                  {loadingMessages[loadingStep]}
                </p>
              </div>

              <div className="w-40 mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full animate-infinite-loading"></div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[10px] uppercase tracking-widest font-bold text-slate-450 flex justify-center gap-6">
                <span>Direct parse system</span>
                <span className="text-slate-200">|</span>
                <span>Optimizing prompt context</span>
              </div>
            </div>
          )}

          {/* Case 2: Analysis Display successfully mapped */}
          {result && !isLoading && (
            <div className="w-full">
              <AnalysisDisplay result={result} onReset={handleReset} />
            </div>
          )}

          {/* Case 3: Initial Empty state block */}
          {!result && !isLoading && (
            <div className="space-y-6">
              
              {/* Show error alerts above instructions if analysis failed to let user retrive quickly */}
              {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

              <div id="intro-hero" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-2">
                  <FileText className="h-8 w-8" />
                </div>
                
                <div className="max-w-md mx-auto space-y-3">
                  <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight leading-none">
                    Document Intelligence Workspace
                  </h2>
                  <p className="text-sm text-slate-500 font-sans leading-relaxed">
                    Welcome to the High Density document analytics center. Paste any direct, publicly accessible PDF paper URL (e.g., from scientific archives, academic reviews, or corporate portals) in the controller on the left side. Our parser instantly downloads and maps the schema metadata using the Gemini 3.5-Flash backend.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    JSON parsed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    CORS Verified
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    Prompt Sanatized
                  </span>
                </div>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Styled Infinite Loading Keyframes decoration helper */}
      <style>{`
        @keyframes infiniteWidth {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 100%; margin-left: 0%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-infinite-loading {
          animation: infiniteWidth 2s infinite linear;
        }
      `}</style>

      {/* High Density Footer */}
      <footer className="h-12 border-t border-slate-200 bg-white px-8 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex gap-6 uppercase tracking-wider text-[10px] font-bold text-slate-400">
          <span>Typescript ESM</span>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span>Vite &amp; Express Hybrid</span>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span>PDF Parse 2.0</span>
        </div>
        <div>&copy; {new Date().getFullYear()} PDF Analyzer • System Ready</div>
      </footer>

    </div>
  );
}
