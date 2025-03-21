---
title:
description:
stage: seedling
date: 2024-12-08
lastmod: 2025-03-19
tags:
  - seedlings
  - tanstack-query
  - query-key
category:
enableToc: true
type: note
imageNameKey: Seedlings
draft: false
---

## 💡 쿼리키 관리 팁 - QueryKey factory

> 배경

쿼리키에 params를 포함하면서 페이지를 param별로 캐싱하려니 좀 더 정돈된 쿼리키 사용이 필요했다. 배열이 길어지다 보니 헷갈리기도 하고, 변수로 중앙에서 관리하는 것이 좋을 것 같았다.

## 🔍 Research

관련 예시를 찾던 도중, Tanstack-query를 관리하는 개발자의 블로그(TkDodo)에서 그가 추천하는 쿼리키 관리 방식에 대한 포스트를 발견했다. [^1]

이 방식은, 배열에 객체를 포함하여 관리하는 방법이다.
배열로만 관리할 경우 순서가 틀리면 다른 쿼리키로 인식되기 때문에(스코프도 변함), 개발자는 객체를 이용해서 모호한 하위 params/filters 같은 것들을 일관성 있게 관리하는 패턴을 제안한다.

### 📝 코드 스니핏

```ts
const todoKeys = {
  // ✅ all keys are arrays with exactly one object
  all: [{ scope: "todos" }] as const,
  lists: () => [{ ...todoKeys.all[0], entity: "list" }] as const,
  list: (state: State, sorting: Sorting) => [{ ...todoKeys.lists()[0], state, sorting }] as const,
}
```

### 배열 기반 쿼리키의 한계

> 배열에 원시값으로 정의한 쿼리키는 순서가 바뀌면 다른 쿼리로 인식됨 ⚠️

```ts
const getAllUsers = useQuery(["users"])
const getUserById = useQuery(["users", userId])
const getUserPosts = useQuery(["users", userId, "posts"])
const getUserFollowers = useQuery(["users", userId, "followers"])

// getUserPosts 쿼리키와 공집합이지만 순서가 바뀌어 다른 쿼리로 인식됨
const userPostsWrong = useQuery(["posts", userId, "users"])
```

### 쿼리키 팩토리 예시

> 배열의 첫번째 요소를 객체{key: value}로 사용

```ts
// 쿼리키 팩토리
const userKeys = {
  // 기본 스코프
  // 배열에 객체를 포함하여 관리
  all: [{ scope: "users" }] as const,

  // 목록 관련
  lists: () => [{ ...userKeys.all[0], entity: "list" }] as const,
  list: (filters = {}) => [{ ...userKeys.lists()[0], ...filters }] as const,

  // 상세 정보 관련
  details: () => [{ ...userKeys.all[0], entity: "detail" }] as const,
  detail: (userId) => [{ ...userKeys.details()[0], id: userId }] as const,

  // 사용자별 하위 엔티티
  posts: (userId) => [{ ...userKeys.detail(userId)[0], subEntity: "posts" }] as const,
  followers: (userId) => [{ ...userKeys.detail(userId)[0], subEntity: "followers" }] as const,
}
```

이렇게 객체로 관리하면 쿼리를 쉽게 그룹화 할 수 있고 쿼리키의 부분 일치 검색이 가능해진다.
Tanstack-query 공식문서[^2]에 따르면 쿼리키를 비교할때 deep partial matching을 알고리즘으로 사용해서 prefix로 여러개의 쿼리들을 찾아 한번에 무효화 할 수 있다.

#### 쿼리 비교 알고리즘

