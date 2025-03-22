---
title: svg 아이콘 최적화 시키기 (feat. sprite)
description: svg 아이콘 최적화 시키기
type: function
date: 2024-12-20
lastmod: 2025-03-18
start_date: 
end_date: 
tags:
  - project
tech_stack: 
github: 
live_demo: 
enableToc: true
imageNameKey: "\bDocthru"
draft: false
---

## 배경

정말 간단한 요구사항에서 시작했다. Docthru 프로젝트에서 svg 아이콘이 20-30개 정도 사용되고 있었는데, Next.js 환경에서 이미지 최적화가 필요하다고 느꼈다. 처음에는 당연히 Next의 `<Image>` 컴포넌트를 사용하는 방법도 고려했고, svg 이미지를 동적으로 색상 변경도 하고 싶어서 svgr이나 다른 svg 컴포넌트화 라이브러리를 찾아보고 있었다.

```jsx
// 이런 방식으로 사용하려고 했었다
import HeartIcon from "./HeartIcon.svg"
const App = () => <HeartIcon fill="red" />
```

근데 리서치하는 과정에서 중요한 문제를 발견했다. svg 파일을 이렇게 리액트 컴포넌트로 변환하는 접근법이 사실 JS 번들 크기를 크게 증가시킨다는 것이다. 단순히 "아이콘 쓰는 방법"을 찾던 것에서 "최적화된 아이콘 시스템을 어떻게 구축할까?"라는 더 큰 문제로 확장된 것이다.

## svg-in-js 방식의 문제점

계속 파고들면서 svg-in-js 방식의 구체적인 문제점을 파악했다

1. **번들 크기와 파싱 시간**: JS 번들이 커질수록 브라우저가 파싱하고 실행하는 시간이 길어진다. 이게 성능에 직접적인 영향을 준다.
2. **기기 다양성 고려**: 최신 고성능 기기에서는 차이가 크게 느껴지지 않을 수 있지만, 전 세계 사용자의 75%는 중저가 기기를 사용한다는 통계를 봤다. 우리는 모든 사용자를 배려해야 한다.
3. **잘못된 접근법**: SVG는 본질적으로 이미지를 설명하는 XML 태그인데, 이걸 JavaScript로 처리하는 건 형식에 맞지 않다. 그냥 이미지로 다루는 게 더 자연스럽다.

연관노트: [[My Garden/🌱_Seedlings/svg-in-js ❌|svg-in-js ❌]]

## 대안

1. **Image + SVG 방식** (`<img src='icon.svg'>`):

   - 가장 무난하고 Next의 `<Image>`로 최적화 가능하다
   - 단점: 동적 CSS 스타일링이 어렵고, 매 아이콘마다 HTTP 요청이 발생한다

2. **인라인 SVG 방식** (SVG 코드를 직접 JSX에 포함):

   - 장점: 즉시 렌더링되고 CSS 스타일링 가능하다
   - 단점: 원래 문제였던 JS 번들 크기 증가, DOM 요소 증가로 메모리 성능 저하된다

3. **SVG 스프라이트 방식** (`<use>` 태그로 스프라이트 참조):
   - 장점: 한 번의 HTTP 요청으로 모든 아이콘을 가져오고, CSS 스타일링도 가능하다
   - 장점: 브라우저 캐싱 효과와 JS 번들 크기에 영향을 주지 않는다
   - 결론: 성능과 유연성을 모두 갖춘 최적의 방식이다

## 해결책 구현

이미 프로젝트가 어느정도 진행되었기 때문에 점직적으로 현재 Next의 `<Image>`로 아이콘을 다루는것을 지키며 현재 asset 폴더 구조를 이용해 svg 스프라이트 파일을 생성하는 스크립트를 짰다.

여러번의 고난?이 있었지만 **현재 asset 폴더구조를 이용해 icon과 image 모은 스프라이트 파일 생성** 하고 **동적으로 css를 적용**할수 있는 스크립트를 짤 수 있었다.

