/**
 * Shared TypeScript type definitions for Codelia
 */

// Provider types
export type AIProvider = 'openai' | 'gemini' | 'claude' | 'enterprise_gateway';

// Provider-specific configuration
export interface OpenAIConfig {
    key: string;
}

export interface GeminiConfig {
    key: string;
    url: string;
}

export interface ClaudeConfig {
    key: string;
}

export interface EnterpriseGatewayConfig {
    key: string;
    url: string;
}

// Project configuration
export interface ProjectConfig {
    developer?: string;
    system?: string;
    client?: string;
}

// Complete application configuration
export interface AppConfig {
    provider: AIProvider;
    openai?: OpenAIConfig;
    gemini?: GeminiConfig;
    claude?: ClaudeConfig;
    enterprise_gateway?: EnterpriseGatewayConfig;
    project?: ProjectConfig;
}

// Pattern types for requirement improvement
export type PatternType = 'ubiquitous' | 'event-driven' | 'unwanted' | 'state-driven' | 'optional' | 'complex';

export interface PatternData {
    pattern: PatternType;
    system_response?: string;
    precondition?: string;
    trigger?: string;
    forbidden_action?: string;
    condition?: string;
    optional_feature?: string;
}

// Scoring and evaluation types
export interface RuleScore {
    score: number;
    reason: string;
    name?: string;
}

export interface CategoryScore {
    score: number;
    max: number;
    rules: string[];
}

export interface ScoreResult {
    total: number;
    max: number;
    percentage: number;
    scores: Record<string, RuleScore>;
    categories?: Record<string, CategoryScore>;
}

// Improvement result types
export interface ImprovementResult {
    original: string;
    improved: string;
    pattern_data: PatternData;
}

export interface ScoreChange {
    original: number;
    improved: number;
    change: number;
}

export interface ScoreComparison {
    original: ScoreResult;
    improved: ScoreResult;
    changes: Record<string, ScoreChange>;
    total_improvement: number;
}

export interface TopImprovement {
    ruleId: string;
    title: string;
    content: string;
}

// Complete API response for /api/improve
export interface ImproveResponse {
    original_scores: ScoreResult;
    improved_result: ImprovementResult;
    improved_scores: ScoreResult;
    comparison: ScoreComparison;
    explanations: TopImprovement[];
}

// API request types
export interface EvaluateRequest {
    text: string;
}

export interface ImproveRequest {
    text: string;
    pattern_data: PatternData;
}

// API error response
export interface ErrorResponse {
    error: string;
}
