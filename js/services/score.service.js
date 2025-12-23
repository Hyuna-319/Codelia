/**
 * Service layer for score calculation and formatting logic.
 */
export class ScoreService {
    /**
     * Calculates the total score for a specific set of rules.
     * @param {Object} scores - The scores map from the API.
     * @param {string[]} rules - The list of rule IDs to include in the calculation.
     * @returns {number}
     */
    calculateCategoryScoreByRules(scores, rules) {
        let total = 0;
        if (scores) {
            rules.forEach(rule => {
                if (scores[rule]) {
                    total += scores[rule].score || 0;
                }
            });
        }
        return total;
    }

    /**
     * Calculates the total score for rules starting with a specific prefix.
     * @param {Object} scores - The scores map from the API.
     * @param {string} prefix - The rule ID prefix (e.g., 'P', 'C').
     * @returns {number}
     */
    calculateCategoryScore(scores, prefix) {
        let total = 0;
        if (scores) {
            Object.keys(scores).forEach(key => {
                if (key.startsWith(prefix)) {
                    total += scores[key].score || 0;
                }
            });
        }
        return total;
    }

    /**
     * Calculates the score delta between original and improved versions.
     * @param {number} originalTotal - The original total score.
     * @param {number} improvedTotal - The improved total score.
     * @param {number} maxScore - The maximum possible score.
     * @returns {Object} Delta values (points and percentage).
     */
    calculateScoreDelta(originalTotal, improvedTotal, maxScore = 320) {
        const points = improvedTotal - originalTotal;
        const percentage = Math.round((points / maxScore) * 100);
        return { points, percentage };
    }

    /**
     * Formats a score for display (e.g., "75 / 100").
     * @param {number} score - The current score.
     * @param {number} maxScore - The maximum score.
     * @returns {string}
     */
    formatScoreDisplay(score, maxScore) {
        return `${score} / ${maxScore}`;
    }

    /**
     * Calculates the percentage of a score.
     * @param {number} score - The current score.
     * @param {number} maxScore - The maximum score.
     * @returns {number}
     */
    calculatePercent(score, maxScore) {
        return Math.round((score / maxScore) * 100);
    }
}

export const scoreService = new ScoreService();
