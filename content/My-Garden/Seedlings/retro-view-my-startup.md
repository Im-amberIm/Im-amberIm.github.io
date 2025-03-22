---
title: 개발 과정 중 직면한 문제 정리
description:
stage: seedling
date: 2025-08-10
lastmod: 2025-03-19
tags:
  - seedling
category:
enableToc: true
type: note
imageNameKey: Seedlings
---

# 초급 프로젝트 회고록

## Week 1

### 문제: BigInt Type 직렬화

`TypeError: Do not know how to serialize a BigInt` 에러 해결

```js
// 방법 1: prototype 확장
BigInt.prototype.toJSON = function () {
  return { $bigint: this.toString() }
}

// 방법 2: stringify replacer 사용
function bigIntToString(data) {
  return JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  )
}

// 방법 3: map으로 직접 변환 (최종 채택)
const bigIntToString = companies.map((company) => ({
  ...company,
  actualInvestment: company.actualInvestment.toString(),
  revenue: company.revenue.toString(),
}))
```

- `JSON.stringify`만 사용시 Content-Type이 'text/html'로 설정되는 문제 발견
- 해결책으로 `map` 사용 방식 채택 (가장 직관적이고 효율적)
- 필요한 경우 `res.setHeader("Content-Type", "application/json")` 설정

