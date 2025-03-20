---
title: svg-in-js 피해야 하는 이유
description: SVG를 JavaScript 번들에 포함시키는 방식의 문제점과 대안 및 최적화 기법
stage: seedling
date: 2024-10-22
lastmod: 2025-03-18
tags:
  - seedling
  - SVG
  - 성능최적화
  - 프론트엔드
  - 웹성능
category: 웹 개발
enableToc: true
type: note
---

# svg-in-js 피해야 하는 이유

## 💡 발견

> 배경

Next에서 `<Image>`이미지 태그로 사용한 svg를 동적으로 색상변경을 하고 싶어 검색하다 svgr이나 다른 라이브러리로 svg를 리액트에서 컴포넌트화해
쉽게 사용할수 있는걸 보았다.

(예시)

```jsx
// HeartIcon.svg 파일을 React 컴포넌트로 가져옴
import HeartIcon from "./HeartIcon.svg"
const App = () => <HeartIcon fill="red" />
```

그러나 리서치 도중, 이렇게 svg를 컴포넌트로 사용할 경우 자바스크립틑 소스 코드내 포함되어 JS 번들 크기를 키운다는 글을 보았다.

이렇게 사용하면 개발자는 편하지만, **JavaScript 번들 크기 증가**, **파싱 및 컴파일 오버헤드**, **메모리 사양 증가 등**으로 사용자를 불편하게 하는 방식인 것이다.

## 🔍 Research 문제 분석

### 1. SVG-in-JS의 주요 문제점!

- JavaScript 파싱 및 컴파일은 무료가 아님 - 번들 크기가 클수록 JavaScript 엔진이 소스 코드를 처리하는 시간이 길어짐
- 성능 테스트에서 6KB 크기의 SVG 아이콘이 JavaScript 번들로 변환될 때 약 24KB로 크기가 증가
- 바이트 단위로, JavaScript는 동일한 크기의 이미지나 웹 폰트보다 브라우저가 처리하는 데 더 많은 비용이 듬
- 고성능 장치에서는 그 차이가 분명하지 않을 수 있지만, 전 세계 사용자의 75%는 Samsung Galaxy A50이나 Nokia G11과 같은 중저가 기기를 사용
- 웹 개발은 모든 사용자에게 포용적이어야 함 - 부유한 지역의 사용자만을 위한 것이 아님
- SVG는 JavaScript가 아니라 이미지를 설명하는 HTML과 유사한 XML 태그로, JS 번들에서 분리하여 파싱 및 컴파일 단계에서 제외해야 함

### 2. SVG 처리 방식 비교

1. **Image + SVG 방식**: `<img src='icon.svg'>`

   - **장점**: 브라우저 캐싱 활용, HTTP/2에서 효율적 로딩, JS 번들 크기에 영향 없음
   - **단점**: CSS로 내부 스타일링 어려움, 동적 색상 변경 제한적, 각 아이콘마다 HTTP 요청 필요
   - **성능 데이터**: Cloud Four의 테스트에서 300개 아이콘 렌더링 시 가장 빠른 로드 시간을 보임

2. **인라인 SVG 방식**: 직접 SVG 코드를 JSX에 포함

   - **장점**: 즉시 렌더링, CSS 스타일링 용이, JavaScript로 직접 조작 가능
   - **단점**: JS 번들 크기 증가, DOM 요소 증가로 메모리 사용량 증가, 파싱/컴파일 오버헤드
   - **성능 데이터**: 소수의 아이콘만 필요한 경우 합리적이지만, 아이콘 수가 증가할수록 성능이 급격히 저하됨

3. **SVG 스프라이트 방식**: `<use>` 태그로 외부 스프라이트 참조
   - **장점**: 앞선 두 방식의 장점을 모두 가짐, 한 번의 HTTP 요청으로 모든 아이콘 로드, JS 번들 크기에 영향 없음, CSS 스타일링 가능, 브라우저 캐싱 효과적 활용
   - **결론**: 성능과 유연성 모두에서 최적의 방식
   - **성능 데이터**: 많은 아이콘을 사용할 때 메모리 사용량과 렌더링 성능 면에서 가장 효율적

### 채택한 방식: svg 스프라이트 기법

