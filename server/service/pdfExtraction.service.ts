import { PDFParse } from "pdf-parse";

export interface ExtractionResult {
  text: string;
  pages: number;
  originalLength: number;
}

export class PdfExtractionService {
  /**
   * Extracts clean text and metadata from PDF Buffer using the modern PDFParse class.
   */
  async extractText(pdfBuffer: Buffer): Promise<ExtractionResult> {
    try {
      // 1. Convert Buffer to Uint8Array as required by PDFParse options
      const uint8Array = new Uint8Array(pdfBuffer);
      
      // 2. Instantiate and compile text using modern ESM-friendly class
      const parser = new PDFParse({ data: uint8Array });
      const textResult = await parser.getText();
      
      const rawText = textResult.text || "";
      const numPages = textResult.total || 1;

      // 3. Basic text cleanup
      const cleanText = rawText
        .replace(/\r\n/g, "\n")
        .replace(/[^\x07\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "") // remove problematic non-printable chars
        .trim();

      // Clean up parser memory context
      await parser.destroy();

      return {
        text: cleanText,
        pages: numPages,
        originalLength: cleanText.length,
      };
    } catch (error: any) {
      throw new Error("Unable to read PDF content.");
    }
  }
}

export const pdfExtractionService = new PdfExtractionService();
