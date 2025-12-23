// Main Application Initialization
import { GuidePanel } from './components/GuidePanel.js';
import { HistoryPanel } from './components/HistoryPanel.js';

// Global instances
window.guidePanel = null;
window.historyPanel = null;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Guide Panel
    const guidePanelContainer = document.getElementById('guidePanelContainer');
    if (guidePanelContainer) {
        window.guidePanel = new GuidePanel(guidePanelContainer);
    }

    // Initialize History Panel
    const historyPanelContainer = document.getElementById('historyPanelContainer');
    if (historyPanelContainer) {
        window.historyPanel = new HistoryPanel(historyPanelContainer);
    }

    // Load configuration and check
    if (window.loadConfig) {
        window.loadConfig();
    }
    if (window.checkConfiguration) {
        window.checkConfiguration();
    }
});

// Global tab switching function
window.switchInputTab = function (tabName) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // Deactivate all tabs
    document.querySelectorAll('.input-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab pane
    const selectedPane = document.getElementById(`tab-${tabName}`);
    if (selectedPane) {
        selectedPane.classList.add('active');
    }

    // Activate selected tab
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Load project settings when switching to pattern mode
    if (tabName === 'pattern' && window.loadProjectSettingsToPattern) {
        window.loadProjectSettingsToPattern();
    }
};

// Export history add function for use in renderer.js
window.addToHistory = function (original, improved, originalScore, improvedScore) {
    if (window.historyPanel) {
        window.historyPanel.addHistoryItem(original, improved, originalScore, improvedScore);
    }
};