> 동적 변경 가능 && 한번 로드된 svg 파일로 재사용 가능 (캐싱).

- SVG 스프라이트는 여러 SVG 아이콘을 하나의 파일로 합친후 `<symbol>`과`<use>` 태그로 참조 사용한다.
- 각 아이콘은 `<symbol>` 태그로 정의되고 고유 ID를 가지며, HTML에서는 `<use>` 요소를 통해 참조한다.

이 방법은 옛날 이미지를 스프라이트 해서 쓰던 방식처럼 한 svg 파일에 프로젝트에서 사용되는 모든 아이콘 svg를 넣고 한번에 로드 한 뒤,`<use>`와 <`symbol>`을 사용해서 부분적으로 참조해서 사용하는 방식이다.
이 방식은 img 태그를 사용했을때의 최적화 장점 포함, 동적으로 js 없이 css 스타일도 적용할 수 있다.

**스프라이트 파일 예시**:

```xml
// icon-sprite.svg

<svg xmlns="http://www.w3.org/2000/svg">

 // id로 각 아이콘 이름 부여해 구별
  <symbol id="icon-heart" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </symbol>
  <symbol id="icon-star" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </symbol>
  <!-- 다른 아이콘들 -->
</svg>
```

**코드 내 사용 예시**:

```html
// Component.jsx
<svg width="24" height="24">
  <use href="/assets/icons.svg#icon-heart"></use>
</svg>
```

**세 가지 주요 구현 방법**:

1. **외부 스프라이트 파일**: 별도의 SVG 파일로 저장하고 `<use>` 태그의 `href` 속성으로 참조

   ```html
   <svg><use href="/path/to/sprites.svg#icon-id"></use></svg>
   ```

2. **인라인 스프라이트**: HTML 문서에 스프라이트를 직접 포함시키고 `<use>` 태그로 참조

   ```html
   <svg style="display:none">
     <!-- 여기에 symbol 태그들 -->
   </svg>
   <svg><use href="#icon-id"></use></svg>
   ```

3. **CSS Mask/Background 방식**: SVG를 CSS 마스크나 배경으로 사용
   ```css
   .icon-heart {
     mask-image: url("sprites.svg#icon-heart");
     background-color: currentColor;
   }
   ```

### 🚩 알게된 것

#### 1. svg 동적 스타일링 기법

**CSS 변수를 활용한 동적 스타일링**:

```css
/* 스프라이트 파일 내 SVG 요소 */
<path fill="var(--icon-fill, currentColor)" stroke="var(--icon-stroke, none)" />

/* 사용 시 CSS */
.active-icon {
  --icon-fill: #ff0000;
}
.inactive-icon {
  --icon-fill: #cccccc;
}
```

#### 2. SVG 스프라이트 생성 도구

**자동화 도구**:

- **svg-sprite**: 명령줄 도구로, SVG 파일을 스프라이트로 변환 (+ 후에 사용해보았으나 내 마음대로 커스텀 하기 힘들었음)
- **svg-sprite-loader**: Webpack 로더로, 빌드 프로세스에 통합
- **SVGO**: SVG 최적화 도구, 파일 크기를 크게 줄여줌 (+ 이것도 딱히 최적화 할게 없었는지 변경후 차이가 없었음. 기본 아이콘이라 그런것 같음)

#### 3. 각 기법 성능 테스트