### 기술 구현:

1. 속성을 개별적으로 추출하고 기본값을 설정

```js
// 각 SVG 요소에서 기존 스타일 속성 추출

const fillMatch = attributes.match(/\sfill\s*=\s*['"]([^'"]+)['"]/)
const strokeMatch = attributes.match(/\sstroke\s*=\s*['"]([^'"]+)['"]/)
const widthMatch = attributes.match(/\swidth\s*=\s*['"]([^'"]+)['"]/)
const heightMatch = attributes.match(/\sheight\s*=\s*['"]([^'"]+)['"]/)

// 원본 값 저장 및 기본값 설정

const originalFill = fillMatch ? fillMatch[1] : null
const originalStroke = strokeMatch ? strokeMatch[1] : null
const originalWidth = widthMatch ? widthMatch[1] : "24"
const originalHeight = heightMatch ? heightMatch[1] : "24"
```

2. 기존 속성을 완전히 제거한 후 CSS 변수를 사용하여 동적 스타일링이 가능하도록 재구성

```js
// 먼저 기존 속성들을 깔끔하게 제거 (fill, stroke, width, height 제거)
// viewport는 비율을 위해 유지

attributes = attributes.replace(/\sfill\s*=\s*['"][^'"]+['"]/gi, "")
attributes = attributes.replace(/\sstroke\s*=\s*['"][^'"]+['"]/gi, "")
attributes = attributes.replace(/\swidth\s*=\s*['"][^'"]+['"]/gi, "")
attributes = attributes.replace(/\sheight\s*=\s*['"][^'"]+['"]/gi, "")

// 그 다음 CSS 변수와 함께 재구성
let modifiedTag = `<${tag} ${attributes.trim()}`
if (originalFill) modifiedTag += ` fill="var(--${tag}-fill, ${originalFill})"`

if (originalStroke) modifiedTag += ` stroke="var(--${tag}-stroke, ${originalStroke})"`
```

3.  크기 조절 용이하게 고정 크기 제거

```js
// 아이콘 SVG 파일에서 고정 크기 속성 제거 - 동적 크기 조절을 위한 핵심 작업

svgContent = svgContent.replace(/<svg[^>]*\swidth="[^"]*"/gi, "<svg")
svgContent = svgContent.replace(/<svg[^>]*\sheight="[^"]*"/gi, "<svg")
```

4. `<use>`를 사용하기 위해 `<svg>` 태그를 `<symbol>` 태그로 변환 및 각 파일 이름 기반 id 부여

```js
// 고유한 ID 생성 로직
const fileNameWithoutExt = path.basename(file, path.extname(file))
const symbolId = createIdName(fileNameWithoutExt)

// SVG를 Symbol로 변환
svgContent = svgContent
  .replace("<svg", `<symbol id="${symbolId}"`)
  .replace("</svg>", "</symbol>")
  .replace(/\s?xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "")
```

#### 변환 전

```js
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="#000000" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
</svg>
```

#### 변환 후

```js

<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="ic_arrowDown" viewBox="0 0 24 24">
    <path fill="var(--path-fill, #000000)" width="var(--path-width, 24)" height="var(--path-height, 24)" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
  </symbol>
  <!-- 다른 심볼들 -->
</svg>


```

#### SVG `<use>`를 활용한 컴포넌트 추상화.

```js
import cn from "@/utils/clsx"

export default function Svg({
  name,
  width = "24",
  height,
  type = "icon",
  className,
  addName = "",
  style,
}) {
  const calculatedHeight = height || width
  const prefix = type === "icon" ? "ic" : "img"

  return (
    <svg
      width={width}
      height={calculatedHeight}
      className={cn("Svg", className)}
      aria-label={name}
      style={style}
    >
      <use href={`/assets/${type}s_sprite.svg/#${prefix}_${name}`} className={cn(name)} />

      {addName && (
        <use href={`/assets/${type}s_sprite.svg/#${prefix}_${addName}`} className={cn(addName)} />
      )}
    </svg>
  )
}
```

## 활용예시: 피드백 폼에서의 동적 색상 변경

컴포넌트가 조건에 따라 비활성화 상태일때의 색과 활성화 될때의 색 동적으로 표시

```js
// 컴포넌트.js
<Svg name="chatBubbles" className={cn(styles.chatIcon, { [styles.disabled]: disabled })} />
```

```css
// 컴포넌트.module.css

