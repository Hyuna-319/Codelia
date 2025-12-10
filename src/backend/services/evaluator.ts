import { AIClient } from './ai-client';
import { ScoreResult, RuleScore, CategoryScore } from '../../shared/types';

/**
 * Requirement Evaluator
 * Evaluates requirements against INCOSE rules and calculates scores
 */
export class RequirementEvaluator {
    private aiClient: AIClient;
    private scoringPrompt: string;

    // All 64 rules (P1-P7, C1-C15, R1-R42)
    private readonly allRules = [
        // Pattern Rules
        'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7',
        // Characteristics - Individual
        'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9',
        // Characteristics - Set
        'C10', 'C11', 'C12', 'C13', 'C14', 'C15',
        // Writing Rules
        'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9',
        'R10', 'R11',
        'R12', 'R13', 'R14', 'R15', 'R16', 'R17',
        'R18', 'R19', 'R20', 'R21', 'R22', 'R23',
        'R24', 'R25',
        'R26',
        'R27', 'R28',
        'R29', 'R30',
        'R31',
        'R32',
        'R33',
        'R34', 'R35',
        'R37', 'R38', 'R39', 'R40',
        'R41', 'R42'
    ];

    constructor(aiClient: AIClient, scoringPrompt: string) {
        this.aiClient = aiClient;
        this.scoringPrompt = scoringPrompt;
    }

    /**
     * Evaluate requirement text and return scores
     */
    async evaluate(text: string): Promise<ScoreResult> {
        try {
            const scores = await this.aiClient.evaluateRequirement(this.scoringPrompt, text);
            return this.processScores(scores);
        } catch (error) {
            console.error('Evaluation failed:', error);
            return this.getDefaultScores();
        }
    }

    /**
     * Process raw scores from AI and calculate totals and categories
     */
    private processScores(scores: Record<string, RuleScore>): ScoreResult {
        let totalScore = 0;
        const maxScore = 320; // 64 rules × 5 points

        // Calculate total score
        for (const rule of this.allRules) {
            if (scores[rule]) {
                totalScore += scores[rule].score || 0;
            }
        }

        // Calculate category scores
        const categories = this.calculateCategoryScores(scores);

        return {
            total: totalScore,
            max: maxScore,
            percentage: Math.round((totalScore / maxScore * 100) * 10) / 10,
            scores,
            categories
        };
    }

    /**
     * Calculate scores for each category
     */
    private calculateCategoryScores(scores: Record<string, RuleScore>): Record<string, CategoryScore> {
        // Category definitions (17 categories)
        const categories: Record<string, string[]> = {
            '패턴 규칙 (P1-P7)': ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
            '개별 특성 (C1-C9)': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
            '집합 특성 (C10-C15)': ['C10', 'C11', 'C12', 'C13', 'C14', 'C15'],
            'Accuracy (정확성)': ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9'],
            'Concision (간결성)': ['R10', 'R11'],
            'Non-Ambiguity (비모호성)': ['R12', 'R13', 'R14', 'R15', 'R16', 'R17'],
            'Singularity (단일성)': ['R18', 'R19', 'R20', 'R21', 'R22', 'R23'],
            'Completeness (완전성)': ['R24', 'R25'],
            'Realism (현실성)': ['R26'],
            'Conditions (조건 표현)': ['R27', 'R28'],
            'Uniqueness (고유성)': ['R29', 'R30'],
            'Abstraction (추상화 수준)': ['R31'],
            'Quantification (정량화 - R32)': ['R32'],
            'Tolerance (허용오차)': ['R33'],
            'Quantification (정량화 - R34-35)': ['R34', 'R35'],
            'Uniformity of Language (언어 일관성)': ['R36', 'R37', 'R38', 'R39', 'R40'],
            'Modularity (모듈성)': ['R41', 'R42']
        };

        const result: Record<string, CategoryScore> = {};

        for (const [catName, rules] of Object.entries(categories)) {
            const maxScore = rules.length * 5;
            let currentScore = 0;

            for (const rule of rules) {
                if (scores[rule]) {
                    currentScore += scores[rule].score || 0;
                }
            }

            result[catName] = {
                score: currentScore,
                max: maxScore,
                rules
            };
        }

        return result;
    }

    /**
     * Get default scores (all zeros)
     */
    private getDefaultScores(): ScoreResult {
        return {
            total: 0,
            max: 320,
            percentage: 0,
            scores: {},
            categories: {}
        };
    }

    /**
     * Compare original and improved scores
     */
    compareScores(originalScores: ScoreResult, improvedScores: ScoreResult): any {
        const changes: Record<string, any> = {};

        for (const rule of this.allRules) {
            const orig = originalScores.scores[rule]?.score || 0;
            const impr = improvedScores.scores[rule]?.score || 0;

            changes[rule] = {
                original: orig,
                improved: impr,
                change: impr - orig
            };
        }

        return {
            original: originalScores,
            improved: improvedScores,
            changes,
            total_improvement: improvedScores.total - originalScores.total
        };
    }
}
