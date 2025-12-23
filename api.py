"""
Flask API Server - 백엔드 진입점
- 프론트엔드와 통신하는 REST API 엔드포인트 제공
- /api/config: 설정 관리 (GET/POST)
- /api/evaluate: 요구사항 평가
- /api/improve: 요구사항 개선
"""
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

from flask import Flask, request, jsonify
from flask_cors import CORS
from modules.services import ConfigService, AnalysisService, DatabaseService
import re
import uuid
import json
import traceback

app = Flask(__name__)
CORS(app)

# Initialize Services
config_service = ConfigService()
db_service = DatabaseService()
analysis_service = AnalysisService(config_service)

# --- API Routes ---

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get all history from DB"""
    try:
        history = db_service.get_history_list()
        return jsonify(history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['POST'])
def save_history():
    """Save analysis results to DB (Handles multiple requirement splitting)"""
    data = request.json
    original_text = data.get('original_text')
    improved_text = data.get('improved_text')
    original_score = data.get('original_score')
    improved_score = data.get('improved_score')
    parent_id = data.get('parent_id', '')
    full_data = data.get('full_data')  # Complete API response object
    
    # Generate a unique session ID for grouping
    session_id = str(uuid.uuid4())
    try:
        # 1. Improved Text에서 개별 요구사항 분리
        # 형식: **요구사항 N**
        req_sections = re.split(r'\*\*요구사항\s+\d+.*?\*\*', improved_text)
        req_headers = re.findall(r'\*\*요구사항\s+(\d+).*?\*\*', improved_text)
        
        # 첫 번째 섹션은 헤더 이전의 서론일 수 있으므로 제거 (보통 비어있거나 제목)
        if len(req_sections) > len(req_headers):
            req_sections = req_sections[1:]

        # 한 세션 내에서 중복 저장을 방지하기 위한 세트
        saved_req_ids = set()

        if not req_headers:
            # 요구사항 태그가 없는 경우 (단일 요구사항으로 처리)
            display_text = re.split(r'\n###', improved_text)[0].strip()
            req_id = parent_id if parent_id else "REQ-001"
            
            item = {
                'req_id': req_id,
                'original': original_text,
                'improved': display_text,
                'original_score': original_score,
                'improved_score': improved_score,
                'session_id': session_id,
                'full_data': full_data
            }
            db_service.save_history_item(item)
        else:
            # 각 요구사항별로 개별 레코드 저장
            for i, (num, content) in enumerate(zip(req_headers, req_sections)):
                # 자릿수 유지 넘버링 (REQ-001 -> REQ-001-001)
                padding = 3
                match = re.search(r'(\d+)$', parent_id)
                if match:
                    padding = len(match.group(1))
                
                # parent_id가 이미 해당 번호로 끝나면 중복 처리 방지
                str_num = str(num).zfill(padding)
                if parent_id and (parent_id.endswith(f"-{str_num}") or parent_id.endswith(f" {str_num}")):
                    sub_id = parent_id
                else:
                    sub_id = f"{parent_id}-{str_num}" if parent_id else f"REQ-{str_num}"
                
                # 중복 저장 방지 (AI가 동일 번호를 중복 출력할 경우 대비)
                if sub_id in saved_req_ids:
                    continue
                saved_req_ids.add(sub_id)

                # 평가 섹션(###) 이전까지만 추출하여 카드에는 요구사항 본문만 표시
                display_content = re.split(r'\n###', content)[0].strip()
                
                item = {
                    'req_id': sub_id,
                    'original': original_text if i == 0 else f"(Original truncated - See {sub_id.split('-')[0]})",
                    'improved': display_content,
                    'original_score': original_score,
                    'improved_score': improved_score,
                    'session_id': session_id,
                    'full_data': full_data
                }
                db_service.save_history_item(item)

        return jsonify({'status': 'success', 'message': 'History saved to SQLite'})
    except Exception as e:
        print(f"Error saving history: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/history/delete', methods=['POST'])
def delete_history():
    """Delete a history item"""
    data = request.json
    item_id = data.get('id')
    try:
        db_service.delete_history_item(item_id)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    cfg = config_service.load_config()

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
