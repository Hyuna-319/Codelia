/**
 * Renderer Process for Codelia
 * Handles UI interactions and API communication
 */

const API_URL = 'http://localhost:8000/api';

// DOM Element Getters (type-safe)
const getElement = <T extends HTMLElement>(id: string): T => {
    return document.getElementById(id) as T;
};

// Navigation
function switchView(viewName: string): void {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    getElement(`view-${viewName}`).classList.add('active');

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    if (viewName === 'improvement') navItems[0].classList.add('active');
    if (viewName === 'settings') navItems[1].classList.add('active');
}

// Input Mode Switching
function switchInputMode(mode: string): void {
    getElement('tabDirectInput').classList.toggle('active', mode === 'direct');
    getElement('tabPatternInput').classList.toggle('active', mode === 'pattern');

    getElement('directInputMode').classList.toggle('hidden', mode !== 'direct');
    getElement('patternInputMode').classList.toggle('hidden', mode !== 'pattern');

    if (mode === 'pattern') {
        loadProjectSettingsToPattern();
    }
}

// Load project settings into pattern input fields
async function loadProjectSettingsToPattern(): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/config`);
        const data = await response.json();
        const project = data.project || {};

        (getElement('patternDeveloper') as HTMLInputElement).value = project.developer || '';
        (getElement('patternSystem') as HTMLInputElement).value = project.system || '';
        (getElement('patternClient') as HTMLInputElement).value = project.client || '';
    } catch (error) {
        console.error('Error loading project settings:', error);
    }
}

// Check configuration and update UI state
async function checkConfiguration(redirect: boolean = false): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/config`);
        const data = await response.json();
        const project = data.project || {};

        const provider = data.provider || 'openai';
        let apiKey = '';

        if (provider === 'openai') apiKey = data.openai?.key;
        else if (provider === 'gemini') apiKey = data.gemini?.key;
        else if (provider === 'claude') apiKey = data.claude?.key;
        else if (provider === 'enterprise_gateway') apiKey = data.enterprise_gateway?.key;

        const hasApiKey = !!apiKey;
        const hasProjectContext = !!(project.developer && project.system && project.client);
        const isValid = hasApiKey && hasProjectContext;

        const warningEl = getElement('configWarning');
        const improvementView = getElement('view-improvement');
        const interactiveElements = improvementView.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement>('input, textarea, select, button');
        const warningBtn = warningEl.querySelector('button');

        if (!isValid) {
            warningEl.classList.remove('hidden');
            warningEl.style.display = 'flex';

            interactiveElements.forEach(el => {
                if (el !== warningBtn) {
                    el.disabled = true;
                    el.style.opacity = '0.5';
                    if (el.tagName === 'BUTTON') el.style.cursor = 'not-allowed';
                }
            });

            if (redirect) {
                switchView('settings');
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

        return isValid;
    } catch (error) {
        console.error('Error checking configuration:', error);
        return false;
    }
}

// Update pattern fields visibility
function updatePatternFields(): void {
    const pattern = (getElement('patternSelect') as HTMLSelectElement).value;
    document.querySelectorAll('.pattern-fields').forEach(el => el.classList.add('hidden'));
    const selectedFields = getElement(`fields-${pattern}`);
    if (selectedFields) {
        selectedFields.classList.remove('hidden');
    }
}

// Collect pattern data
function collectPatternData(): any {
    const pattern = (getElement('patternSelect') as HTMLSelectElement).value;
    const data: any = { pattern };

    const getValue = (id: string): string => {
        const el = document.getElementById(id) as HTMLInputElement | null;
        return el?.value.trim() || '';
    };

    switch (pattern) {
        case 'ubiquitous':
            data.system_response = getValue('field-system-response');
            break;
        case 'event-driven':
            data.precondition = getValue('field-precondition');
            data.trigger = getValue('field-trigger');
            data.system_response = getValue('field-system-response-ed');
            break;
        case 'unwanted':
            data.precondition = getValue('field-precondition-uw');
            data.forbidden_action = getValue('field-forbidden');
            break;
        case 'state-driven':
            data.condition = getValue('field-condition');
            data.system_response = getValue('field-system-response-sd');
            break;
        case 'optional':
            data.optional_feature = getValue('field-optional-feature');
            data.system_response = getValue('field-system-response-opt');
            break;
        case 'complex':
            data.precondition = getValue('field-precondition-cx');
            data.trigger = getValue('field-trigger-cx');
            data.system_response = getValue('field-system-response-cx');
            break;
    }

    Object.keys(data).forEach(key => {
        if (data[key] === '') delete data[key];
    });

    return data;
}

