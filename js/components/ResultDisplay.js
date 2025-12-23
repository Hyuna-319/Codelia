import { getElementById, toggleClass } from '../utils/dom-helpers.js';
import { RULE_DEFINITIONS, CATEGORY_DEFINITIONS } from '../utils/constants.js';
import { scoreService } from '../services/score.service.js';

/**
 * Component for displaying the analysis results.
 */
export class ResultDisplay {
    /**
     * Main entry point to display results.
     * @param {Object} data - The API response data.
     */
    static displayResult(data) {
        const resultSection = getElementById('resultSection');
        if (resultSection) resultSection.classList.remove('hidden');

        // 1. Score Comparison
        this.displayScoreComparison(data.original_scores, data.improved_scores, data.comparison);

        // 2. Detailed Score Table
        this.displayDetailedScoreTable(data.original_scores, data.improved_scores);

        // 3. Improved Requirements Cards
        this.displayRequirementCards(data.improved_result.improved);

        // 4. Key Improvements 
        this.displayTopImprovements(data.original_scores, data.improved_scores, data.explanations || [], data.improved_result.improved);

        // 5. Add to history
        this.triggerAddToHistory(data);
    }

    /**
     * Displays the score comparison section.
     */
    static displayScoreComparison(original, improved, comparison) {
        getElementById('scoreOriginalTotal').textContent = scoreService.formatScoreDisplay(original.total, 320);
        getElementById('scoreOriginalPercent').textContent = `${scoreService.calculatePercent(original.total, 320)}%`;

        getElementById('scoreImprovedTotal').textContent = scoreService.formatScoreDisplay(improved.total, 320);
        getElementById('scoreImprovedPercent').textContent = `${scoreService.calculatePercent(improved.total, 320)}%`;

        const delta = scoreService.calculateScoreDelta(original.total, improved.total, 320);
        const deltaText = getElementById('scoreDeltaText');
        deltaText.textContent = `${delta.points >= 0 ? '+' : ''}${delta.points}점 (${delta.points >= 0 ? '+' : ''}${delta.percentage}%)`;
        deltaText.style.color = delta.points >= 0 ? '#006644' : '#BF2600';

        this.renderCategoryBars('categoryScoresOriginal', original.scores);
        this.renderCategoryBars('categoryScoresImproved', improved.scores);
    }

