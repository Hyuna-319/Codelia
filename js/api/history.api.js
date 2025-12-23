/**
 * History API - 백엔드 SQLite 히스토리 데이터와 통신하는 레이어
 */
export const historyApi = {
    /**
     * 전체 히스토리 목록 조회
     */
    async getAll() {
        try {
            const response = await fetch('http://localhost:8000/api/history');
            if (!response.ok) throw new Error('Failed to fetch history');
            return await response.json();
        } catch (error) {
            console.error('History API (GET) Error:', error);
            return [];
        }
    },

    /**
     * 히스토리 저장 
     */
    async save(historyData) {
        try {
            const response = await fetch('http://localhost:8000/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(historyData)
            });
            if (!response.ok) throw new Error('Failed to save history');
            return await response.json();
        } catch (error) {
            console.error('History API (POST) Error:', error);
            throw error;
        }
    },

    /**
     * 히스토리 개별 삭제
     */
    async delete(id) {
        try {
            const response = await fetch('http://localhost:8000/api/history/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            return await response.json();
        } catch (error) {
            console.error('History API (DELETE) Error:', error);
            throw error;
        }
    }
};
