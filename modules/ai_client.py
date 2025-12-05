
"""
AI API 호출
"""
import os
from typing import Dict, Any
import json
import requests

class AIClient:
    
    def __init__(self, provider: str, api_key: str, model_name: str = None, base_url: str = None):

        self.provider = provider.lower()
        self.api_key = api_key
        self.max_tokens = 8000
        self.base_url = base_url
        
        # 기본 URL 설정 
        self.default_urls = {
            'openai': 'https://api.openai.com/v1',
            'claude': 'https://api.anthropic.com/v1'
        }

        
        if self.provider == 'openai':
            self.model = "gpt-4o-mini"
            self.base_url = self.default_urls['openai'] 
        elif self.provider == 'claude':
            self.model = "claude-3-sonnet-20240229" 
            self.base_url = self.default_urls['claude'] #
        elif self.provider == 'gemini':
            self.model = model_name if model_name else "gemini-2.0-flash"

            if not self.base_url:
  
                 pass
        elif self.provider == 'enterprise_gateway':
            self.model = None # No model selection
            if not self.base_url:
                raise ValueError("Enterprise Gateway requires a Base URL")
        
        print(f"✓ {provider.upper()} client initialized")
        if self.base_url:
            print(f"  Base URL: {self.base_url}")
        if self.model:
            print(f"  Model: {self.model}")
    
    def load_prompt(self, file_path) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def call_api(self, system_prompt: str, user_message: str) -> str:
        """통합 API 호출 메서드"""
        if self.provider == 'openai':
            return self._call_openai(system_prompt, user_message)
        elif self.provider == 'gemini':
            return self._call_gemini(system_prompt, user_message)
        elif self.provider == 'claude':
            return self._call_claude(system_prompt, user_message)
        elif self.provider == 'enterprise_gateway':
            return self._call_enterprise_gateway(system_prompt, user_message)
        else:
            raise ValueError(f"지원하지 않는 제공자입니다: {self.provider}")

    def _call_openai(self, system_prompt: str, user_message: str) -> str:
        """OpenAI API 호출 (Fixed URL)"""
        url = f"{self.base_url.rstrip('/')}/chat/completions"
        
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

    def _call_gemini(self, system_prompt: str, user_message: str) -> str:
   
        full_prompt = f"{system_prompt}\n\nUser Request:\n{user_message}"
        
        if not self.base_url:
             raise ValueError("Gemini configuration requires a Base URL")


        url = self.base_url
        
        headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': self.api_key 
        }
        
        payload = {
            "contents": [{
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

    def _call_claude(self, system_prompt: str, user_message: str) -> str:
      
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

    def _call_enterprise_gateway(self, system_prompt: str, user_message: str) -> str:
   
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
    
    def improve_requirement(
        self,
        quality_prompt: str,
        original_text: str,
        pattern_data: Dict[str, Any]
    ) -> str:
    
        pattern_type = pattern_data.get('pattern', 'ubiquitous')
        pattern_context = f"Pattern Type: {pattern_type}\n\n"
        
     
        for key, value in pattern_data.items():
            if key != 'pattern' and value:
                pattern_context += f"{key.replace('_', ' ').title()}: {value}\n"
        
        user_message = f"""
Original Requirement: {original_text}

{pattern_context}

Please improve this requirement based on the INCOSE rules provided in the system prompt.
Use the pattern information above to structure the improved requirement appropriately.
If any pattern fields are missing, do not include them in the improved requirement.
"""
        return self.call_api(quality_prompt, user_message)
    
    def evaluate_requirement(
        self,
        scoring_prompt: str,
        text: str
    ) -> Dict[str, Any]:
      
        user_message = f"""
Requirement to Evaluate:
{text}

Please evaluate this requirement and provide the score in JSON format as specified.
"""
      
        if self.provider == 'gemini':
            user_message += "\nIMPORTANT: Output ONLY valid JSON."

        response = self.call_api(scoring_prompt, user_message)
        
        try:
           
            clean_response = response.strip()
            if clean_response.startswith('```json'):
                clean_response = clean_response[7:]
            if clean_response.startswith('```'):
                clean_response = clean_response[3:]
            if clean_response.endswith('```'):
                clean_response = clean_response[:-3]
            
        
            json_start = clean_response.find('{')
            json_end = clean_response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = clean_response[json_start:json_end]
                return json.loads(json_str)
            else:
                
                return json.loads(clean_response)
        except Exception as e:
            raise Exception(f"점수 평가 결과 파싱 실패: {str(e)}\n응답: {response}")