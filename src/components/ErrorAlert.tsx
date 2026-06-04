import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div id="error-alert" className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 shadow-sm animate-in fade-in slide-in-from-top duration-200">
      <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-rose-900">Analysis Attempt Failed</h4>
        <p className="text-sm mt-1 text-rose-700 leading-relaxed font-sans">{message}</p>
        {onRetry && (
          <button
            id="error-retry-btn"
            onClick={onRetry}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-900 bg-rose-100 hover:bg-rose-200 transition-colors py-1 px-3 rounded-lg border border-rose-200"
          >
            <RotateCcw className="h-3 w-3" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
