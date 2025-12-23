import { historyApi } from '../api/history.api.js';

/**
 * History Panel Component
 * - SQLite 백엔드 연동
 * - localStorage 데이터 자동 마이그레이션
 * - 개별 요구사항 번호 유지 및 정렬
 */
export class HistoryPanel {
    constructor(container) {
        this.container = container;
        this.history = [];
        this.isCollapsed = false;
        this.init();
    }

    async init() {
        try {
            this.render();
            this.attachEventListeners();

            this.updateList();
            await this.loadHistory();
        } catch (err) {
            console.error('HistoryPanel init error:', err);
        }
    }

    render() {
        this.container.innerHTML = `
      <div class="history-header">
        <h2>🕒 History</h2>
        <button class="history-collapse-btn" aria-label="Collapse">−</button>
      </div>
      <div class="history-search">
        <input type="text" placeholder="요구사항 검색..." id="historySearch">
      </div>
      <div class="history-list" id="historyList">
        <!-- updateList()에 의해 채워짐 -->
      </div>
    `;
    }

    renderHistoryList() {
        if (!this.history || this.history.length === 0) {
            return `
        <div class="history-empty">
          <div class="history-empty-icon">📝</div>
          <p>아직 분석된 요구사항이 없습니다.</p>
          <small style="font-size: 10px; color: var(--text-tertiary); display: block; margin-top: 5px;">
            
          </small>
        </div>
      `;
        }

        return this.history.map((item, index) => {
            try {
                if (!item) return '';

                const displayId = item.req_id || `#REQ-${String(index + 1).padStart(3, '0')}`;

                let dateStr = "";
                if (item.created_at) {
                    const d = new Date(item.created_at);
                    dateStr = `${d.getMonth() + 1}.${d.getDate()}.`;
                }

                const scoreDiff = (item.improved_score || 0) - (item.original_score || 0);
                const scoreDiffText = scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff;

                const improvedDisplay = (item.improved_text || '').split(/\n###|###/)[0].trim();

                return `
          <div class="history-card" data-index="${index}" data-id="${item.id}">
            <div class="history-card-header">
              <span class="history-card-id" title="Session: ${item.session_id || ''}">${displayId}</span>
              <span class="history-card-date">${dateStr}</span>
            </div>
            <div class="history-card-body">
                <div class="history-snippet improved">
                    <span class="snippet-label">개선:</span> ${improvedDisplay}
                </div>
                <div class="history-snippet original" title="클릭하여 전체 보기">
                    <span class="snippet-label">원본:</span> ${item.original_text || ''}
                </div>
            </div>
            <div class="history-card-score">
              <span class="history-score-badge original">${item.original_score || 0}%</span>
              <span class="score-arrow">→</span>
              <span class="history-score-badge improved">${item.improved_score || 0}%</span>
              <span class="history-score-delta">(${scoreDiffText}%)</span>
            </div>
          </div>
        `;
            } catch (err) {
                console.error('Error rendering history item:', index, err);
                return '';
            }
        }).join('');
    }

    attachEventListeners() {
        const collapseBtn = this.container.querySelector('.history-collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                this.isCollapsed = !this.isCollapsed;
                this.container.classList.toggle('collapsed', this.isCollapsed);
                collapseBtn.textContent = this.isCollapsed ? '+' : '−';
            });
        }

        const searchInput = this.container.querySelector('#historySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterHistory(e.target.value);
            });
        }
        this.attachCardListeners();
    }

    attachCardListeners() {
        const listContainer = this.container.querySelector('#historyList');
        if (!listContainer) return;

        listContainer.querySelectorAll('.history-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.original')) return;
                const index = parseInt(card.getAttribute('data-index'));
                this.loadHistoryItem(index);
            });
        });

        listContainer.querySelectorAll('.history-snippet.original').forEach(snippet => {
            snippet.addEventListener('click', (e) => {
                e.stopPropagation();
                snippet.classList.toggle('expanded');
            });
        });
    }

    async addHistoryItem(original, improved, originalScore, improvedScore, parentId = '', fullData = null) {
        try {
            const data = {
                original_text: original,
                improved_text: improved,
                original_score: Math.round((originalScore / 320) * 100),
                improved_score: Math.round((improvedScore / 320) * 100),
                parent_id: parentId,
                full_data: fullData
            };

            await historyApi.save(data);
            await this.loadHistory();
        } catch (error) {
            console.error('Failed to save to SQLite:', error);
            // Fallback: If DB save fails, we don't have a reliable way to show it except in memory
            this.updateList();
        }
    }

    updateList() {
        try {
            const listContainer = this.container.querySelector('#historyList');
            if (listContainer) {
                listContainer.innerHTML = this.renderHistoryList();
                this.attachCardListeners();
            }
        } catch (error) {
            console.error('Error updating history list:', error);
        }
    }

    loadHistoryItem(index) {
        const item = this.history[index];
        if (item && window.loadHistoryResult) {
            const mappedItem = {
                original: item.original_text,
                improved: item.improved_text,
                parentId: (item.req_id || "").split('-')[0],
                fullData: typeof item.full_data === 'string' ? JSON.parse(item.full_data) : item.full_data
            };
            window.loadHistoryResult(mappedItem);
        }
    }

    filterHistory(searchTerm) {
        const cards = this.container.querySelectorAll('.history-card');
        const term = searchTerm.toLowerCase();
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(term) ? 'block' : 'none';
        });
    }

    async loadHistory() {
        try {

            const dbHistory = await historyApi.getAll();

            if (dbHistory && Array.isArray(dbHistory) && dbHistory.length > 0) {
                this.history = dbHistory;
            } else {

                await this.migrateFromLocalStorage();
            }
        } catch (e) {
            console.error('Failed to load history from DB:', e);

        } finally {
            this.updateList();
        }
    }

    async migrateFromLocalStorage() {
        const saved = localStorage.getItem('requirementHistory');
        if (!saved) return;

        try {
            const rawHistory = JSON.parse(saved);
            if (!Array.isArray(rawHistory) || rawHistory.length === 0) return;

            console.log(`Migrating ${rawHistory.length} legacy items to SQLite...`);

            for (const item of rawHistory) {
                const data = {
                    original_text: item.original || '',
                    improved_text: item.improved || '',
                    original_score: item.originalScore || 0,
                    improved_score: item.improvedScore || 0,
                    parent_id: item.parentId || '',
                    full_data: item.fullData
                };
                try {
                    await historyApi.save(data);
                } catch (err) {
                    console.error('Migration item failed:', err);
                }
            }

            localStorage.removeItem('requirementHistory');
            const dbHistory = await historyApi.getAll();
            if (dbHistory && Array.isArray(dbHistory)) {
                this.history = dbHistory;
            }
        } catch (error) {
            console.error('Migration crashed:', error);
        }
    }
}
