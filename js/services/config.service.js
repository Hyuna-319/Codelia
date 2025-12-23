import { configApi } from '../api/config.api.js';

/**
 * Service layer for configuration-related business logic.
 */
export class ConfigService {
    /**
     * Loads the configuration from the API.
     * @returns {Promise<Object>}
     */
    async loadConfig() {
        return await configApi.getConfig();
    }

    /**
     * Checks if the configuration is valid (has API key and project context).
     * @returns {Promise<Object>} Object containing validity status and missing fields.
     */
    async checkConfiguration() {
        const config = await this.loadConfig();
        const project = config.project || {};
        const provider = config.provider || 'openai';

        let apiKey = '';
        if (provider === 'openai') apiKey = config.openai?.key;
        else if (provider === 'gemini') apiKey = config.gemini?.key;
        else if (provider === 'claude') apiKey = config.claude?.key;

        const hasApiKey = !!apiKey;
        const hasProjectContext = !!(project.developer && project.system && project.client);
        const isValid = hasApiKey && hasProjectContext;

        return {
            isValid,
            hasApiKey,
            hasProjectContext,
            provider,
            config
        };
    }

    /**
     * Saves the API configuration for a specific provider.
     * @param {Object} apiData - The API configuration data (provider, keys, urls).
     * @returns {Promise<Object>}
     */
    async saveApiConfig(apiData) {
        const currentConfig = await this.loadConfig();
        const newConfig = {
            ...currentConfig,
            provider: apiData.provider,
            openai: apiData.openai || currentConfig.openai,
            gemini: apiData.gemini || currentConfig.gemini,
            claude: apiData.claude || currentConfig.claude
        };
        return await configApi.saveConfig(newConfig);
    }

    /**
     * Saves the project configuration.
     * @param {Object} projectData - The project configuration data (developer, system, client).
     * @returns {Promise<Object>}
     */
    async saveProjectConfig(projectData) {
        const currentConfig = await this.loadConfig();
        const newConfig = {
            ...currentConfig,
            project: {
                developer: projectData.developer.trim(),
                system: projectData.system.trim(),
                client: projectData.client.trim()
            }
        };
        return await configApi.saveConfig(newConfig);
    }

    /**
     * Validates if the API key for the current provider exists.
     * @param {string} provider - The AI provider.
     * @param {Object} config - The configuration object.
     * @returns {boolean}
     */
    validateApiKey(provider, config) {
        if (provider === 'openai') return !!config.openai?.key;
        if (provider === 'gemini') return !!config.gemini?.key && !!config.gemini?.url;
        if (provider === 'claude') return !!config.claude?.key;
        return false;
    }
}

export const configService = new ConfigService();