    /**
     * Renders progress bars for each category.
     */
    static renderCategoryBars(containerId, scores) {
        const container = getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        CATEGORY_DEFINITIONS.forEach(cat => {
            const maxScore = cat.rules.length * 5;
            const score = scoreService.calculateCategoryScoreByRules(scores, cat.rules);
            const percent = scoreService.calculatePercent(score, maxScore);

            const div = document.createElement('div');
            div.className = 'category-score';
            div.innerHTML = `
                <div class="category-header">
                    <span class="category-name">${cat.label}</span>
                    <span class="category-value">${score}/${maxScore}</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${containerId.includes('Improved') ? 'improved' : ''}" style="width: ${percent}%"></div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    /**
     * Displays the detailed score table.
     */
    static displayDetailedScoreTable(original, improved) {
        const tbody = getElementById('detailedScoreTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const allKeys = new Set([
            ...Object.keys(original.scores || {}),
            ...Object.keys(improved.scores || {})
        ]);

        const sortedKeys = Array.from(allKeys).sort((a, b) => {
            const typeA = a.charAt(0);
            const typeB = b.charAt(0);
            if (typeA !== typeB) return typeA.localeCompare(typeB);
            return parseInt(a.slice(1)) - parseInt(b.slice(1));
        });

        sortedKeys.forEach(key => {
            const origItem = original.scores[key];
            const impItem = improved.scores[key];

            if (!origItem && !impItem) return;

            const origScore = original.scores?.[key]?.score || 0;
            const impScore = improved.scores?.[key]?.score || 0;
            const diff = impScore - origScore;

            let ruleNameDisplay = '';
            if (RULE_DEFINITIONS[key]) {
                ruleNameDisplay = `${RULE_DEFINITIONS[key].ko} (${RULE_DEFINITIONS[key].en})`;
            } else {
                ruleNameDisplay = original.scores?.[key]?.name || improved.scores?.[key]?.name || '';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">
                    <span style="font-weight:700; color:#42526E;">${key}</span> 
                    <span style="color:#6B778C; font-size:12px; margin-left:6px;">${ruleNameDisplay}</span>
                </td>
                <td>${origScore}</td>
                <td>${impScore}</td>
                <td class="score-change ${diff < 0 ? 'negative' : ''}">${diff > 0 ? '+' : ''}${diff}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Displays the improved requirement cards.
     */
    static displayRequirementCards(fullText) {
        const container = getElementById('requirementCardsContainer');
        if (!container) return;
        container.innerHTML = '';

        const sectionRegex = /### 2\..+?\n([\s\S]*?)(?=### 3\.|$)/;
        const match = fullText.match(sectionRegex);

        if (!match) {
            container.innerHTML = '<div style="padding: 10px; color: #BF2600;">개선된 요구사항을 찾을 수 없습니다.</div>';
            return;
        }

        let improvedSection = match[1].trim();

        const reqRegex = /\*\*요구사항\s+(\d+)\s+\(Pattern:\s*(.+?)\):\*\*\s*\n(.+?)(?=\n\*\*요구사항|\n\n\(If single|$)/gs;
        let reqMatches = [...improvedSection.matchAll(reqRegex)];

        if (reqMatches.length === 0) {
            const fallbackRegex = /(?:^|\n)(?:\d+\.|-)\s+(.+?)(?=(?:\n(?:\d+\.|-)|\n\n|$))/gs;
            let fallbackMatches = [...improvedSection.matchAll(fallbackRegex)];

            if (fallbackMatches.length > 0) {
                fallbackMatches.forEach((m, i) => {
                    this.createReqCard(container, i + 1, m[1].trim(), null);
                });
            } else {
                this.createReqCard(container, 1, improvedSection, null);
            }
        } else {
            reqMatches.forEach((m) => {
                const number = parseInt(m[1]);
                const pattern = m[2].trim();
                const text = m[3].trim();
                this.createReqCard(container, number, text, pattern);
            });
        }
    }

    /**
     * Creates and appends a requirement card to the container.
     */
    static createReqCard(container, number, text, pattern) {
        const div = document.createElement('div');
        div.className = 'req-card';

        let patternBadge = '';
        if (pattern) {
            patternBadge = `<span style="background: #E3FCEF; color: #006644; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-left: 8px;">Pattern: ${pattern}</span>`;
        }

        div.innerHTML = `
            <div class="req-card-header">
                <span class="req-number-badge">요구사항 ${number}</span>${patternBadge}
            </div>
            <div class="req-text">${text.replace(/\n/g, '<br>')}</div>
        `;
        container.appendChild(div);
    }

    /**
     * Displays the top improvements and additional recommendations.
     */
    static displayTopImprovements(originalEval, improvedEval, explanations, fullText) {
        const container = getElementById('keyImprovementsList');
        if (!container) return;
        container.innerHTML = '';

        if (!explanations || explanations.length === 0) {
            container.innerHTML = '<div style="padding: 10px; color: #6B778C;">No improvement explanations available.</div>';
        } else {
            const scoreChanges = [];
            if (originalEval.scores && improvedEval.scores) {
                Object.keys(originalEval.scores).forEach(key => {
                    const orig = originalEval.scores[key];
                    const imp = improvedEval.scores[key];

                    if (orig && imp && orig.score < imp.score) {
                        scoreChanges.push({
                            rule: key,
                            name: orig.name || key,
                            original: orig.score,
                            improved: imp.score,
                            change: imp.score - orig.score
                        });
                    }
                });
            }

            explanations.forEach(explanation => {
                const scoreChange = scoreChanges.find(sc => sc.rule === explanation.ruleId);
                const div = document.createElement('div');
                div.className = 'improvement-item';
                div.style.backgroundColor = '#F4F5F7';
                div.style.padding = '12px';
                div.style.lineHeight = '1.5';

                if (scoreChange) {
                    const cleanContent = explanation.content.replace(/\*\*/g, '').trim();
                    let displayTitle = explanation.title;
                    if (displayTitle.startsWith(explanation.ruleId)) {
                        displayTitle = displayTitle.substring(explanation.ruleId.length).trim();
                        displayTitle = displayTitle.replace(/^[-:]\s*/, '');
                    }

                    const header = `<span style="font-weight:600; color:#172B4D;">[${explanation.ruleId}] ${displayTitle}</span> <span style="color:#0052CC; font-weight:600; margin-left:8px;">(${scoreChange.original}점→${scoreChange.improved}점, +${scoreChange.change}점)</span>`;

                    div.innerHTML = `
                        <div style="margin-bottom:4px;">${header}</div>
                        <div style="color:#42526E;">${cleanContent}</div>
                    `;
                } else {
                    const cleanContent = explanation.content.replace(/\*\*/g, '').trim();
                    const combined = `${explanation.ruleId} ${explanation.title} ${cleanContent}`;
                    div.innerHTML = `<div style="color:#172B4D;">${combined}</div>`;
                }
                container.appendChild(div);
            });
        }

        this.displayAdditionalRecommendations(fullText);
    }

    /**
     * Displays additional recommendations extracted from the markdown.
     */
    static displayAdditionalRecommendations(fullText) {
        const recContainer = getElementById('recommendationsList');
        if (!recContainer || !fullText) return;
        recContainer.innerHTML = '';

        const recRegex = /###\s*5\..+?추가 개선 권장사항[\s\S]*?(\n|$)([\s\S]*)/;
        const recMatch = fullText.match(recRegex);

        if (recMatch) {
            let recText = recMatch[2].trim().replace(/```$/, '').trim();

            if (recText && recText.toLowerCase() !== 'none' && recText !== '없음') {
                const items = recText.split(/(?:\r?\n|\s+-\s+)/).filter(r => r.trim().length > 0);
                items.forEach(itemText => {
                    let cleanItem = itemText.replace(/^[-*•✔️✅☑️]\s*/, '').trim();
                    if (!cleanItem) return;

                    const div = document.createElement('div');
                    div.className = 'improvement-item';
                    div.innerHTML = `<div class="improvement-desc">${cleanItem}</div>`;
                    recContainer.appendChild(div);
                });
            } else {
                recContainer.innerHTML = '<div style="padding: 10px; color: #6B778C;">추가적인 개선 권장사항이 없습니다.</div>';
            }
        } else {
            recContainer.innerHTML = '<div style="padding: 10px; color: #6B778C;">추가적인 개선 권장사항이 없습니다.</div>';
        }
    }

    /**
     * Triggers the history update in the main window.
     */
    static triggerAddToHistory(data) {
        const directTab = getElementById('tab-direct');
        const isDirectMode = directTab && !directTab.classList.contains('hidden');
        const originalText = isDirectMode
            ? getElementById('inputRequirementDirect').value
            : getElementById('inputRequirementPattern').value;

        if (window.addToHistory) {
            window.addToHistory(
                originalText,
                data.improved_result.improved,
                data.original_scores.total,
                data.improved_scores.total
            );
        }
    }
}
