import { AIClient } from './ai-client';
import { PatternData, ImprovementResult } from '../../shared/types';

/**
 * Requirement Improver
 * Improves requirements using AI based on pattern data
 */
export class RequirementImprover {
    private aiClient: AIClient;
    private qualityPrompt: string;

    constructor(aiClient: AIClient, qualityPrompt: string) {
        this.aiClient = aiClient;
        this.qualityPrompt = qualityPrompt;
    }

    /**
     * Improve requirement with pattern data
     */
    async improve(originalText: string, patternData: PatternData): Promise<ImprovementResult> {
        const improvedText = await this.aiClient.improveRequirement(
            this.qualityPrompt,
            originalText,
            patternData
        );

        return {
            original: originalText,
            improved: improvedText,
            pattern_data: patternData
        };
    }
}
