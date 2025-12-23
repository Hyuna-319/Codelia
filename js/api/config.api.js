import { BaseApi } from './base.api.js';

/**
 * Repository layer for configuration-related API calls.
 */
export class ConfigApi extends BaseApi {
    constructor() {
        super();
    }

    /**
     * Retrieves the current configuration from the backend.
     * @returns {Promise<Object>}
     */
    async getConfig() {
        return this.get('/config');
    }

    /**
     * Saves the configuration to the backend.
     * @param {Object} configData - The configuration object to save.
     * @returns {Promise<Object>}
     */
    async saveConfig(configData) {
        return this.post('/config', configData);
    }
}

export const configApi = new ConfigApi();
