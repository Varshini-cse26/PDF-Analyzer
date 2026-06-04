import { pdfDownloadService } from "./pdfDownload.service";
import { pdfExtractionService } from "./pdfExtraction.service";
import { geminiService } from "./gemini.service";
import { AnalysisResponseDto } from "../dto/analysis.dto";

export class AnalysisService {
  /**
   * Orchestrates PDF download, text extraction, Gemini analysis, and DTO formulation.
   */
  async analyzePdf(pdfUrl: string): Promise<AnalysisResponseDto> {
    // Basic verification of incoming request
    if (!pdfUrl || typeof pdfUrl !== "string" || pdfUrl.trim() === "") {
      throw new Error("The PDF URL cannot be empty.");
    }

    const trimmedUrl = pdfUrl.trim();

    try {
      new URL(trimmedUrl);
    } catch {
      throw new Error("Please supply a valid, fully formed URL (e.g., https://arxiv.org/pdf/1706.03762).");
    }

    // 1. Fetch PDF from target server
    const buffer = await pdfDownloadService.downloadPdf(trimmedUrl);

    // 2. Extract text with Apache-equivalent parsing
    const extractionResult = await pdfExtractionService.extractText(buffer);

    // Validate that some readable content was fetched/extracted
    const rawText = extractionResult.text || "";
    const lettersOnly = rawText
      .toLowerCase()
      // Remove digits, punctuation, brackets, symbols, and whitespace
      .replace(/[0-9\s.,\/#!$%\^&\*;:{}=\-_`~()\[\]"'’\-+?¿¡<>@|\\’“”«»]/g, "")
      // Remove common non-content placeholder words
      .replace(/page|document|pdf|slide|of/gi, "");

    if (lettersOnly.length < 15) {
      throw new Error("Unable to read PDF content.");
    }

    // 3. Connect to server-side Gemini AI for structured extraction
    const aiOutput = await geminiService.analyzeDocument(extractionResult.text);

    // 4. Match with Schema response DTO
    return {
      documentType: aiOutput.documentType,
      title: aiOutput.title,
      authors: aiOutput.authors,
      summary: aiOutput.summary,
      keyTakeaway: aiOutput.keyTakeaway,
      pages: extractionResult.pages,
      charactersExtracted: extractionResult.originalLength,
      timestamp: new Date().toISOString(),
    };
  }
}

export const analysisService = new AnalysisService();
