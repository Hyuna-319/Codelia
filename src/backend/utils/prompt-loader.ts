import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectConfig } from '../../shared/types';

/**
 * Prompt Loader
 * Loads prompt files and injects project context
 */
export class PromptLoader {
    private static readonly PROMPTS_DIR = path.join(__dirname, '../../../prompts');

    /**
     * Load quality prompt (Quality.md)
     */
    static async loadQualityPrompt(): Promise<string> {
        const filePath = path.join(PromptLoader.PROMPTS_DIR, 'Quality.md');
        return await fs.readFile(filePath, 'utf-8');
    }

    /**
     * Load scoring prompt (scoring_criteria.md)
     */
    static async loadScoringPrompt(): Promise<string> {
        const filePath = path.join(PromptLoader.PROMPTS_DIR, 'scoring_criteria.md');
        return await fs.readFile(filePath, 'utf-8');
    }

    /**
     * Inject project context into prompt
     * Replaces {PROJECT_CONTEXT}, {Developer}, {System}, {Client} placeholders
     */
    static injectProjectContext(prompt: string, project: ProjectConfig = {}): string {
        const developer = project.developer?.trim() || '';
        const system = project.system?.trim() || '';
        const client = project.client?.trim() || '';

        // Create project context block
        const projectContext = `
- **Developer**: ${developer}
- **Target System**: ${system}
- **Client**: ${client}
`;

        // Replace placeholders
        let result = prompt.replace('{PROJECT_CONTEXT}', projectContext);
        result = result.replace('{Developer}', developer || 'Supplier');
        result = result.replace('{System}', system || 'System');
        result = result.replace('{Client}', client || 'Client');

        return result;
    }
}
