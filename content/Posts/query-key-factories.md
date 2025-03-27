---
title: Query Key 관리하기 - query key factories
description: 
stage: evergreen
date: 2024-12-20
lastmod: 2025-03-22
tags:
  - post
  - tanstack-query
  - query-key
category: Library
enableToc: true
type: note
imageNameKey: posts
draft: false
---

## 💡 쿼리키 관리 팁 - QueryKey factory

> 배경

쿼리키에 params를 포함하면서 페이지를 param별로 캐싱하려니 좀 더 정돈된 쿼리키 사용이 필요했다. 배열이 길어지다 보니 헷갈리기도 하고, 변수로 체계화 시켜서 중앙에서 관리하는 것이 좋을 것 같았다.

## 🔍 Research

관련 예시를 찾던 도중, Tanstack-query를 관리하는 개발자의 블로그(TkDodo)에서 쿼리키 관리 방식에 대한 포스트를 발견했다. [^1]
커뮤니티에서도 이런 패턴을 확장한 라이브러리가 있는데, 가장 인기있는 것은 `@lukemorales/query-key-factory[^2]`이다. <br>
이 라이브러리는 타입 안전한 쿼리키 생성과 자동 완성 기능을 제공하며, 특히 TypeScript 프로젝트에서 유용하다.
그치만 이 글에서는 쿼리키 패턴 비교하는 것이 목적이라 이 라이브러리는 다루지 않는다.

## 쿼리키 비교 분석: 배열 기반 vs 객체 기반

### 보통의 배열 기반 쿼리키

> 배열에 원시값으로 나열

```ts
const getAllUsers = useQuery(["users"]) // ["users"] 쿼리키에 에 getAllUsers로 fetch한 데이터가 저장됨
const getUserById = useQuery(["users", userId]) // ["users", userId] 쿼리키에 getUserById로 fetch한 데이터가 저장됨
```

### TkDodo의 객체 기반 쿼리키 패턴

> TkDodo는 모든 쿼리키를 **배열 안의 단일 객체**로 표현하는 방식을 권장한다.

```ts
// 중앙에서 쿼리키를 변수로 관리하며 매서드로 생성
const todoKeys = {
  // ✅ all keys are arrays with exactly one object
  // = 모든 키는 정확히 하나의 객체를 포함한 배열
  all: [{ scope: "todos" }] as const,
  lists: () => [{ ...todoKeys.all[0], entity: "list" }] as const, // [{scope: "todos", entity: "list"}]
  list: (state: State, sorting: Sorting) => [{ ...todoKeys.lists()[0], state, sorting }] as const,
  // [{scope: "todos", entity: "list", state, sorting}]
}
```

이 패턴의 핵심:

- **모든 쿼리키가 정확히 하나의 객체를 포함한 배열로 구성**
- **객체 내부에 모든 필요한 데이터를 키-값 쌍으로 표현**
  - 예: `scope: "todos"`, `entity: "list"`, `id: 5` 등

### 배열 기반 쿼리키의 한계

> 일반 원시값의 요소의 배열시 순서에 의존하기 때문에 순서가 바뀔시 다른 쿼리로 인식됨 ⚠️

```ts
const getAllUsers = useQuery(["users"])
const getUserById = useQuery(["users", userId])
const getUserPosts = useQuery(["users", userId, "posts"])

// getUserPosts와 공집합이지만, 순서가 달라 무효화 오류 발생함.
queryClient.invalidateQueries({ queryKey: ["posts", userId, "users"] })
```

### 권장되는 방식: TkDodo의 단일 객체 패턴

> 위의 문제는 TkDodo가 제안한 단일 객체 패턴으로 해결할 수 있다.

```js
// 단일 객체 패턴으로 개선
const getUsersQueries = {
  all: [{ entity: "users" }],
  detail: (userId) => [{ entity: "users", id: userId }],
  posts: (userId) => [{ entity: "users", id: userId, relation: "posts" }],
}

// 사용 예시
const { data: allUsers } = useQuery({ queryKey: getUsersQueries.all })
const { data: user } = useQuery({ queryKey: getUsersQueries.detail(5) })
const { data: userPosts } = useQuery({ queryKey: getUsersQueries.posts(5) })

// 객체 속성(properties) 기반 매칭
queryClient.invalidateQueries({ queryKey: [{ entity: "users", id: 5 }] })
```

이 방식은 **객체 속성(properties) 기반으로 매칭**되므로 순서에 의존하지 않고, 더 유연한 쿼리 관리가 가능하다.

<br>

### 쿼리 비교 알고리즘 이해하기

Tanstack-query 공식문서[^3]에 따르면 `invalidateQueries`나 `removeQueries` 같은 메서드를 사용시, 깊은 부분 일치 검색(deep partial matching: 객체의 속성들이 부분적으로 일치하는지 깊게 검사하는 알고리즘) 알고리즘을 사용한다 소개한다.<br>
이 알고리즘은 쿼리키의 prefix(접두사) 기반으로 작동하기 때문에 배열의 첫 부분부터 순서가 일치해야 한다. 즉, 캐시된 퀴리키의 시작부분이 무효화하려는 패턴과 정확히 일치해야 된다.

