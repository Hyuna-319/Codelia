# Requirement Analyzer (Codelia)

INCOSE 표준 기반 요구사항 품질 분석 및 개선 도구

<br>
<br>


## 개요

Requirement Analyzer는 INCOSE 요구사항 작성 표준을 기반으로 요구사항의 품질을 자동으로 분석하고 개선안을 제시하는 데스크톱 애플리케이션입니다.

**주요 기능:**
- 📊 64개 INCOSE 규칙 기반 자동 평가
- 🤖 AI 기반 요구사항 개선 제안
- 📈 상세한 점수 비교 및 분석
- 🎯 EARS 패턴 자동 적용
- 💾 프로젝트 컨텍스트 저장

<br>
<br>

## 시스템 요구사항

### 개발 환경
- **Node.js**: 18.x 이상
- **Python**: 3.11 이상
- **운영체제**: macOS, Windows 10/11

### 실행 환경 
- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 11 (Big Sur) 이상

<br>
<br>

## 프로젝트 구조

```
Codelia/
├── main.js                 # Electron 메인 프로세스
├── index.html              # UI 메인 페이지
├── renderer.js             # UI 로직
├── api.py                  # Flask 백엔드 서버
├── config.py               # 설정 파일
├── api.spec                # PyInstaller 빌드 설정
├── package.json            # Node.js 프로젝트 설정
├── requirements.txt        # Python 의존성
├── modules/                # Python 모듈
│   ├── ai_client.py        # AI API 클라이언트
│   ├── improver.py         # 요구사항 개선 로직
│   └── evaluator.py        # 요구사항 평가 로직
├── prompts/                # AI 프롬프트
│   ├── Quality.md          # 개선 프롬프트
│   └── scoring_criteria.md # 평가 기준
└── .github/workflows/      # GitHub Actions
    └── build-windows.yml   # Windows 빌드 워크플로우
```

<br>
<br>


## 기술 스택

### Frontend
- **Electron**: 28.x - 크로스 플랫폼 데스크톱 앱
- **HTML/CSS/JavaScript**: UI 구현
- **wait-on**: 서버 대기 유틸리티

### Backend
- **Python**: 3.11
- **Flask**: 웹 서버
- **Flask-CORS**: CORS 처리
- **Requests**: HTTP 클라이언트

### AI Integration
- OpenAI GPT-4
- Google Gemini
- Anthropic Claude

### Build Tools
- **electron-builder**: Electron 앱 패키징
- **PyInstaller**: Python 실행파일 생성
- **GitHub Actions**: CI/CD 자동화

<br>
<br>




## 개발 환경 설정

### 1. 저장소 클론
```bash
git clone https://github.com/YOUR_USERNAME/requirement_improver.git
cd requirement_improver/Codelia
```

### 2. Python 의존성 설치
```bash
# macOS/Linux
pip3 install -r requirements.txt

# Windows
pip install -r requirements.txt
```

### 3. Node.js 의존성 설치
```bash
npm install
```

### 4. AI API 키 설정
앱 실행 후 Settings 탭에서 다음 중 하나 설정:
- OpenAI API Key
- Google Gemini API Key
- Claude API Key

<br>
<br>


## 실행 방법

### 개발 모드 실행

**방법 1: 자동 실행 (권장)**
```bash
npm start
```
→ Python 서버와 Electron 앱이 자동으로 실행됩니다.

**방법 2: 수동 실행**
```bash
# 터미널 1: Python 서버
python3 api.py  # macOS/Linux
python api.py   # Windows

# 터미널 2: Electron 앱
npm run electron
```

### 앱 접속
브라우저가 자동으로 열리거나, Electron 창이 표시됩니다.

<br>
<br>


## 빌드 방법

### Windows 빌드 (GitHub Actions 사용)

**자동 빌드 (권장)**

1. 코드를 GitHub에 푸시
```bash
git add .
git commit -m "Update code"
git push
```

2. GitHub Actions 자동 실행
   - GitHub 저장소 → **Actions** 탭
   - "Build Windows Release" 워크플로우 확인

3. 빌드 완료 후 다운로드
   - 완료된 워크플로우 클릭
   - **Artifacts** 섹션에서 `windows-installer` 다운로드

**수동 빌드 **
```bash
# 1. Python 백엔드 빌드
pip install pyinstaller
pyinstaller api.spec

# 2. Electron 앱 빌드
npm run dist
```
<br>
<br>

### macOS 빌드

```bash
# 1. Python 백엔드 빌드
pip3 install pyinstaller
pyinstaller api.spec

# 2. Electron 앱 빌드
npm run dist
```

**결과물:**
- `dist/` 폴더에 `.dmg` 파일 생성
<br>
<br>


## 문제 해결

### Python 서버가 시작되지 않음
```bash
# Python 경로 확인
which python3  # macOS/Linux
where python   # Windows

# 의존성 재설치
pip install -r requirements.txt --force-reinstall
```

### Electron 앱이 열리지 않음
```bash
# Node 모듈 재설치
rm -rf node_modules package-lock.json
npm install
```

### Windows 빌드 실패
- GitHub Actions 로그 확인
- `api.spec` 파일의 경로 설정 확인