🔗 [해당 아티클 부분](https://cloudfour.com/thinks/svg-icon-stress-test/#methodology)

🔗 [직접 테스트 해볼수 있는 곳](https://unoptimized--svg-icon-stress-test.netlify.app/)

아티클 내 진행한 성능 테스트 결과:

1. **렌더링 시간**:

   - 50개 아이콘: 스프라이트 방식이 SVG-in-JS보다 30% 빠름
   - 300개 아이콘: 스프라이트 방식이 SVG-in-JS보다 최대 4배 빠름

2. **메모리 사용량**:

   - SVG-in-JS: 높은 메모리 사용량 (300개 아이콘에서 약 8MB 추가 사용)
   - 스프라이트: 낮은 메모리 사용량 (300개 아이콘에서 약 2MB 추가 사용)

3. **초기 로드 시간**:
   - SVG-in-JS: 번들 크기 증가로 초기 로드 느림
   - 이미지: 각 이미지마다 HTTP 요청 필요
   - 스프라이트: 단일 HTTP 요청, 캐싱 효과적

#### 5. 실제 프로젝트 적용 시 고려사항

1. **기존 프로젝트 마이그레이션**:

   - 점진적으로 변경 (필요한 부분부터 스프라이트 방식 적용)
   - 기존 SVG 컴포넌트를 스프라이트 버전으로 대체하는 어댑터 패턴 고려

2. **디자인 시스템 통합**:

   - 아이콘 네이밍 규칙 표준화 (이 부분은 이미 svg 컨밴션을 이용해 Image `src`에 넣을 path를 객체로 생성하는 스크립트 사용해서 되어있음)
   - 동적 스타일링을 위한 CSS 변수 시스템 구축
   - 스프라이트 자동 생성 빌드 파이프라인 구축

3. **브라우저 지원 고려**:
   - 외부 SVG 파일 참조는 IE에서 제한적 지원
   - 크로스 오리진 이슈는 CORS 설정 필요
   - CSS Mask 방식은 브라우저 지원 범위 확인 필요

### +추가 (2025)

#### @svg-use 라이브러리

작년말에 릴리즈된 `@svg-use` 라이브러리 발견.
내가 스크립트 짜면서 하려던 스프라이트 접근 방식의 장점을 유지하면서도 React 컴포넌트처럼 사용할 수 있는 방법을 쓸 수 있는 라이브러리가 있네;
(내가 작년에 개발중일때와 겹쳐서 아마 초기단계거나 아직 안나왔었을거라 믿고싶다...🥹)
그래도 직접 짜보면서 공부 했으니 오히려 좋아!

```jsx
// npm install @svg-use

import { useSVG } from "@svg-use"

function App() {
  return <div>{useSVG("/sprites.svg#icon-heart", { fill: "red" })}</div>
}
```

### ⏭ 다음 단계 (What's Next?)

- [x] 현재 프로젝트의 SVG 아이콘 분석 (수, 크기, 사용 패턴)
- [x] SVG 스프라이트 자동 생성 스크립트 작성
- [x] SVG 스프라이트 컴포넌트 설계 (동적 스타일링 지원)
- [x] 성능 테스트 수행 (변경 전/후 비교)

### 📚 References & Resources

- [Breaking Up with SVG-in-JS in 2023 (2023) by Extrem, K.](https://kurtextrem.de/posts/svg-in-js) - Kurt Extrem의 SVG-in-JS 문제점 및 대안 분석
- [2023년 SVG-in-JS와 결별](https://github.com/yeonjuan/dev-blog/blob/master/JavaScript/breaking-up-with-svg-in-js-in-2023.md) - Kurt Extrem 글의 한국어 번역
- [Which SVG technique performs best for way too many icons? (2021) by Stika, T.](https://cloudfour.com/thinks/svg-icon-stress-test/)
- 다양한 SVG 기법의 성능 비교 테스트
- [Introducing @svg-use (2024)](https://fotis.xyz/posts/introducing-svg-use/) - SVG 스프라이트를 React에서 쉽게 사용할 수 있는 새로운 라이브러리 소개
- [SVG Sprite 기법을 사용해 나만의 특별한 Icon 컴포넌트 개발 (2023)](https://velog.io/@adultlee/Svg-sprite-%EA%B8%B0%EB%B2%95%EC%9D%84-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EB%82%B4%EA%B0%80-%EC%89%AC%EC%9A%B4-Icon-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%EA%B0%9C%EB%B0%9C) - SVG 스프라이트를 활용한 React 컴포넌트 구현 사례
- [아이콘으로 SVG 스프라이트를 만드는 방법(2023)](https://hackernoon.com/lang/ko/%EC%95%84%EC%9D%B4%EC%BD%98%EC%9C%BC%EB%A1%9C-svg-%EC%8A%A4%ED%94%84%EB%9D%BC%EC%9D%B4%ED%8A%B8%EB%A5%BC-%EB%A7%8C%EB%93%9C%EB%8A%94-%EB%B0%A9%EB%B2%95) - SVG 스프라이트 생성 방법론

### 📝 연관 노트

- [[SVG 아이콘 최적화 시키기 (feat. sprite)]]
