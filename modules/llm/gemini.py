import requests
from .base import LLMProvider

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, base_url: str, model: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')  
        self.model = model

    def _build_endpoint(self) -> str:
       
        base = self.base_url
        
        # 1. 완전한 엔드포인트인 경우
        if ':generateContent' in base:
            return base
        
        # 2. Enterprise Gateway 형식 
        if base.endswith('/models') or base.endswith('/models/'):
            return f"{base.rstrip('/')}/{self.model}:generateContent"
        
        # 3. Base URL만 제공된 경우
        return f"{base}/models/{self.model}:generateContent"

    def generate(self, system_prompt: str, user_message: str) -> str:
        full_prompt = f"{system_prompt}\n\nUser Request:\n{user_message}"
        
        if not self.base_url:
            raise ValueError("Gemini configuration requires a Base URL")

        endpoint = self._build_endpoint()
        url = f"{endpoint}?key={self.api_key}"
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        payload = {
            "contents": [{
                "role": "user",
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