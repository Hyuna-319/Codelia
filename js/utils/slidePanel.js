// Slide Panel Utility
export class SlidePanel {
    constructor() {
        this.panel = null;
        this.init();
    }

    init() {
        // Create slide panel element
        this.panel = document.createElement('div');
        this.panel.className = 'slide-panel';
        this.panel.innerHTML = `
      <div class="slide-panel-header">
        <h3 id="slidePanelTitle"></h3>
        <button class="slide-panel-close" aria-label="Close">✕</button>
      </div>
      <div class="slide-panel-content" id="slidePanelContent"></div>
    `;
        document.body.appendChild(this.panel);

        // Event listeners
        this.panel.querySelector('.slide-panel-close').addEventListener('click', () => this.close());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    open(title, content) {
        document.getElementById('slidePanelTitle').innerHTML = title;
        document.getElementById('slidePanelContent').innerHTML = content;
        this.panel.classList.add('open');
    }

    close() {
        if (this.panel) {
            this.panel.classList.remove('open');
        }
    }

    isOpen() {
        return this.panel && this.panel.classList.contains('open');
    }
}
