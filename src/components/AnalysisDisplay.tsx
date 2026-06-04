import React, { useState } from "react";
import { 
  FileText, BookOpen, Users, Key, Calendar, 
  Copy, Check, RotateCcw, Landmark, Clock, FileEdit
} from "lucide-react";
import { AnalysisResult } from "../types";

interface AnalysisDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

export default function AnalysisDisplay({ result, onReset }: AnalysisDisplayProps) {
  const [copied, setCopied] = useState(false);

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
        " on " + date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const handleCopy = () => {
    const textToCopy = `
=== PDF DOCUMENT ANALYSIS ===
Title: ${result.title}
Document Type: ${result.documentType}
Authors: ${result.authors}
Pages: ${result.pages}
Characters Parsed: ${result.charactersExtracted.toLocaleString()}
Analysis Date: ${result.timestamp}

--- SUMMARY ---
${result.summary}

--- KEY TAKEAWAY ---
${result.keyTakeaway}
=============================
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="analysis-display-panel" className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
      
      {/* Dynamic Header */}
      <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded uppercase tracking-wider">
              {result.documentType}
            </span>
            <span className="text-slate-400 text-[11px] font-medium">• Analyzed {formatTimestamp(result.timestamp)}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight leading-snug">
            {result.title}
          </h2>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            id="copy-analysis-btn"
            onClick={handleCopy}
            title="Copy Analysis Output"
            className="p-2 sm:px-4 sm:py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-400" />
                <span className="hidden sm:inline">Copy Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Content with high density columns */}
      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Stats Section */}
        <div className="md:col-span-1 md:border-r border-slate-100 space-y-6 pr-0 md:pr-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pages</p>
            <p className="text-2xl font-bold font-display text-slate-900">{result.pages}</p>
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Characters</p>
            <p className="text-2xl font-bold font-display text-slate-900">{result.charactersExtracted.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Authors / Publisher</p>
            <p className="text-xs font-medium text-slate-700 leading-relaxed italic">{result.authors}</p>
          </div>
        </div>

        {/* Right Details Section */}
        <div className="md:col-span-3 space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              Executive Summary
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line font-sans">
              {result.summary}
            </p>
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
            <h3 className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
              <Key className="w-4 h-4 text-indigo-500" />
              Key Takeaway
            </h3>
            <p className="text-indigo-950 leading-relaxed text-sm font-medium font-sans">
              {result.keyTakeaway}
            </p>
          </div>
        </div>

      </div>

      {/* Responsive bottom status line */}
      <div className="mt-auto border-t border-slate-100 bg-slate-50/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> JSON Parsed
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> CORS Verified
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Schema Mapped
          </span>
        </div>
        
        <button
          id="reset-analysis-btn"
          onClick={onReset}
          className="text-indigo-600 hover:text-indigo-800 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Analysis Session
        </button>
      </div>

    </div>
  );
}
