const API_URL = 'http://localhost:8000/api';

// DOM Elements
const providerSelect = document.getElementById('providerSelect');
const openaiKeyInput = document.getElementById('openaiKeyInput');
const openaiUrlInput = document.getElementById('openaiUrlInput');

const geminiKeyInput = document.getElementById('geminiKeyInput');
const geminiUrlInput = document.getElementById('geminiUrlInput');

const claudeKeyInput = document.getElementById('claudeKeyInput');
const claudeUrlInput = document.getElementById('claudeUrlInput');

const openaiInputGroup = document.getElementById('openaiInputGroup');
const geminiInputGroup = document.getElementById('geminiInputGroup');
const claudeInputGroup = document.getElementById('claudeInputGroup');

const apiStatus = document.getElementById('apiStatus');
const btnImprove = document.getElementById('btnImprove');

const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');

// Note: Tab switching is now handled by switchInputTab() in main.js
// This function is kept for backward compatibility but not used
function switchInputMode(mode) {
    // Deprecated - use switchInputTab() instead
    if (window.switchInputTab) {
        window.switchInputTab(mode);
    }
}

// Load project settings into pattern input fields
async function loadProjectSettingsToPattern() {
    try {
        const response = await fetch(`${API_URL}/config`);
        const data = await response.json();
        const project = data.project || {};

        document.getElementById('patternDeveloper').value = project.developer || '';
        document.getElementById('patternSystem').value = project.system || '';
        document.getElementById('patternClient').value = project.client || '';
    } catch (error) {
        console.error('Error loading project settings:', error);
    }
}

