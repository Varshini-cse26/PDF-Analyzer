import axios from "axios";
import { AnalysisResult } from "../types";

export class ApiService {
  /**
   * Post a PDF URL to the backend for AI structure analysis.
   */
  static async analyzePdf(pdfUrl: string): Promise<AnalysisResult> {
    const response = await axios.post<AnalysisResult>("/api/analyze", {
      pdfUrl: pdfUrl.trim()
    }, {
      timeout: 120000, // 2 minutes timeout (parsing takes some time)
      headers: {
        "Content-Type": "application/json",
      }
    });
    return response.data;
  }
}
