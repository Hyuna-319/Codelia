import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

from flask import Flask, request, jsonify
from flask_cors import CORS
from modules.services import ConfigService, AnalysisService

app = Flask(__name__)
CORS(app)

# Initialize Services
config_service = ConfigService()
analysis_service = AnalysisService(config_service)

# --- API Routes ---

@app.route('/api/config', methods=['GET'])
def get_config():
    cfg = config_service.load_config()
    # Ensure default structure for frontend
    import config as default_config
    return jsonify({
        'provider': cfg.get('provider', default_config.DEFAULT_PROVIDER),
        'openai': cfg.get('openai', {'key': '', 'url': ''}),
        'gemini': cfg.get('gemini', {'key': '', 'url': ''}),
        'claude': cfg.get('claude', {'key': '', 'url': ''}),
        'project': cfg.get('project', {})
    })

@app.route('/api/config', methods=['POST'])
def update_config():
    """Update configuration"""
    data = request.json
    current_config = config_service.load_config()
    current_config.update(data)
    
    if config_service.save_config(current_config):
        return jsonify({'status': 'success', 'message': 'Configuration saved'})
    return jsonify({'status': 'error', 'message': 'Failed to save config'}), 500

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    text = data.get('text')
    
    try:
        result = analysis_service.evaluate(text)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400 if "API key" not in str(e) else 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/improve', methods=['POST'])
def improve():
    data = request.json
    text = data.get('text')
    pattern_data = data.get('pattern_data', {})
    
    try:
        result = analysis_service.improve(text, pattern_data)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400 if "API key" not in str(e) else 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000)
