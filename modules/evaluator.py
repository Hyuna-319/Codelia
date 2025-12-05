"""
점수 평가 
"""
from typing import Dict, List
from .ai_client import AIClient


class RequirementEvaluator:
    
    
    def __init__(self, ai_client: AIClient, scoring_prompt: str):

        self.ai_client = ai_client
        self.scoring_prompt = scoring_prompt
        
        # 규칙 목록 
        self.all_rules = [
            # Pattern Rules
            "P1", "P2", "P3", "P4", "P5", "P6", "P7",
            # Characteristics - Individual
            "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9",
            # Characteristics - Set
            "C10", "C11", "C12", "C13", "C14", "C15",
            # Writing Rules
            "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9",
            "R10", "R11",
            "R12", "R13", "R14", "R15", "R16", "R17",
            "R18", "R19", "R20", "R21", "R22", "R23",
            "R24", "R25",
            "R26",
            "R27", "R28",
            "R29", "R30",
            "R31",
            "R32",
            "R33",
            "R34", "R35",
            "R37", "R38", "R39", "R40",
            "R41", "R42"
        ]
    
    def evaluate(self, text: str) -> Dict:

        try:
            scores = self.ai_client.evaluate_requirement(
                scoring_prompt=self.scoring_prompt,
                text=text
            )
            return self._process_scores(scores)
        except Exception as e:
           
            return self._get_default_scores()
    
    def _process_scores(self, scores: Dict) -> Dict:
        
        total_score = 0
        # 전체 64개 규칙 * 5점 = 320점 고정
        max_score = 320 
        
        for rule in self.all_rules:
            if rule in scores:
                score = scores[rule].get('score', 0)
                total_score += score
        
        # 카테고리별 점수 계산
        categories = self._calculate_category_scores(scores)
        
        return {
            "total": total_score,
            "max": max_score,
            "percentage": round((total_score / max_score * 100), 1),
            "scores": scores,
            "categories": categories
        }
    
    def _calculate_category_scores(self, scores: Dict) -> Dict:
        
        
        # 카테고리 정의 
        categories = {
            "패턴 규칙 (P1-P7)": {"rules": ["P1", "P2", "P3", "P4", "P5", "P6", "P7"]},
            "개별 특성 (C1-C9)": {"rules": ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"]},
            "집합 특성 (C10-C15)": {"rules": ["C10", "C11", "C12", "C13", "C14", "C15"]},
            "Accuracy (정확성)": {"rules": ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9"]},
            "Concision (간결성)": {"rules": ["R10", "R11"]},
            "Non-Ambiguity (비모호성)": {"rules": ["R12", "R13", "R14", "R15", "R16", "R17"]},
            "Singularity (단일성)": {"rules": ["R18", "R19", "R20", "R21", "R22", "R23"]},
            "Completeness (완전성)": {"rules": ["R24", "R25"]},
            "Realism (현실성)": {"rules": ["R26"]},
            "Conditions (조건 표현)": {"rules": ["R27", "R28"]},
            "Uniqueness (고유성)": {"rules": ["R29", "R30"]},
            "Abstraction (추상화 수준)": {"rules": ["R31"]},
            "Quantification (정량화 - R32)": {"rules": ["R32"]},
            "Tolerance (허용오차)": {"rules": ["R33"]},
            "Quantification (정량화 - R34-35)": {"rules": ["R34", "R35"]},
            "Uniformity of Language (언어 일관성)": {"rules": ["R36", "R37", "R38", "R39", "R40"]},
            "Modularity (모듈성)": {"rules": ["R41", "R42"]}
        }
        
        result = {}
        
        for cat_name, cat_data in categories.items():
            rules = cat_data["rules"]
            max_score = len(rules) * 5  
            current_score = 0
            
            for rule in rules:
                if rule in scores:
                    # 점수가 있으면 더하고, 없으면 0
                    current_score += scores[rule].get('score', 0)
            
            result[cat_name] = {
                "score": current_score,
                "max": max_score,
                "rules": rules
            }
            
        return result
    
    def _get_default_scores(self) -> Dict:
  
        return {
            "total": 0,
            "max": 320,
            "percentage": 0,
            "scores": {},
            "categories": {}
        }
    
    def compare_scores(self, original_scores: Dict, improved_scores: Dict) -> Dict:

        changes = {}
        
        for rule in self.all_rules:
            orig = original_scores.get("scores", {}).get(rule, {}).get("score", 0)
            impr = improved_scores.get("scores", {}).get(rule, {}).get("score", 0)
            
            # 모든 규칙 포함 (0점이라도)
            changes[rule] = {
                "original": orig,
                "improved": impr,
                "change": impr - orig
            }
        
        return {
            "original": original_scores,
            "improved": improved_scores,
            "changes": changes,
            "total_improvement": improved_scores.get("total", 0) - original_scores.get("total", 0)
        }