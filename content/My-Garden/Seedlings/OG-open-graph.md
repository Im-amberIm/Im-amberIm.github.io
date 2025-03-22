---
title: "OG: Open Graph"
description: 
stage: seedling
date: 2025-03-20
lastmod: 2025-03-20
tags:
  - seedling
category: 
enableToc: true
type: note
imageNameKey: Seedlings
draft: true
---


## 💡 OG image 최적의 사이즈?

> 배경
> quartz에서 og 이미지 업데이트 하면서 최적의 사이즈가 궁금해짐?

### 🔍 Research

### Open Graph 이미지(og:image) 권장 크기

Open Graph 이미지(og:image)는 콘텐츠가 소셜 미디어에 공유될 때 표시되는 썸네일 이미지입니다. 각 플랫폼마다 약간씩 다른 크기를 권장하지만, 대부분의 플랫폼에서 잘 작동하는 일반적인 권장 사항은 다음과 같습니다:

#### 최적 크기

권장 크기: 1200 × 630 픽셀

이 크기는 다음과 같은 이유로 가장 널리 권장됩니다:

- Facebook, Twitter, LinkedIn 등 주요 소셜 미디어 플랫폼과 호환

- 16:9 종횡비로 모바일 및 데스크톱에서 잘 보임

- 충분한 해상도를 제공하여 고화질 디스플레이에서도 선명하게 표시

#### 플랫폼별 권장 사항

1. Facebook:

- 최소: 600 × 315 픽셀

- 권장: 1200 × 630 픽셀

- 최대 파일 크기: 8MB

1. Twitter:

- 권장: 1200 × 675 픽셀 (16:9 비율)

- 최소: 144 × 144 픽셀

- 최대 파일 크기: 5MB (사진), 15MB (GIF)

1. LinkedIn:

- 권장: 1200 × 627 픽셀

- 최소: 200 × 200 픽셀

1. Pinterest:

- 권장: 1000 × 1500 픽셀 (2:3 비율)

#### 추가 최적화 팁

1. 파일 형식: JPG, PNG, WebP 등의 웹 최적화 형식 사용

2. 파일 크기: 가능한 200KB 이하로 유지 (로딩 속도 개선)

3. 텍스트 배치: 이미지 중앙에 텍스트 배치 (잘림 방지)

4. 여백: 가장자리에 20% 정도의 여백 유지 (다양한 디스플레이에서 안전하게 표시)

5. 브랜딩: 로고나 브랜드 요소를 일관되게 포함

#### Quartz에서의 사용

Quartz에서는 기본적으로 quartz/static/og-image.png 파일을 Open Graph 이미지로 사용합니다. 이 파일을 1200 × 630 픽셀 크기로 대체하시면 소셜 미디어 공유 시 최적의 표시 효과를 얻을 수 있습니다.

개별 페이지마다 다른 og:image를 사용하려면 해당 마크다운 파일의 frontmatter에 image 속성을 추가하세요:
### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
