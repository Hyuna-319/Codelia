/**
 * Utility functions for DOM manipulation.
 */

/**
 * Gets an element by its ID.
 * @param {string} id - The element ID.
 * @returns {HTMLElement|null}
 */
export function getElementById(id) {
    return document.getElementById(id);
}

/**
 * Toggles a class on an element.
 * @param {HTMLElement} element - The target element.
 * @param {string} className - The class to toggle.
 * @param {boolean} [force] - Whether to force add/remove the class.
 */
export function toggleClass(element, className, force) {
    if (element) {
        element.classList.toggle(className, force);
    }
}

/**
 * Sets the API status banner content and style.
 * @param {string} type - The status type ('success', 'warning', 'error').
 * @param {string} message - The status message to display.
 */
export function setApiStatus(type, message) {
    const apiStatus = getElementById('apiStatus');
    if (!apiStatus) return;

    apiStatus.className = `panel panel-${type === 'error' ? 'warning' : type}`;
    if (type === 'success') apiStatus.className = 'panel panel-success';
    if (type === 'warning') apiStatus.className = 'panel panel-warning';

    apiStatus.innerHTML = `
        <span class="panel-icon">${type === 'success' ? '✅' : '⚠️'}</span>
        <div>${message}</div>
    `;
}

/**
 * Shows the loading section and disables the improve button.
 */
export function showLoading() {
    const loadingSection = getElementById('loadingSection');
    const btnImprove = getElementById('btnImprove');
    const resultSection = getElementById('resultSection');

    if (loadingSection) loadingSection.classList.remove('hidden');
    if (resultSection) resultSection.classList.add('hidden');
    if (btnImprove) btnImprove.disabled = true;
}

/**
 * Hides the loading section and enables the improve button.
 */
export function hideLoading() {
    const loadingSection = getElementById('loadingSection');
    const btnImprove = getElementById('btnImprove');

    if (loadingSection) loadingSection.classList.add('hidden');
    if (btnImprove) btnImprove.disabled = false;
}

/**
 * Toggles the API key input groups based on the selected provider.
 * @param {string} provider - The selected AI provider.
 */
export function toggleApiKeyInputs(provider) {
    const openaiInputGroup = getElementById('openaiInputGroup');
    const geminiInputGroup = getElementById('geminiInputGroup');
    const claudeInputGroup = getElementById('claudeInputGroup');

    if (openaiInputGroup) toggleClass(openaiInputGroup, 'hidden', provider !== 'openai');
    if (geminiInputGroup) toggleClass(geminiInputGroup, 'hidden', provider !== 'gemini');
    if (claudeInputGroup) toggleClass(claudeInputGroup, 'hidden', provider !== 'claude');
}
