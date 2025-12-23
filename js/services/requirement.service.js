import { requirementApi } from '../api/requirement.api.js';

/**
 * Service layer for requirement processing business logic.
 */
export class RequirementService {
    /**
     * Improves a requirement text using the AI API.
     * @param {string} text - The original requirement text.
     * @param {Object} patternData - Optional pattern-specific data.
     * @returns {Promise<Object>}
     */
    async improveRequirement(text, patternData = {}) {
        if (!this.validateInput(text)) {
            throw new Error('Please enter a requirement.');
        }
        return await requirementApi.improve(text, patternData);
    }

    /**
     * Evaluates a requirement text using the AI API.
     * @param {string} text - The requirement text.
     * @returns {Promise<Object>}
     */
    async evaluateRequirement(text) {
        if (!this.validateInput(text)) {
            throw new Error('Please enter text to evaluate.');
        }
        return await requirementApi.evaluate(text);
    }

    /**
     * Validates the input requirement text.
     * @param {string} text - The input text.
     * @returns {boolean}
     */
    validateInput(text) {
        return !!(text && text.trim().length > 0);
    }

    /**
     * Collects pattern data from the corresponding DOM elements based on the selected pattern.
     * Note: This method still interacts with DOM, as per original logic.
     * @returns {Object}
     */
    collectPatternData() {
        const pattern = document.getElementById('patternSelect').value;
        const data = { pattern };

        switch (pattern) {
            case 'ubiquitous':
                data.system_response = document.getElementById('field-system-response')?.value.trim();
                break;
            case 'event-driven':
                data.precondition = document.getElementById('field-precondition')?.value.trim();
                data.trigger = document.getElementById('field-trigger')?.value.trim();
                data.system_response = document.getElementById('field-system-response-ed')?.value.trim();
                break;
            case 'unwanted':
                data.precondition = document.getElementById('field-precondition-uw')?.value.trim();
                data.forbidden_action = document.getElementById('field-forbidden')?.value.trim();
                break;
            case 'state-driven':
                data.condition = document.getElementById('field-condition')?.value.trim();
                data.system_response = document.getElementById('field-system-response-sd')?.value.trim();
                break;
            case 'optional':
                data.optional_feature = document.getElementById('field-optional-feature')?.value.trim();
                data.system_response = document.getElementById('field-system-response-opt')?.value.trim();
                break;
            case 'complex':
                data.precondition = document.getElementById('field-precondition-cx')?.value.trim();
                data.trigger = document.getElementById('field-trigger-cx')?.value.trim();
                data.system_response = document.getElementById('field-system-response-cx')?.value.trim();
                break;
        }

        Object.keys(data).forEach(key => {
            if (data[key] === '') delete data[key];
        });

        return data;
    }
}

export const requirementService = new RequirementService();