[TanStack Query의 깃허브 소스 코드](https://github.com/TanStack/query/blob/9e414e8b4f3118b571cf83121881804c0b58a814/src/core/utils.ts#L321-L338)

```ts
// queryKey 비교 알고리즘 (단순화됨)
export function partialMatchKey(a: QueryKey, b: QueryKey): boolean {
  return partialDeepEqual(a, b)
}

// 객체의 부분 일치를 확인하는 함수
function partialDeepEqual(a: any, b: any): boolean {
  // 1. 두 값이 정확히 같다면 일치
  if (a === b) {
    return true
  }

  // 2. 타입이 다르면 불일치
  if (typeof a !== typeof b) {
    return false
  }

  // 3. 두 값이 모두 객체인 경우
  if (a && b && typeof a === "object" && typeof b === "object") {
    // b의 모든 속성이 a에 존재하고 일치하는지 확인
    return !Object.keys(b).some((key) => !partialDeepEqual(a[key], b[key]))
  }

  return false
}
```

이 비교 알고리즘은 **단방향**으로 동작한다는걸 이해하는게 중요했다.

TanStack Query는 캐시의 모든 쿼리키들을 순회하면서 각각에 대해:

- 무효화 패턴(b)이 저장된 쿼리키(a)의 **부분 집합**인지 확인한다.
- 즉, "b의 모든 속성이 a에도 있고 값이 같은가?"를 검사하는 것이다.

이는 실제 중첩된 쿼리키를 무효화하는데 중요한 특성이다.

예를 들어, 다음과 같은 쿼리키가 있다고 가정해보자.

**1. 캐시에 있는 쿼리키들**

```
1. [{ scope: 'users', id: 5, entity: 'detail' }]
2. [{ scope: 'users', id: 5, subEntity: 'posts' }]
3. [{ scope: 'users', id: 7, subEntity: 'posts' }]
4. [{ scope: 'posts', id: 10 }]
```

**2. 무효화 명령을 실행:**

```js
queryClient.invalidateQueries({
  queryKey: [{ scope: "users", id: 5 }],
})
```

**3. 결과:**

1. 쿼리 1: ✅ 무효화 됨 (패턴의 모든 속성이 포함됨)
2. 쿼리 2: ✅ 무효화 됨 (패턴의 모든 속성이 포함됨)
3. 쿼리 3: ❌ 무효화 안됨 (id가 다름)
4. 쿼리 4: ❌ 무효화 안됨 (scope이 다름)

**4. 왜 "단방향"인가?**

- 무효화 패턴(b)이 쿼리키(a)의 부분 집합인지만 확인.
- 역방향(쿼리키가 패턴의 부분 집합인지)은 확인하지 않음.

### 쿼리키 팩토리 사용

```js
// 🧹 사용자 관련 모든 쿼리 제거
queryClient.removeQueries({
  queryKey: [{ scope: "users" }],
})

// 🔄 모든 사용자 목록 쿼리 리셋 (필터와 상관없이)
queryClient.resetQueries({
  queryKey: [{ scope: "users", entity: "list" }],
})

// ⚡ 특정 사용자의 모든 관련 데이터 무효화
queryClient.invalidateQueries({
  queryKey: [{ scope: "users", id: userId }],
})

// 🌐 전체 애플리케이션의 모든 'posts' 서브엔티티 무효화 (스코프 무관)
queryClient.invalidateQueries({
  queryKey: [{ subEntity: "posts" }],
})
```

### 꼭 첫번째 인덱스에 객체를 둬야 하나?

굳이 첫번째에 객체가 와야지만 부분 일치 검색이 가능한것은 아니지만, TkDodo는 첫번째 요소를 객체를 고정하면 구조분해를 더 명확하게 할 수 있고 필터링을 더 유연하게 사용할수 있어 첫번째에 두는걸 권장한다.
_이 방식의 장점: 코드 유지보수성, 타입 안전성, 그리고 필터링 기능을 향상_

아래 처럼 구조 분해를 활용하면 쿼리 함수에서 쿼리키의 첫번째 요소가 객체이므로 명명된 속성으로 바로 접근 가능하다.

```ts
// 쿼리 함수에서 구조 분해 활용하기
const fetchTodos = async ({
  // 쿼리키의 첫 번째 요소가 객체이므로 명명된 속성으로 바로 접근 가능
  queryKey: [{ state, sorting, filters }],
}: QueryFunctionContext<ReturnType<typeof todoKeys.list>>) => {
  // ✅ URL 빌드시 위치가 아닌 속성명으로 접근하므로 안전
  const response = await axios.get(`todos/${state}?sorting=${sorting}&limit=${filters.limit}`)
  return response.data
}
```

## 프로젝트에서 적용

실제 내 프로젝트에서는 쿼리키 팩토리를 적용할때 TkDodo의 방식처럼 객체를 [0]번째 인덱스에 두지 않고 관련된 데이터 도메인 (database entity)를 문자열로 두고 관리했다.

```js
// 실제 프로젝트 적용 예시.

export const workKey = {
  all: ["works"],
  lists: () => [...workKey.all, "list"],
  list: (challengeId, params = {}) => [...workKey.lists(), challengeId, { ...params }],

  details: () => [...workKey.all, "detail"],
  detail: (workId) => [...workKey.details(), workId],
  feedbacks: (workId) => [...workKey.detail(workId), "feedbacks"],
}
```

```js
// TkDodo 권장 패턴
// 첫번째 요소를 객체로 둠.
// TkDodo는 'scope' 속성으로 데이터 도메인을 표현하고, 'entity' 속성으로 쿼리 타입을 표현함
;[{ scope: "users", id: 5, entity: "detail" }]
```

```js
// 내가 적용한 패턴
// 첫번째 문자열로 데이터 도메인(또는 DB 엔티티)을 표현하고,
// 두번째 문자열로 쿼리 타입을 표현함
;["works", "list", challengeId, { ...params }]
```

페이지 구조가 확실한 계층 구조를 가지고 있어서 단순하게 사용하였고 직관적이여서 이와 같은 방식으로 적용했다.
예를 들어 작업물(works)의 상세페이지(detail)가 업데이트 되면, 그 상세 페이지로 들어가기전에 fetch했던 작업물들 목록(list)도 업데이트 해야하기 때문에 'list'까지 배열을 가진 쿼리키를 무효화 해서 하위까지 한번에 하는 구조가 나을거라 생각했다.
어차피 프로젝트의 구조와 규칙이 명확해서 더 직관적인 방법을 적용했고, TkDodo의 방식은 좀 더 복잡한 페이지 구조나 계층이 모호할때 유연하게 쿼리를 처리하기 더 좋아보인다.

---

### ⏭ 다음 단계 (What's Next?)

- [ ] 현재 리액트 + 자바스크립트 프로젝트 -> 넥스트 + 타입스크립트로 전환할때 TkDodo의 방식으로 적용해보기
- [ ] query key factory 관리 하는 라이브러리도 있다. 한번 확인해 보기 [@lukemorales/query-key-factory](https://www.npmjs.com/package/@lukemorales/query-key-factory)
- [ ] 쿼리 필터 관련 문서 정리 (QueryFilter & MutationFilter) [쿼리 필터 관련 문서](https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters)

### 키워드 정리

- Context: 컴포넌트 트리 전체에 데이터를 전달하는 전역 변수
- QueryKey: 쿼리의 고유 식별자
- QueryFunctionContext: 쿼리 함수의 매개변수

### 📚 References & Resources

[Dorfmeister, D. 2021, "Leveraging the Query Function Context"](https://tkdodo.eu/blog/leveraging-the-query-function-context#query-key-factories)

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]

---

[^1]: 링크:[Leveraging the Query Function Context](https://tkdodo.eu/blog/leveraging-the-query-function-context#query-key-factories)

[^2]: 링크:[TanStack Query - Query Matching with invalidateQueries](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation#query-matching-with-invalidatequeries)
