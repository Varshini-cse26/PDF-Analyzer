export interface AnalysisRequestDto {
  pdfUrl: string;
}

export interface AnalysisResponseDto {
  documentType: string;
  title: string;
  authors: string;
  summary: string;
  keyTakeaway: string;
  pages: number;
  charactersExtracted: number;
  timestamp: string;
}
