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
        
        improved_text = self.ai_client.call_api(self.quality_prompt, user_message)
        
        return {
            "original": original_text,
            "improved": improved_text,
            "pattern_data": pattern_data
        }