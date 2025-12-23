// History Panel Component
export class HistoryPanel {
    constructor(container) {
        this.container = container;
        this.history = [];
        this.isCollapsed = false;
        this.init();
        this.loadHistory();
    }

    init() {
        this.render();
        this.attachEventListeners();
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
        ${this.renderHistoryList()}
      </div>
    `;
    }

    renderHistoryList() {
        if (this.history.length === 0) {
            return `
        <div class="history-empty">
          <div class="history-empty-icon">📝</div>
          <p>아직 분석된 요구사항이 없습니다.</p>
        </div>
      `;
        }

        return this.history.map((item, index) => `
      <div class="history-card" data-index="${index}">
        <div class="history-card-header">
          <span class="history-card-id">#REQ-${String(index + 1).padStart(3, '0')}</span>
          <span class="history-card-date">${item.date}</span>
        </div>
        <div class="history-card-text">
          <strong>원본:</strong> ${this.truncate(item.original, 50)}
        </div>
        <div class="history-card-score">
          <span class="history-score-badge original">${item.originalScore}%</span>
          <span>→</span>
          <span class="history-score-badge improved">${item.improvedScore}%</span>
          <span class="history-score-delta">(+${item.improvedScore - item.originalScore}%)</span>
        </div>
      </div>
    `).join('');
    }

    attachEventListeners() {
        // Collapse button
        const collapseBtn = this.container.querySelector('.history-collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                this.isCollapsed = !this.isCollapsed;
                this.container.classList.toggle('collapsed', this.isCollapsed);
                collapseBtn.textContent = this.isCollapsed ? '+' : '−';
            });
        }

        // Search
        const searchInput = this.container.querySelector('#historySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterHistory(e.target.value);
            });
        }

        // Card clicks
        this.attachCardListeners();
    }

    attachCardListeners() {
        this.container.querySelectorAll('.history-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.loadHistoryItem(index);
            });
        });
    }

    addHistoryItem(original, improved, originalScore, improvedScore) {
        const item = {
            original,
            improved,
            originalScore: Math.round((originalScore / 320) * 100),
            improvedScore: Math.round((improvedScore / 320) * 100),
            date: new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
        };

        this.history.unshift(item);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        this.updateList();
    }

    updateList() {
        const listContainer = this.container.querySelector('#historyList');
        if (listContainer) {
            listContainer.innerHTML = this.renderHistoryList();
            this.attachCardListeners();
        }
    }

    loadHistoryItem(index) {
        const item = this.history[index];
        if (item && window.loadHistoryResult) {
            window.loadHistoryResult(item);
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

    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    saveHistory() {
        try {
            localStorage.setItem('requirementHistory', JSON.stringify(this.history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('requirementHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                this.updateList();
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }
}
