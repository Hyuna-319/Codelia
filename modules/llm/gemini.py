import requests
from .base import LLMProvider

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, base_url: str, model: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model

    def generate(self, system_prompt: str, user_message: str) -> str:
        full_prompt = f"{system_prompt}\n\nUser Request:\n{user_message}"
        
        if not self.base_url:
             raise ValueError("Gemini configuration requires a Base URL")

        # Smart URL construction: detect if it's Gateway or standard Gemini
        base = self.base_url.rstrip('/')
        
        if '/models/' in base:
            # Enterprise Gateway style (already has /models/ path)
            url = f"{base}?key={self.api_key}"
        else:
            # Standard Google Gemini API (needs model endpoint appended)
            url = f"{base}/models/{self.model}:generateContent?key={self.api_key}"
        
        headers = {
            'Content-Type': 'application/json'
            # Note: x-goog-api-key removed, using query parameter instead
        }
        
        payload = {
            "contents": [{
                "role": "user",  # Required by Enterprise Gateway
                "parts": [{"text": full_prompt}]
            }]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=120)
            response.raise_for_status()
            result = response.json()
            return result['candidates'][0]['content']['parts'][0]['text']
        except requests.exceptions.RequestException as e:
            raise Exception(f"Gemini API 호출 실패: {str(e)}")