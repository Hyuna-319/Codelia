import { Router, Request, Response } from 'express';
import { ConfigManager } from '../utils/config-manager';
import { PromptLoader } from '../utils/prompt-loader';
import { AIClient } from '../services/ai-client';
import { RequirementEvaluator } from '../services/evaluator';
import { RequirementImprover } from '../services/improver';
import { ImproveRequest, TopImprovement } from '../../shared/types';

const router = Router();

/**
 * POST /api/improve
 * Improve requirement with pattern data
 */
router.post('/improve', async (req: Request, res: Response) => {
    try {
        const { text, pattern_data }: ImproveRequest = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        // Load configuration
        const config = await ConfigManager.load();
        const provider = config.provider || 'openai';
        const providerSettings = config[provider];

        if (!providerSettings || !providerSettings.key) {
            return res.status(401).json({ error: `API key for ${provider} not found` });
        }

        const apiKey = providerSettings.key;
        const baseUrl = (providerSettings as any).url;

        // Initialize AI client
        const aiClient = new AIClient(provider, apiKey, baseUrl);

        // Load prompts
        let qualityPrompt = await PromptLoader.loadQualityPrompt();
        const scoringPrompt = await PromptLoader.loadScoringPrompt();

        // Inject project context into quality prompt
        const project = config.project || {};
        qualityPrompt = PromptLoader.injectProjectContext(qualityPrompt, project);

        // Create services
        const improver = new RequirementImprover(aiClient, qualityPrompt);
        const evaluator = new RequirementEvaluator(aiClient, scoringPrompt);

        // 1. Evaluate original
        const originalScores = await evaluator.evaluate(text);

        // 2. Improve with pattern data
        const improvedResult = await improver.improve(text, pattern_data);

        // 3. Evaluate improved
        const improvedScores = await evaluator.evaluate(improvedResult.improved);

        // 4. Calculate top score changes
        const explanations: TopImprovement[] = [];
        if (originalScores.scores && improvedScores.scores) {
            const scoreChanges: any[] = [];

            for (const [ruleId, origData] of Object.entries(originalScores.scores)) {
                const impData = improvedScores.scores[ruleId];
                if (impData && origData.score < impData.score) {
                    const change = impData.score - origData.score;
                    scoreChanges.push({
                        rule: ruleId,
                        name: origData.name || ruleId,
                        original: origData.score,
                        improved: impData.score,
                        change,
                        reason: impData.reason || ''
                    });
                }
            }

            // Sort by change (descending) and take top 3
            scoreChanges.sort((a, b) => b.change - a.change);
            const topChanges = scoreChanges.slice(0, 3);

            // Create explanations
            for (const change of topChanges) {
                explanations.push({
                    ruleId: change.rule,
                    title: change.name,
                    content: change.reason
                });
            }
        }

        // 5. Compare scores
        const comparison = evaluator.compareScores(originalScores, improvedScores);

        res.json({
            original_scores: originalScores,
            improved_result: improvedResult,
            improved_scores: improvedScores,
            comparison,
            explanations
        });
    } catch (error) {
        console.error('Improvement error:', error);
        res.status(500).json({ error: String(error) });
    }
});

export default router;
