---
title: Axios는 mlHttpRequest가 콜백 기반인데 어떻게 Promise 기반으로 바꿨어?
description: 
stage: seedling
date: 2025-03-26
lastmod: 2025-03-26
tags:
  - seedling
category: 
type: note
enableToc: true
draft: true
---

> 배경

Axios는 xmlhttprequest가 콜백 기반인데 어떻게 promise 기반으로 바꿨어? 어떻게 그 xmlhttprequest를 만든다는거야?


## 🔍 Research

Axios는 **XMLHttpRequest(XHR)**의 콜백 기반 구조를 **Promise API**로 래핑하여 변환합니다. 이 과정은 다음과 같은 기술적 메커니즘을 통해 구현됩니다:

## **1. Promise 래핑 원리**

- **XHR 이벤트 리스너 → Promise 상태 변환**:
    
    - XHR의 **`onload`**, **`onerror`**, **`onabort`** 이벤트를 감지하여 **resolve** 또는 **reject** 처리[3](https://dev.to/mperon/axios-error-handling-like-a-boss-333d)[4](https://rapidapi.com/guides/axios-vs-xmlhttprequest).


```js

const xhr = new XMLHttpRequest();
return new Promise((resolve, reject) => {
  xhr.onload = () => resolve(xhr.response);
  xhr.onerror = () => reject(new Error('Request failed'));
  xhr.send(data);
});

```


    
- **상태 코드 기반 오류 자동 감지**:
    
    - HTTP 상태 코드가 **`2xx`** 범위가 아니면 자동으로 **reject** 처리

## **2. XMLHttpRequest 생성 과정**

Axios는 브라우저 환경에서 다음과 같이 XHR 인스턴스를 생성하고 설정합니다:

1. **인스턴스 생성**:

```js
const xhr = new XMLHttpRequest();

```

2. **요청 초기화**:
    
```js

xhr.open(method, url, true); // 비동기 모드 활성화

```
    
3. **헤더 설정**:
    
```js

xhr.setRequestHeader('Content-Type', 'application/json');


```
    
4. **응답 처리**:
    
```js

xhr.responseType = 'json'; // 자동 JSON 파싱

```
    
5. **이벤트 바인딩**:
    
```js

xhr.addEventListener('readystatechange', handleStateChange);

```

## **3. Promise 변환의 기술적 장점**

|**특징**|**XHR (콜백)**|**Axios (Promise)**|
|---|---|---|
|**에러 처리**|수동 상태 코드 확인 필요|**`try/catch`** 또는 **`.catch()`**로 통합 관리[1](https://blog.logrocket.com/http-requests-axios/)[4](https://rapidapi.com/guides/axios-vs-xmlhttprequest)|
|**코드 구조**|중첩 콜백 가능성|체이닝(**`.then()`**)과 **`async/await`** 지원[1](https://blog.logrocket.com/http-requests-axios/)|
|**병렬 요청**|복잡한 구현|**`Promise.all`**로 간결한 처리[1](https://blog.logrocket.com/http-requests-axios/)|
|**자동 변환**|수동 **`JSON.parse()`** 필요|요청/응답 데이터 자동 변환[2](https://axios-http.com/docs/intro)[4](https://rapidapi.com/guides/axios-vs-xmlhttprequest)|

## **4. 고급 기능 구현 방식**

- **인터셉터 시스템**:
    
    - **`axios.interceptors`** 객체를 통해 요청/응답 가로채기
    
```js

axios.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer token'; // 헤더 자동 주입
  return config;
});


```
- **커스텀 변환 로직**:
    
    - **`transformRequest`**/**`transformResponse`**로 데이터 변형[1](https://blog.logrocket.com/http-requests-axios/)[5](https://axios-http.com/docs/req_config):
    
```js

axios.post(url, data, {
  transformRequest: [(data) => JSON.stringify(data)]
});


```

## **5. 브라우저 vs Node.js 환경 처리**

- **브라우저**: XHR을 직접 사용
    
- **Node.js**: 내장 **`http`** 모듈 활용
    
- **통일된 API**:
    
 ```js

// 동일한 코드로 두 환경 지원
axios.get('https://api.example.com').then(...);


```

Axios는 이러한 기술적 레이어를 통해 XHR의 복잡성을 추상화하면서도 **Promise의 이점(가독성, 에러 처리 용이성)**을 극대화합니다. 이는 Fetch API의 기능적 한계(예: 요청 취소 미지원)를 보완하는 핵심 원동력입니다[^1][^2].

### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

##### Axios 소개 및 사용법

- **[Getting Started | Axios Docs](https://axios-http.com/docs/intro)**  
    Promise 기반 HTTP 클라이언트인 Axios의 개요 및 사용법
- **[Axios & Error handling like a boss - DEV Community](https://dev.to/mperon/axios-error-handling-like-a-boss-333d)**  
    Axios에서 오류를 효과적으로 처리하는 방법
- [**Axios vs XMLHttpRequest - Rapid API**](https://rapidapi.com/guides/axios-vs-xmlhttprequest)  
    Axios와 XMLHttpRequest의 차이점 분석

##### Axios 설정 및 활용

- **[Request Config | Axios Docs](https://axios-http.com/docs/req_config)**  
    Axios의 다양한 요청 설정 옵션 설명
- **[Making HTTP requests with Axios - CircleCI](https://circleci.com/blog/making-http-requests-with-axios/)**  
    Axios를 활용한 HTTP 요청 처리

##### Axios 및 비동기 처리 문제 해결

- **[How can I convert an existing promise to a callback in Node.js? - GitHub](https://github.com/axios/axios/issues/4915)**
- **[JavaScript convert callback to promise - Stack Overflow](https://stackoverflow.com/questions/49030088/javascript-convert-callback-to-promise/49030179)**
- **[Request made with axios does not work but works with XMLHttpRequest - Stack Overflow](https://stackoverflow.com/questions/59656393/request-made-with-axios-does-not-work-but-if-it-works-with-xmlhttprequest)**
- **[Requests unexpectedly delayed due to an Axios internal promise - GitHub](https://github.com/axios/axios/issues/2609)**
    
#####  XMLHttpRequest, Fetch API 비교

- **[Axios와 XMLHttpRequest - Silver Library](https://silverlibrary.tistory.com/498)**
- **[XMLHttpRequest & fetch & axios - velog](https://velog.io/@kcj_dev96/fetch)**
- **[Axios? Fetch API? 어떤 걸 사용해야 하나요 - velog](https://velog.io/@myjeong19/Axios-Fetch-API-%EC%96%B4%EB%96%A4%EA%B1%B8-%EC%82%AC%EC%9A%A9%ED%95%B4%EC%95%BC-%ED%95%98%EB%82%98%EC%9A%94)**    
- **[Ajax란? + XMLHttpRequest, fetch API, axios - Woldan Blog](https://pul8219.github.io/javascript/js-ajax/)**
    
##### 비동기 처리 관련 참고 자료

- **[How do I return the response from an asynchronous call? - Stack Overflow](https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call/50178868)**


### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]





[^1]: **[Axios & Error handling like a boss - DEV Community](https://dev.to/mperon/axios-error-handling-like-a-boss-333d)**  

[^2]: [**Axios vs XMLHttpRequest - Rapid API**](https://rapidapi.com/guides/axios-vs-xmlhttprequest)  
