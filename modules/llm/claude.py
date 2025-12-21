import requests
from .base import LLMProvider

class ClaudeProvider(LLMProvider):
    def __init__(self, api_key: str, base_url: str, model: str = "claude-3-sonnet-20240229", max_tokens: int = 8000):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.max_tokens = max_tokens

    def generate(self, system_prompt: str, user_message: str) -> str:
        # Check if using Enterprise Gateway (query parameter style)
        if '?key=' in self.base_url or self.base_url.startswith('https://h-chat-api'):
            # Gateway style
            url = f"{self.base_url}?key={self.api_key}" if '?key=' not in self.base_url else self.base_url
            headers = {'Content-Type': 'application/json'}
        else:
            # Standard Anthropic API
            url = f"{self.base_url.rstrip('/')}/messages"
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': self.api_key,
                'anthropic-version': '2023-06-01'
            }
        
        payload = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": 0.7,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_message}
            ]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=120)
            response.raise_for_status()
            result = response.json()
            return result['content'][0]['text']
        except requests.exceptions.RequestException as e:
            raise Exception(f"Claude API 호출 실패: {str(e)}")