참고: [MDN BigInt JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json), [Prisma BigInt](https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#serializing-bigint)

### 문제: 테이블 cell에서 ellipsis 적용 안됨

```css
.TableRow .description {
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

- td cell에서 직접 line-clamp가 안되어서 span으로 감싸서 해결함
- `line-clamp`를 사용하기 위해서는 블록 레벨 요소가 필요하므로, 이를 위해 `td` 내에 `span`으로 감싸서 `-webkit-box` 로 문제를 해결함. td는 블록레벨 요소나 -webkit-box같은 레이아웃 모델을 적용할수 없음
- ellipsis 적용을 위해 `overflow: hidden`과 `white-space: nowrap` 필수

### 문제: 테이블 border-radius 이슈

```css
.Table thead tr th:first-child {
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

- 태블릿 사이즈에서 첫 컬럼이 display:none 되면서 border-radius가 사라지는 문제 해결
- thead와 tbody 각각에 border-radius 적용하여 해결

참고: [테이블 z-index](https://m.blog.naver.com/tcloe8/221630141872)

### 문제: 페이지네이션 방식 선택

- 디자인은 offset 기반인데 요구사항은 cursor 기반이라 고민
- 결론: offset 기반으로 변경
  - cursor 기반 유지시 서버에서 5페이지치 데이터 미리 조회 필요
  - 실제 이점이 크지 않아 디자인과의 일관성 선택

## Week 2-3

### 테이블, 드롭다운 버튼, 페이지네이션 공통 컴포넌트화

#### 고민

각 테이블마다 필요한 필드가 다르고 렌더방식도 상이함

#### 해결

각 필드를 체크해서 필드종류에 따라 유연하게 렌더링 하는 방식으로 접근.

- **Table 컴포넌트**

  - **기능**: 테이블의 전반적인 구조를 담당하며, `list`와 `tableHeaders`를 받아 동적으로 테이블을 생성.
  - **설계 요소**: 데이터 유효성 검사를 통해 리스트가 없거나 잘못된 형식의 데이터를 처리. `tableHeaders`를 기반으로 `thead`와 `tbody`를 생성하여 각 셀은 `TableData`로 렌더링, 필드별로 다른 스타일과 기능을 지원.

- **TableData 컴포넌트**

  - **기능**: 각 셀의 데이터를 렌더링하며, `header`와 `item`을 받아 특정 필드에 따라 적절한 렌더링 수행.
  - **설계 요소**: `renderTableData` 함수를 사용해 필드별 스타일과 기능을 조건부로 렌더링. 예를 들어, 기업명 필드는 로고와 링크를 표시하고, 투자 금액 필드는 포맷 변환을 적용.

- **ColGroup 컴포넌트**
  - **기능**: 테이블 컬럼의 너비를 설정.
  - **설계 요소**: `columns`를 받아 특정 필드는 고정 너비, 나머지는 공통 너비로 설정하여 일관된 레이아웃 유지.

개선점: propsType 같은걸로 type check 하는것도 좋아보임.
아니면 React-table 같은 라이브러리 쓰는것도 좋아보임

### 드롭다운 버튼 컴포넌트화

**문제점**:  
드롭다운 버튼을 누를 때, 각 버튼에 맞는 정렬된 데이터를 API로부터 Fetch해야 했음. 이 과정에서 다양한 드롭다운 버튼이 존재하는데, 이들을 각각 공통 컴포넌트로 관리하면서도 각기 다른 동작을 수행하도록 구현하는 것이 도전이었음.

**해결책**:

- 테이블 컴포넌트에서 했던 것처럼, 필요한 3개의 버튼을 객체(`value`, `label`)로 정의하고, `props`로 버튼 타입(`buttonType`), 정렬 기준(`orderBy`), 정렬 상태 업데이트 함수(`setOrderBy`)를 받아 각 버튼이 고유의 동작을 수행하도록 설계함.
  - **정렬 상태 관리**:  
     `sortBy`와 `order` 두 가지 쿼리 파라미터를 `orderBy`라는 단일 상태로 관리함. 예를 들어, `orderBy` 상태를 `"sort-by_order"` 형식으로 업데이트하여, API 호출 시 이 값을 `split`하여 `sortBy`와 `order`로 분리해 사용하도록 함.

### 페이지네이션

**문제점**:  
페이지네이션을 위해 response에 totalCount를 받아 totalPages를 계산후 페이지네이션 컴포넌트에 내려줘야 하는데, 이때 query를 한 state에 관리 하다보니 api 호출함수에서 무한루프 api 호출이 발생함

**해결책**: 조건문을 달아 totalPages가 바뀔때만 렌더링 되게 바꿈.

### 문제: 가로 스크롤바 커스텀 디자인

참고자료: [스크롤 바(Scrollbar) 스타일링](https://inpa.tistory.com/entry/CSS-%F0%9F%8C%9F-%EC%8A%A4%ED%81%AC%EB%A1%A4-%EB%B0%94Scrollbar-%EA%BE%B8%EB%AF%B8%EA%B8%B0-%EC%86%8D%EC%84%B1-%EC%B4%9D%EC%A0%95%EB%A6%AC)

- 크롬에서는 커스텀 스크롤바 디자인이 잘 적용되었으나, 파이어폭스에서는 적용되지 않는 문제가 발생함
- 파이어폭스를 위한 CSS 코드(`scrollbar-width` 및 `scrollbar-color`)를 추가하였으나, 이로 인해 크롬의 스크롤바 디자인이 깨지는 현상이 발생
- 파이어폭스의 경우 `@supports`를 사용하여 특정 CSS 속성 지원 여부를 확인한 뒤, 해당 속성을 적용함으로써 문제를 해결하려고 했으나, 크롬에서도 이 코드가 영향을 미치면서 디자인이 깨짐
- 브라우저별로 별도의 CSS 파일을 로드하거나, 특정 클래스명을 사용하여 브라우저에 따라 다른 스타일을 적용해야할듯. 그런데 firefox 호환까지는 생각안해도 된다 하셔서 그냥 무시하기로 함

### 문제: Loader 애니매이션 만들기

CSS animation 구현에서 어려움을 겪음:

- view 에서 i 의 head 부분만 바운스되게 애니매이션 하고 싶음
- 해결: 로고 svg에서 i의 head 부분을 지움
- div 로 같은 원형을 만들어서 바운스 되게 애니매이션 줌

문제: vw, vh을 하니까 너비를 줄였을때 점이 i의 레터에서 시작하지 않음

또는 위키링크 시도:
![[/My Garden/🌱_Seedlings/attachments/Seedlings-회고.png]]

#### 해결: calc()

> calc() 함수 사용해서 부모 요소의 절반 기준으로 이동시키게 조정

화면 비율이 변경되도 고정 픽셀값을 넣어줘서 원하는 위치에 dot을 넣음

```css
left: calc(50% - 75px);
top: calc(50% - 35px);
```

### 문제: 브랜드 이미지 없을때 사용할 디폴트 UI (배경과 이니셜) 생성

#### 문제 상황

회사 브랜드 이미지가 없는 경우 이니셜을 보여주는 디폴트 UI를 만들어야 했습니다. 배경색과 텍스트 색상의 대비가 중요했습니다.

#### 시도 1: 랜덤 색상 생성 + 색상 대비 비율 계산

**접근 방법:**

1. 배경에 랜덤 HEX 코드 색상 생성
2. 대비 계산을 통해 적절한 텍스트 색상 결정

**참고 자료:**

- [Random HEX Color Code Snippets](https://www.paulirish.com/2009/random-hex-color-code-snippets/)
- [Generate Random HEX Color in JavaScript](https://dev.to/thecodepixi/what-the-hex-how-to-generate-random-hex-color-codes-in-javascript-21n)

**문제점:** 배경이 밝은 경우 기본 하얀색 텍스트가 잘 보이지 않음

#### 시도 2: Relative Luminance 계산을 통한 대비 개선

**참고 자료:**

- [Relative Luminance](https://www.w3.org/WAI/GL/wiki/Relative_luminance)
- [Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Contrast Techniques](https://www.w3.org/WAI/WCAG21/Techniques/general/G145)
- [Realities and Myths of Contrast and Color](https://www.smashingmagazine.com/2022/09/realities-myths-contrast-color/)

**계산 방식:**

```
1. Relative luminance 공식:
   L = 0.2126 * R + 0.7152 * G + 0.0722 * B

   여기서 R, G, B는:
   - R sRGB <= 0.04045 ? R = R sRGB /12.92 : R = ((R sRGB +0.055)/1.055) ^ 2.4
   - G sRGB <= 0.04045 ? G = G sRGB /12.92 : G = ((G sRGB +0.055)/1.055) ^ 2.4
   - B sRGB <= 0.04045 ? B = B sRGB /12.92 : B = ((B sRGB +0.055)/1.055) ^ 2.4

   그리고 R sRGB, G sRGB, B sRGB는:
   - R sRGB = R 8bit /255
   - G sRGB = G 8bit /255
   - B sRGB = B 8bit /255

2. 대비 비율 계산:
   (L1 + 0.05) / (L2 + 0.05)

   L1 = 밝은 색상의 상대 휘도
   L2 = 어두운 색상의 상대 휘도

3. 대비 비율 최소 기준: 3:1 이상

* 휘도 임계값: 0.179 (어두운/밝은 색상 판단 기준)
```

**문제점:**

- 계산식대로 구현했는데 실제 눈으로 볼 때는 대비가 부족함
- W3C 기준을 충족해도 사용자 경험이 좋지 않음
- 알고보니 오래된 공식(outdated formula)이었음

#### 시도 3: APCA(Advanced Perceptual Contrast Algorithm) 적용

최신 APCA 공식을 찾아 적용하려 했으나, 구현 복잡도가 높고 더 근본적인 문제 발견!

- 프론트엔드에서 브랜드 색을 랜덤 생성시 페이지 리로드나 페이지 이동하면 일관성 없이 브랜드 배경색이 계속 바뀜.

#### 최종 해결책: 데이터베이스에 색상 저장

**구현 방법:**

1. 데이터베이스의 `Company` 모델에 `brandColor` 필드 추가 (enum 타입)
2. `brandImage`가 없는 경우 `brandColor`를 사용해 일관된 배경색 적용
3. 시각적으로 검증된 6가지 색상 조합을 미리 정의
4. 각 배경색에 맞는 텍스트 색상을 최소 8:1 대비 비율로 매칭
   [Adobe color contrast checker](https://color.adobe.com/create/color-contrast-analyzer)

**seeding 전략:**

- 테스트 데이터 생성시 6가지 색상 중 랜덤 할당
- 실제 사용자는 동일한 brandColor 값 유지로 일관성 확보

**결과:**

- 사용자 경험 개선: 일관된 브랜드 아이덴티티 유지
- 접근성 향상: 모든 색상 조합이 8:1 이상의 높은 대비 비율 보장
- 어도비 색상 대비 툴로 검증된 색상 조합 사용

#### 개선 및 학습 포인트

1. **해시 함수 활용:** 회사명에서 일관된 해시값을 생성해 색상으로 변환하면 데이터베이스 변경 없이 일관성 유지 가능
2. **개인 실습 아이디어:**
   - 해시 함수로 일관된 랜덤 색상 생성
   - APCA 알고리즘 구현해보기
   - 배경색에서 파생된 조화로운 대비 색상 자동 생성 기능

이 경험을 통해 접근성과 사용자 경험 측면에서 색상 대비의 중요성을 깊이 이해하게 되었습니다.

### 문제: 모달 리렌더링 이슈

- React의 `key` 속성을 이용해 모달이 리렌더링될 때 새로운 컴포넌트로 인식되도록 시도했지만, 근본적인 문제를 해결하지 못했음. 특히, 순위가 내려갈 때 발생하는 특이한 문제는 여전히 존재했음
- 모달을 부모 컴포넌트에서 상태로 관리하여 props로 전달하는 방식도 고려했음. 그러나 **모달을 부모 컴포넌트에서 내려주는 방식은 드릴링이 심해지는 문제**가 있었음. 이로 인해 코드 복잡성이 증가하고, 유지보수성이 떨어질 우려가 있었음

## 📝 연관 노트
