---
title: vs extension 만들기
description: 
stage: seedling
date: 2025-03-23
lastmod: 2025-03-23
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

프로그래머스로 알고리즘 공부하는데 편집기 색상이 눈에 너무 편했다. 찾아보니 brand color 팔레트도 사이트에서 찾을 수 있었다.
한번 내 vscode에도 적용해 보자!

## Visual code studio 테마 설정


프로그래머스 편집기 색상

![[attachments/Seedlings-vs-extension-theme-1.png]]
1. 에디터 배경색: `#263747` ($blue-grey-900)
2. 변수 이름: `#FFEB3B` ($yellow-500)

3. 키워드: `#673AB7` ($color-info)

4. 메서드: `#4CAF50` ($green-500)

5. 숫자: `#FFC107` ($amber-500)

6. 연산자/구분자: `#98A8B9` ($blue-grey-300)

7. 주석: `#5F7F90` ($blue-grey-500)

| 색상 코드     | 변수 이름          | 사용 용도                               |
| --------- | -------------- | ----------------------------------- |
| `#C08DE1` |                | 함수 및 키워드 강조 (예: function, solution) |
| `#263747` | $blue-grey-900 | 배경색 (코드 에디터의 기본 배경)                 |
| `#7AA6DA` |                | 변수 및 속성 강조 (예: string, Array.join)  |
| `#4CAF51` | $green-500     | 숫자 강조 (예: Number(value) === 7)      |
| `#FFEB3B` | $yellow-500    | 연산자 및 일부 강조 요소 (예: +, =)            |
| `#99CC9A` |                | 메서드 호출 및 함수 적용 (예: .join)           |
| `#A16B94` |                | 괄호 및 일부 구문 강조 (예: { 및 })            |


| 색상 코드 | 변수 이름 | 사용 용도 |
|---------|---------|----------|
| `#d27b53` | cm-comment | 주석 |
| `#a16a94` | cm-atom, cm-number | 원자값, 숫자 |
| `#99cc99` | cm-property, cm-attribute | 속성, 어트리뷰트 |
| `#d54e53` | cm-keyword | 키워드 (function, const 등) |
| `#e7c547` | cm-string | 문자열 |
| `#b9ca4a` | cm-variable | 기본 변수 |
| `#7aa6da` | cm-variable-2 | 특수 변수 |
| `#e78c45` | cm-def | 정의 (함수명 등) |
| `#eaeaea` | cm-bracket | 괄호 |



![[attachments/Seedlings-vs-extension-theme.png]]


### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

- [프로그래머스 브랜드 컬러 팔레트](https://programmers.co.kr/design/colors#)

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
