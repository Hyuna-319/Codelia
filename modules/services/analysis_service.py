"""
Analysis Service - 비즈니스 로직 계층
- 요구사항 평가 및 개선의 핵심 로직 담당
- AI Client, Evaluator, Improver를 조합하여 전체 워크플로우 관리
- 프로젝트 컨텍스트 주입 및 점수 비교 처리
"""
from modules import AIClient, RequirementImprover, RequirementEvaluator
import config

class AnalysisService:
    def __init__(self, config_service):
        self.config_service = config_service
        
    def _create_ai_client(self):
        settings = self.config_service.get_provider_settings()
        if not settings['api_key']:
            raise ValueError(f"API key for {settings['provider']} not found")
            
        return AIClient(
            provider=settings['provider'],
            api_key=settings['api_key'],
            model_name=None,
            base_url=settings['base_url'] if settings['base_url'] else None
        )

    def evaluate(self, text):
        if not text:
            raise ValueError("No text provided")
            
        ai_client = self._create_ai_client()
        scoring_prompt = ai_client.load_prompt(config.SCORING_PROMPT_FILE)
        evaluator = RequirementEvaluator(ai_client, scoring_prompt)
        
        return evaluator.evaluate(text)

    def improve(self, text, pattern_data):
        if not text:
            raise ValueError("No text provided")
            
        ai_client = self._create_ai_client()
        
        # Load prompts
        quality_prompt = ai_client.load_prompt(config.PROMPT_FILE)
        scoring_prompt = ai_client.load_prompt(config.SCORING_PROMPT_FILE)
        
        # Inject project context
        project = self.config_service.get_project_context()
        developer = project.get('developer', '').strip()
        system = project.get('system', '').strip()
        client = project.get('client', '').strip()
        
        project_context = f"""
- **Developer**: {developer}
- **Target System**: {system}
- **Client**: {client}
"""
        quality_prompt = quality_prompt.replace('{PROJECT_CONTEXT}', project_context)
        quality_prompt = quality_prompt.replace('{Developer}', developer if developer else 'Supplier')
        quality_prompt = quality_prompt.replace('{System}', system if system else 'System')
        quality_prompt = quality_prompt.replace('{Client}', client if client else 'Client')
        
        # Create components
        improver = RequirementImprover(ai_client, quality_prompt)
        evaluator = RequirementEvaluator(ai_client, scoring_prompt)
        
        # 1. Evaluate Original
        original_scores = evaluator.evaluate(text)
        
        # 2. Improve
        improved_result = improver.improve(text, pattern_data)
        
        # 3. Evaluate Improved
        improved_scores = evaluator.evaluate(improved_result['improved'])
        
        # 4. Calculate top score changes
        explanations = self._calculate_top_changes(original_scores, improved_scores)
        
        # 5. Compare
        comparison = evaluator.compare_scores(original_scores, improved_scores)
        
        return {
            'original_scores': original_scores,
            'improved_result': improved_result,
            'improved_scores': improved_scores,
            'comparison': comparison,
            'explanations': explanations
        }
        
    def _calculate_top_changes(self, original_scores, improved_scores):
        explanations = []
        if original_scores.get('scores') and improved_scores.get('scores'):
            score_changes = []
            for rule_id, orig_data in original_scores['scores'].items():
                imp_data = improved_scores['scores'].get(rule_id)
                if imp_data and orig_data.get('score') < imp_data.get('score'):
                    change = imp_data['score'] - orig_data['score']
                    score_changes.append({
                        'rule': rule_id,
                        'name': orig_data.get('name', rule_id),
                        'original': orig_data['score'],
                        'improved': imp_data['score'],
                        'change': change,
                        'reason': imp_data.get('reason', '')
                    })
            
            score_changes.sort(key=lambda x: x['change'], reverse=True)
            top_changes = score_changes[:3]
            
            for change in top_changes:
                explanations.append({
                    'ruleId': change['rule'],
                    'title': change['name'],
                    'content': change['reason']
                })
        return explanations
