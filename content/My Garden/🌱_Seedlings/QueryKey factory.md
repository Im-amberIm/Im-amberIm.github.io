---
title: 
description: 
stage: seedling
date: 2025-03-19
lastmod: 2025-03-19
tags:
  - seedling
  - tanstack-query
category: 
enableToc: true
type: note
imageNameKey: Seedlings
---

# {{title}}

## 💡 토픽

> 배경


### 🔍 Research

```js
// 실제 프로젝트 적용 예시.
export const workKey = {
all: ['works'],
lists: () => [...workKey.all, 'list'],
list: (challengeId, params = {}) => [
...workKey.lists(),
challengeId,
{ ...params },

],

details: () => [...workKey.all, 'detail'],
detail: (workId) => [...workKey.details(), workId],
feedbacks: (workId) => [...workKey.detail(workId), 'feedbacks'],

};

```

### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
