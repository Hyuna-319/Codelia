import { Router, Request, Response } from 'express';
import { ConfigManager } from '../utils/config-manager';

const router = Router();

/**
 * GET /api/config
 * Retrieve current configuration
 */
router.get('/config', async (req: Request, res: Response) => {
    try {
        const config = await ConfigManager.load();

        res.json({
            provider: config.provider || 'openai',
            openai: config.openai || { key: '' },
            gemini: config.gemini || { key: '', url: '' },
            claude: config.claude || { key: '' },
            enterprise_gateway: config.enterprise_gateway || { key: '', url: '' },
            project: config.project || {}
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

/**
 * POST /api/config
 * Update configuration
 */
router.post('/config', async (req: Request, res: Response) => {
    try {
        const newConfig = req.body;
        const currentConfig = await ConfigManager.load();

        // Merge with current config
        const updatedConfig = { ...currentConfig, ...newConfig };

        const success = await ConfigManager.save(updatedConfig);

        if (success) {
            res.json({ status: 'success', message: 'Configuration saved' });
        } else {
            res.status(500).json({ status: 'error', message: 'Failed to save config' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to save config' });
    }
});

export default router;
