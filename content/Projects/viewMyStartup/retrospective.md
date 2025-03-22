---
title: 개발 문제 해결 과정
type: retrospective
project: viewMyStartup
date: 2025-08-21
lastmod: 2025-03-19
tags:
  - retrospective
  - KPT
duration:
  start: YYYY-MM-DD
  end: YYYY-MM-DD
enableToc: true
imageNameKey: viewMyStartup
---

## 첫 팀 프로젝트 회고록 (View My Startup)

문제점 단위로 3주간 노트했던것을 정리해봤습니다. 개발적 이슈 외, 팀 협업에서 팀 소통과 본딩이 중요 하다는것을 다시 한번 깨달았습니다. 여러시각을 가진 사람들이 팀으로 같은 방향을 바라보고 같은 페이지에 있다는게 핵심이였던것 같습니다. 결과의 성취보다 과정에서 즐겁게 같이 배운다는 느낌이 가장 보람찼던 경험이였습니다.

### Week 1 회고록

## **회고록**

### **문제: BigInt Type 직렬화**

- 프로젝트 진행 중, BigInt 타입을 JSON으로 직렬화할 때 `TypeError: Do not know how to serialize a BigInt`라는 에러가 발생함.
- JavaScript에서 BigInt 타입을 JSON으로 변환할 때 발생하는 문제.

**해결책**:

- **옵션 1**: 앱 시작 파일 (`app.js`)에서 BigInt를 문자열로 변환

  ```jsx
  javascriptCopy code
  BigInt.prototype.toJSON = function () {
    return { $bigint: this.toString() };
  };

  ```

  [MDN: 참고 링크](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json)

