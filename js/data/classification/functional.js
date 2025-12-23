// Functional Requirements Classification Data
export const functionalData = {
    title: '📋 기능 요구사항',
    icon: '📋',
    sections: [
        {
            title: '🔵 정의 및 목적',
            color: 'blue',
            content: `
        <p>기능 요구사항은 시스템이 <strong>무엇을(What)</strong> 수행해야 하는지를 기술한다. 입력(Input)에 대한 출력(Output), 상태 전이(State Transition), 시스템 동작(Behavior) 등을 명확히 규정하여 시스템의 동작 범위와 기대 결과를 정의한다.</p>
        <p><strong>주요 특징:</strong></p>
        <ul>
          <li>시스템이 '무엇을(What)' 수행해야 하는지 기능적 동작 정의</li>
          <li>관찰 가능하고 측정 가능한 동작 제시</li>
          <li>입력 조건과 출력 결과 명확화</li>
          <li>테스트 케이스를 통해 직접 검증 가능</li>
        </ul>
      `
        },
        {
            title: '🟢 작성 원칙',
            color: 'green',
            content: `
        <ul>
          <li>주어와 동사를 포함한 명확한 문장 구조를 사용한다.</li>
          <li><strong>'shall'(해야 한다)</strong>을 사용하여 구속력 있는 요구사항을 명시한다.</li>
          <li>'should'(하면 좋다), 'may'(해도 된다), 'will'(~할 것이다)은 반드시 수행해야 하는 요구사항이 아닌 경우에만 사용한다.</li>
          <li>부정형(shall not) 및 수동태(It is required that) 표현은 피한다.</li>
          <li>측정 가능한 조건(measurable condition)과 검증 가능성(verifiability)을 포함한다.</li>
        </ul>
      `
        },
        {
            title: '🟡 작성 예시',
            color: 'yellow',
            content: `
        <table>
          <thead>
            <tr>
              <th>요구사항 ID</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>FR-001</td>
              <td>Body CAN을 통해 후진 기어 신호가 수신되면, IRCU는 100ms 이내에 후방 램프를 활성화해야 한다.</td>
            </tr>
            <tr>
              <td>FR-002</td>
              <td>차량 속도가 30 km/h 이상이고 조향각이 45°를 초과하면, IRCU는 해당 방향의 코너링 램프를 켜야 한다.</td>
            </tr>
            <tr>
              <td>FR-003</td>
              <td>IRCU는 시스템 초기화 시 5초 이내에 자가진단 테스트를 완료해야 한다.</td>
            </tr>
          </tbody>
        </table>
      `
        }
    ]
};
