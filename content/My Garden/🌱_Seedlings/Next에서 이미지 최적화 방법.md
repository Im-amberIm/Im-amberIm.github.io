---
title: Next에서 이미지 최적화 방법
description: Next에서 이미지 최적화 방법
stage: seedling
date: 2024-10-18
lastmod: 2025-03-18
tags:
  - seedling
  - Next
category: 
enableToc: true
type: note
---

# Next에서 이미지 최적화 방법

> Doctru 프로젝트에서 Next 프레임워크를 쓰면서 Next가 가진 이미지 최적화 방법을 최대한 쓸 수 있는 법이 있을까?

-

### 🔍 Research

### 1. Next의 `<Image>` 컴포넌트 사용

브라우저의 크기에 따라 이미지를 최적화하여 보여줌
4000x3000 크기의 이미지를 100x100 크기로 충분하다면?
자동으로 서버에서 크기를 줄여 100x100 크기의 이미지를 보여줌
-> 20배의 용량 절약

엄밀히 말하면 Page Router의 기능은 아니지만, 유용한 최적화 기능임
Layout Shift 최적화를 위해 width와 height를 꼭 지정해야 함
layout shift 사용자 경험에 안좋음(이미지가 로딩중 다른 요소가 그자리에있다가 로딩후 옆 엘리먼트가 밀리는 현상?)

최적화 해주니까 tinypng 이용해서 최적화 굳이 안해줘도 됨

```jsx
import Image from "next/image"

function MyComponent() {
  return <Image src="/images/profile.jpg" alt="Picture of the author" width={500} height={500} />
}
```

#### Image 컴포넌트의 특징, 주의사항

- **크기 최적화**: 각 디바이스에 맞는 적절한 크기의 이미지를 자동으로 제공하며, WebP와 AVIF와 같은 최신 이미지 포맷을 사용함
- **시각적 안정성**: 이미지를 로딩할 때 레이아웃 시프트를 자동으로 방지함
- **빠른 페이지 로드**: 이미지를 뷰포트에 들어올 때만 로드하며, 선택적으로 블러 업 플레이스홀더를 사용할 수 있음
- **자산 유연성**: 원격 서버에 저장된 이미지도 필요에 따라 크기를 조정할 수 있음

**로컬 이미지 사용**

- ES module 문법으로 static import (import srcImage from './image.png')를 사용하면 자동으로 크기를 읽어올 수 있음
- 로컬 이미지를 사용하려면, `.jpg`, `.png`, 또는 `.webp` 이미지 파일을 `public` 폴더에서 가져와서 `import`해야 함. Next.js는 - - 자동으로 이미지의 본래 너비와 높이를 결정하여 Cumulative Layout Shift를 방지함

```javascript
import Image from "next/image"
import profilePic from "./me.png"

export default function Page() {
  return <Image src={profilePic} alt="Picture of the author" />
}
```

**원격 이미지 사용**

- remote image: 만약 다른 서버의 이미지를 사용한다면, next.config.js의 remotePatterns옵션으로 서버 접근을 허용해야 함 (악용 방지 차원)
  [NextJS remotePatters](https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns)

- 숫자로 크기를 정하기 애매한 경우, layout="fill" 옵션을 사용하면 부모 요소의 크기에 맞게 이미지를 늘릴 수 있음
- 원격 이미지를 사용할 경우, `src` 속성에 URL 문자열을 제공해야 함. 이때, `width`와 `height` 속성을 수동으로 지정하여 이미지의 비율을 - 유지하고 레이아웃 시프트를 방지함. 원격 서버에서 이미지를 안전하게 사용하기 위해서는 `next.config.js`에서 지원되는 URL 패턴을 정의해야 함

```javascript
import Image from "next/image"

export default function Page() {
  return (
    <Image
      src="https://s3.amazonaws.com/my-bucket/profile.png"
      alt="Picture of the author"
      width={500}
      height={500}
    />
  )
}
```

### 🚩 알게된 것

- Next.js의 Image 컴포넌트는 자동으로 이미지 크기를 최적화해서 성능 향상시킴
- 로컬 이미지나 원격 이미지 모두 효율적으로 관리 가능함
- 레이아웃 시프트 방지를 위해 width와 height 속성이 중요함
- 원격 이미지 사용시 보안을 위해 remotePatterns 설정이 필요함

### ⏭ 다음 단계 (What's Next?)

- [ ] 실제 프로젝트에 Image 컴포넌트 적용해보기
- [ ] 다양한 이미지 크기에서 최적화 효과 테스트하기
- [ ] 블러 플레이스홀더 옵션 활용해보기
- [ ] 반응형 이미지 처리 방법 더 알아보기

#### 📚 References & Resources

- [올리브영 테크 블로그(2023) : NEXT.JS의 이미지 최적화는 어떻게 동작하는가?](https://oliveyoung.tech/2023-06-09/nextjs-image-optimization/)
- [Next 공식문서: 이미지 최적화](https://nextjs.org/docs/app/getting-started/images-and-fonts)

#### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
