"""
요구사항 개선 로직
"""
from typing import Dict, List
from .ai_client import AIClient


class RequirementImprover:
 
    
    def __init__(self, ai_client: AIClient, quality_prompt: str):

        self.ai_client = ai_client
        self.quality_prompt = quality_prompt
    
    def improve(
        self,
        original_text: str,
        pattern_data: Dict
    ) -> Dict:

        
        improved_text = self.ai_client.improve_requirement(
            quality_prompt=self.quality_prompt,
            original_text=original_text,
            pattern_data=pattern_data
        )
        
        return {
            "original": original_text,
            "improved": improved_text,
            "pattern_data": pattern_data
        }