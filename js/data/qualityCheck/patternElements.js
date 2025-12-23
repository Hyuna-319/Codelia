// Pattern Elements P1-P7 Data
export const patternElementsData = {
    title: '🔧 요소 P1-P7',
    icon: '🔧',
    sections: [
        {
            title: '🔵 EARS 패턴 구성 요소',
            color: 'blue',
            content: `
        <p><strong>P1-P7: 요구사항 패턴의 핵심 구성 요소</strong></p>
        <ul>
          <li><strong>P1 주어 (Subject):</strong> 시스템 또는 컴포넌트</li>
          <li><strong>P2 조동사 (Modal Verb):</strong> shall, should, may 등</li>
          <li><strong>P3 행위 (Action):</strong> 수행해야 할 동작</li>
          <li><strong>P4 목적어 (Object):</strong> 동작의 대상</li>
          <li><strong>P5 성능 기준 (Performance Measure):</strong> 측정 가능한 기준</li>
          <li><strong>P6 조건절 (Condition Clause):</strong> 전제 조건</li>
          <li><strong>P7 제약 조건 (Qualification Clause):</strong> 추가 제약사항</li>
        </ul>
      `
        },
        {
            title: '🟢 패턴 요소 활용 예시',
            color: 'green',
            content: `
        <p><strong>예시:</strong> "Body CAN을 통해 후진 기어 신호가 수신되면, IRCU는 100ms 이내에 후방 램프를 활성화해야 한다."</p>
        <ul>
          <li><strong>P6 (조건절):</strong> Body CAN을 통해 후진 기어 신호가 수신되면</li>
          <li><strong>P1 (주어):</strong> IRCU는</li>
          <li><strong>P5 (성능 기준):</strong> 100ms 이내에</li>
          <li><strong>P3 (행위):</strong> 활성화</li>
          <li><strong>P4 (목적어):</strong> 후방 램프를</li>
          <li><strong>P2 (조동사):</strong> 해야 한다</li>
        </ul>
      `
        }
    ]
};
