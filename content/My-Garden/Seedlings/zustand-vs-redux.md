---
title:
description:
stage: seedling
date: 2025-03-24
lastmod: 2025-03-24
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

Tanstack-query로 서버 데이터 관리하는데 zustand 도입이 필요할까?
이 조합으로 많이 쓴다는데 진짜인가?
## 🔍 Research


What is Zustand?

https://blog.msar.me/understanding-zustand-a-lightweight-state-management-library-for-react

### Use Cases for Zustand

Zustand can be used in various scenarios where state management is required. Here are a few common use cases:

1. **Global State Management:** Managing global state across the entire application, such as user authentication, theme settings, and application configuration.
    
2. **Component State Management:** Handling state that is shared between multiple components, such as form inputs, filters, and UI state.
    
3. **Asynchronous State Management:** Managing state that depends on asynchronous operations, such as fetching data from an API and handling loading and error states.







https://dev.to/androbro/simplifying-data-fetching-with-zustand-and-tanstack-query-one-line-to-rule-them-all-3k87

## **When TanStack Query Alone is Enough**

TanStack Query is excellent for managing **server state**, such as:

1. Authentication flows (e.g., login/logout, token refresh).
    
2. Fetching and caching user data (e.g., profile, permissions).
    
3. Keeping server data in sync with the UI (e.g., refetching when stale).
    

For example:

- If your app relies on HTTP-only cookies for tokens and uses TanStack Query to fetch the authenticated user and manage session state, you don't need Zustand or Redux.
    
- TanStack Query's caching and automatic refetching ensure that server state remains up-to-date without additional libraries.


The article you linked recommends using Zustand alongside TanStack Query to simplify data fetching and handle loading/error states in a more centralized way. Here's a breakdown of the reasons:

1. **Centralized Loading State Management**:
    
    - **Problem**: Managing loading states for multiple queries can lead to repetitive code and scattered logic.
        
    - **Zustand Solution**: By creating a global loading state in Zustand, components can easily access and modify the loading state.
        
    - **Example**:
        
        javascript
        
        `import { create } from 'zustand'; interface LoaderState {   isLoading: boolean;  setIsLoading: (isLoading: boolean) => void; } export const useLoaderStore = create<LoaderState>()((set) => ({   isLoading: false,  setIsLoading: (isLoading: boolean) => set({ isLoading }), }));`
        
2. **Centralized Error Handling and Notifications**:
    
    - **Problem**: Displaying error messages or toast notifications across different components can be inconsistent and require duplication.
        
    - **Solution**: Centralize error handling and notification logic.
        
    - **Example**: The article uses a global `showToast` function and a custom `useErrorNotification` hook to consistently display errors using a toast system (e.g., PrimeReact's `Toast`).
        
3. **Custom Data Fetching Hook**:
    
    - **Problem**: Data fetching logic, error handling, and loading state updates can clutter components.
        
    - **Solution**: Create a custom hook (`useDataFetching`) to encapsulate these tasks. This hook uses TanStack Query for data fetching and Zustand for loading state management.
        
    - **Example**:
        
        javascript
        
        `import { useLoaderStore } from '@/stores/store'; import { useErrorNotification } from '@/hooks/useErrorNotification'; interface UseDataFetchingParams {   isLoading: boolean;  isError: boolean;  error: CustomError | null;  errorMessage: string; } export const useDataFetching = ({ isLoading, isError, error, errorMessage }: UseDataFetchingParams) => {   const { setIsLoading } = useLoaderStore();  useErrorNotification(isError, errorMessage, error);  useLoading(isLoading, setIsLoading); };`
        
4. **Simplified Component Code**:
    
    - By using these abstractions, components become cleaner and focused on rendering. The data fetching logic, loading state management, and error handling are handled by the custom hooks.
        
    - **Example**:
        
        javascript
        
        `const { cars, refetchCars } = useCars({ filterObject: selectedBrand, active });`
        
        This one line provides access to the fetched data, a refetch function, automatic loading state management (via Zustand), and automatic error handling.
        
5. **Benefits Summarized**:
    
    - **Simplified Component Code**: Components are more focused on rendering, not data management.
        
    - **Global State Management**: Zustand easily manages global state, like a loading indicator.
        
    - **Powerful Data Fetching**: TanStack Query handles caching, refetching, and background updates.
        
    - **Centralized Error Handling**: A global toast system provides consistent error handling and display.
        
    - **Reusability**: Custom hooks like `useCars` can be reused in multiple components.
        
    - **Consistency**: Error handling and loading states are managed consistently across components.
        

In summary, the article suggests that combining Zustand with TanStack Query can simplify data fetching and improve code organization by centralizing loading state management and error handling. This approach reduces boilerplate code and makes components cleaner and more maintainable.

### 🚩 알게된 것

-

### ⏭ 다음 단계 (What's Next?)

- [ ]

### 📚 References & Resources

[Zustand](https://refine.dev/blog/zustand-react-state/#introduction)

### 📝 연관 노트

- 🌿 **Budding:** [[]]
- 🌳 **Evergreen:** [[]]
