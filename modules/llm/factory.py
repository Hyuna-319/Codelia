from .openai import OpenAIProvider
from .gemini import GeminiProvider
from .claude import ClaudeProvider
from .enterprise import EnterpriseGatewayProvider

class LLMFactory:
    @staticmethod
    def create_provider(provider: str, api_key: str, base_url: str = None, model_name: str = None):
        provider = provider.lower()
        
        default_urls = {
            'openai': 'https://api.openai.com/v1',
            'claude': 'https://api.anthropic.com/v1'
        }
        
        if provider == 'openai':
            url = base_url if base_url else default_urls['openai']
            return OpenAIProvider(api_key, url, model=model_name if model_name else "gpt-4o-mini")
            
        elif provider == 'gemini':
            return GeminiProvider(api_key, base_url, model=model_name if model_name else "gemini-2.0-flash")
            
        elif provider == 'claude':
            url = base_url if base_url else default_urls['claude']
            return ClaudeProvider(api_key, url, model=model_name if model_name else "claude-3-sonnet-20240229")
            
        elif provider == 'enterprise_gateway':
            if not base_url:
                raise ValueError("Enterprise Gateway requires a Base URL")
            return EnterpriseGatewayProvider(api_key, base_url)
            
        else:
            raise ValueError(f"Unsupported provider: {provider}")
