import json
from pathlib import Path
import config

class ConfigService:
    def __init__(self):
        self.config_dir = Path.home() / ".Codelia"
        self.config_file = self.config_dir / "config.json"
        
    def load_config(self):
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return {}
        return {}
        
    def save_config(self, new_config):
        self.config_dir.mkdir(exist_ok=True)
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(new_config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Failed to save config: {e}")
            return False
            
    def get_provider_settings(self):
        cfg = self.load_config()
        provider = cfg.get('provider', config.DEFAULT_PROVIDER)
        provider_settings = cfg.get(provider, {})
        
        return {
            'provider': provider,
            'api_key': provider_settings.get('key', ''),
            'base_url': provider_settings.get('url', ''),
            'model_name': None # Default handled by factory
        }
        
    def get_project_context(self):
        cfg = self.load_config()
        return cfg.get('project', {})
