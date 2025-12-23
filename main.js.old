import { GuidePanel } from './components/GuidePanel.js';
import { HistoryPanel } from './components/HistoryPanel.js';
import { ResultDisplay } from './components/ResultDisplay.js';
import { configService } from './services/config.service.js';
import { requirementService } from './services/requirement.service.js';
import * as dom from './utils/dom-helpers.js';

// Global instances
window.guidePanel = null;
window.historyPanel = null;

/**
 * Application Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Panels
    const guidePanelContainer = dom.getElementById('guidePanelContainer');
    if (guidePanelContainer) {
        window.guidePanel = new GuidePanel(guidePanelContainer);
    }

    const historyPanelContainer = dom.getElementById('historyPanelContainer');
    if (historyPanelContainer) {
        window.historyPanel = new HistoryPanel(historyPanelContainer);
    }

    // 2. Load Configuration
    await loadConfig();

    // 3. Initial UI Setup
    updatePatternFields();

    // 4. Initial Config Check
    await checkConfiguration(true);
});

// --- API & Config Functions ---

async function loadConfig() {
    try {
        const config = await configService.loadConfig();
        const providerSelect = dom.getElementById('providerSelect');

        if (providerSelect) providerSelect.value = config.provider || 'openai';

        if (dom.getElementById('openaiKeyInput')) dom.getElementById('openaiKeyInput').value = config.openai?.key || '';
        if (dom.getElementById('openaiUrlInput')) dom.getElementById('openaiUrlInput').value = config.openai?.url || '';

        if (dom.getElementById('geminiKeyInput')) dom.getElementById('geminiKeyInput').value = config.gemini?.key || '';
        if (dom.getElementById('geminiUrlInput')) dom.getElementById('geminiUrlInput').value = config.gemini?.url || '';

        if (dom.getElementById('claudeKeyInput')) dom.getElementById('claudeKeyInput').value = config.claude?.key || '';
        if (dom.getElementById('claudeUrlInput')) dom.getElementById('claudeUrlInput').value = config.claude?.url || '';

        const project = config.project || {};
        if (dom.getElementById('projectDeveloper')) dom.getElementById('projectDeveloper').value = project.developer || '';
        if (dom.getElementById('projectSystem')) dom.getElementById('projectSystem').value = project.system || '';
        if (dom.getElementById('projectClient')) dom.getElementById('projectClient').value = project.client || '';

        toggleApiKeyInputs();
        updateApiStatus();
    } catch (error) {
        console.error('Error loading config:', error);
        dom.setApiStatus('error', 'Failed to connect to server');
    }
}

async function checkConfiguration(redirect = false) {
    const status = await configService.checkConfiguration();
    const warningEl = dom.getElementById('configWarning');
    if (!warningEl) return status.isValid;

    const directTab = dom.getElementById('tab-direct');
    const interactiveElements = directTab ? directTab.querySelectorAll('input, textarea, select, button') : [];

    if (!status.isValid) {
        warningEl.classList.remove('hidden');
        warningEl.style.display = 'flex';
        interactiveElements.forEach(el => {
            if (!el.closest('#configWarning')) {
                el.disabled = true;
                el.style.opacity = '0.5';
                if (el.tagName === 'BUTTON') el.style.cursor = 'not-allowed';
            }
        });

        if (redirect) {
            switchInputTab('settings');
        }
    } else {
        warningEl.classList.add('hidden');
        warningEl.style.display = 'none';
        interactiveElements.forEach(el => {
            el.disabled = false;
            el.style.opacity = '1';
            if (el.tagName === 'BUTTON') el.style.cursor = 'pointer';
        });
    }

    return status.isValid;
}

function updateApiStatus() {
    const providerSelect = dom.getElementById('providerSelect');
    if (!providerSelect) return;

    const provider = providerSelect.value;
    const config = {
        openai: { key: dom.getElementById('openaiKeyInput')?.value },
        gemini: { key: dom.getElementById('geminiKeyInput')?.value, url: dom.getElementById('geminiUrlInput')?.value },
        claude: { key: dom.getElementById('claudeKeyInput')?.value }
    };

    const hasKey = configService.validateApiKey(provider, config);
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

    if (hasKey) {
        dom.setApiStatus('success', `${providerName} 사용 준비 완료`);
        const btnImprove = dom.getElementById('btnImprove');
        if (btnImprove) btnImprove.disabled = false;
    } else {
        dom.setApiStatus('warning', `${providerName} API 키를 입력해주세요`);
        const btnImprove = dom.getElementById('btnImprove');
        if (btnImprove) btnImprove.disabled = true;
    }
}

async function saveApiConfig() {
    try {
        const apiData = {
            provider: dom.getElementById('providerSelect').value,
            openai: { key: dom.getElementById('openaiKeyInput').value, url: dom.getElementById('openaiUrlInput').value },
            gemini: { key: dom.getElementById('geminiKeyInput').value, url: dom.getElementById('geminiUrlInput').value },
            claude: { key: dom.getElementById('claudeKeyInput').value, url: dom.getElementById('claudeUrlInput').value }
        };

        await configService.saveApiConfig(apiData);
        dom.setApiStatus('success', 'API 설정이 저장되었습니다.');
        await checkConfiguration();
        switchInputTab('direct');
    } catch (error) {
        dom.setApiStatus('error', 'API 설정 저장 실패');
        alert('API 설정 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

async function resetApiConfig() {
    const providerSelect = dom.getElementById('providerSelect');
    if (!providerSelect || !confirm('선택한 AI 제공자의 API 키를 초기화하시겠습니까?')) return;

    const provider = providerSelect.value;
    if (provider === 'openai') {
        dom.getElementById('openaiKeyInput').value = '';
        dom.getElementById('openaiUrlInput').value = '';
    } else if (provider === 'gemini') {
        dom.getElementById('geminiKeyInput').value = '';
        dom.getElementById('geminiUrlInput').value = '';
    } else if (provider === 'claude') {
        dom.getElementById('claudeKeyInput').value = '';
        dom.getElementById('claudeUrlInput').value = '';
    }

    await saveApiConfig();
}

async function saveProjectConfig() {
    try {
        const projectData = {
            developer: dom.getElementById('projectDeveloper').value,
            system: dom.getElementById('projectSystem').value,
            client: dom.getElementById('projectClient').value
        };

        await configService.saveProjectConfig(projectData);
        dom.setApiStatus('success', '프로젝트 설정이 저장되었습니다.');
        alert('프로젝트 설정이 성공적으로 저장되었습니다!');
        await checkConfiguration();
    } catch (error) {
        dom.setApiStatus('error', '프로젝트 설정 저장 실패');
        alert('프로젝트 설정 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

async function resetProjectConfig() {
    if (!confirm('모든 프로젝트 설정을 초기화하시겠습니까?')) return;

    dom.getElementById('projectDeveloper').value = '';
    dom.getElementById('projectSystem').value = '';
    dom.getElementById('projectClient').value = '';

    await saveProjectConfig();
}

/**
 * Loads project context into pattern input fields (temp override)
 */
