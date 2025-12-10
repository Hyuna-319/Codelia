import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { AppConfig } from '../../shared/types';

/**
 * Configuration Manager
 * Handles loading and saving application configuration to ~/.Codelia/config.json
 * Matches the behavior of Python's load_config() and save_config()
 */
export class ConfigManager {
    private static readonly CONFIG_DIR = path.join(os.homedir(), '.Codelia');
    private static readonly CONFIG_FILE = path.join(ConfigManager.CONFIG_DIR, 'config.json');

    /**
     * Load configuration from file
     * Returns empty object if file doesn't exist or on error
     */
    static async load(): Promise<Partial<AppConfig>> {
        try {
            const exists = await fs.access(ConfigManager.CONFIG_FILE)
                .then(() => true)
                .catch(() => false);

            if (!exists) {
                return {};
            }

            const data = await fs.readFile(ConfigManager.CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to load config:', error);
            return {};
        }
    }

    /**
     * Save configuration to file
     * Creates directory if it doesn't exist
     * Returns true on success, false on failure
     */
    static async save(config: Partial<AppConfig>): Promise<boolean> {
        try {
            // Create directory if it doesn't exist
            await fs.mkdir(ConfigManager.CONFIG_DIR, { recursive: true });

            // Write config file with pretty formatting
            await fs.writeFile(
                ConfigManager.CONFIG_FILE,
                JSON.stringify(config, null, 2),
                'utf-8'
            );

            return true;
        } catch (error) {
            console.error('Failed to save config:', error);
            return false;
        }
    }

    /**
     * Delete a specific key from configuration
     */
    static async deleteKey(key: string): Promise<boolean> {
        try {
            const currentConfig = await ConfigManager.load();

            if (key in currentConfig) {
                delete currentConfig[key as keyof AppConfig];
                return await ConfigManager.save(currentConfig);
            }

            return false;
        } catch (error) {
            console.error('Failed to delete config key:', error);
            return false;
        }
    }
}
