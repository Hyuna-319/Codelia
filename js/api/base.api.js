/**
 * Base API class providing core fetch functionality and error handling.
 */
export class BaseApi {
    /**
     * @param {string} baseUrl - The base URL for the API.
     */
    constructor(baseUrl = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Performs a fetch request with default options and error handling.
     * @param {string} endpoint - The API endpoint to call.
     * @param {Object} options - Fetch options.
     * @returns {Promise<any>} - The parsed JSON response.
     * @throws {Error} - If the request fails or returns a non-OK status.
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request Error [${url}]:`, error);
            throw error;
        }
    }

    /**
     * Performs a GET request.
     * @param {string} endpoint - The API endpoint to call.
     * @returns {Promise<any>}
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * Performs a POST request.
     * @param {string} endpoint - The API endpoint to call.
     * @param {Object} data - The data to send in the request body.
     * @returns {Promise<any>}
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}
