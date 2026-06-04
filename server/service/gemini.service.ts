import { GoogleGenAI, Type } from "@google/genai";

export interface CleanAnalysisResult {
  documentType: string;
  title: string;
  authors: string;
  summary: string;
  keyTakeaway: string;
}

export class GeminiService {
  private aiClient: GoogleGenAI | null = null;

  /**
   * Lazy initializes and returns the GoogleGenAI client.
   * Throws a user-friendly error if the GEMINI_API_KEY environment variable is missing.
   */
  private getClient(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "GEMINI_API_KEY environment variable is not defined. " +
          "Please configure your Gemini API Key in the Settings > Secrets tab of AI Studio."
        );
      }

      this.aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return this.aiClient;
  }

  /**
   * Intelligently truncates long text, keeping the beginning (e.g. abstract/header)
   * and the end (e.g. conclusion/references) which usually hold the key info.
   */
  private truncateText(text: string, maxChars = 50000): string {
    if (text.length <= maxChars) {
      return text;
    }
    // Reserve 80% for start, 20% for end
    const startCount = Math.floor(maxChars * 0.8);
    const endCount = Math.floor(maxChars * 0.2);
    
    const startChunk = text.slice(0, startCount);
    const endChunk = text.slice(-endCount);

    return `${startChunk}\n\n... [TRUNCATED FOR TOKEN LIMIT] ...\n\n${endChunk}`;
  }

  /**
   * Requests a structured analysis on the document text using Gemini.
   */
  async analyzeDocument(documentText: string): Promise<CleanAnalysisResult> {
    const client = this.getClient();

    const preparedText = this.truncateText(documentText);

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Analyze the following extracted PDF document text. Produce an accurate, descriptive summary and key takeaway based on this material. Combine all elements carefully and return in the requested structured JSON format.\n\nDocument Text:\n${preparedText}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: 
            "You are a professional research scientist and senior documents analyst. " +
            "Your task is to analyze documents objective and extract metadata and high-fidelity concise summaries. " +
            "Do not hallucinate content; rely strictly on the provided text.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentType: {
                type: Type.STRING,
                description: "Type of document, e.g., 'Research Paper', 'Article', 'User Manual', 'Financial Report', 'Legal Case', etc."
              },
              title: {
                type: Type.STRING,
                description: "The official academic or corporate title of the document. If none, write a concise header matching the contents."
              },
              authors: {
                type: Type.STRING,
                description: "The author list, creator, or publishing institution. Write 'Unknown' if none can be identified."
              },
              summary: {
                type: Type.STRING,
                description: "An authentic, elegant, and thorough summary of the main points, thesis, methodology, results, or objectives."
              },
              keyTakeaway: {
                type: Type.STRING,
                description: "The core conclusion, actionable learning, or primary innovation of this document."
              }
            },
            required: ["documentType", "title", "authors", "summary", "keyTakeaway"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Received an empty response from Gemini API.");
      }

      // Parse and return the JSON
      try {
        const parsed = JSON.parse(responseText.trim());
        return {
          documentType: parsed.documentType || "Unknown",
          title: parsed.title || "Untitled Document",
          authors: parsed.authors || "Unknown",
          summary: parsed.summary || "No summary provided.",
          keyTakeaway: parsed.keyTakeaway || "No key takeaway provided."
        };
      } catch (jsonErr) {
        console.error("Failed to parse Gemini response text:", responseText, jsonErr);
        throw new Error("Unable to parse structured AI analysis response schema.");
      }
    } catch (apiErr: any) {
      throw new Error(`Gemini API connection error: ${apiErr.message}`);
    }
  }
}

export const geminiService = new GeminiService();
