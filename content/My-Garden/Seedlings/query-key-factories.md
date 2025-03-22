---
title: QueryKey factory 리서치
description: 
stage: seedling
date: 2024-12-08
lastmod: 2025-03-19
tags:
  - seedlings
  - tanstack-query
  - query-key
category: Library
enableToc: true
type: note
imageNameKey: Seedlings
draft: false
---

## 💡 쿼리키 관리 팁 - QueryKey factory

> 배경

쿼리키에 params를 포함하면서 페이지를 param별로 캐싱하려니 좀 더 정돈된 쿼리키 사용이 필요했다. 배열이 길어지다 보니 헷갈리기도 하고, 변수로 체계화 시켜서 중앙에서 관리하는 것이 좋을 것 같았다.

## 🔍 Research

관련 예시를 찾던 도중, Tanstack-query를 관리하는 개발자의 블로그(TkDodo)에서 쿼리키 관리 방식에 대한 포스트를 발견했다. [^1]

> TkDodo는 모든 쿼리키를 **배열 안의 단일 객체**로 표현하는 방식을 권장한다.

- **모든 쿼리키가 정확히 하나의 객체를 포함한 배열로 구성**
- **객체 내부에 모든 필요한 데이터를 키-값 쌍으로 표현**
  - 예: `scope: "todos"`, `entity: "list"`, `id: 5` 등

### TkDodo의 쿼리키 관리 패턴

```ts
const todoKeys = {
  // ✅ all keys are arrays with exactly one object
  // = 모든 키는 한 object를 포함한 배열이다.
  all: [{ scope: "todos" }] as const,
  lists: () => [{ ...todoKeys.all[0], entity: "list" }] as const,
  list: (state: State, sorting: Sorting) => [{ ...todoKeys.lists()[0], state, sorting }] as const,
}
```

### 쿼리키 팩토리 예시

> 쿼리키들을 배열안에 한 object{key: value}로 사용하는 방식

```ts
const userKeys = {
  // 1. 기본 스코프 정의
  all: [{ scope: "users" }] as const,

  // 2. entity: list 구조 생성
  lists: () => [{ ...userKeys.all[0], entity: "list" }] as const,
  list: (filters = {}) => [{ ...userKeys.lists()[0], ...filters }] as const,

  // 이 후 entity 별로 메서드 추가 (예시: detail)
  details: () => [{ ...userKeys.all[0], entity: "detail" }] as const,
  detail: (userId) => [{ ...userKeys.details()[0], id: userId }] as const,

  ...
}
```

### 메서드 간의 계층 구조

```text

userKeys.all → 기본 도메인 정의
  ├── userKeys.lists() → 목록 관련 기본 구조
  │     └── userKeys.list(filters) → 최종 목록 쿼리 (필터 포함)
  │
  └── userKeys.details() → 상세 정보 기본 구조
        └── userKeys.detail(userId) → 특정 사용자 상세 정보


```

### 메서드 구조 (Domain > Entity > Query)

#### **1. `userKeys.all` - 기본 스코프**

- 모든 users 관련 쿼리를 한 번에 무효화할 때 유용
- 반환값: `[{ scope: "users" }]`
- 예: `queryClient.invalidateQueries({ queryKey: userKeys.all })`

#### **2-1. `userKeys.lists()` - 목록 기본 쿼리키**

- 모든 users의 list(목록) 쿼리키
- 모든 list 쿼리(필터와 상관없이)를 무효화할 때 사용
- 반환값: `[{ scope: "users", entity: "list" }]`
- 예: `queryClient.invalidateQueries({ queryKey: userKeys.lists() })`

#### **2-2. `userKeys.list(filters)` - 필터가 적용된 list 쿼리키**

- 구체적인 필터가 추가된 list 쿼리키
- 특정 필터 조건의 목록 데이터를 조회하거나 무효화할 때 사용
- 반환값: `[{ scope: "users", entity: "list", filters }]`
- 예: 특정 페이지 목록 조회: `useQuery({ queryKey: userKeys.list({ page: 1, limit: 10 }) })`

이 방식대로 단일 객체로 관리하면 쿼리를 쉽게 그룹화 할 수 있고, 객체의 properties를 기반으로 부분 일치 검색(deep partial matching)을 더 쉽게 할 수 있다.
Tanstack-query 공식문서[^2]에 따르면 `invalidateQueries`나 `removeQueries` 같은 메서드를 사용할 때 deep partial matching 알고리즘을 사용한다. 이 알고리즘은 쿼리키의 prefix(접두사) 기반으로 작동하기 때문에 배열의 첫 부분부터 순서가 일치해야 한다. 즉, 캐시된 퀴리키의 시작부분이 무효화하려는 패턴과 정확히 일치해야 된다.
그래서 이 같이 한 object에 key: value 형식으로 관리하면 명명된 속성(key)으로 바로 접근 가능하기 때문에 순서와 상관없이 더 정교하게 무효화를 시킬 수 있다.

#### 첫 번째 요소가 원시값일 때의 한계

> 배열 prefix를 기반으로 매칭하기 때문에 원시값으로 정의한 쿼리키는 순서가 바뀔시 다른 쿼리로 인식됨 ⚠️

```ts
const getAllUsers = useQuery(["users"])
const getUserById = useQuery(["users", userId])
const getUserPosts = useQuery(["users", userId, "posts"])
const getUserFollowers = useQuery(["users", userId, "followers"])

// getUserPosts 쿼리키와 공집합이지만 순서가 바뀌어 다른 쿼리로 인식됨
const userPostsWrong = useQuery(["posts", userId, "users"])
```

### 쿼리 비교 알고리즘

> 정확히 어떻게 비교할까?
> [TanStack Query의 깃허브 소스 코드](https://github.com/TanStack/query/blob/9e414e8b4f3118b571cf83121881804c0b58a814/src/core/utils.ts#L321-L338)

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

이 비교 알고리즘은 **단방향**으로 동작한다는걸 이해하는게 중요하다.

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

### 쿼리키 팩토리 사용 예시

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

(그럼 부분적으로만 객체 사용해도 되는구나)

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

---

### ⏭ 다음 단계 (What's Next?)

- [x] 실제 프로젝트 적용 예시 추가해보기

### 📚 References & Resources

[Dorfmeister, D. 2021, "Leveraging the Query Function Context"](https://tkdodo.eu/blog/leveraging-the-query-function-context#query-key-factories)

### 📝 연관 노트

- 🌳 **Evergreen:** [[Posts/query-key-factories| Query Key 관리하기 - query key factories]]

---

[^1]: 링크:[Leveraging the Query Function Context](https://tkdodo.eu/blog/leveraging-the-query-function-context#query-key-factories)

[^2]: 링크:[TanStack Query - Query Matching with invalidateQueries](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation#query-matching-with-invalidatequeries)
