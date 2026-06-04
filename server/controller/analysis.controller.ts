import { Request, Response } from "express";
import { analysisService } from "../service/analysis.service";

export class AnalysisController {
  /**
   * Endpoint: POST /api/analyze
   * Body: { pdfUrl: string }
   */
  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const { pdfUrl } = req.body;

      if (!pdfUrl) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "The 'pdfUrl' parameter is required in the request body."
        });
        return;
      }

      if (typeof pdfUrl !== "string") {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "The 'pdfUrl' must be a valid URL string."
        });
        return;
      }

      const result = await analysisService.analyzePdf(pdfUrl);
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Analysis Controller Exception:", error);
      
      // Map exception messages gracefully for the client
      const statusCode = error.message.includes("not defined") || error.message.includes("API Key")
        ? 500  // Server issue with Key setup
        : error.message.includes("does not contain a valid PDF document")
        ? 400  // Rule 1 Bad URL/Content
        : error.message.includes("Unable to read PDF content")
        ? 422  // Rule 2 Unreadable/Extraction failed
        : error.message.includes("The provided URL is not valid") || error.message.includes("must be a valid URL string") || error.message.includes("parameter is required")
        ? 400  // Bad Request - invalid client parameters
        : error.message.includes("not found")
        ? 404  // Document not found
        : error.message.includes("Access forbidden")
        ? 403  // Content blocked by upstream
        : 502; // Gateway/Extraction service failure

      const responseError = error.message || "An unexpected error occurred during document processing.";

      res.status(statusCode).json({
        error: responseError,
        message: responseError
      });
    }
  }
}

export const analysisController = new AnalysisController();
