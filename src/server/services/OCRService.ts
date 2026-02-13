import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { ManusAIService } from './ManusAIService';
import { logger } from '../utils/logger';

/**
 * OCR Service - Extract text and structure from PDF contracts
 *
 * Uses pdf.js for text extraction and Manus AI for intelligent parsing
 */
export class OCRService {
  private manusAI: ManusAIService;

  constructor() {
    this.manusAI = new ManusAIService();
  }

  /**
   * Extract raw text from PDF contract
   * @param pdfBuffer - PDF file buffer
   * @returns Extracted text content
   */
  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      logger.info('Starting PDF text extraction');

      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      const textChunks: string[] = [];

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine text items
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        textChunks.push(pageText);
      }

      const fullText = textChunks.join('\n\n');

      logger.info(`PDF text extraction complete: ${numPages} pages, ${fullText.length} characters`);

      return fullText;
    } catch (error) {
      logger.error('PDF text extraction failed', error);
      throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`);
    }
  }

  /**
   * Extract structured contract terms from PDF text using AI
   * @param pdfText - Raw PDF text
   * @returns Structured contract terms
   */
  async extractContractTerms(pdfText: string): Promise<{
    commission: string | null;
    campaign_type: string | null;
    campaign_duration: number | null;
    tablet_included: boolean | null;
    tablet_model: string | null;
    contract_length: number | null;
    special_clauses: string[];
    raw_text: string;
  }> {
    try {
      logger.info('Starting AI-powered contract term extraction');

      const prompt = `
You are a contract analysis expert. Extract the following terms from this Bolt Food merchant contract:

CONTRACT TEXT:
${pdfText}

Extract and return ONLY a JSON object with these fields:
{
  "commission": "string - percentage (e.g., '12%') or null if not found",
  "campaign_type": "string - campaign/promotion details or null",
  "campaign_duration": "number - duration in days or null",
  "tablet_included": "boolean - true/false or null if not mentioned",
  "tablet_model": "string - tablet model name or null",
  "contract_length": "number - contract duration in months or null",
  "special_clauses": ["array of important special clauses/terms"]
}

Rules:
1. Extract EXACT values as they appear in the contract
2. For percentages, include the % symbol
3. For durations, convert to numbers (months or days)
4. Return null if a field is not found
5. Do NOT infer or assume values not explicitly stated

Return ONLY valid JSON, no explanation.
`;

      const response = await this.manusAI.callAI(prompt);

      // Parse AI response
      let contractTerms;
      try {
        // Extract JSON from response (handle if AI adds markdown formatting)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          contractTerms = JSON.parse(jsonMatch[0]);
        } else {
          contractTerms = JSON.parse(response);
        }
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON', { response });
        throw new Error('AI returned invalid JSON format');
      }

      logger.info('Contract term extraction complete', { contractTerms });

      return {
        ...contractTerms,
        raw_text: pdfText,
      };
    } catch (error) {
      logger.error('Contract term extraction failed', error);
      throw new Error(`Failed to extract contract terms: ${(error as Error).message}`);
    }
  }

  /**
   * Extract contract terms directly from PDF file
   * @param pdfBuffer - PDF file buffer
   * @returns Structured contract terms
   */
  async extractFromPDF(pdfBuffer: Buffer) {
    const text = await this.extractTextFromPDF(pdfBuffer);
    return await this.extractContractTerms(text);
  }

  /**
   * Validate extracted contract terms for completeness
   * @param terms - Extracted contract terms
   * @returns Validation result with missing fields
   */
  validateContractTerms(terms: any): {
    isComplete: boolean;
    missingFields: string[];
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  } {
    const requiredFields = [
      'commission',
      'campaign_type',
      'campaign_duration',
      'tablet_included',
      'contract_length',
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (terms[field] === null || terms[field] === undefined) {
        missingFields.push(field);
      }
    }

    // Determine confidence based on completeness
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    const completionRate = 1 - missingFields.length / requiredFields.length;

    if (completionRate === 1) {
      confidence = 'HIGH';
    } else if (completionRate >= 0.7) {
      confidence = 'MEDIUM';
    } else {
      confidence = 'LOW';
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      confidence,
    };
  }
}
