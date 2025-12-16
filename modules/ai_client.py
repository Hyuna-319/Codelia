"""
AI API 호출
"""
import os
from typing import Dict, Any
import json
from .llm import LLMFactory

class AIClient:
    
    def __init__(self, provider: str, api_key: str, model_name: str = None, base_url: str = None):
        self.provider = provider.lower()
        self.api_key = api_key
        self.base_url = base_url
        self.model_name = model_name
        
        # Initialize the specific provider using the factory
        self.llm = LLMFactory.create_provider(
            provider=self.provider,
            api_key=self.api_key,
            base_url=self.base_url,
            model_name=self.model_name
        )
        
        print(f"✓ {provider.upper()} client initialized")
        if self.base_url:
            print(f"  Base URL: {self.base_url}")
        if self.model_name:
            print(f"  Model: {self.model_name}")
    
    def load_prompt(self, file_path) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def call_api(self, system_prompt: str, user_message: str) -> str:
        """통합 API 호출 메서드"""
        return self.llm.generate(system_prompt, user_message)