.disabled {
  --path-fill: var(--grey-50); /* 비활성화 상태: 연한 회색 경로 */
  --circle-fill: var(--grey-300); /* 비활성화 상태: 중간 회색 원 */
}
```

### 레이어

한 블로그 [Complete guide to SVG sprites](https://medium.com/@hayavuk/complete-guide-to-svg-sprites-7e202e215d34)에서 sprite내에서 symbol들을 더 잘게 레이어로 쪼개 재사용하는 법을 읽었다.

아이콘 자체로 재사용 하려했지 아이콘 내의 요소들을 또 나눠서 그걸 기반으로 또 사용할 생각을 못했었다.

버튼이 이렇게 비활성화 / 활성화 적용이 되어야 하는데 디자인대로 구현시 안의 화살표와 밖의 원을 서로 다른 색상을 적용을 시켜줘야 되어야했다.![[attachments/Docthru-svg-sprite-method.png]]ㄴ

![[attachments/Docthru-svg-sprite-method-1.png]]
그래서 수동으로 원부분과 화살표 아이콘을 따로 svg 파일로 분리해서 sprite에 넣고
컴포넌트에서 조합을 하였다.

레이어를 쌓아 구현하기 위해 `<Svg>` 컴포넌트를 svg를 한개 더 참조할수 있게 `addName props`를 추가했다

```jsx
// props로 두번째 아이콘을 받으면 생성
{addName &&}
```

디자인 일관성을 위해 아이콘 디자인 내에서 사용되는 요소들이 많아서 figma에서 다 분해후 정리해서 이렇게 레이어 처럼 쓰는것도 괜찮겠다 생각했다. 근데 품이 많이 들고 새 아이콘이 추가될때마다 개발자가 일일히 조합해서 사용하는것 또한 조금은 최적화 되는 성능에 비해 ~~미친짓일지도...~~

### 프로젝트 내 활용 예시: 피드백 폼에서의 동적 색상 변경

```jsx
// FeedbackForm.jsx
export default function FeedbackForm({ id }) {
  // ... 다른 코드 생략 ...

        <button className={s.submitButton} type="submit" disabled={!isValid}>
          <Svg
            addName="arrowDown"  // 첫 번째 아이콘 - 화살표
            name="circle"        // 두 번째 아이콘 - 원
            className="arrowCircle"
            width="40"
          />
        </button>

  // ... 다른 코드 생략 ...
  );
}
```

### CSS로 동적 색상 적용:

```css
/* FeedbackForm.module.css */
.submitButton :global(.arrowCircle .circle) {
  width: 40px;
  height: 40px;
  --circle-fill: var(--brand-black); /* 기본 상태: 검은색 원 */
}

.submitButton :global(.arrowCircle .arrowDown) {
  --path-fill: var(--brand-yellow); /* 기본 상태: 노란색 화살표 */
  transform: scale(0.6);
  transform-origin: center;
}

.submitButton:disabled :global(.arrowCircle .circle) {
  --circle-fill: var(--grey-100); /* 비활성화 상태: 회색 원 */
}

