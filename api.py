import sys
import io


sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

import json
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from modules import AIClient, RequirementImprover, RequirementEvaluator
import config

app = Flask(__name__)
CORS(app)

# API Key Storage Path
CONFIG_DIR = Path.home() / ".requirement_improver"
CONFIG_FILE = CONFIG_DIR / "config.json"

def load_config():
    
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_config(new_config):
   
    CONFIG_DIR.mkdir(exist_ok=True)
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(new_config, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Failed to save config: {e}")
        return False

def delete_config_key(key):
    
    current_config = load_config()
    if key in current_config:
        del current_config[key]
        return save_config(current_config)
    return False

# --- API Routes ---

@app.route('/api/config', methods=['GET'])
def get_config():
    cfg = load_config()
    return jsonify({
        'provider': cfg.get('provider', config.DEFAULT_PROVIDER),
        'openai': cfg.get('openai', {'key': ''}),
        'gemini': cfg.get('gemini', {'key': '', 'url': ''}),
        'claude': cfg.get('claude', {'key': ''}),
        'enterprise_gateway': cfg.get('enterprise_gateway', {'key': '', 'url': ''}),
        'project': cfg.get('project', {})
    })

@app.route('/api/config', methods=['POST'])
def update_config():
    """Update configuration"""
    data = request.json
    current_config = load_config()
    
    
    current_config.update(data)
    
    if save_config(current_config):
        return jsonify({'status': 'success', 'message': 'Configuration saved'})
    return jsonify({'status': 'error', 'message': 'Failed to save config'}), 500

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    text = data.get('text')
    
    cfg = load_config()
    cfg = load_config()
    provider = cfg.get('provider', config.DEFAULT_PROVIDER)
    
    
    provider_settings = cfg.get(provider, {})
    api_key = provider_settings.get('key', '')
    base_url = provider_settings.get('url', '')
    
    if not api_key:
        return jsonify({'error': f'API key for {provider} not found'}), 401
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
       
        ai_client = AIClient(
            provider=provider,
            api_key=api_key,
            model_name=None, 
            base_url=base_url if base_url else None
        )
        
        scoring_prompt = ai_client.load_prompt(config.SCORING_PROMPT_FILE)
        evaluator = RequirementEvaluator(ai_client, scoring_prompt)
        
        scores = evaluator.evaluate(text)
        return jsonify(scores)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/improve', methods=['POST'])
def improve():
    data = request.json
    text = data.get('text')
    pattern_data = data.get('pattern_data', {})
    
    cfg = load_config()
    cfg = load_config()
    provider = cfg.get('provider', config.DEFAULT_PROVIDER)
    
  
    provider_settings = cfg.get(provider, {})
    api_key = provider_settings.get('key', '')
    base_url = provider_settings.get('url', '')
    
    if not api_key:
        return jsonify({'error': f'API key for {provider} not found'}), 401
        
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        ai_client = AIClient(
            provider=provider, 
            api_key=api_key,
            model_name=None, # Defaults handled in AIClient
            base_url=base_url if base_url else None
        )
        
        quality_prompt = ai_client.load_prompt(config.PROMPT_FILE)
        scoring_prompt = ai_client.load_prompt(config.SCORING_PROMPT_FILE)
        
        # Inject project context into quality prompt
        project = cfg.get('project', {})
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

        
        improver = RequirementImprover(ai_client, quality_prompt)
        evaluator = RequirementEvaluator(ai_client, scoring_prompt)
        
        # 1. Evaluate Original
        original_scores = evaluator.evaluate(text)
        
        # 2. Improve with pattern data
        improved_result = improver.improve(
            original_text=text,
            pattern_data=pattern_data
        )
        
        # 3. Evaluate Improved
        improved_scores = evaluator.evaluate(improved_result['improved'])
        
        # 4. Calculate top score changes 
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
                        'reason': imp_data.get('reason', '')  # Use evaluation reason
                    })
            
            
            score_changes.sort(key=lambda x: x['change'], reverse=True)
            top_changes = score_changes[:3]
            
            
            for change in top_changes:
                explanations.append({
                    'ruleId': change['rule'],
                    'title': change['name'],
                    'content': change['reason']
                })
        
        # 5. Compare
        comparison = evaluator.compare_scores(original_scores, improved_scores)
        
        return jsonify({
            'original_scores': original_scores,
            'improved_result': improved_result,
            'improved_scores': improved_scores,
            'comparison': comparison,
            'explanations': explanations  # Using evaluation reasons
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000)