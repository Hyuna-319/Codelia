"""
Database Service - SQLite 기반 히스토리 관리 서비스
- 사용자 홈 디렉토리(~/.Codelia)에 history.db 생성 및 관리
- 히스토리 단일/일괄 저장, 조회, 삭제 기능 제공
- Windows EXE 배포 환경을 고려한 절대 경로 처리
"""
import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

class DatabaseService:
    def __init__(self):
        # 사용자 홈 디렉토리에 데이터 저장 
        self.db_dir = Path.home() / ".Codelia"
        self.db_path = self.db_dir / "history.db"
        self._init_db()

    def _get_connection(self):
        """데이터베이스 연결 생성"""
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        """데이터베이스 및 테이블 초기화"""
        self.db_dir.mkdir(exist_ok=True)
        
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    req_id TEXT NOT NULL,
                    original_text TEXT,
                    improved_text TEXT,
                    original_score INTEGER,
                    improved_score INTEGER,
                    session_id TEXT,
                    full_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # 인덱스 생성 (조회 성능 및 정렬 목적)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_req_id ON history(req_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_session_id ON history(session_id)")

    def save_history_item(self, item_data):
        """
        개별 히스토리 항목 저장
        item_data: {req_id, original, improved, original_score, improved_score, session_id, full_data}
        """
        query = """
            INSERT INTO history (
                req_id, original_text, improved_text, 
                original_score, improved_score, session_id, full_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        
        # full_data가 객체인 경우 JSON 문자열로 변환
        full_data_json = json.dumps(item_data.get('full_data')) if isinstance(item_data.get('full_data'), (dict, list)) else item_data.get('full_data')
        
        with self._get_connection() as conn:
            cursor = conn.execute(query, (
                item_data.get('req_id'),
                item_data.get('original'),
                item_data.get('improved'),
                item_data.get('original_score'),
                item_data.get('improved_score'),
                item_data.get('session_id'),
                full_data_json
            ))
            return cursor.lastrowid

    def get_history_list(self):
        """전체 히스토리 목록 조회 (req_id 기준 오름차순)"""
        query = """
            SELECT id, req_id, original_text, improved_text, 
                   original_score, improved_score, session_id, full_data, created_at
            FROM history
            ORDER BY req_id ASC, created_at DESC
        """
        
        with self._get_connection() as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(query).fetchall()
            
            return [dict(row) for row in rows]

    def delete_history_item(self, history_id):
        """특정 히스토리 삭제"""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM history WHERE id = ?", (history_id,))
            return True

    def clear_all_history(self):
        """전체 히스토리 삭제"""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM history")
            return True
