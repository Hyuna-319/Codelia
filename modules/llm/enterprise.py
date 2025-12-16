import requests
from .base import LLMProvider

class EnterpriseGatewayProvider(LLMProvider):
    def __init__(self, api_key: str, base_url: str, max_tokens: int = 8000):
        self.api_key = api_key
        self.base_url = base_url
        self.max_tokens = max_tokens

    def generate(self, system_prompt: str, user_message: str) -> str:
        url = self.base_url
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}' 
        }
        
        payload = {
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
          
            if 'choices' in result:
                return result['choices'][0]['message']['content']
            elif 'content' in result: 
                return result['content'][0]['text'] if isinstance(result['content'], list) else result['content']
            elif 'response' in result:
                return result['response']
            else:
                return str(result) 
        except requests.exceptions.RequestException as e:
            raise Exception(f"Enterprise Gateway Call Failed: {str(e)}")
