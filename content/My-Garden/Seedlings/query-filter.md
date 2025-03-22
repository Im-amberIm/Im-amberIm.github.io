---
title:
description:
stage: seedling
date: 2025-03-22
lastmod: 2025-03-22
tags:
  - seedling
  - tanstack-query
  - filter
category:
enableToc: true
type: note
imageNameKey: Seedlings
draft: true
resource:
  - https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters
---

> 배경
> 쿼리키 지식 다지기 꾹꾹이~

## 🔍 Research

- 쿼리 필터 관련 문서 정리 (QueryFilter & MutationFilter) [쿼리 필터 관련 문서](https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters)

### 쿼리 필터(QueryFilter) 이해하기

`invalidateQueries` 및 `removeQueries` 메서드는 `QueryFilter` 객체를 매개변수로 받는다. 이 필터 객체는 캐시에서 특정 쿼리를 대상으로 하는 다양한 조건을 지정할 수 있다.

```js
// QueryFilter 예시
queryClient.invalidateQueries({
  queryKey: userKeys.all, // 특정 쿼리키와 일치하는 쿼리 선택
  exact: false, // prefix 매칭 활성화 (기본값)
  refetchType: "active", // 활성 쿼리만 리페치
  predicate: (query) => query.state.data?.timestamp < Date.now() - 10000, // 조건 함수
})
```

이런 필터 옵션을 통해 더 세밀한 쿼리 관리가 가능하다.

### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
