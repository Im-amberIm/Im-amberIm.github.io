---
title:
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

AJAX가 뭔데?

### **AJAX (Asynchronous JavaScript and XML)**
>  웹 브라우저와 서버 간 데이터를 비동기적으로 교환하는 프로그래밍 방식.
>  - **카테고리**: **웹 개발 기법**
- **역할**: 전체 페이지를 새로고침하지 않고 필요한 데이터만 갱신하여 동적인 웹 애플리케이션 구현.
- **특징**:
    - 비동기 통신을 통해 빠르고 부드러운 사용자 경험 제공.
    - XML뿐만 아니라 JSON, HTML 등 다양한 데이터 형식 사용 가능.
        

### **XML (eXtensible Markup Language)**
>  데이터를 구조화하고 저장하기 위한 마크업 언어.
>  - **카테고리**: **웹 개발 기법**
- **역할**: 초기 AJAX에서 서버와 클라이언트 간 데이터 교환 형식으로 사용됨.
- **현황**: 현재는 JSON이 더 널리 사용됨.
    

### **XMLHttpRequest**
> **브라우저에서 제공하는 Web API 객체로, AJAX 요청을 구현하기 위해 사용됨.
> - **카테고리**: **브라우저 API**
- **역할**:
    - HTTP 요청 전송 및 응답 수신.
    - 서버와 비동기적으로 데이터를 주고받음.
- **특징**:
    - 콜백 기반으로 동작, 코드 가독성이 낮음.
    - 오래된 기술로 Fetch API로 대체되고 있음.
        

### **Fetch API**
> ** XMLHttpRequest를 대체하기 위해 도입된 최신 Web API.
> - **카테고리**: **브라우저 API**
    
- **역할**:
    - HTTP 요청을 Promise 기반으로 처리하여 비동기 작업을 간결하게 구현.
    - JSON 파싱 및 에러 처리가 직관적임.
- **특징**:
    - 코드가 간단하고 가독성이 높음.
    - 최신 브라우저에서 지원.
        

### **HTTP 요청**
>  클라이언트와 서버 간 데이터 교환을 위한 프로토콜.
>  - **카테고리**: **네트워크 프로토콜**
- **역할**:
    - 클라이언트가 서버에 데이터를 요청(GET, POST 등)하거나 데이터를 전송함.
    - AJAX, XMLHttpRequest, Fetch API 모두 HTTP 요청을 기반으로 동작.


- AJAX는 특정 기술이 아니라 여러 기술(HTML, CSS, JavaScript, XMLHttpRequest 등)의 조합으로 이루어진 웹 개발 기법입니다.
    
- XMLHttpRequest와 Fetch API는 AJAX를 구현하기 위한 브라우저 API이며, XML은 초기 데이터 형식으로 사용되었으나 현재는 JSON이 주로 사용됩니다.
    
- HTTP 요청은 AJAX가 동작하는 기반 프로토콜입니다.

## **2. 계층 구조**

```js

HTTP 요청
 └── AJAX (비동기 통신 개념)
      ├── XMLHttpRequest (구현 기술)
      └── Fetch API (최신 구현 기술)
XML (데이터 형식, 초기 AJAX에서 사용)


HTTP 요청 (네트워크 프로토콜)
 └── AJAX (웹 개발 기법)
      ├── XMLHttpRequest (브라우저 API)
      ├── Fetch API (브라우저 API)
      └── XML/JSON (데이터 형식)


```
## **3. 관계 및 비교**

|용어|역할/특징|현재 활용도|
|---|---|---|
|**HTTP 요청**|클라이언트와 서버 간 데이터 교환 프로토콜. GET/POST 방식 등으로 요청.|모든 웹 통신의 기본|
|**AJAX**|비동기 통신 개념. 전체 페이지 리로드 없이 필요한 데이터만 갱신.|현대 웹 개발의 핵심 개념|
|**XMLHttpRequest**|AJAX 구현 기술. 콜백 기반으로 복잡한 코드 작성 필요.|레거시 시스템에서 사용 중|
|**Fetch API**|XMLHttpRequest를 대체하는 최신 기술. Promise 기반으로 간결한 코드 작성 가능.|현대 웹 개발에서 권장|
|**XML**|초기 AJAX에서 데이터 형식으로 사용되었으나, 현재는 JSON이 더 널리 사용됨.|거의 사용되지 않음|





## **4. 요약**

AJAX는 비동기 통신의 개념이며, 이를 구현하기 위해 `XMLHttpRequest`와 `Fetch API`가 사용됩니다. 초기에는 XML이 데이터 교환 형식으로 사용되었으나, 현재는 JSON이 주로 사용됩니다. Fetch API는 Promise 기반으로 더 간단하고 현대적인 방식으로 AJAX를 구현할 수 있어 최신 웹 개발에서 선호됩니다.


## AJAX의 활용

AJAX에서 서버와 통신하기 위해 보내는 HTTP 리퀘스트가 기술의 핵심이라고 할 수 있는데요. 이를 위해서는 기능을 제공하는 객체의 인스턴스가 필요했고, `XMLHttpRequest` 가 대표적으로 사용된 객체입니다.

요즘은 Fetch API나 `XMLHttpRequest` 를 기반으로 더 쓰기 편하게 만들어진 axios와 같은 패키지를 사용해서 AJAX를 활용하고 있습니다.

## **Axios와 XMLHttpRequest의 차이점**

|특징|**XMLHttpRequest**|**Axios**|
|---|---|---|
|**기반 기술**|브라우저 내장 API|XMLHttpRequest 기반 (브라우저 환경)|
|**비동기 처리 방식**|콜백 기반|Promise 기반|
|**코드 가독성**|복잡하고 중첩된 코드 발생 가능|간결하고 직관적인 코드 작성 가능|
|**추가 기능**|없음|JSON 자동 변환, 인터셉터, 요청 취소 등 제공|






### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
