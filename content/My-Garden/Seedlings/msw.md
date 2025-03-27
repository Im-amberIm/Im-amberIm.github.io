---
title: 
description: 
stage: seedling
date: 2025-03-27
lastmod: 2025-03-27
tags:
  - seedling
category: 
type: note
enableToc: true
draft: true
---

> 배경

mock api 중 msw 고른 이유

## 🔍 Research

## **MSW와 다른 API Mocking 라이브러리의 차이점**

MSW(Mock Service Worker)는 **Service Worker**를 활용하여 네트워크 수준에서 요청을 가로채고 모의 응답을 제공하는 API Mocking 라이브러리입니다. 이를 다른 라이브러리와 비교하면 다음과 같은 차이점이 있습니다:

## **1. MSW의 주요 특징**

- **네트워크 레벨에서 Mocking**:
    
    - MSW는 브라우저의 Service Worker를 이용해 HTTP 요청을 가로채므로, 네이티브 `fetch` 메서드나 `axios`, `react-query` 등 모든 네트워크 라이브러리와 호환됩니다[1](https://velog.io/@khy226/msw%EB%A1%9C-%EB%AA%A8%EC%9D%98-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0)[2](https://tech.ktcloud.com/entry/MSW%EB%A1%9C-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0-API-Mocking)[4](https://uiop5809.tistory.com/234).
        
- **Mock 서버 구축 불필요**:
    
    - 별도의 Mock 서버 없이 네트워크 요청을 처리하여 개발 환경을 간소화합니다[1](https://velog.io/@khy226/msw%EB%A1%9C-%EB%AA%A8%EC%9D%98-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0)[2](https://tech.ktcloud.com/entry/MSW%EB%A1%9C-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0-API-Mocking).
        
- **브라우저와 Node.js 환경 지원**:
    
    - 브라우저에서는 Service Worker를, Node.js에서는 HTTP 요청 가로채기를 통해 동작합니다[2](https://tech.ktcloud.com/entry/MSW%EB%A1%9C-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0-API-Mocking)[4](https://uiop5809.tistory.com/234).
        
- **유저 중심 테스트 가능**:
    
    - 실제 사용자처럼 네트워크 요청과 응답을 처리하여 더 현실적인 테스트 환경을 제공합니다[3](https://seongry.github.io/2021/12-05-try-to-use-msw-on-testing/)[8](https://bum-developer.tistory.com/entry/React-MSW).
        

## **2. 다른 API Mocking 라이브러리와의 차이점**

|**라이브러리**|**Mocking 방식**|**주요 차이점**|
|---|---|---|
|**MSW**|네트워크 레벨(Service Worker)|네트워크 요청을 가로채므로 모든 네트워크 라이브러리와 호환되며, 브라우저와 Node.js 환경 모두 지원[1](https://velog.io/@khy226/msw%EB%A1%9C-%EB%AA%A8%EC%9D%98-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0)[2](https://tech.ktcloud.com/entry/MSW%EB%A1%9C-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0-API-Mocking).|
|**Axios Mock Adapter**|Axios 요청 레벨에서 Mocking|Axios에 종속적이며, 네이티브 `fetch`나 다른 HTTP 클라이언트와는 호환되지 않음[3](https://seongry.github.io/2021/12-05-try-to-use-msw-on-testing/)[8](https://bum-developer.tistory.com/entry/React-MSW).|
|**JSON Server**|로컬 Mock 서버 생성|별도의 서버를 구축해야 하며, 실제 네트워크 요청을 가로채지 않음. 프론트엔드와 백엔드 간 병렬 작업에 적합[1](https://velog.io/@khy226/msw%EB%A1%9C-%EB%AA%A8%EC%9D%98-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0).|
|**Mirage JS**|클라이언트-서버 통신 모의(Mock)|클라이언트 중심으로 설계되어 있으며, GraphQL 및 RESTful API 모두 지원하지만 브라우저 외부 환경에서는 제한적[2](https://tech.ktcloud.com/entry/MSW%EB%A1%9C-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0-API-Mocking).|
|**WireMock**|HTTP 기반 Mock 서버|복잡한 상태 기반 테스트에 적합하지만, 브라우저 내에서 직접적인 네트워크 요청 가로채기는 불가능[1](https://velog.io/@khy226/msw%EB%A1%9C-%EB%AA%A8%EC%9D%98-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0).|

## **3. MSW의 장점**

- **프레임워크 독립적**:
    
    - React, Vue, Angular 등 다양한 프레임워크에서 잘 동작합니다[2](https://tech.ktcloud.com/entry/MSW%EB%A1%9C-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0-API-Mocking).
        
- **코드 수정 필요 없음**:
    
    - 기존 API 요청 로직을 수정하지 않고 모킹 처리가 가능하며, 실제 API로 쉽게 전환할 수 있습니다[1](https://velog.io/@khy226/msw%EB%A1%9C-%EB%AA%A8%EC%9D%98-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0)[4](https://uiop5809.tistory.com/234).
        
- **현실적인 테스트 환경 제공**:
    
    - Service Worker를 활용해 실제 사용자처럼 동작하는 테스트가 가능하므로, 더 신뢰성 있는 결과를 얻을 수 있습니다[3](https://seongry.github.io/2021/12-05-try-to-use-msw-on-testing/)[8](https://bum-developer.tistory.com/entry/React-MSW).
        

## **4. MSW 선택 이유**

MSW는 다음과 같은 이유로 다른 라이브러리보다 선호됩니다:

1. **네트워크 레벨에서 동작**: 모든 HTTP 클라이언트를 지원하며, 실제 API 요청과 동일한 흐름으로 테스트 가능.
    
2. **설치 및 사용 간편성**: 별도의 서버 구축 없이 빠르게 설정 가능.
    
3. **다양한 환경 지원**: 브라우저와 Node.js 모두에서 일관된 Mocking 제공.
    

## **결론**

MSW는 API Mocking 라이브러리 중에서도 가장 현실적이고 유연한 방식으로 네트워크 요청을 처리합니다. 다른 라이브러리에 비해 더 높은 수준의 사용자 경험과 테스트 품질을 제공하며, 특히 프론트엔드 개발 생산성을 크게 향상시킵니다.

### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