// Toggle API key inputs
function toggleApiKeyInputs(): void {
    const provider = (getElement('providerSelect') as HTMLSelectElement).value;
    getElement('openaiInputGroup').classList.toggle('hidden', provider !== 'openai');
    getElement('geminiInputGroup').classList.toggle('hidden', provider !== 'gemini');
    getElement('claudeInputGroup').classList.toggle('hidden', provider !== 'claude');
    getElement('enterpriseInputGroup').classList.toggle('hidden', provider !== 'enterprise_gateway');
    updateApiStatus();
}

// Load configuration
async function loadConfig(): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/config`);
        const data = await response.json();

        (getElement('providerSelect') as HTMLSelectElement).value = data.provider || 'openai';

        (getElement('openaiKeyInput') as HTMLInputElement).value = data.openai?.key || '';
        (getElement('geminiKeyInput') as HTMLInputElement).value = data.gemini?.key || '';
        (getElement('geminiUrlInput') as HTMLInputElement).value = data.gemini?.url || '';
        (getElement('claudeKeyInput') as HTMLInputElement).value = data.claude?.key || '';
        (getElement('enterpriseKeyInput') as HTMLInputElement).value = data.enterprise_gateway?.key || '';
        (getElement('enterpriseUrlInput') as HTMLInputElement).value = data.enterprise_gateway?.url || '';

        const project = data.project || {};
        (getElement('projectDeveloper') as HTMLInputElement).value = project.developer || '';
        (getElement('projectSystem') as HTMLInputElement).value = project.system || '';
        (getElement('projectClient') as HTMLInputElement).value = project.client || '';

        toggleApiKeyInputs();
        updateApiStatus();
    } catch (error) {
        console.error('Error loading config:', error);
        setApiStatus('error', 'Failed to connect to server');
    }
}

// Update API status
function updateApiStatus(): void {
    const provider = (getElement('providerSelect') as HTMLSelectElement).value;
    let hasKey = false;

    if (provider === 'openai') {
        hasKey = !!(getElement('openaiKeyInput') as HTMLInputElement).value;
    } else if (provider === 'gemini') {
        hasKey = !!(getElement('geminiKeyInput') as HTMLInputElement).value && !!(getElement('geminiUrlInput') as HTMLInputElement).value;
    } else if (provider === 'claude') {
        hasKey = !!(getElement('claudeKeyInput') as HTMLInputElement).value;
    } else if (provider === 'enterprise_gateway') {
        hasKey = !!(getElement('enterpriseKeyInput') as HTMLInputElement).value && !!(getElement('enterpriseUrlInput') as HTMLInputElement).value;
    }

    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    if (hasKey) {
        setApiStatus('success', `${providerName} 사용 준비 완료`);
        const btnImprove = getElement('btnImprove') as HTMLButtonElement;
        if (btnImprove) btnImprove.disabled = false;
    } else {
        setApiStatus('warning', `${providerName} API 키를 입력해주세요`);
        const btnImprove = getElement('btnImprove') as HTMLButtonElement;
        if (btnImprove) btnImprove.disabled = true;
    }
}

// Set API status
function setApiStatus(type: string, message: string): void {
    const apiStatus = getElement('apiStatus');
    apiStatus.className = `panel panel-${type === 'error' ? 'warning' : type}`;
    apiStatus.innerHTML = `
    <span class="panel-icon">${type === 'success' ? '✅' : '⚠️'}</span>
    <div>${message}</div>
  `;
}

// Save API configuration
async function saveApiConfig(): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/config`);
        const currentConfig = await response.json();

        const config = {
            ...currentConfig,
            provider: (getElement('providerSelect') as HTMLSelectElement).value,
            openai: { key: (getElement('openaiKeyInput') as HTMLInputElement).value },
            gemini: {
                key: (getElement('geminiKeyInput') as HTMLInputElement).value,
                url: (getElement('geminiUrlInput') as HTMLInputElement).value
            },
            claude: { key: (getElement('claudeKeyInput') as HTMLInputElement).value },
            enterprise_gateway: {
                key: (getElement('enterpriseKeyInput') as HTMLInputElement).value,
                url: (getElement('enterpriseUrlInput') as HTMLInputElement).value
            }
        };

        const saveResponse = await fetch(`${API_URL}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (saveResponse.ok) {
            setApiStatus('success', 'API 설정이 저장되었습니다.');
            await checkConfiguration();
            switchView('improvement');
        } else {
            setApiStatus('error', 'API 설정 저장 실패');
            alert('API 설정 저장에 실패했습니다.');
        }
    } catch (error: any) {
        console.error('Error saving API config:', error);
        setApiStatus('error', 'API 설정 저장 중 오류 발생');
        alert('API 설정 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// Reset API configuration
async function resetApiConfig(): Promise<void> {
    if (!confirm('선택한 AI 제공자의 API 키를 초기화하시겠습니까?')) return;

    const provider = (getElement('providerSelect') as HTMLSelectElement).value;

    if (provider === 'openai') {
        (getElement('openaiKeyInput') as HTMLInputElement).value = '';
    } else if (provider === 'gemini') {
        (getElement('geminiKeyInput') as HTMLInputElement).value = '';
        (getElement('geminiUrlInput') as HTMLInputElement).value = '';
    } else if (provider === 'claude') {
        (getElement('claudeKeyInput') as HTMLInputElement).value = '';
    } else if (provider === 'enterprise_gateway') {
        (getElement('enterpriseKeyInput') as HTMLInputElement).value = '';
        (getElement('enterpriseUrlInput') as HTMLInputElement).value = '';
    }

    await saveApiConfig();
    setApiStatus('warning', `${provider.charAt(0).toUpperCase() + provider.slice(1)} API 키가 초기화되었습니다.`);
}

// Save project configuration
async function saveProjectConfig(): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/config`);
        const currentConfig = await response.json();

        const config = {
            ...currentConfig,
            project: {
                developer: (getElement('projectDeveloper') as HTMLInputElement).value.trim(),
                system: (getElement('projectSystem') as HTMLInputElement).value.trim(),
                client: (getElement('projectClient') as HTMLInputElement).value.trim()
            }
        };

        const saveResponse = await fetch(`${API_URL}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (saveResponse.ok) {
            setApiStatus('success', '프로젝트 설정이 저장되었습니다.');
            alert('프로젝트 설정이 성공적으로 저장되었습니다!');
            await checkConfiguration();
        } else {
            setApiStatus('error', '프로젝트 설정 저장 실패');
            alert('프로젝트 설정 저장에 실패했습니다.');
        }
    } catch (error: any) {
        console.error('Error saving project config:', error);
        setApiStatus('error', '프로젝트 설정 저장 중 오류 발생');
        alert('프로젝트 설정 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// Reset project configuration
async function resetProjectConfig(): Promise<void> {
    if (!confirm('모든 프로젝트 설정을 초기화하시겠습니까?')) return;

    (getElement('projectDeveloper') as HTMLInputElement).value = '';
    (getElement('projectSystem') as HTMLInputElement).value = '';
    (getElement('projectClient') as HTMLInputElement).value = '';

    await saveProjectConfig();
    setApiStatus('warning', '프로젝트 설정이 초기화되었습니다.');
}

// Improve requirement (main function)
async function improveRequirement(): Promise<void> {
    const isConfigValid = await checkConfiguration(true);
    if (!isConfigValid) return;

    const isDirectMode = !getElement('directInputMode').classList.contains('hidden');
    const text = isDirectMode
        ? (getElement('inputRequirementDirect') as HTMLTextAreaElement).value
        : (getElement('inputRequirementPattern') as HTMLTextAreaElement).value;

    if (!text) {
        alert('Please enter a requirement.');
        return;
    }

    const patternData = isDirectMode ? {} : collectPatternData();

    const loadingSection = getElement('loadingSection');
    const resultSection = getElement('resultSection');
    const btnImprove = getElement('btnImprove') as HTMLButtonElement;

    loadingSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    btnImprove.disabled = true;

    try {
        const response = await fetch(`${API_URL}/improve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, pattern_data: patternData })
        });

        const data = await response.json();

        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            displayResult(data);
        }
    } catch (error: any) {
        alert('Error connecting to server: ' + error.message);
    } finally {
        loadingSection.classList.add('hidden');
        btnImprove.disabled = false;
    }
}

