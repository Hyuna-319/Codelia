/**
 * Application-wide constants.
 */

export const API_URL = 'http://localhost:8000/api';

export const RULE_DEFINITIONS = {
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

export const CATEGORY_DEFINITIONS = [
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
