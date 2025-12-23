// Quality Requirements Classification Data
export const qualityData = {
    title: '⚡ 품질 요구사항',
    icon: '⚡',
    sections: [
        {
            title: '🔵 정의 및 목적',
            color: 'blue',
            content: `
        <p>품질 요구사항은 시스템이 <strong>얼마나 잘(How Well)</strong> 동작해야 하는지를 정의하는 비기능 요구사항(Non-Functional Requirements)이다. 기능 요구사항이 "무엇을 해야 하는가"를 정의한다면, 품질 요구사항은 "그 기능을 얼마나 잘 수행해야 하는가"를 정의한다.</p>
        <p><strong>품질 요구사항의 중요성:</strong></p>
        <p>품질 요구사항이 명확하지 않으면 다음과 같은 문제가 발생한다:</p>
        <ul>
          <li>성능 목표가 불명확할 경우 사용자 기대 미달 가능</li>
          <li>보안 취약점 발생 시 데이터 유출 위험</li>
          <li>유지보수 비용 증가 및 확장성 제약</li>
        </ul>
      `
        },
        {
            title: '🟣 품질 요구사항 분류',
            color: 'purple',
            content: `
        <p style="font-size: 11px; color: #6B778C; margin-bottom: 8px;">※ 자세한 내용은 ISO/IEC/IEEE 25010:2022 Quality Characteristics를 참조</p>
        <table>
          <thead>
            <tr>
              <th>품질 유형</th>
              <th>정의</th>
              <th>예시</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>기능 적합성</td>
              <td>명시된 조건에서 명시된 요구를 만족하는 기능 제공 정도</td>
              <td>ADAS는 차선이탈, 전방 추돌경고, 긴급제동 기능을 모두 포함해야 한다.</td>
            </tr>
            <tr>
              <td>성능 효율성</td>
              <td>명시된 조건에서 사용되는 자원의 양에 대한 성능의 정도</td>
              <td>레이더 데이터 처리 주기는 100ms 이내여야 한다.</td>
            </tr>
            <tr>
              <td>호환성</td>
              <td>다른 제품/시스템과 정보를 교환하고 기능을 수행할 수 있는 정도</td>
              <td>차량 ECU는 ISO 11898 CAN 프로토콜을 따라야 한다.</td>
            </tr>
            <tr>
              <td>신뢰성</td>
              <td>특정 조건에서 특정 기간 동안 기능을 수행하는 정도</td>
              <td>제어 알고리즘은 100시간 연속 운행 시 오류가 발생하지 않아야 한다.</td>
            </tr>
            <tr>
              <td>보안성</td>
              <td>정보와 데이터가 보호되어 권한에 따라 접근과 변경이 가능한 정도</td>
              <td>차량-서버 통신은 TLS 1.3 암호화를 적용해야 한다.</td>
            </tr>
            <tr>
              <td>안전성</td>
              <td>인명·재산·환경에 위해를 주지 않도록 설계된 정도</td>
              <td>센서 오류 발생 시 차량은 자동으로 페일세이프 모드로 전환되어야 한다.</td>
            </tr>
          </tbody>
        </table>
      `
        },
        {
            title: '🟢 작성 원칙',
            color: 'green',
            content: `
        <ul>
          <li>요구사항은 <strong>정량적(Quantifiable)</strong> 조건을 포함해야 한다.</li>
          <li>"shall"을 사용하여 <strong>검증 가능(Verifiable)</strong>하게 기술한다.</li>
          <li>측정 가능한 조건(measurable condition)과 검증 가능성(verifiability)을 포함한다.</li>
        </ul>
      `
        }
    ]
};