// Display result
function displayResult(data: any): void {
    getElement('resultSection').classList.remove('hidden');

    displayScoreComparison(data.original_scores, data.improved_scores, data.comparison);
    displayDetailedScoreTable(data.original_scores, data.improved_scores);
    displayRequirementCards(data.improved_result.improved);
    displayTopImprovements(data.original_scores, data.improved_scores, data.explanations || [], data.improved_result.improved);
    displayRecommendations(data.improved_result.improved);
}

// Display score comparison
function displayScoreComparison(original: any, improved: any, comparison: any): void {
    getElement('scoreOriginalTotal').textContent = `${original.total} / 320`;
    getElement('scoreOriginalPercent').textContent = `${Math.round((original.total / 320) * 100)}%`;

    getElement('scoreImprovedTotal').textContent = `${improved.total} / 320`;
    getElement('scoreImprovedPercent').textContent = `${Math.round((improved.total / 320) * 100)}%`;

    const delta = improved.total - original.total;
    const deltaPercent = Math.round((delta / 320) * 100);
    const deltaText = getElement('scoreDeltaText');
    deltaText.textContent = `${delta >= 0 ? '+' : ''}${delta}점 (${delta >= 0 ? '+' : ''}${deltaPercent}%)`;
    deltaText.style.color = delta >= 0 ? '#006644' : '#BF2600';

    renderCategoryBars('categoryScoresOriginal', original.scores);
    renderCategoryBars('categoryScoresImproved', improved.scores);
}

