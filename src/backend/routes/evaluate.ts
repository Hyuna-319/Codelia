import { Router, Request, Response } from 'express';
import { ConfigManager } from '../utils/config-manager';
import { PromptLoader } from '../utils/prompt-loader';
import { AIClient } from '../services/ai-client';
import { RequirementEvaluator } from '../services/evaluator';
import { EvaluateRequest } from '../../shared/types';

const router = Router();

/**
 * POST /api/evaluate
 * Evaluate requirement text
 */
router.post('/evaluate', async (req: Request, res: Response) => {
    try {
        const { text }: EvaluateRequest = req.body;

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

        // Load scoring prompt
        const scoringPrompt = await PromptLoader.loadScoringPrompt();

        // Create evaluator and evaluate
        const evaluator = new RequirementEvaluator(aiClient, scoringPrompt);
        const scores = await evaluator.evaluate(text);

        res.json(scores);
    } catch (error) {
        console.error('Evaluation error:', error);
        res.status(500).json({ error: String(error) });
    }
});

export default router;