.submitButton:disabled :global(.arrowCircle .arrowDown) {
  --path-fill: var(--grey-50); /* 비활성화 상태: 연한 회색 화살표 */
}
```

## 결과 및 성과

이 SVG 스프라이트 시스템으로 얻은 주요 이점은:

1. **CSS 변수를 통한 동적 스타일링**

   - 컴포넌트 상태에 따라 아이콘 색상 동적 변경 가능하다
   - 호버, 포커스, 비활성화 등 다양한 상태 대응 가능하다
   - 테마 변경에도 유연하게 대응할 수 있다

2. **일관된 아이콘 시스템**

   - 단일 `<Svg>` 컴포넌트로 모든 아이콘 관리한다
   - name 속성만으로 간단하게 아이콘 변경 가능하다
   - 크기, 색상 등 속성을 일관되게 제어할 수 있다

3. **성능 최적화**
   - 스프라이트 방식으로 HTTP 요청 최소화된다
   - JS 번들에 SVG 코드가 포함되지 않는다
   - 브라우저 캐싱 효율 극대화된다

처음에는 단순한 최적화 작업이라고 생각했지만, 결국 사용자 경험과 개발 경험 모두를 크게 향상시키는 프로젝트가 되었다. 단순히 "아이콘을 사용"하는 것에서 "성능과 사용성을 모두 고려한 아이콘 시스템 구축"으로 접근 방식을 바꾸게 되었다.

## 기술적 성과 및 배운 점

1. **웹 성능 최적화**: JavaScript 번들 크기, 파싱/컴파일 시간, 메모리 사용량 등 다양한 측면에서의 성능 최적화 기법 습득
2. **문제 해결 능력**: 성능 문제 식별, 대안 리서치, 솔루션 설계 및 구현의 전체 주기 경험
3. **시스템 설계**: 확장 가능하고 유지보수하기 쉬운 아이콘 시스템 설계
4. **점진적 마이그레이션**: 기존 코드베이스를 유지하면서 새로운 패턴을 도입하는 전략 수립

단순한 이미지 최적화를 넘어, 웹 애플리케이션의 전체적인 성능과 사용자 경험을 고려한 종합적인 문제 해결을 하면서 많이 배울수 있었다.

- [ ] webpack

## 개발 여정

- 🌱 초기 아이디어: [[My-Garden/Seedlings/avoid-svg-in-js|svg-in-js 피해야 하는 이유]]

## 참고자료

- [Breaking Up with SVG-in-JS in 2023 (2023) by Extrem, K.](https://kurtextrem.de/posts/svg-in-js) - Kurt Extrem의 SVG-in-JS 문제점 및 대안 분석
- [2023년 SVG-in-JS와 결별](https://github.com/yeonjuan/dev-blog/blob/master/JavaScript/breaking-up-with-svg-in-js-in-2023.md) - Kurt Extrem 글의 한국어 번역
- [Which SVG technique performs best for way too many icons? (2021) by Stika, T.](https://cloudfour.com/thinks/svg-icon-stress-test/)
- 다양한 SVG 기법의 성능 비교 테스트
- [Introducing @svg-use (2024)](https://fotis.xyz/posts/introducing-svg-use/) - SVG 스프라이트를 React에서 쉽게 사용할 수 있는 새로운 라이브러리 소개
- [SVG Sprite 기법을 사용해 나만의 특별한 Icon 컴포넌트 개발 (2023)](https://velog.io/@adultlee/Svg-sprite-%EA%B8%B0%EB%B2%95%EC%9D%84-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EB%82%B4%EA%B0%80-%EC%89%AC%EC%9A%B4-Icon-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%EA%B0%9C%EB%B0%9C) - SVG 스프라이트를 활용한 React 컴포넌트 구현 사례
- [아이콘으로 SVG 스프라이트를 만드는 방법(2023)](https://hackernoon.com/lang/ko/%EC%95%84%EC%9D%B4%EC%BD%98%EC%9C%BC%EB%A1%9C-svg-%EC%8A%A4%ED%94%84%EB%9D%BC%EC%9D%B4%ED%8A%B8%EB%A5%BC-%EB%A7%8C%EB%93%9C%EB%8A%94-%EB%B0%A9%EB%B2%95) - SVG 스프라이트 생성 방법론
