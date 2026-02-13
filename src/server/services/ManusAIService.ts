import { logger } from '../utils/logger';

/**
 * Manus AI Service - Integration with Manus AI API
 *
 * Wraps the Manus AI/LLM API for use across all services.
 * Manus provides access to Claude and GPT-4 models.
 */
export class ManusAIService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.MANUS_API_KEY || '';
    this.baseURL = process.env.MANUS_API_URL || 'https://api.manus.im/v1';
    this.model = process.env.MANUS_MODEL || 'claude-3-5-sonnet';

    if (!this.apiKey) {
      logger.warn('MANUS_API_KEY not set - AI features will not work');
    }
  }

  /**
   * Call Manus AI with a text prompt
   * @param prompt - The prompt to send to the AI
   * @param options - Optional configuration
   * @returns AI response text
   */
  async callAI(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            ...(options?.systemPrompt
              ? [{ role: 'system', content: options.systemPrompt }]
              : []),
            { role: 'user', content: prompt },
          ],
          temperature: options?.temperature ?? 0.1,
          max_tokens: options?.maxTokens ?? 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Manus API error ${response.status}: ${errorText}`);
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Manus AI');
      }

      return content;
    } catch (error) {
      logger.error('Manus AI call failed', { error });
      throw new Error(`AI call failed: ${(error as Error).message}`);
    }
  }

  /**
   * Extract structured data from text using AI
   * @param text - Input text to extract from
   * @param schema - JSON schema description of expected output
   * @returns Extracted structured data
   */
  async extractStructuredData<T>(
    text: string,
    schema: string
  ): Promise<T> {
    const prompt = `
Extract data from the following text according to this schema:

SCHEMA:
${schema}

TEXT:
${text}

Return ONLY valid JSON matching the schema. No explanation.
`;

    const response = await this.callAI(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch {
      throw new Error(`AI returned invalid JSON: ${response.substring(0, 200)}`);
    }
  }
}