- **옵션 2**: Prisma에서 BigInt 타입을 문자열로 변환하는 방법

  ```jsx
  javascriptCopy code
  JSON.stringify(
    this,
    (key, value) => (typeof value === 'bigint' ? value.toString() : value)
  );

  ```

  [Prisma: 참고 링크](https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#serializing-bigint)

**다른 문제점**:

- BigInt 값을 문자열로 먼저 변환하면 숫자로 정렬할 때 문제가 생김. 정렬 후에 문자열로 변환하여 응답을 보내는 방식으로 해결함.

**해결 방법**:

- **옵션 1**: `map`을 사용하여 BigInt 타입에 `toString()` 적용

  ```jsx
  javascriptCopy code
  const bigIntToString = companies.map((company) => ({
    ...company,
    actualInvestment: company.actualInvestment.toString(),
    revenue: company.revenue.toString(),
  }));

  ```

- **옵션 2**: `JSON.stringify` -> `JSON.parse` 방식 사용

  ```jsx
  javascriptCopy code
  function bigIntToString(data) {
    return JSON.stringify(data, (key, value) => {
      return typeof value === "bigint" ? value.toString() : value;
    });
  }

  const parsedResult = JSON.parse(bigIntToString(company));
  res.send(parsedResult);

  ```

- **결과**:
  - `JSON.stringify`만 사용할 경우, 응답의 Content-Type이 `text/html`로 설정되는 문제가 있어 이를 다시 `JSON.parse`로 처리하여 문제를 해결함.
  - 하지만 두 번 연산하는 것이 비효율적이라고 판단하여, `map`을 사용하는 방법을 선택함.
  - `JSON.stringify`를 사용하는 함수에서는 `res.setHeader("Content-Type", "application/json");`로 설정하여 `parse`를 사용하지 않아도 되도록 조정함.

---

### **문제: 테이블의 내용 줄임 표시 (ellipsis)**

- 테이블에서 2줄 이상의 내용을 줄임 표시(`...`)로 나타내야 하는 문제 발생.

**해결책**:

- CSS를 사용하여 줄임 표시를 구현함.

  ```css
  cssCopy code .TableRow .description {
    max-width: 301px;
    width: 100%;
  }

  .TableRow .description span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }
  ```

- **결과**:

  - `line-clamp`를 사용하기 위해서는 블록 레벨 요소가 필요하므로, 이를 위해 `td` 내에 `span`으로 감싸서 문제를 해결함.
  - **추가 설정**:이 두 가지 속성을 함께 사용하여 `ellipsis`를 정상적으로 적용함.

    ```css
    cssCopy code
    overflow: hidden;
    white-space: nowrap;

    ```

---

### **문제: 테이블의 첫 번째 컬럼이 타블렛 사이즈에서 `display: none`이 되며, `border-radius`도 사라짐**

- 타블렛 사이즈에서 테이블의 첫 번째 컬럼이 `display: none`으로 처리될 때, 테이블의 `border-radius`가 사라지는 문제 발생.

**해결책**:

- 테이블 `thead`와 `tbody`에 `border-radius`를 적용

  ```css
  cssCopy code .Table thead tr th:first-child {
    border-bottom-left-radius: 4px;
  }

  .Table thead tr th:last-child {
    border-bottom-right-radius: 4px;
  }

  .Table tbody tr:first-child td:first-child {
    border-top-left-radius: 4px;
  }

  .Table tbody tr:first-child td:last-child {
    border-top-right-radius: 4px;
  }
  ```

---

### **문제: Pagination 요구사항 불일치**

- 요구사항에서는 커서 기반 페이지네이션을 요구되었지만 디자인은 오프셋 기반으 최적화로 되어 있었음. 이로 인해 구현 방법에 대한 고민이 필요했음.

**해결책**:

- **토론 후 결론**:
  - 오프셋 기반 페이지네이션으로 변경함. 커서 기반의 장점이 명확하지 않았고, 디자인과의 일관성을 유지하기 위해 이 방식을 선택함.
  - 만약 커서 기반을 유지할 경우, 미리 서버에서 5개 페이지 수만큼의 데이터를 조회해 커서 ID 배열을 제공해야 했기 때문에, 커서 기반의 메리트가 없다는 결론에 도달함.

---

### 회고록 - Week 2

이번 주에는 테이블, 드롭다운 버튼, 페이지네이션을 공통 컴포넌트로 만드는 작업을 진행했음. 작업 중 여러 문제에 직면했지만, 이를 해결하면서 많은 것을 배움.
리스트로 하기보단 table이 . 더 시맨틱 했기 때문에 테이블로 공통 컴포넌트화 작업함.

### 문제 1: 테이블 컴포넌트화의 어려움

각 테이블마다 필요한 필드와 렌더링 방식이 달라 공통 컴포넌트로 구현하는 것이 까다로웠음.

**해결책**:

- **유연한 렌더링 방식 도입**:필드 종류에 따라 유연하게 렌더링할 수 있도록 설계해 다양한 테이블 구조를 지원함.
- **Table 컴포넌트**:`list`와 `tableHeaders`를 받아 동적으로 테이블을 생성하도록 설계함. 데이터 유효성 검사를 통해 `list` 가 없거나 잘못된 형식의 데이터를 처리하고, `tableHeaders`를 기반으로 `thead`와 `tbody`를 생성함. 각 셀은 `TableData` 컴포넌트를 통해 필드별로 다른 스타일과 기능을 지원하도록 했음.
- **TableData 컴포넌트**:각 셀의 데이터를 렌더링하며, `header`와 `item`을 받아 필드에 따라 적절한 렌더링을 수행함. 예를 들어, 기업명 필드는 로고와 링크를 표시하고, 투자 금액 필드는 포맷 변환을 적용함.
- **ColGroup 컴포넌트**:테이블 컬럼의 너비를 설정하는 역할을 함. `columns`를 받아 특정 필드는 고정 너비로, 나머지는 공통 너비로 설정해 일관된 레이아웃을 유지함.

**개선점**:

- `PropTypes`를 활용해 타입 체크를 강화할 필요가 있음.
- React-table 같은 라이브러리를 사용하는 것도 좋은 방법이라고 생각했음.

### 문제 2: 드롭다운 버튼의 공통화

드롭다운 버튼을 누를 때, 각 버튼에 맞는 정렬된 데이터를 API로부터 Fetch해야 했음. 이 과정에서 다양한 드롭다운 버튼이 존재하는데, 이들을 각각 공통 컴포넌트로 관리하면서도 각기 다른 동작을 수행하도록 구현하는 것이 도전이었음.

**해결책**:

- **드롭다운 버튼 컴포넌트화**:
  테이블 컴포넌트에서 했던 것처럼, 필요한 3개의 버튼을 객체(`value`, `label`)로 정의하고, `props`로 버튼 타입(`buttonType`), 정렬 기준(`orderBy`), 정렬 상태 업데이트 함수(`setOrderBy`)를 받아 각 버튼이 고유의 동작을 수행하도록 설계함.
  - **정렬 상태 관리**:`sortBy`와 `order` 두 가지 쿼리 파라미터를 `orderBy`라는 단일 상태로 관리함. 예를 들어, `orderBy` 상태를 `"sort-by_order"` 형식으로 업데이트하여, API 호출 시 이 값을 `split`하여 `sortBy`와 `order`로 분리해 사용하도록 함.

### 문제 3: 페이지네이션에서 무한 루프 문제

### 문제점:

페이지네이션 구현 과정에서 부모 컴포넌트 함수에서 `totalPages`를 계산한 후 페이지네이션 컴포넌트에 내려줄 때 무한 루프 API 호출이 발생했음.

`queryParams` state에서 `totalPages`를 같이 관리하면서, 이 값이 변경될 때마다 `init` 함수가 다시 실행돼, API 호출이 반복되는 무한 루프 상황이 발생했음.

### 해결책:

`totalPages` 값이 변경될 때만 상태를 업데이트하도록 조건문을 추가해 무한 루프 문제를 해결함. 새로운 `totalPages` 값을 기존 값과 비교해 다를 경우에만 상태를 업데이트하도록 함.

---

### **문제 4: 가로 스크롤바 커스텀 디자인**

- **상황 설명**:
  - 크롬에서는 커스텀 스크롤바 디자인이 잘 적용되었으나, 파이어폭스에서는 적용되지 않는 문제가 발생함.
  - 파이어폭스를 위한 CSS 코드(`scrollbar-width` 및 `scrollbar-color`)를 추가하였으나, 이로 인해 크롬의 스크롤바 디자인이 깨지는 현상이 발생.

**해결책**:

- **파이어폭스 전용 스타일링**:
  - 파이어폭스의 경우 `@supports`를 사용하여 특정 CSS 속성 지원 여부를 확인한 뒤, 해당 속성을 적용함으로써 문제를 해결하려고 했으나, 크롬에서도 이 코드가 영향을 미치면서 디자인이 깨짐.
- **대안**:
  - 브라우저별로 별도의 CSS 파일을 로드하거나, 특정 클래스명을 사용하여 브라우저에 따라 다른 스타일을 적용하도록 수정.

---

### **문제 5: Loader 애니메이션 만들기**

- **상황 설명**:
  - 커스텀 훅을 사용하여 `load`, `error`, `api call` 함수를 생성하는 과정에서 어려움을 겪음. 이해하는데 시간이 많이 소요 되었음.
  - CSS 애니메이션 구현 시, 로고의 `i`의 head 부분만 바운스되도록 애니메이션을 적용하려 했으나, 화면 너비가 바뀌면 원하는 위치에 정확히 맞추기 어려움.

![[attachments/viewMyStartup-retrospective.png]]

**해결책**:

- **i의 head 부분 바운스 애니메이션**:
  - SVG에서 `i`의 head 부분을 지우고, 동일한 원형을 `div`로 만들어 애니메이션을 적용함.
  - `calc()` 함수를 사용하여 부모 요소의 절반을 기준으로 원형을 이동시킴으로써 화면 비율이 변경되어도 위치가 고정되도록 조정.

```css
left: calc(50% - 75px);

top: calc(50% - 35px);
```

---

### **문제 6: 브랜드 이미지가 없을 때 사용할 디폴트 UI 생성 (LogoImg 컴포넌트)**

- **상황**: 브랜드 이미지가 없는 경우, 해당 브랜드를 대표할 UI를 생성해야 했음. 이를 위해, 배경색을 랜덤으로 생성하고 그 위에 브랜드 이니셜을 표시하는 방식을 고려함.
- **문제**: 배경색을 랜덤으로 생성할 때, 밝은 색상이 선택되면 이니셜 텍스트(하얀색)가 잘 보이지 않는 상황이 발생함.

### **2. 초기 접근 방법:**

- **랜덤 색상 생성**: 먼저, 랜덤으로 HEX 색상 코드를 생성하는 방법을 사용함. 이를 통해 다양한 배경색을 쉽게 구현할 수 있었음.
  - 참고 자료:
    - [Random HEX Color Code Snippets](https://www.paulirish.com/2009/random-hex-color-code-snippets/)
    - [Generate Random HEX Color in JavaScript](https://dev.to/thecodepixi/what-the-hex-how-to-generate-random-hex-color-codes-in-javascript-21n)
- **Contrast Ratio 계산**: 배경색이 밝을 때 텍스트의 가독성을 위해, `Relative Luminance`를 사용해 텍스트와 배경 사이의 대비를 계산함. Luminance 계산을 위해 HEX에서 RGB로 색상 생성하는것으로 바꿈
  - **기존 공식**:
    - `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`
    - 이 공식을 사용하여 배경과 텍스트 색상의 밝기를 계산한 후, 대비 비율을 다음과 같이 구함: ContrastRatio=L2+0.05L1+0.05
      ContrastRatio=L1+0.05L2+0.05Contrast Ratio = \frac{L1 + 0.05}{L2 + 0.05}
    - 그러나, 이 방법이 실제 사용자 경험과 일치하지 않는 문제를 발견함. 포뮬라 이론상 W3 기준 4.5:1 대비 비율에 만족하지만, 실제로는 텍스트가 잘 보이지 않는 경우가 있었음. 알고보니 outdated된 포뮬라였음.

### **3. 새로운 접근법:**

- **문제**: 기존 `Relative Luminance` 기반 대비 계산 공식은 실제 사용자의 시각적 인지와 일치하지 않았음. 특히, 밝은 배경과 어두운 텍스트 조합에서 이러한 문제가 더 두드러졌음.
- **새로운 접근법**: 더 정확한 대비 계산을 위해 `Advanced Perceptual Contrast Algorithm (APCA)`를 써야 한다함
  - **APCA**:
    - **설명**: APCA는 기존 대비 계산 방식과 달리, 글꼴 크기, 굵기, 색상 조합 등을 고려하여 더 현실적인 대비를 계산함.
    - **공식**: APCA는 색상의 밝기를 지수 함수로 변환하여 더 정확한 대비를 계산하며, 텍스트 크기와 굵기에 따라 요구되는 대비 수준을 동적으로 조정함.
    - **참고 자료**: [APCA 설명 및 구현](https://www.w3.org/WAI/GL/task-forces/silver/wiki/User:Myndex/APCA_model) (계산식)
    - 일단 여기서 이거 하나 구현하는데 함수를 너무 많이 사용하고 집착하는거 같아서 살짝 식음..(너무 복잡해서 사용에 부담느낌)

### **4. 문제 해결 및 한계:**

- **최종 해결책**:
  - 생각해보니 어차피 테이블이 재 랜더링 될때 무작위로 또 배경색이 부여되서 디자인 일관성이 사라짐.
  - **데이터베이스 수정**: 이를 해결하기 위해, 팀 회의후 데이터베이스에 `brandColor` 필드를 추가하여, `brandImage`가 없는 경우 brandColor를 사용해서 디폴트 로고를 만들기로 함.
  - brandColor enum(6종류의 색상)으로 mockup seeding 할때 랜덤으로 색상 넣어줌.
  - **Contrast Ratio 확인**: 어도비 색상대비 툴 사용해 주어진 배경색상에 최소 8:1의 대비를 되는 색상을 골라 프론트에서 텍스트 색상을 매칭해줌.

### **5. 개선점 및 향후 계획:**

- **해쉬 함수 사용**: 해쉬 함수를 사용하여 입력값에 따라 일관된 배경색을 생성하는 방법을 추천받음. 이렇게 하면 백엔드 수정 없이도 일관된 배경색을 유지할 수 있다함.
  - 개선및 하고싶은점: 연습으로, APCA 포뮬라를 사용해 랜덤 배경색을 지정하고, 그 배경색과 대비되는 텍스트 색상을 부여하는 기능을 구현해보고 싶음. 원래는 배경색의 베이스 컬러가 섞인 대비되는 텍스트 색상을 자동으로 생성하고 싶음.

## 프로젝트 회고 마무리

이번 프로젝트를 통해 백엔드와 프론트엔드 영역에서 모두 의미 있는 성장을 경험할 수 있었다.

**백엔드 개발**
백엔드 작업에서는 이전에 학습한 CRUD 기능을 실제로 적용하며 지식을 공고히 할 수 있었고 특히 페이지네이션 구현 과정에서 offset 기반과 cursor 기반 디자인의 차이점과 각각의 적합한 사용 상황에 대한 이해도를 높일 수 있었다. 이론적으로만 알고 있던 내용을 실제 프로젝트에 적용해보며 더욱 깊이 이해할수 있었다.

**프론트엔드 개발**
프론트엔드 개발에서는 공통 컴포넌트화 작업에 많은 시간과 노력을 했다. 이 과정에서 가장 중요했던 고민은 "컴포넌트의 자율성과 유연성의 균형"이었다. 어느 수준까지의 기능을 컴포넌트 내부에 포함시킬지, 그리고 어떤 부분을 외부에서 제어할 수 있도록 설계할지에 대한 깊은 고민을 통해 재사용성과 유지보수성이 높은 컴포넌트를 개발할 수 있었다.

**배운 점**
이번 프로젝트를 하면서 모듈화와 재사용 가능한 로직이 얼마나 중요한지 뼈저리게 느꼈다. 처음에는 급한 마음에 기능 구현에만 집중했는데, 나중에 코드를 정리하고 컴포넌트를 분리하면서 이게 얼마나 시간을 절약해주는지 직접 체감했다.

특히 공통 컴포넌트를 만들 때는 다른 개발자들도 사용할 거라는 생각으로 좀 더 신경 썼다. "이 코드를 처음 보는 사람이 이해할 수 있을까?"라는 질문을 계속 던지면서 주석도 꼼꼼히 달고, 함수명도 더 직관적으로 짓기 위해 노력했다. 물론 어떤 사람들은 주석이 많은 코드가 나쁜 코드라고 하지만... 완벽한 코드를 짤 수 있을 때까지는 설명이 필요하다고 생각한다. 나도 아직 배울 게 많으니까.

이번에 얻은 경험을 바탕으로 앞으로는 처음부터 구조를 좀 더 체계적으로 잡고 시작해야겠다. 나중에 리팩토링하는 것보다 처음부터 잘 설계하는 게 결국 더 빠르다는 걸 몸소 깨달았다. 다음 프로젝트에서는 더 효율적이고 유지보수하기 좋은 코드를 위해 초반 설계에 더 많은 시간을 투자해야겠다.

### 관련 노트

- [[view my startup 회고]]
