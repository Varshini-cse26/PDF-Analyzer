import axios from "axios";

export class PdfDownloadService {
  /**
   * Normalizes document URLs for reliable programmatic downloading.
   * Particularly targets arXiv URLs, pointing them to export.arxiv.org
   * and ensuring correct path resolutions.
   */
  private normalizeUrl(url: string): string {
    const trimmed = url.trim();
    try {
      const parsed = new URL(trimmed);

      // Support Google Drive links
      if (parsed.hostname.includes("drive.google.com")) {
        let fileId = "";
        const fileDMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileDMatch && fileDMatch[1]) {
          fileId = fileDMatch[1];
        } else {
          const idParam = parsed.searchParams.get("id");
          if (idParam) {
            fileId = idParam;
          }
        }

        if (fileId) {
          // Map to Google's raw content direct-download URL format
          return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      }

      if (parsed.hostname.endsWith("arxiv.org")) {
        // Change hostname to export.arxiv.org which is designated for programmatic & bulk downloads
        parsed.hostname = "export.arxiv.org";

        // Map abstract pages (/abs/*) directly to the corresponding PDF stream
        if (parsed.pathname.startsWith("/abs/")) {
          parsed.pathname = parsed.pathname.replace("/abs/", "/pdf/");
        }

        // Strip .pdf from the end if present, as export.arxiv.org expects raw paper IDs
        if (parsed.pathname.endsWith(".pdf")) {
          parsed.pathname = parsed.pathname.slice(0, -4);
        }

        return parsed.toString();
      }
    } catch (e) {
      // Allow general fallback if url parser throws
    }
    return trimmed;
  }

  /**
   * Downloads a robust PDF file into a Buffer from the provided URL.
   * Performs basic URL validation and handles download errors gracefully.
   */
  async downloadPdf(url: string): Promise<Buffer> {
    const targetUrl = this.normalizeUrl(url);

    // 1. Basic format validation
    try {
      new URL(targetUrl);
    } catch (e) {
      throw new Error(`The provided URL is not valid: ${url}`);
    }

    // 2. Download PDF with Axios
    try {
      const response = await axios.get(targetUrl, {
        responseType: "arraybuffer",
        timeout: 20000, // 20s timeout limit
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/pdf, application/octet-stream, */*",
        },
      });

      // Verify header type if present (some pages return HTML when blocked)
      const contentType = response.headers["content-type"];
      if (contentType && typeof contentType === "string" && contentType.includes("html")) {
        throw new Error("The provided URL does not contain a valid PDF document.");
      }

      const buffer = Buffer.from(response.data);
      if (!buffer || buffer.length === 0) {
        throw new Error("Unable to read PDF content.");
      }

      // Check PDF Magic Number "%PDF"
      const isPdfHeader = buffer.toString("utf-8", 0, 4) === "%PDF";
      if (!isPdfHeader) {
        throw new Error("The provided URL does not contain a valid PDF document.");
      }

      return buffer;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`PDF not found (Status Code 404) at URL: ${targetUrl}`);
        } else if (error.response?.status === 403) {
          throw new Error(`Access forbidden (Status Code 403). The server hosting the PDF rejected the request.`);
        } else if (error.code === "ECONNABORTED") {
          throw new Error(`Connection timed out while loading the PDF from: ${targetUrl}`);
        }
        throw new Error(`Failed to download PDF from URL. Network error: ${error.message}`);
      }
      throw error;
    }
  }
}

export const pdfDownloadService = new PdfDownloadService();
