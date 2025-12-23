# 🚨 긴급 수정 가이드

## 현재 상황
- 화면에 Direct Input, Pattern Input, Settings 탭만 보임
- Guide Panel과 History Panel이 안 보임
- 버튼 클릭이 안 됨

## 🔍 확인 방법

### 1. 브라우저 개발자 도구 열기
- **Chrome/Edge**: `F12` 또는 `Cmd+Option+I` (Mac)
- **Safari**: `Cmd+Option+C` (Mac)

### 2. Console 탭에서 에러 확인
다음 중 하나가 보일 것입니다:

#### 에러 1: "Cannot find module"
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"
```
**원인**: ES6 모듈 로딩 실패

#### 에러 2: "xxx is not a function"
```
Uncaught TypeError: window.improveRequirement is not a function
```
**원인**: 전역 함수가 설정되지 않음

#### 에러 3: "Cannot read property of undefined"
```
Uncaught TypeError: Cannot read property 'render' of undefined
```
**원인**: 컴포넌트 초기화 실패

## 🔧 즉시 해결 방법

### 방법 1: 강제 새로고침
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### 방법 2: 캐시 삭제 후 새로고침
1. 개발자 도구 열기 (F12)
2. Network 탭 선택
3. "Disable cache" 체크
4. 새로고침 (F5)

### 방법 3: renderer.js 임시 복구
만약 위 방법이 안 되면:
```bash
# index.html에 renderer.js 다시 추가
# 355번 줄에 추가:
<script src="renderer.js"></script>
<script type="module" src="js/main.js"></script>
```

## 📊 Console에서 실행할 명령어

### 1. 컴포넌트 확인
```javascript
console.log('Components:', {
    guidePanel: window.guidePanel,
    historyPanel: window.historyPanel,
    inputPanel: window.inputPanel,
    settingsPanel: window.settingsPanel,
    resultPanel: window.resultPanel
});
```

### 2. 전역 함수 확인
```javascript
console.log('Functions:', {
    improveRequirement: typeof window.improveRequirement,
    switchInputTab: typeof window.switchInputTab,
    saveApiConfig: typeof window.saveApiConfig
});
```

### 3. EventBus 확인
```javascript
console.log('EventBus:', window.eventBus);
```

## 🎯 예상 결과

### 정상인 경우:
```
🚀 Initializing Codelia Application...
✓ API Layer initialized
✓ Service Layer initialized
✓ SettingsPanel initialized
✓ InputPanel initialized
✓ ResultPanel initialized
✓ GuidePanel initialized
✓ HistoryPanel initialized
🎉 Codelia Application initialized successfully!
```

### 에러가 있는 경우:
```
❌ Uncaught Error: ...
```

## 🔄 다음 단계

에러 메시지를 복사해서 알려주세요!

