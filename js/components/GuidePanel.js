// Guide Panel Component
import { functionalData } from '../data/classification/functional.js';
import { qualityData } from '../data/classification/quality.js';
import { constraintsData } from '../data/classification/constraints.js';
import { earsData } from '../data/rules/ears.js';
import { principlesData } from '../data/rules/principles.js';
import { characteristicsData } from '../data/qualityCheck/characteristics.js';
import { writingRulesData } from '../data/qualityCheck/writingRules.js';
import { patternElementsData } from '../data/qualityCheck/patternElements.js';
import { SlidePanel } from '../utils/slidePanel.js';

export class GuidePanel {
  constructor(container) {
    this.container = container;
    this.slidePanel = new SlidePanel();
    this.guideData = {};
    this.searchTerm = '';
    this.currentOpenItem = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="guide-header">
        <h2>📚 작성 가이드</h2>
      </div>
      <div class="guide-tree">
        ${this.renderTreeSection('요구사항 분류', [
      { icon: '📋', label: '기능 요구사항', data: functionalData },
      { icon: '⚡', label: '품질 요구사항', data: qualityData },
      { icon: '🔒', label: '제약 조건', data: constraintsData }
    ])}
        ${this.renderTreeSection('작성 규칙', [
      { icon: '📝', label: 'EARS 패턴', data: earsData },
      { icon: '📐', label: '작성 원칙', data: principlesData }
    ])}
        ${this.renderTreeSection('품질 체크', [
      { icon: '🎯', label: '특성 C1-C15', data: characteristicsData },
      { icon: '📋', label: '규칙 R1-R42', data: writingRulesData },
      { icon: '🔧', label: '요소 P1-P7', data: patternElementsData }
    ])}
      </div>
      <div class="guide-footer">
        <button class="settings-btn" id="settingsBtn">
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    `;
  }

  renderTreeSection(title, items) {
    const itemsHtml = items.map((item, index) => {
      const dataId = `${title}-${index}`;
      this.guideData[dataId] = item.data; // Store data for later access

      return `
        <div class="tree-item" data-id="${dataId}">
          <span class="icon">${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="tree-section">
        <div class="tree-section-header">
          <span class="icon">▼</span>
          <span>${title}</span>
        </div>
        <div class="tree-section-content">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Tree section toggle
    this.container.querySelectorAll('.tree-section-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const section = e.currentTarget.closest('.tree-section');
        section.classList.toggle('collapsed');
      });
    });

    // Tree item click - open slide panel
    this.container.querySelectorAll('.tree-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const dataId = e.currentTarget.getAttribute('data-id');
        const data = this.guideData[dataId];

        if (data) {
          // Check if clicking the same item that's currently open
          if (this.currentOpenItem === dataId && this.slidePanel.isOpen()) {
            // Close the panel if same item clicked again
            this.slidePanel.close();
            this.currentOpenItem = null;
            e.currentTarget.classList.remove('active'); // Deactivate the item
          } else {
            // Open the panel with new content
            this.openSlidePanel(data);
            this.currentOpenItem = dataId;

            // Update active state
            this.container.querySelectorAll('.tree-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
          }
        }
      });
    });

    // Settings button
    const settingsBtn = this.container.querySelector('#settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        window.switchInputTab('settings');
      });
    }
  }

  openSlidePanel(guideData) {
    const contentHtml = guideData.sections.map(section => `
      <div class="slide-section">
        <div class="slide-section-title ${section.color}">
          ${section.title}
        </div>
        <div class="slide-section-content">
          ${section.content}
        </div>
      </div>
    `).join('');

    this.slidePanel.open(guideData.title, contentHtml);
  }

  filterTree() {
    const items = this.container.querySelectorAll('.tree-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(this.searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }
}
