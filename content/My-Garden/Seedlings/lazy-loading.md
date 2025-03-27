---
title: Improve the initial loading performancce of an app
description: 
stage: seedling
date: 2025-03-25
lastmod: 2025-03-25
tags:
  - seedling
category: 
enableToc: true
type: note
imageNameKey: Seedlings
draft: true
resource:
---

> 배경
https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading

## 🔍 Research

# Lazy Loading

[Lazy loading](https://developer.mozilla.org/docs/Web/Performance/Lazy_loading) in Next.js helps improve the initial loading performance of an application by decreasing the amount of JavaScript needed to render a route.

It allows you to defer loading of **Client Components** and imported libraries, and only include them in the client bundle when they're needed. For example, you might want to defer loading a modal until a user clicks to open it.

There are two ways you can implement lazy loading in Next.js:

1. Using [Dynamic Imports](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#nextdynamic) with `next/dynamic`
2. Using [`React.lazy()`](https://react.dev/reference/react/lazy) with [Suspense](https://react.dev/reference/react/Suspense)

### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
