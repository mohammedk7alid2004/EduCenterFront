# 🏛️ EduCenter Frontend Architecture Guide

## نمط المعمارية: Feature-Based Vertical Slice Architecture

تعتمد هذه المعمارية على تقسيم المشروع حسب **الوظائف (Features)** بدلاً من التقسيم الأفقي التقليدي، مما يجعل الكود سهل الصيانة، سريع التوسع، وخالياً من التشابك بين الشاشات.

---

## 📂 هيكل المجلدات الرئيسي

```
src/
├── app/                  # 1. طبقة التطبيق والتوجيه
│   ├── layouts/          # التخطيطات العامة (Sidebar, Header, Layout)
│   ├── routes/           # إعدادات React Router والـ Route Guards
│   ├── app.tsx           # المكون الرئيسي للـ Shell
│   └── error-boundary.tsx# معالج الأخطاء العام
│
├── config/               # 2. الإعدادات والثوابت (Single Source of Truth)
│   ├── constants.ts      # الثوابت (Endpoints, Routes, Storage Keys)
│   ├── theme.ts          # ألوان الهوية الرسمية (Deep Forest, Golden Hour, Sand)
│   ├── icons.ts          # سجل الأيقونات المركزي (Lucide Registry)
│   └── permissions.ts    # الصلاحيات والأدوار (RBAC)
│
├── core/                 # 3. البنية التحتية والخدمات الأساسية
│   ├── api/              # عميل Axios مع الـ Interceptors وتجديد الـ Token
│   ├── auth/             # مخزن الـ Auth بالـ Zustand والـ Persistence
│   ├── i18n/             # إعدادات اللغات (عربي / إنجليزي) ودعم RTL
│   └── providers/        # مزودات React Query والـ Toasts
│
├── features/             # 4. الميزات المستقلة (Features / Vertical Slices)
│   ├── auth/             # ميزة تسجيل الدخول
│   │   ├── components/   # مكونات خاصة بالميزة (Form, Hero, Logo, Modals)
│   │   ├── api.ts        # دوال الـ API النقية للميزة
│   │   ├── hooks.ts      # React Query Hooks للميزة
│   │   ├── types.ts      # أنواع TypeScript الخاصة بالميزة
│   │   ├── login-page.tsx# شاشة الدخول الرئيسية
│   │   └── index.ts      # المخرج العام الوحيد للميزة
│   │
│   ├── dashboard/        # ميزة لوحة التحكم
│   └── [feature_name]/   # أي ميزة جديدة (الطلاب، المجموعات، الحصص، الحسابات...)
│
└── shared/               # 5. العناصر والمكونات المشتركة
    ├── ui/               # مكونات UI قابلة للاستخدام في أي مكان (Button, Input, Modal, DataTable, Icon)
    ├── lib/              # دوال و Hooks مساعدة عامة (useDebounce, useUrlState)
    └── styles/           # ملفات Tailwind CSS وأنماط التصميم
```

---

## ⚡ كيف تضيف أي ميزة جديدة (Feature) في 4 خطوات بسيطة؟

عند إضافة شاشة جديدة (مثال: ميزة الطلاب `students`):

### 1. أنشئ مجلد الميزة: `src/features/students/`

- **`types.ts`**: عرّف الأنواع والبيانات:
  ```ts
  export interface Student {
    id: string;
    fullName: string;
    grade: string;
  }
  ```
- **`api.ts`**: دوال الاتصال بالباك إند:
  ```ts
  import { apiClient } from '@/core/api';
  import type { Student } from './types';

  export async function getStudents(signal?: AbortSignal): Promise<Student[]> {
    const { data } = await apiClient.get<Student[]>('/Students', { signal });
    return data;
  }
  ```
- **`hooks.ts`**: استدعاء React Query:
  ```ts
  import { useQuery } from '@tanstack/react-query';
  import { getStudents } from './api';

  export function useStudents() {
    return useQuery({
      queryKey: ['students'],
      queryFn: ({ signal }) => getStudents(signal),
    });
  }
  ```

### 2. ابنِ مكونات الشاشة

- ضع المكونات الصغيرة في `src/features/students/components/`.
- اجمع الصفحة في `students-page.tsx`.

### 3. صدّر الصفحة في `index.ts`

```ts
// src/features/students/index.ts
export { StudentsPage } from './students-page';
```

### 4. سجّل المسار في الراوتر

في `src/app/routes/router.tsx`:

```tsx
{ path: '/students', element: <StudentsPage /> }
```

---

## 🛡️ القواعد الذهبية المتبعة في المشروع

1. **Feature Boundaries**: كل ميزة تملك ملفاتها بالكامل ولا يتم استيراد أي ملف داخلي من خارج الميزة إلا عبر `index.ts`.
2. **Strict TypeScript**: بدون `any` وبدون Magic Strings.
3. **No Direct Axios in UI**: كل طلبات السيرفر تمر عبر `api.ts` و `hooks.ts`.
4. **Icons via Registry**: تسجل الأيقونة في `src/config/icons.ts` وتستعمل عبر `<Icon name="..." />`.
5. **Semantic Theme**: الألوان تأتي من التوكنز فقط (`bg-primary`, `text-accent`...).
6. **Full RTL & i18n**: كل النصوص من ملفات الترجمة واستعمال اتجاهات منطقية دائماً (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).
