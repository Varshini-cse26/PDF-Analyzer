export interface AnalysisResult {
  documentType: string;
  title: string;
  authors: string;
  summary: string;
  keyTakeaway: string;
  pages: number;
  charactersExtracted: number;
  timestamp: string;
}

export interface AnalysisError {
  message: string;
  error?: string;
}
