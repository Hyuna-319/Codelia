import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from '../../shared/types';

/**
 * AI Client for multiple providers
 * Supports OpenAI, Gemini, Claude, and Enterprise Gateway
 */
export class AIClient {
    private provider: AIProvider;
    private apiKey: string;
    private baseUrl?: string;
    private model: string;
    private maxTokens: number = 8000;

    // SDK instances
    private openaiClient?: OpenAI;
    private anthropicClient?: Anthropic;
    private geminiClient?: GoogleGenerativeAI;

    constructor(provider: AIProvider, apiKey: string, baseUrl?: string) {
        this.provider = provider.toLowerCase() as AIProvider;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;

        // Initialize based on provider
        switch (this.provider) {
            case 'openai':
                this.model = 'gpt-4o-mini';
                this.openaiClient = new OpenAI({
                    apiKey: this.apiKey,
                    baseURL: 'https://api.openai.com/v1'
                });
                break;

            case 'gemini':
                this.model = 'gemini-2.0-flash';
                if (!this.baseUrl) {
                    throw new Error('Gemini configuration requires a Base URL');
                }
                this.geminiClient = new GoogleGenerativeAI(this.apiKey);
                break;

            case 'claude':
                this.model = 'claude-3-sonnet-20240229';
                this.anthropicClient = new Anthropic({
                    apiKey: this.apiKey
                });
                break;

            case 'enterprise_gateway':
                this.model = '';
                if (!this.baseUrl) {
                    throw new Error('Enterprise Gateway requires a Base URL');
                }
                break;

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }

        console.log(`✓ ${provider.toUpperCase()} client initialized`);
        if (this.baseUrl) {
            console.log(`  Base URL: ${this.baseUrl}`);
        }
        if (this.model) {
            console.log(`  Model: ${this.model}`);
        }
    }

    /**
     * Call AI API with system prompt and user message
     */
    async callAPI(systemPrompt: string, userMessage: string): Promise<string> {
        switch (this.provider) {
            case 'openai':
                return this.callOpenAI(systemPrompt, userMessage);
            case 'gemini':
                return this.callGemini(systemPrompt, userMessage);
            case 'claude':
                return this.callClaude(systemPrompt, userMessage);
            case 'enterprise_gateway':
                return this.callEnterpriseGateway(systemPrompt, userMessage);
            default:
                throw new Error(`Unsupported provider: ${this.provider}`);
        }
    }

    /**
     * OpenAI API call
     */
    private async callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
        if (!this.openaiClient) {
            throw new Error('OpenAI client not initialized');
        }

        try {
            const response = await this.openaiClient.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: this.maxTokens,
                temperature: 0.7
            });

            return response.choices[0].message.content || '';
        } catch (error) {
            throw new Error(`OpenAI API call failed: ${error}`);
        }
    }

    /**
     * Gemini API call
     */
    private async callGemini(systemPrompt: string, userMessage: string): Promise<string> {
        if (!this.baseUrl) {
            throw new Error('Gemini Base URL not configured');
        }

        // Combine system prompt and user message
        const fullPrompt = `${systemPrompt}\n\nUser Request:\n${userMessage}`;

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: fullPrompt }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result: any = await response.json();
            return result.candidates[0].content.parts[0].text;
        } catch (error) {
            throw new Error(`Gemini API call failed: ${error}`);
        }
    }

    /**
     * Claude API call
     */
    private async callClaude(systemPrompt: string, userMessage: string): Promise<string> {
        if (!this.anthropicClient) {
            throw new Error('Claude client not initialized');
        }

        try {
            const response = await (this.anthropicClient as any).messages.create({
                model: this.model,
                max_tokens: this.maxTokens,
                temperature: 0.7,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userMessage }
                ]
            });

            const content = response.content[0];
            if (content.type === 'text') {
                return content.text;
            }

            return '';
        } catch (error) {
            throw new Error(`Claude API call failed: ${error}`);
        }
    }

    /**
     * Enterprise Gateway API call
     */
    private async callEnterpriseGateway(systemPrompt: string, userMessage: string): Promise<string> {
        if (!this.baseUrl) {
            throw new Error('Enterprise Gateway Base URL not configured');
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: this.maxTokens,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result: any = await response.json();

            // Handle various response formats
            if (result.choices && result.choices[0]) {
                return result.choices[0].message.content;
            } else if (result.content) {
                if (Array.isArray(result.content)) {
                    return result.content[0].text;
                }
                return result.content;
            } else if (result.response) {
                return result.response;
            }

            return String(result);
        } catch (error) {
            throw new Error(`Enterprise Gateway call failed: ${error}`);
        }
    }

    /**
     * Evaluate requirement and return JSON scores
     */
    async evaluateRequirement(scoringPrompt: string, text: string): Promise<any> {
        let userMessage = `Requirement to Evaluate:\n${text}\n\nPlease evaluate this requirement and provide the score in JSON format as specified.`;

        if (this.provider === 'gemini') {
            userMessage += '\nIMPORTANT: Output ONLY valid JSON.';
        }

        const response = await this.callAPI(scoringPrompt, userMessage);

        // Parse JSON from response
        return this.parseJSON(response);
    }

    /**
     * Parse JSON from AI response, removing markdown code blocks
     */
    private parseJSON(response: string): any {
        try {
            let cleanResponse = response.trim();

            // Remove markdown code blocks
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.substring(7);
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.substring(3);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
            }

            // Extract JSON object
            const jsonStart = cleanResponse.indexOf('{');
            const jsonEnd = cleanResponse.lastIndexOf('}') + 1;

            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const jsonStr = cleanResponse.substring(jsonStart, jsonEnd);
                return JSON.parse(jsonStr);
            }

            // Try parsing the whole response
            return JSON.parse(cleanResponse);
        } catch (error) {
            throw new Error(`Failed to parse score evaluation result: ${error}\nResponse: ${response}`);
        }
    }

    /**
     * Improve requirement with pattern data
     */
    async improveRequirement(
        qualityPrompt: string,
        originalText: string,
        patternData: any
    ): Promise<string> {
        const patternType = patternData.pattern || 'ubiquitous';
        let patternContext = `Pattern Type: ${patternType}\n\n`;

        // Add pattern fields
        for (const [key, value] of Object.entries(patternData)) {
            if (key !== 'pattern' && value) {
                const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                patternContext += `${formattedKey}: ${value}\n`;
            }
        }

        const userMessage = `Original Requirement: ${originalText}

${patternContext}

Please improve this requirement based on the INCOSE rules provided in the system prompt.
Use the pattern information above to structure the improved requirement appropriately.
If any pattern fields are missing, do not include them in the improved requirement.`;

        return this.callAPI(qualityPrompt, userMessage);
    }
}