// Render category bars
function renderCategoryBars(containerId: string, scores: any): void {
    const container = getElement(containerId);
    container.innerHTML = '';

    const categories = [
        { key: 'P', label: '패턴 규칙 (Patterns) P1-P5', rules: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'] },
        { key: 'C_IND', label: '개별 특성 (Individual) C1-C9', rules: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'] },
        { key: 'C_SET', label: '집합 특성 (Set) C10-C15', rules: ['C10', 'C11', 'C12', 'C13', 'C14', 'C15'] },
        { key: 'Accuracy', label: '정확성 (Accuracy) R1-R9', rules: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9'] },
        { key: 'Concision', label: '간결성 (Concision) R10-R11', rules: ['R10', 'R11'] },
        { key: 'NonAmbiguity', label: '비모호성 (Non-Ambiguity) R12-R17', rules: ['R12', 'R13', 'R14', 'R15', 'R16', 'R17'] },
        { key: 'Singularity', label: '단일성 (Singularity) R18-R23', rules: ['R18', 'R19', 'R20', 'R21', 'R22', 'R23'] },
        { key: 'Completeness', label: '완전성 (Completeness) R24-R25', rules: ['R24', 'R25'] },
        { key: 'Realism', label: '현실성 (Realism) R26', rules: ['R26'] },
        { key: 'Conditions', label: '조건 표현 (Conditions) R27-R28', rules: ['R27', 'R28'] },
        { key: 'Uniqueness', label: '고유성 (Uniqueness) R29-R30', rules: ['R29', 'R30'] },
        { key: 'Abstraction', label: '추상화 수준 (Abstraction) R31', rules: ['R31'] },
        { key: 'Quantification1', label: '정량화 (Quantification) R32', rules: ['R32'] },
        { key: 'Tolerance', label: '허용오차 (Tolerance) R33', rules: ['R33'] },
        { key: 'Quantification2', label: '정량화 (Quantification) R34-R35', rules: ['R34', 'R35'] },
        { key: 'Uniformity', label: '언어 일관성 (Uniformity) R36-R40', rules: ['R36', 'R37', 'R38', 'R39', 'R40'] },
        { key: 'Modularity', label: '모듈성 (Modularity) R41-R42', rules: ['R41', 'R42'] }
    ];

    categories.forEach(cat => {
        const maxScore = cat.rules.length * 5;
        const score = calculateCategoryScoreByRules(scores, cat.rules);
        const percent = Math.round((score / maxScore) * 100);

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

// Calculate category score by rules
function calculateCategoryScoreByRules(scores: any, rules: string[]): number {
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

// Rule definitions (truncated for brevity - include all from original)
const RULE_DEFINITIONS: Record<string, { ko: string; en: string }> = {
    'P1': { ko: '주어', en: 'Subject' },
    'P2': { ko: '조동사', en: 'Modal Verb' },
    'P3': { ko: '행위', en: 'Action' },
    'P4': { ko: '목적어', en: 'Object' },
    'P5': { ko: '성능 기준', en: 'Performance Measure' },
    'P6': { ko: '조건절', en: 'Condition Clause' },
    'P7': { ko: '제약 조건', en: 'Qualification Clause' },
    'C1': { ko: '필수성', en: 'Necessary' },
    'C2': { ko: '적절성', en: 'Appropriate' },
    'C3': { ko: '명확성', en: 'Unambiguous' },
    'C4': { ko: '완전성', en: 'Complete' },
    'C5': { ko: '단일성', en: 'Singular' },
    'C6': { ko: '실현 가능성', en: 'Feasible' },
    'C7': { ko: '검증 가능성', en: 'Verifiable' },
    'C8': { ko: '정확성', en: 'Correct' },
    'C9': { ko: '준수성', en: 'Conforming' },
    'C10': { ko: '완전성(집합)', en: 'Complete (Set)' },
    'C11': { ko: '일관성', en: 'Consistent' },
    'C12': { ko: '실현 가능성(집합)', en: 'Feasible (Set)' },
    'C13': { ko: '이해 용이성', en: 'Comprehensible' },
    'C14': { ko: '타당성 확인 가능성', en: 'Validatable' },
    'C15': { ko: '정확성(집합)', en: 'Correct (Set)' },
    'R1': { ko: '구조화', en: 'Structured Statements' },
    'R2': { ko: '능동태', en: 'Active Voice' },
    'R3': { ko: '적절한 주어-동사', en: 'Appropriate Subject-Verb' },
    'R4': { ko: '정의된 용어', en: 'Defined Terms' },
    'R5': { ko: '명확한 지칭', en: 'Definite Articles' },
    'R6': { ko: '단위 사용', en: 'Common Units of Measure' },
    'R7': { ko: '모호한 용어 금지', en: 'Vague Terms' },
    'R8': { ko: '면책 조항 금지', en: 'Escape Clauses' },
    'R9': { ko: '포괄적 용어 금지', en: 'Open-Ended Clauses' },
    'R10': { ko: '간결한 표현', en: 'Superfluous Infinitives' },
    'R11': { ko: '절 분리', en: 'Separate Clauses' },
    'R12': { ko: '문법', en: 'Correct Grammar' },
    'R13': { ko: '철자', en: 'Correct Spelling' },
    'R14': { ko: '구두점', en: 'Correct Punctuation' },
    'R15': { ko: '논리 표현', en: 'Logical Expressions' },
    'R16': { ko: '부정문 사용', en: 'Use of "Not"' },
    'R17': { ko: '빗금 사용 금지', en: 'Use of Oblique Symbol' },
    'R18': { ko: '단일 개념', en: 'Single Thought Sentence' },
    'R19': { ko: '결합어 금지', en: 'Combinators' },
    'R20': { ko: '목적 구문 금지', en: 'Purpose Phrases' },
    'R21': { ko: '괄호 사용 최소화', en: 'Parentheses' },
    'R22': { ko: '나열 금지', en: 'Enumeration' },
    'R23': { ko: '도표 참조', en: 'Supporting Diagrams' },
    'R24': { ko: '대명사 금지', en: 'Pronouns' },
    'R25': { ko: '제목 독립성', en: 'Headings' },
    'R26': { ko: '비현실적 절대어 금지', en: 'Absolutes' },
    'R27': { ko: '명확한 조건', en: 'Explicit Conditions' },
    'R28': { ko: '명확한 AND/OR', en: 'Multiple Conditions' },
    'R29': { ko: '적절한 분류', en: 'Classification' },
    'R30': { ko: '고유한 표현', en: 'Unique Expression' },
    'R31': { ko: '솔루션 미포함', en: 'Solution Free' },
    'R32': { ko: '개별 지칭', en: 'Universal Qualification' },
    'R33': { ko: '값 범위 정의', en: 'Range of Values' },
    'R34': { ko: '측정 가능한 성능', en: 'Measurable Performance' },
    'R35': { ko: '구체적 시간 의존성', en: 'Temporal Dependencies' },
    'R36': { ko: '일관된 용어/단위', en: 'Consistent Terms and Units' },
    'R37': { ko: '약어 정의', en: 'Acronyms' },
    'R38': { ko: '모호한 약어 금지', en: 'Abbreviations' },
    'R39': { ko: '스타일 가이드 준수', en: 'Style Guide' },
    'R40': { ko: '일관된 소수점 형식', en: 'Decimal Format' },
    'R41': { ko: '논리적 그룹화', en: 'Related Requirements' },
    'R42': { ko: '구조화된 템플릿', en: 'Structured Sets' }
};

// Display detailed score table
function displayDetailedScoreTable(original: any, improved: any): void {
    const tbody = getElement('detailedScoreTableBody');
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

// Display requirement cards
function displayRequirementCards(fullText: string): void {
    const container = getElement('requirementCardsContainer');
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
        const fallbackRegex = /(?:^|\n)(?:\d+\.|-)\s+(.+?)(?=(?:\n(?:\d+\.|-)|\ n\n|$))/gs;
        let fallbackMatches = [...improvedSection.matchAll(fallbackRegex)];

        if (fallbackMatches.length > 0) {
            fallbackMatches.forEach((m, i) => {
                createReqCard(container, i + 1, m[1].trim(), null);
            });
        } else {
            createReqCard(container, 1, improvedSection, null);
        }
    } else {
        reqMatches.forEach((m) => {
            const number = parseInt(m[1]);
            const pattern = m[2].trim();
            const text = m[3].trim();
            createReqCard(container, number, text, pattern);
        });
    }
}

// Create requirement card
function createReqCard(container: HTMLElement, number: number, text: string, pattern: string | null): void {
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

// Display top improvements
function displayTopImprovements(originalEval: any, improvedEval: any, explanations: any[], fullText: string): void {
    const container = getElement('keyImprovementsList');
    container.innerHTML = '';

    if (!explanations || explanations.length === 0) {
        container.innerHTML = '<div style="padding: 10px; color: #6B778C;">No improvement explanations available.</div>';
        return;
    }

    const scoreChanges: any[] = [];
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

        if (scoreChange) {
            // Clean content
            const cleanContent = explanation.content.replace(/\*\*/g, '').trim();

            // Clean title - remove rule ID if it's at the start
            let displayTitle = explanation.title;
            if (displayTitle.startsWith(explanation.ruleId)) {
                displayTitle = displayTitle.substring(explanation.ruleId.length).trim();
                displayTitle = displayTitle.replace(/^[-:]\s*/, '');
            }

            // Create header with original format: [P2] (2점→5점, +3점)
            const header = `<span style="font-weight:600; color:#172B4D;">[${explanation.ruleId}] ${displayTitle}</span> <span style="color:#0052CC; font-weight:600; margin-left:8px;">(${scoreChange.original}점→${scoreChange.improved}점, +${scoreChange.change}점)</span>`;

            const div = document.createElement('div');
            div.className = 'improvement-item';
            div.style.backgroundColor = '#F4F5F7';
            div.style.padding = '12px';
            div.style.borderRadius = '3px';
            div.style.marginBottom = '8px';
            div.innerHTML = `
                <div style="margin-bottom: 8px;">${header}</div>
                <div style="color: #42526E; font-size: 14px; line-height: 1.6;">${cleanContent}</div>
            `;
            container.appendChild(div);
        }
    });
}

// Display recommendations (Section 5 from AI response)
function displayRecommendations(fullText: string): void {
    const container = getElement('recommendationsList');
    if (!container || !fullText) return;

    container.innerHTML = '';

    // Parse section 5: 추가 개선 권장사항
    const recRegex = /###\s*5\..+?추가 개선 권장사항[\s\S]*?(\n|$)([\s\S]*)/;
    const recMatch = fullText.match(recRegex);

    if (recMatch) {
        let recText = recMatch[2].trim();

        // Remove trailing code blocks
        recText = recText.replace(/```$/, '').trim();

        if (recText && recText.toLowerCase() !== 'none' && recText !== '없음') {
            // Split by newlines or bullet points
            const items = recText.split(/(?:\r?\n|\s+-\s+)/).filter(r => r.trim().length > 0);

            items.forEach(itemText => {
                // Clean up bullet points
                let cleanItem = itemText.replace(/^[-*•✔️✅☑️]\s*/, '').trim();
                if (!cleanItem) return;

                const div = document.createElement('div');
                div.className = 'improvement-item';
                div.innerHTML = `<div class="improvement-desc">${cleanItem}</div>`;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<div style="padding: 10px; color: #6B778C;">추가적인 개선 권장사항이 없습니다.</div>';
        }
    } else {
        container.innerHTML = '<div style="padding: 10px; color: #6B778C;">추가적인 개선 권장사항이 없습니다.</div>';
    }
}

// Initialize on load
window.onload = async function () {
    await loadConfig();
    updatePatternFields();
    checkConfiguration(true);
};

// Export functions to window for HTML onclick handlers
(window as any).improveRequirement = improveRequirement;
(window as any).saveApiConfig = saveApiConfig;
(window as any).resetApiConfig = resetApiConfig;
(window as any).saveProjectConfig = saveProjectConfig;
(window as any).resetProjectConfig = resetProjectConfig;
(window as any).switchView = switchView;
(window as any).switchInputMode = switchInputMode;
(window as any).toggleApiKeyInputs = toggleApiKeyInputs;
(window as any).updatePatternFields = updatePatternFields;
