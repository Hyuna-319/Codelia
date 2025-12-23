import { BaseApi } from './base.api.js';

/**
 * Repository layer for requirement-related API calls.
 */
export class RequirementApi extends BaseApi {
    constructor() {
        super();
    }

    /**
     * Sends a requirement for improvement.
     * @param {string} text - The original requirement text.
     * @param {Object} patternData - Pattern-specific data (if any).
     * @returns {Promise<Object>} - The improved requirement and evaluation data.
     */
    async improve(text, patternData = {}) {
        return this.post('/improve', {
            text: text,
            pattern_data: patternData
        });
    }

    /**
     * Evaluates a requirement text.
     * @param {string} text - The requirement text to evaluate.
     * @returns {Promise<Object>} - Evaluation scores and metrics.
     */
    async evaluate(text) {
        return this.post('/evaluate', { text });
    }
}

export const requirementApi = new RequirementApi();