// Check configuration and update UI state
window.checkConfiguration = async function checkConfiguration(redirect = false) {
    try {
        const response = await fetch(`${API_URL}/config`);
        const data = await response.json();
        const project = data.project || {};

        const provider = data.provider || 'openai';
        let apiKey = '';

        if (provider === 'openai') apiKey = data.openai?.key;
        else if (provider === 'gemini') apiKey = data.gemini?.key;
        else if (provider === 'claude') apiKey = data.claude?.key;

        const hasApiKey = !!apiKey;
        const hasProjectContext = !!(project.developer && project.system && project.client);
        const isValid = hasApiKey && hasProjectContext;

        console.log('Config Check:', { isValid, hasApiKey, hasProjectContext, project });

        const warningEl = document.getElementById('configWarning');
        if (!warningEl) return isValid;

        // Get all interactive elements in Direct Input tab
        const directTab = document.getElementById('tab-direct');
        const interactiveElements = directTab ? directTab.querySelectorAll('input, textarea, select, button') : [];

        if (!isValid) {
            // Show warning
            warningEl.classList.remove('hidden');
            warningEl.style.display = 'flex';

            // Disable inputs
            interactiveElements.forEach(el => {
                if (!el.closest('#configWarning')) {
                    el.disabled = true;
                    el.style.opacity = '0.5';
                    if (el.tagName === 'BUTTON') el.style.cursor = 'not-allowed';
                }
            });

            if (redirect && window.switchInputTab) {
                window.switchInputTab('settings');
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


// Make updatePatternFields global for onclick handler
window.updatePatternFields = function updatePatternFields() {
    const pattern = document.getElementById('patternSelect').value;
    document.querySelectorAll('.pattern-fields').forEach(el => el.classList.add('hidden'));
    const selectedFields = document.getElementById(`fields-${pattern}`);
    if (selectedFields) {
        selectedFields.classList.remove('hidden');
    }
}

// Make collectPatternData global
window.collectPatternData = function collectPatternData() {
    const pattern = document.getElementById('patternSelect').value;
    const data = { pattern };

    switch (pattern) {
        case 'ubiquitous':
            data.system_response = document.getElementById('field-system-response')?.value.trim();
            break;
        case 'event-driven':
            data.precondition = document.getElementById('field-precondition')?.value.trim();
            data.trigger = document.getElementById('field-trigger')?.value.trim();
            data.system_response = document.getElementById('field-system-response-ed')?.value.trim();
            break;
        case 'unwanted':
            data.precondition = document.getElementById('field-precondition-uw')?.value.trim();
            data.forbidden_action = document.getElementById('field-forbidden')?.value.trim();
            break;
        case 'state-driven':
            data.condition = document.getElementById('field-condition')?.value.trim();
            data.system_response = document.getElementById('field-system-response-sd')?.value.trim();
            break;
        case 'optional':
            data.optional_feature = document.getElementById('field-optional-feature')?.value.trim();
            data.system_response = document.getElementById('field-system-response-opt')?.value.trim();
            break;
        case 'complex':
            data.precondition = document.getElementById('field-precondition-cx')?.value.trim();
            data.trigger = document.getElementById('field-trigger-cx')?.value.trim();
            data.system_response = document.getElementById('field-system-response-cx')?.value.trim();
            break;
    }

    Object.keys(data).forEach(key => {
        if (data[key] === '') delete data[key];
    });

    return data;
}


window.onload = async function () {
    await loadConfig();
    updatePatternFields();
};

window.toggleApiKeyInputs = function toggleApiKeyInputs() {
    const provider = providerSelect.value;
    openaiInputGroup.classList.toggle('hidden', provider !== 'openai');
    geminiInputGroup.classList.toggle('hidden', provider !== 'gemini');
    claudeInputGroup.classList.toggle('hidden', provider !== 'claude');
    // Enterprise gateway removed
    updateApiStatus();
}

window.loadConfig = async function loadConfig() {
    try {
        const response = await fetch(`${API_URL}/config`);
        const data = await response.json();

        providerSelect.value = data.provider || 'openai';


        openaiKeyInput.value = data.openai?.key || '';
        openaiUrlInput.value = data.openai?.url || '';


        geminiKeyInput.value = data.gemini?.key || '';
        geminiUrlInput.value = data.gemini?.url || '';


        claudeKeyInput.value = data.claude?.key || '';
        claudeUrlInput.value = data.claude?.url || '';


        // Enterprise gateway removed


        const project = data.project || {};
        document.getElementById('projectDeveloper').value = project.developer || '';
        document.getElementById('projectSystem').value = project.system || '';
        document.getElementById('projectClient').value = project.client || '';

        toggleApiKeyInputs();
        updateApiStatus();

    } catch (error) {
        console.error('Error checking config:', error);
        setApiStatus('error', 'Failed to connect to server');
    }
}

function updateApiStatus() {
    const provider = providerSelect.value;
    let hasKey = false;

    if (provider === 'openai') {
        hasKey = !!openaiKeyInput.value;
    } else if (provider === 'gemini') {
        hasKey = !!geminiKeyInput.value && !!geminiUrlInput.value; // URL required
    } else if (provider === 'claude') {
        hasKey = !!claudeKeyInput.value;
        // Enterprise gateway removed - validation handled per provider
    }

    if (hasKey) {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        setApiStatus('success', `${providerName} 사용 준비 완료`);
        if (btnImprove) btnImprove.disabled = false;
    } else {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        setApiStatus('warning', `${providerName} API 키를 입력해주세요`);
        if (btnImprove) btnImprove.disabled = true;
    }
}

function setApiStatus(type, message) {
    apiStatus.className = `panel panel-${type === 'error' ? 'warning' : type}`;
    if (type === 'success') apiStatus.className = 'panel panel-success';
    if (type === 'warning') apiStatus.className = 'panel panel-warning';

    apiStatus.innerHTML = `
        <span class="panel-icon">${type === 'success' ? '✅' : '⚠️'}</span>
        <div>${message}</div>
    `;
}


window.saveApiConfig = async function saveApiConfig() {
    try {

        const response = await fetch(`${API_URL}/config`);
        const currentConfig = await response.json();


        const configData = {
            provider: providerSelect.value,
            openai: { key: openaiKeyInput.value, url: openaiUrlInput.value },
            gemini: { key: geminiKeyInput.value, url: geminiUrlInput.value },
            claude: { key: claudeKeyInput.value, url: claudeUrlInput.value }
        };

        const config = {
            ...currentConfig,
            ...configData
        };

        const saveResponse = await fetch(`${API_URL}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (saveResponse.ok) {
            setApiStatus('success', 'API 설정이 저장되었습니다.');

            await checkConfiguration();

            // Switch to direct input tab
            if (window.switchInputTab) {
                window.switchInputTab('direct');
            }
        } else {
            setApiStatus('error', 'API 설정 저장 실패');
            alert('API 설정 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error saving API config:', error);
        setApiStatus('error', 'API 설정 저장 중 오류 발생');
        alert('API 설정 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

window.resetApiConfig = async function resetApiConfig() {
    if (!confirm('선택한 AI 제공자의 API 키를 초기화하시겠습니까?')) return;

    const provider = providerSelect.value;

    if (provider === 'openai') {
        openaiKeyInput.value = '';
        openaiUrlInput.value = '';
    } else if (provider === 'gemini') {
        geminiKeyInput.value = '';
        geminiUrlInput.value = '';
    } else if (provider === 'claude') {
        claudeKeyInput.value = '';
        claudeUrlInput.value = '';
    }

    await saveApiConfig();
    setApiStatus('warning', `${provider.charAt(0).toUpperCase() + provider.slice(1)} API 키가 초기화되었습니다.`);
}


window.saveProjectConfig = async function saveProjectConfig() {
    try {

        const response = await fetch(`${API_URL}/config`);
        const currentConfig = await response.json();


        const config = {
            ...currentConfig,
            project: {
                developer: document.getElementById('projectDeveloper').value.trim(),
                system: document.getElementById('projectSystem').value.trim(),
                client: document.getElementById('projectClient').value.trim()
            }
        };

        const saveResponse = await fetch(`${API_URL}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (saveResponse.ok) {
            setApiStatus('success', '프로젝트 설정이 저장되었습니다.');
            alert('프로젝트 설정이 성공적으로 저장되었습니다!'); // Confirmation alert
            await checkConfiguration();
        } else {
            setApiStatus('error', '프로젝트 설정 저장 실패');
            alert('프로젝트 설정 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error saving project config:', error);
        setApiStatus('error', '프로젝트 설정 저장 중 오류 발생');
        alert('프로젝트 설정 저장 중 오류가 발생했습니다: ' + error.message);
    }
}


window.resetProjectConfig = async function resetProjectConfig() {
    if (!confirm('모든 프로젝트 설정을 초기화하시겠습니까?')) return;

    document.getElementById('projectDeveloper').value = '';
    document.getElementById('projectSystem').value = '';
    document.getElementById('projectClient').value = '';

    await saveProjectConfig();
    setApiStatus('warning', '프로젝트 설정이 초기화되었습니다.');
}


async function saveConfig() {
    const config = {
        provider: providerSelect.value,
        openai_key: openaiKeyInput.value,
        openai_url: openaiUrlInput.value,

        gemini_key: geminiKeyInput.value,
        gemini_url: geminiUrlInput.value,

        project: {
            developer: document.getElementById('projectDeveloper').value.trim(),
            system: document.getElementById('projectSystem').value.trim(),
            client: document.getElementById('projectClient').value.trim()
        }
    };

    try {
        const response = await fetch(`${API_URL}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Configuration saved!');
            updateApiStatus();

            setTimeout(() => checkConfiguration(), 100);
        } else {
            alert('Error saving configuration');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Make improveRequirement global for onclick handler
window.improveRequirement = async function improveRequirement() {

    const isConfigValid = await checkConfiguration(true);
    if (!isConfigValid) {
        return;
    }

    // Check which tab is active
    const directTab = document.getElementById('tab-direct');
    const isDirectMode = directTab && directTab.classList.contains('active');

    const text = isDirectMode
        ? document.getElementById('inputRequirementDirect').value
        : document.getElementById('inputRequirementPattern').value;

    if (!text) {
        alert('Please enter a requirement.');
        return;
    }

    const patternData = isDirectMode ? {} : collectPatternData();

    loadingSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    btnImprove.disabled = true;

    try {
        const response = await fetch(`${API_URL}/improve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                pattern_data: patternData
            })
        });

        const data = await response.json();

        console.log('=== API RESPONSE DATA ===');
        console.log('Full response:', data);
        console.log('Original scores:', data.original_scores);
        console.log('Improved scores:', data.improved_scores);
        console.log('Explanations:', data.explanations);

        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            displayResult(data);
        }
    } catch (error) {
        alert('Error connecting to server: ' + error.message);
    } finally {
        loadingSection.classList.add('hidden');
        btnImprove.disabled = false;
    }
}

function displayResult(data) {
    resultSection.classList.remove('hidden');

    // 1. Score Comparison (Total & Categories)
    displayScoreComparison(data.original_scores, data.improved_scores, data.comparison);

    // 2. Detailed Score Table
    displayDetailedScoreTable(data.original_scores, data.improved_scores);

    // 3. Improved Requirements Cards
    displayRequirementCards(data.improved_result.improved);

    // 4. Key Improvements 
    displayTopImprovements(data.original_scores, data.improved_scores, data.explanations || [], data.improved_result.improved);

    // 5. Add to history
    const isDirectMode = !document.getElementById('tab-direct').classList.contains('hidden');
    const originalText = isDirectMode
        ? document.getElementById('inputRequirementDirect').value
        : document.getElementById('inputRequirementPattern').value;

    if (window.addToHistory) {
        window.addToHistory(
            originalText,
            data.improved_result.improved,
            data.original_scores.total,
            data.improved_scores.total
        );
    }
}

function displayScoreComparison(original, improved, comparison) {
    // Total Scores
    document.getElementById('scoreOriginalTotal').textContent = `${original.total} / 320`;
    document.getElementById('scoreOriginalPercent').textContent = `${Math.round((original.total / 320) * 100)}%`;

    document.getElementById('scoreImprovedTotal').textContent = `${improved.total} / 320`;
    document.getElementById('scoreImprovedPercent').textContent = `${Math.round((improved.total / 320) * 100)}%`;

    const delta = improved.total - original.total;
    const deltaPercent = Math.round((delta / 320) * 100);
    const deltaText = document.getElementById('scoreDeltaText');
    deltaText.textContent = `${delta >= 0 ? '+' : ''}${delta}점 (${delta >= 0 ? '+' : ''}${deltaPercent}%)`;
    deltaText.style.color = delta >= 0 ? '#006644' : '#BF2600';


    renderCategoryBars('categoryScoresOriginal', original.scores);
    renderCategoryBars('categoryScoresImproved', improved.scores);
}

function renderCategoryBars(containerId, scores) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';


    const categories = [
        { key: 'P', label: '패턴 규칙 (Patterns) P1-P5', rules: ["P1", "P2", "P3", "P4", "P5", "P6", "P7"] },
        { key: 'C_IND', label: '개별 특성 (Individual) C1-C9', rules: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"] },
        { key: 'C_SET', label: '집합 특성 (Set) C10-C15', rules: ["C10", "C11", "C12", "C13", "C14", "C15"] },
        { key: 'Accuracy', label: '정확성 (Accuracy) R1-R9', rules: ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9"] },
        { key: 'Concision', label: '간결성 (Concision) R10-R11', rules: ["R10", "R11"] },
        { key: 'NonAmbiguity', label: '비모호성 (Non-Ambiguity) R12-R17', rules: ["R12", "R13", "R14", "R15", "R16", "R17"] },
        { key: 'Singularity', label: '단일성 (Singularity) R18-R23', rules: ["R18", "R19", "R20", "R21", "R22", "R23"] },
        { key: 'Completeness', label: '완전성 (Completeness) R24-R25', rules: ["R24", "R25"] },
        { key: 'Realism', label: '현실성 (Realism) R26', rules: ["R26"] },
        { key: 'Conditions', label: '조건 표현 (Conditions) R27-R28', rules: ["R27", "R28"] },
        { key: 'Uniqueness', label: '고유성 (Uniqueness) R29-R30', rules: ["R29", "R30"] },
        { key: 'Abstraction', label: '추상화 수준 (Abstraction) R31', rules: ["R31"] },
        { key: 'Quantification1', label: '정량화 (Quantification) R32', rules: ["R32"] },
        { key: 'Tolerance', label: '허용오차 (Tolerance) R33', rules: ["R33"] },
        { key: 'Quantification2', label: '정량화 (Quantification) R34-R35', rules: ["R34", "R35"] },
        { key: 'Uniformity', label: '언어 일관성 (Uniformity) R36-R40', rules: ["R36", "R37", "R38", "R39", "R40"] },
        { key: 'Modularity', label: '모듈성 (Modularity) R41-R42', rules: ["R41", "R42"] }
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

function calculateCategoryScoreByRules(scores, rules) {
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

function calculateCategoryScore(scores, prefix) {
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

const RULE_DEFINITIONS = {
    // Pattern Elements
    "P1": { ko: "주어", en: "Subject" },
    "P2": { ko: "조동사", en: "Modal Verb" },
    "P3": { ko: "행위", en: "Action" },
    "P4": { ko: "목적어", en: "Object" },
    "P5": { ko: "성능 기준", en: "Performance Measure" },
    "P6": { ko: "조건절", en: "Condition Clause" },
    "P7": { ko: "제약 조건", en: "Qualification Clause" },

    // Individual Characteristics
    "C1": { ko: "필수성", en: "Necessary" },
    "C2": { ko: "적절성", en: "Appropriate" },
    "C3": { ko: "명확성", en: "Unambiguous" },
    "C4": { ko: "완전성", en: "Complete" },
    "C5": { ko: "단일성", en: "Singular" },
    "C6": { ko: "실현 가능성", en: "Feasible" },
    "C7": { ko: "검증 가능성", en: "Verifiable" },
    "C8": { ko: "정확성", en: "Correct" },
    "C9": { ko: "준수성", en: "Conforming" },

    // Set Characteristics
    "C10": { ko: "완전성(집합)", en: "Complete (Set)" },
    "C11": { ko: "일관성", en: "Consistent" },
    "C12": { ko: "실현 가능성(집합)", en: "Feasible (Set)" },
    "C13": { ko: "이해 용이성", en: "Comprehensible" },
    "C14": { ko: "타당성 확인 가능성", en: "Validatable" },
    "C15": { ko: "정확성(집합)", en: "Correct (Set)" },

    // Writing Rules
    "R1": { ko: "구조화", en: "Structured Statements" },
    "R2": { ko: "능동태", en: "Active Voice" },
    "R3": { ko: "적절한 주어-동사", en: "Appropriate Subject-Verb" },
    "R4": { ko: "정의된 용어", en: "Defined Terms" },
    "R5": { ko: "명확한 지칭", en: "Definite Articles" },
    "R6": { ko: "단위 사용", en: "Common Units of Measure" },
    "R7": { ko: "모호한 용어 금지", en: "Vague Terms" },
    "R8": { ko: "면책 조항 금지", en: "Escape Clauses" },
    "R9": { ko: "포괄적 용어 금지", en: "Open-Ended Clauses" },
    "R10": { ko: "간결한 표현", en: "Superfluous Infinitives" },
    "R11": { ko: "절 분리", en: "Separate Clauses" },
    "R12": { ko: "문법", en: "Correct Grammar" },
    "R13": { ko: "철자", en: "Correct Spelling" },
    "R14": { ko: "구두점", en: "Correct Punctuation" },
    "R15": { ko: "논리 표현", en: "Logical Expressions" },
    "R16": { ko: "부정문 사용", en: "Use of “Not”" },
    "R17": { ko: "빗금 사용 금지", en: "Use of Oblique Symbol" },
    "R18": { ko: "단일 개념", en: "Single Thought Sentence" },
    "R19": { ko: "결합어 금지", en: "Combinators" },
    "R20": { ko: "목적 구문 금지", en: "Purpose Phrases" },
    "R21": { ko: "괄호 사용 최소화", en: "Parentheses" },
    "R22": { ko: "나열 금지", en: "Enumeration" },
    "R23": { ko: "도표 참조", en: "Supporting Diagrams" },
    "R24": { ko: "대명사 금지", en: "Pronouns" },
    "R25": { ko: "제목 독립성", en: "Headings" },
    "R26": { ko: "비현실적 절대어 금지", en: "Absolutes" },
    "R27": { ko: "명확한 조건", en: "Explicit Conditions" },
    "R28": { ko: "명확한 AND/OR", en: "Multiple Conditions" },
    "R29": { ko: "적절한 분류", en: "Classification" },
    "R30": { ko: "고유한 표현", en: "Unique Expression" },
    "R31": { ko: "솔루션 미포함", en: "Solution Free" },
    "R32": { ko: "개별 지칭", en: "Universal Qualification" },
    "R33": { ko: "값 범위 정의", en: "Range of Values" },
    "R34": { ko: "측정 가능한 성능", en: "Measurable Performance" },
    "R35": { ko: "구체적 시간 의존성", en: "Temporal Dependencies" },
    "R36": { ko: "일관된 용어/단위", en: "Consistent Terms and Units" },
    "R37": { ko: "약어 정의", en: "Acronyms" },
    "R38": { ko: "모호한 약어 금지", en: "Abbreviations" },
    "R39": { ko: "스타일 가이드 준수", en: "Style Guide" },
    "R40": { ko: "일관된 소수점 형식", en: "Decimal Format" },
    "R41": { ko: "논리적 그룹화", en: "Related Requirements" },
    "R42": { ko: "구조화된 템플릿", en: "Structured Sets" }
};

function displayDetailedScoreTable(original, improved) {
    const tbody = document.getElementById('detailedScoreTableBody');
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



function displayRequirementCards(fullText) {
    const container = document.getElementById('requirementCardsContainer');
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

function createReqCard(container, number, text, pattern) {
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

function displayTopImprovements(originalEval, improvedEval, explanations, fullText) {
    const container = document.getElementById('keyImprovementsList');
    container.innerHTML = '';

    console.log('=== DISPLAY TOP IMPROVEMENTS ===');
    console.log('Explanations from backend:', explanations);

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

            if (scoreChange) {

                const cleanContent = explanation.content.replace(/\*\*/g, '').trim();


                let displayTitle = explanation.title;
                if (displayTitle.startsWith(explanation.ruleId)) {
                    displayTitle = displayTitle.substring(explanation.ruleId.length).trim();

                    displayTitle = displayTitle.replace(/^[-:]\s*/, '');
                }


                const header = `<span style="font-weight:600; color:#172B4D;">[${explanation.ruleId}] ${displayTitle}</span> <span style="color:#0052CC; font-weight:600; margin-left:8px;">(${scoreChange.original}점→${scoreChange.improved}점, +${scoreChange.change}점)</span>`;

                const div = document.createElement('div');
                div.className = 'improvement-item';
                div.style.backgroundColor = '#F4F5F7';
                div.style.padding = '12px';
                div.style.lineHeight = '1.5';

                div.innerHTML = `
                    <div style="margin-bottom:4px;">${header}</div>
                    <div style="color:#42526E;">${cleanContent}</div>
                `;
                container.appendChild(div);

                console.log('Displayed:', header);
            } else {

                const cleanContent = explanation.content.replace(/\*\*/g, '').trim();
                const combined = `${explanation.ruleId} ${explanation.title} ${cleanContent}`;

                const div = document.createElement('div');
                div.className = 'improvement-item';
                div.style.backgroundColor = '#F4F5F7';
                div.style.padding = '12px';
                div.style.lineHeight = '1.5';

                div.innerHTML = `<div style="color:#172B4D;">${combined}</div>`;
                container.appendChild(div);

                console.warn('No score match for:', explanation.ruleId);
            }
        });
    }


    const recContainer = document.getElementById('recommendationsList');
    if (recContainer && fullText) {
        recContainer.innerHTML = '';


        const recRegex = /###\s*5\..+?추가 개선 권장사항[\s\S]*?(\n|$)([\s\S]*)/;
        const recMatch = fullText.match(recRegex);

        if (recMatch) {
            let recText = recMatch[2].trim();

            recText = recText.replace(/```$/, '').trim();

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
}


(function () {

    checkConfiguration(true);
})();


window.improveRequirement = improveRequirement;
window.saveApiConfig = saveApiConfig;
window.resetApiConfig = resetApiConfig;
window.saveProjectConfig = saveProjectConfig;
window.resetProjectConfig = resetProjectConfig;
window.saveConfig = saveConfig;
window.switchView = switchView;
window.switchInputMode = switchInputMode;
window.toggleApiKeyInputs = toggleApiKeyInputs;