async function loadProjectSettingsToPattern() {
    try {
        const config = await configService.loadConfig();
        const project = config.project || {};

        if (dom.getElementById('patternDeveloper')) dom.getElementById('patternDeveloper').value = project.developer || '';
        if (dom.getElementById('patternSystem')) dom.getElementById('patternSystem').value = project.system || '';
        if (dom.getElementById('patternClient')) dom.getElementById('patternClient').value = project.client || '';
    } catch (error) {
        console.error('Error loading pattern project settings:', error);
    }
}

// --- Requirement Functions ---

async function improveRequirement() {
    const isValid = await checkConfiguration(true);
    if (!isValid) return;

    const directTab = dom.getElementById('tab-direct');
    const isDirectMode = directTab && directTab.classList.contains('active');

    const text = isDirectMode
        ? dom.getElementById('inputRequirementDirect').value
        : dom.getElementById('inputRequirementPattern').value;

    if (!text) {
        alert('Please enter a requirement.');
        return;
    }

    const patternData = isDirectMode ? {} : requirementService.collectPatternData();

    dom.showLoading();

    try {
        const data = await requirementService.improveRequirement(text, patternData);
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            ResultDisplay.displayResult(data);
        }
    } catch (error) {
        alert('Error connecting to server: ' + error.message);
    } finally {
        dom.hideLoading();
    }
}

// --- UI Utility Functions ---

function updatePatternFields() {
    const patternSelect = dom.getElementById('patternSelect');
    if (!patternSelect) return;

    const pattern = patternSelect.value;
    document.querySelectorAll('.pattern-fields').forEach(el => el.classList.add('hidden'));
    const selectedFields = dom.getElementById(`fields-${pattern}`);
    if (selectedFields) {
        selectedFields.classList.remove('hidden');
    }
}

function toggleApiKeyInputs() {
    const providerSelect = dom.getElementById('providerSelect');
    if (providerSelect) {
        dom.toggleApiKeyInputs(providerSelect.value);
        updateApiStatus();
    }
}

function switchInputTab(tabName) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.input-tab').forEach(tab => tab.classList.remove('active'));

    const selectedPane = dom.getElementById(`tab-${tabName}`);
    if (selectedPane) selectedPane.classList.add('active');

    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) selectedTab.classList.add('active');

    if (tabName === 'pattern') {
        loadProjectSettingsToPattern();
    }
}

// --- Global Exports (for index.html onclick) ---

window.improveRequirement = improveRequirement;
window.saveApiConfig = saveApiConfig;
window.resetApiConfig = resetApiConfig;
window.saveProjectConfig = saveProjectConfig;
window.resetProjectConfig = resetProjectConfig;
window.updatePatternFields = updatePatternFields;
window.toggleApiKeyInputs = toggleApiKeyInputs;
window.switchInputTab = switchInputTab;
window.checkConfiguration = checkConfiguration;

// Compatibility with HistoryPanel
window.addToHistory = (original, improved, originalScore, improvedScore) => {
    if (window.historyPanel) {
        window.historyPanel.addHistoryItem(original, improved, originalScore, improvedScore);
    }
};
