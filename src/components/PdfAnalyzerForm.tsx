import React, { useState } from "react";
import { Link, Search, Sparkles } from "lucide-react";

interface PdfAnalyzerFormProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function PdfAnalyzerForm({ onAnalyze, isLoading }: PdfAnalyzerFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (input: string): boolean => {
    if (!input.trim()) {
      setError("Please paste a PDF URL to run the analysis.");
      return false;
    }

    try {
      // Basic URL constructor test
      const parsed = new URL(input.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setError("URL protocol must be http or https.");
        return false;
      }
      
      // Let's guide the user gently if it doesn't end with .pdf or contain PDF, 
      // but sometimes valid direct links don't have .pdf (e.g. arXiv links). So we allow it.
      setError(null);
      return true;
    } catch (e) {
      setError("Please enter a valid URL (e.g., https://example.com/document.pdf).");
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUrl(url)) {
      onAnalyze(url.trim());
    }
  };

  const handleExampleClick = (exampleUrl: string) => {
    if (isLoading) return;
    setUrl(exampleUrl);
    setError(null);
    onAnalyze(exampleUrl);
  };

  return (
    <div id="pdf-analyzer-form-container" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Analyze New Document</h2>
      
      <form id="pdf-analyzer-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label id="input-label" htmlFor="pdfUrl" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Public PDF URL
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Link className="h-4 w-4" />
            </div>
            <input
              id="pdfUrl"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null); // Clear errors dynamically
              }}
              placeholder="https://arxiv.org/pdf/1706.03762"
              className={`block w-full rounded-xl border bg-slate-50 py-2.5 pr-4 pl-10 text-xs leading-tight text-slate-700 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                error
                  ? "border-rose-200 focus:border-rose-400 focus:ring-rose-100"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100/50"
              }`}
              disabled={isLoading}
            />
          </div>
          {error && (
            <p id="form-validation-error" className="mt-1.5 text-[11px] font-bold text-rose-600 animate-in fade-in duration-200">
              {error}
            </p>
          )}
        </div>

        <button
          id="analyze-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-md shadow-indigo-100 py-3 hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Search className="h-3.5 w-3.5" />
              <span>Start AI Analysis</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested PDFs for quick testing */}
      <div id="suggested-examples" className="mt-5 border-t border-slate-100 pt-4">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
          Suggested PDF for analysis
        </span>
        <div className="flex flex-col gap-2">
          <button
            id="example-arxiv-btn"
            type="button"
            onClick={() => handleExampleClick("https://arxiv.org/pdf/1706.03762")}
            disabled={isLoading}
            className="w-full text-left inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 disabled:opacity-50 transition-colors py-2 px-3 rounded-lg border border-indigo-100/50 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">Attention Is All You Need (arXiv)</span>
          </button>
          
          <button
            id="example-swin-btn"
            type="button"
            onClick={() => handleExampleClick("https://arxiv.org/pdf/2103.14030")}
            disabled={isLoading}
            className="w-full text-left inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 disabled:opacity-50 transition-colors py-2 px-3 rounded-lg border border-indigo-100/50 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">Swin Transformer (arXiv)</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 justify-center py-2 mt-4 px-2 border-t border-slate-50 pt-3">
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white"></div>
            <div className="w-5 h-5 rounded-full bg-slate-300 border-2 border-white"></div>
            <div className="w-5 h-5 rounded-full bg-slate-400 border-2 border-white"></div>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">1.2k+ documents analyzed today</p>
        </div>
      </div>
    </div>
  );
}
