// Constraints Classification Data
export const constraintsData = {
    title: '🔒 제약 조건',
    icon: '🔒',
    sections: [
        {
            title: '🔵 정의 및 목적',
            color: 'blue',
            content: `
        <p>시스템 자체, 그 설계 또는 구현, 혹은 시스템을 개발하거나 수정하는 데 사용되는 프로세스에 <strong>외부적으로 부과된 제한사항</strong>을 의미한다. 즉, 시스템이 어떻게 만들어져야 하는지를 외부 요인에 의해 강제로 제한하거나 규정하는 조건이다.</p>
        <p><strong>목적:</strong></p>
        <ul>
          <li>설계의 자유도를 제한하여 시스템 개발의 방향성을 명확히 함</li>
          <li>법적, 기술적, 관리적 요건의 준수를 보장함</li>
          <li>프로젝트, 비즈니스, 운영 단계에서 발생 가능한 리스크를 예방함</li>
        </ul>
      `
        },
        {
            title: '🟢 제약사항 특징',
            color: 'green',
            content: `
        <ul>
          <li><strong>외부 요인에 의해 부과됨:</strong> 제약사항은 개발자 내부 결정이 아닌, 법규·표준·계약·정책·기술 환경 등 외부 요구로부터 발생한다.</li>
          <li><strong>설계의 자유도 제한:</strong> 시스템이 사용할 기술, 방법, 절차를 명시함으로써 설계 및 구현의 선택 범위를 제한한다.</li>
          <li><strong>근거 기반 요구사항:</strong> 각 제약은 반드시 근거(Source)를 가져야 하며, 법규·표준·계약·고객 요구 등으로부터 도출된다.</li>
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
              <th>제약사항 유형</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CON-001</td>
              <td>CE 인증 및 EMC 규격을 준수해야 한다.</td>
              <td>Business Operational</td>
            </tr>
            <tr>
              <td>CON-002</td>
              <td>C++17, AUTOSAR Adaptive 기반으로 개발해야 한다.</td>
              <td>Project</td>
            </tr>
            <tr>
              <td>CON-003</td>
              <td>온도 -40°C~85°C에서 정상 동작해야 한다.</td>
              <td>Operational</td>
            </tr>
          </tbody>
        </table>
      `
        }
    ]
};