### 쿼리 비교 알고리즘

> **정확히 어떻게 비교할까?** <br> [TanStack Query의 깃허브 소스 코드를 단순화한 알고리즘:](https://github.com/TanStack/query/blob/9e414e8b4f3118b571cf83121881804c0b58a814/src/core/utils.ts#L321-L338)

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

#### 단방향 매칭 이해하기

이 비교 알고리즘은 **단방향**으로 동작한다는걸 이해하는게 중요하다.

- TanStack Query는 캐시된 쿼리키(a)와 무효화 패턴(b)을 비교한다.
- 무효화 패턴(b)이 캐시된 쿼리키(a)의 부분 집합인지 확인한다.
- 즉, "무효화 패턴의 모든 속성이 캐시된 쿼리키에도 있고 값이 같은가?"를 검사한다.

이는 실제 중첩된 쿼리키를 무효화하는데 중요한 특성이다.

#### 예제로 이해하기

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

**4. 다시, 왜 "단방향"인가?**

- 무효화 패턴(b)이 쿼리키(a)의 부분 집합인지만 확인.
- 역방향(쿼리키가 패턴의 부분 집합인지)은 확인하지 않음.

## 객체 기반 쿼리키 팩토리 구조와 활용

> 객체 기반 쿼리키 팩토리의 계층적 구조와 메서드별 역할:

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

### 객체 기반 쿼리키의 장점

- 유연한 쿼리 무효화: 객체의 properties(프로퍼티)를 기반으로 쿼리를 더 유연하게 무효화할 수 있음
- 구조 분해를 통한 명확한 접근: 쿼리 함수에서 객체의 명명된 속성으로 바로 접근 가능

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

## 내 프로젝트에 적용하기

### 객체 기반 방식 적용시 고려 사항

객체 기반 방식의 가장 큰 장점은 속성 기반 매칭을 통한 유연한 쿼리 관리이다. 이를 최대한 활용하려면 다음과 같이 직접 속성값을 지정하여 무효화하는 것이 가장 효과적이다.
(가독성 좋고, 편리함)

```ts
// 속성값으로 쉽게 무효화 하기
// 모든 투두 삭제
queryClient.removeQueries({
  queryKey: [{ scope: "todos" }],
})

// todos 도메인 안에 모든 목록 리셋
queryClient.resetQueries({
  queryKey: [{ scope: "todos", entity: "list" }],
})

// 어느 도메인이든 모든 목록 무효화 (실수로 다른 도메인의 list까지 무효화 될 수 있음)
queryClient.invalidateQueries({
  queryKey: [{ entity: "list" }],
})
```

#### 하드 코드 방식의 문제

그러나 이 장점을 위해 하드 코딩으로 쿼리키 작성시 아래와 같은 문제점이 있다.

- 속성 이름 오타: scope를 scop으로 잘못 입력하면 아무 쿼리도 무효화되지 않음
- 구조 변경 시 위험: 나중에 팩토리 구조를 변경하면 하드코딩된 객체와 불일치 발생
- 일관성 유지 어려움: 팀원들이 각자 다른 방식으로 객체를 구성할 위험

#### 팩토리 매서도 호출을 통한 대안

물론 중앙에서 관리하기 떄문에 하드코딩 말고 팩토리 함수를 통한 스코프 무관 무효화 할 수 있다.

```js
// 팩토리 매서드를 호출 해 사용 | 하드코딩 ❌
queryClient.invalidateQueries({
  queryKey: todoKeys.lists(), // [{ scope: "todos", entity: "list" }]
})
```

그러나 이런 식으로 활용된다면, 객체 기반 접근법의 장점인 가독성과 편리성이 상쇄된다.

나는 애초에 모든 쿼리키를 변수로 둬 중앙에서 한번에 관리하는것에 제일 우선순위이기 때문에, 이 장점에도 불구 하드코딩은 피하고 싶었고,
이 장점을 포기하니 배열 + 객체 접근법이 훨씬 편리하다 판단했다.

### 내 채택한 방식

> 내 프로젝트에서 선택한 방식은 배열 + 객체 접근법이다.

나는 애초에 모든 쿼리키를 변수로 두어 중앙에서 관리하는 것을 최우선으로 생각했기 때문에, 객체 기반의 유연성보다 팩토리 함수를 통한 안전성을 선택했다.
이러한 상황에서는 배열 + 객체(가변이 높은 매개변수 그룹화) 혼합 접근법이 더 직관적이고 편리하다고 판단했다.

```js
// 중앙에서 관리하는 쿼리키 팩토리
export const workKey = {
  all: ["works"],
  // 반환값: ["works"]

  lists: () => [...workKey.all, "list"],
  // 반환값: ["works", "list"]

  list: (challengeId, params = {}) => [...workKey.lists(), challengeId, { ...params }],
  // 반환값: ["works", "list", challengeId, { ...params }]

  details: () => [...workKey.all, "detail"],
  // 반환값: ["works", "detail"]

  detail: (workId) => [...workKey.details(), workId],
  // workKey.detail(8) 반환값: ["works", "detail", 8]

  feedbacks: (workId) => [...workKey.detail(workId), "feedbacks"],
  // workKey.feedbacks(5) 반환값: ["works", "detail", 5, "feedbacks"]
}
```

```js
// 항상 팩토리 매서드를 호출 해 사용 | 하드코딩 ❌
console.log(workKey.list(challengeId, { ...params }))
// 반환값: ["works", "list", challengeId, { ...params }]
```

#### 특징

REST API 구조와 유사한 계층적 구조 패턴으로 접근했다.

- [0]인덱스: 데이터 도메인(DB 엔티티) - "works"
- [1]인덱스: 조회 유형 - "list" 또는 "detail"
- [2]인덱스: 식별자 - challengeId 또는 workId
- [3]인덱스: 가변적인 매개변수 - {필터링, 정렬, 페이지네이션 등}

### 채택 이유

#### 프로젝트 적합성

- 명확한 도메인 구조에 적합 ("works", "challenges" 등)
- 백엔드 API 구조와 일관성 유지 (REST 패턴)
- 팀원들의 이해도가 높음
- 중소 규모 프로젝트에 충분한 기능 제공
- 중앙 관리 방식에 최적화

#### 기술적 장점

- 하드코딩 없이 팩토리 메서드 사용으로 실수 방지
- 오타 위험 감소
- 명확한 계층 구조 (예: ['works', 'list', challengeId])
- query params 같은 그룹화 시키기 좋은 가변 매개변수만 객체로 관리하여 유연성 확보
- 계층적 도메인 분리가 명확하여 의도치 않은 무효화 방지

### 두 접근법 비교 정리

| 특성        | TkDodo 객체 기반                      | 내 배열 기반 접근법                |
| ----------- | ------------------------------------- | ---------------------------------- |
| 유연성      | 속성 기반 매칭으로 매우 유연함        | prefix 기반 매칭으로 유연성 제한적 |
| 직관성      | 객체 속성으로 구분하여 어려울 수 있음 | REST API와 유사해 직관적           |
| 타입 안전성 | TypeScript와 결합 시 뛰어남           | 위치 기반이라 타입 안전성 낮음     |
| 구조 분해   | 명명된 속성으로 접근 용이             | 위치 기반 접근으로 오류 가능성     |
| 적합한 상황 | 복잡한 대규모 프로젝트                | 구조가 명확한 소규모 프로젝트      |

### 배열 + 객체 방식의 제한 사항

그러나 역시 각 방법이 장단점이 있기 때문에 프로젝트 특성에 따라 적합한 방법을 선택해야 한다.
현재 프로젝트 사이즈에서는 이 방식이 더 적절하다 판단되지만 프로젝트가 성장하면서 복잡한 관계 표현의 어려운 부분은 확실히 있었다.
항상 계층적인 관계일 수 만은 없기 때문에 확장성을 위해 현재에서(리액트+자바스크립트) -> 타입스크립트와 넥스트로 마이그레이션시 타입 안정성도 보장하고 더 유연한 객체 기반 접근법으로 리팩토링 할것이다.

## 정리

### TkDodo의 쿼리키 팩토리의 장점

- 쿼리키 관리 중앙화
- 쿼리키 생성 로직 재사용성
- 쿼리키 무효화 유연성
- 타입 안전성

### 고려해야 할 단점

- 초기 설정 오버헤드: 쿼리키 팩토리 패턴은 초기 구현에 시간이 필요.
- 간단한 사용 사례에서의 복잡성: 매우 간단한 앱에서는 과도한 추상화 일 수 있음.
- 학습 곡선: 팀원들이 이 패턴에 익숙해지는 데 시간이 필요할 수 있음.

객체 기반과 배열 기반 접근법 모두 각자의 장단점이 있으며, 프로젝트의 특성과 팀의 선호도에 따라 적절한 접근법을 선택하는 것이 중요한거 같다.

---

### ⏭ 다음 단계 (What's Next?)

- [ ] 현재 리액트 + 자바스크립트 프로젝트 -> 넥스트 + 타입스크립트로 전환할때 TkDodo의 방식으로 적용해보기
- [ ] query key factory 관리 하는 라이브러리 확인해보기 [@lukemorales/query-key-factory](https://www.npmjs.com/package/@lukemorales/query-key-factory)
- [ ] 쿼리 필터 관련 문서 정리 (QueryFilter & MutationFilter) [쿼리 필터 관련 문서](https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters)

### 📚 References & Resources

[Dorfmeister, D. 2021, "Leveraging the Query Function Context"](https://tkdodo.eu/blog/leveraging-the-query-function-context#query-key-factories)

### 📝 연관 노트

- 🌱 **초기 아이디어** [[My-Garden/Seedlings/query-key-factories | QueryKey factory 리서치]]

---

[^1]: 링크:[Leveraging the Query Function Context](https://tkdodo.eu/blog/leveraging-the-query-function-context#query-key-factories)

[^2]: 링크:[@lukemorales/query-key-factory](https://www.npmjs.com/package/@lukemorales/query-key-factory)

[^3]: 링크:[TanStack Query - Query Matching with invalidateQueries](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation#query-matching-with-invalidatequeries)
