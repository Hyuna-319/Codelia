import requests
from .base import LLMProvider

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, base_url: str, model: str = "gpt-4o-mini", max_tokens: int = 8000):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.max_tokens = max_tokens

    def generate(self, system_prompt: str, user_message: str) -> str:
        # Smart URL construction: detect if it's Gateway or standard OpenAI
        base = self.base_url.rstrip('/') if self.base_url else ''
        
        # Check if URL already contains endpoint paths (Gateway style)
        if '/models/' in base or '/chat/completions' in base:
            # Enterprise Gateway or already complete endpoint
            url = f"{base}?key={self.api_key}" if '?key=' not in base else base
            headers = {'Content-Type': 'application/json'}
        else:
            # Standard OpenAI API (needs /chat/completions appended)
            url = f"{base}/chat/completions" if base else "https://api.openai.com/v1/chat/completions"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": self.max_tokens,
            "temperature": 0.7
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=120)
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except requests.exceptions.RequestException as e:
            raise Exception(f"OpenAI API 호출 실패: {str(e)}")
