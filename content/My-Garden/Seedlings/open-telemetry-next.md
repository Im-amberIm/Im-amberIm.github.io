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

https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry

## 🔍 Research

## 요약: Next.js 앱 성능 모니터링을 위한 OpenTelemetry 설정 가이드

이 글은 Next.js 애플리케이션의 성능을 이해하고 최적화하기 위한 관측성(Observability)의 중요성을 강조하며, OpenTelemetry를 사용하여 앱을 계측하는 방법을 안내합니다. OpenTelemetry는 플랫폼에 독립적인 방식으로 앱을 계측하여 코드 변경 없이 관측성 제공자를 변경할 수 있도록 해줍니다.

**주요 내용:**

- **OpenTelemetry 소개:** 관측성의 중요성과 OpenTelemetry를 사용하여 애플리케이션을 계측하는 이점 설명.
    
- **`@vercel/otel` 패키지 사용:** OpenTelemetry를 빠르게 설정할 수 있도록 도와주는 `@vercel/otel` 패키지 사용 방법 안내.
    
    - 필요한 패키지 설치 (`@vercel/otel`, `@opentelemetry/sdk-logs`, `@opentelemetry/api-logs`, `@opentelemetry/instrumentation`)
        
    - 프로젝트 루트 디렉토리에 `instrumentation.ts` (또는 `.js`) 파일 생성.
        
    - `registerOTel` 함수를 사용하여 OpenTelemetry 등록.
        
- **수동 OpenTelemetry 구성:** `@vercel/otel` 패키지가 요구 사항을 충족하지 못하는 경우 OpenTelemetry를 수동으로 구성하는 방법 안내.
    
    - 필요한 OpenTelemetry 패키지 설치 (`@opentelemetry/sdk-node`, `@opentelemetry/resources`, `@opentelemetry/semantic-conventions`, `@opentelemetry/sdk-trace-node`, `@opentelemetry/exporter-trace-otlp-http`)
        
    - `instrumentation.node.ts` 파일을 생성하여 NodeSDK 초기화.
        
    - `process.env.NEXT_RUNTIME === 'nodejs'` 조건을 사용하여 Node 환경에서만 코드가 실행되도록 함.
        
- **계측 테스트:** OpenTelemetry 추적을 로컬에서 테스트하기 위해 호환 가능한 백엔드를 갖춘 OpenTelemetry Collector 사용 권장.
    
- **배포:** OpenTelemetry Collector를 사용하거나 사용자 지정 Exporter를 사용하여 배포하는 방법 안내.
    
- **사용자 지정 스팬 추가:** OpenTelemetry API를 사용하여 사용자 지정 스팬을 추가하는 방법 안내.
    
- **Next.js의 기본 스팬:** Next.js가 자동으로 계측하는 여러 스팬에 대한 설명 및 속성 정보 제공.
    

**OpenTelemetry 설정 및 테스트 후 할 일:**

1. `NEXT_OTEL_VERBOSE=1` 설정하여 더 많은 스팬을 확인.
    
2. OpenTelemetry Collector를 사용하여 추적 데이터를 수집하고 시각화.
    
3. 필요에 따라 사용자 지정 스팬을 추가하여 특정 코드 영역의 성능을 추적.
    
4. 수집된 데이터를 기반으로 애플리케이션 성능을 최적화.
    

**결론:**

OpenTelemetry를 사용하면 Next.js 애플리케이션의 성능을 효과적으로 모니터링하고 문제를 진단할 수 있습니다. `@vercel/otel` 패키지를 사용하면 설정을 간소화할 수 있으며, 필요에 따라 수동으로 구성하여 더 많은 유연성을 확보할 수 있습니다.

### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
