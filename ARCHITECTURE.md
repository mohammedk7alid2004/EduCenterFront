# 🏛️ EduCenter Frontend Architecture Guide

## نمط المعمارية: Feature-Based Architecture (Commands / Queries / Pages)

تعتمد هذه المعمارية على تقسيم المشروع حسب **الميزات (Features)** مع فصل طبقة التطبيق (`app/`)، والصفحات (`pages/`)، والعناصر المشتركة (`shared/`)، وفصل عمليات القراءة (`queries/`) عن عمليات الكتابة (`commands/`) وملفات التحقق (`schemas/`) والأنواع (`types/`) داخل كل ميزة.

---

## 📂 هيكل المجلدات الرئيسي

```
src/
├── app/                      # 1. طبقة التطبيق والتكوين العام
│   ├── providers/            # مزودات React Query والـ Toasts
│   ├── router/               # إعدادات React Router والـ Route Guards
│   ├── layouts/              # التخطيطات العامة (Sidebar, Header, AppLayout)
│   ├── config/               # الألوان (theme)، الأيقونات (icons)، الصلاحيات (permissions)، i18n
│   ├── app.tsx               # المكون الرئيسي للـ Shell
│   └── error-boundary.tsx    # معالج الأخطاء العام
│
├── features/                 # 2. الميزات المستقلة (Features)
│   └── [feature_name]/
│       ├── commands/         # دوال الكتابة (API + useMutation hooks)
│       ├── queries/          # دوال القراءة (API + useQuery hooks)
│       ├── components/       # مكونات الواجهة الخاصة بالميزة
│       ├── schemas/          # مخططات التحقق بـ Zod
│       ├── types/            # أنواع TypeScript الخاصة بالميزة
│       ├── constants/        # (اختياري) ثوابت الميزة
│       ├── utils/            # (اختياري) دوال مساعدة خاصة بالميزة
│       └── index.ts          # المخرج العام الوحيد للميزة
│
├── shared/                   # 3. العناصر المشتركة عبر التطبيق
│   ├── api/                  # عميل Axios والـ Interceptors ومعالجة ApiError
│   ├── components/           # مكونات UI قابلة لإعادة الاستخدام (Button, Input, Modal, DataTable, Icon)
│   ├── hooks/                # Hooks عامة (useAuthStore, usePermission, useOnline, useListControls...)
│   ├── utils/                # دوال مساعدة عامة (forms, download, qr-code)
│   ├── types/                # الأنواع المشتركة (ApiResult, PaginatedResult, ListFilters, AuthUser)
│   └── constants/            # الثوابت العامة (ROUTES, API_ENDPOINTS, QUERY_KEYS, STORAGE_KEYS)
│
├── pages/                    # 4. صفحات المسارات (Thin Route Pages)
├── assets/                   # 5. الملفات الثابتة وأنماط CSS (styles/tokens.css)
├── locales/                  # 6. ملفات الترجمة (ar.json, en.json)
└── main.tsx                  # نقطة دخول التطبيق
```

---

## ⚡ كيف تضيف أي ميزة جديدة (Feature)؟

عند إضافة شاشة جديدة (مثال: `products`):

1. **أنشئ مجلد الميزة `src/features/products/`**:
   - `types/`: تعريف الأنواع والواجهات.
   - `schemas/`: تعريف Zod validation schemas.
   - `queries/`: دوال الـ GET النقية (`*.queries.api.ts`) و React Query hooks (`*.queries.ts`).
   - `commands/`: دوال الـ POST/PUT/PATCH/DELETE (`*.commands.api.ts`) و mutation hooks (`*.commands.ts`).
   - `components/`: مكونات الشاشة (الجدول، الفلاتر، المودال...).
   - `index.ts`: تصدير الأعضاء العامة فقط.
2. **أنشئ الصفحة في `src/pages/products-page.tsx`** وصدّرها من `src/pages/index.ts`.
3. **سجّل المسار في `src/app/router/router.tsx`** عبر lazy import من `@/pages/products-page`.

---

## 🛡️ القواعد الذهبية المتبعة في المشروع

1. **Feature Boundaries**: كل ميزة تملك ملفاتها بالكامل ولا يتم استيراد أي ملف داخلي من خارج الميزة إلا عبر `index.ts`.
2. **Strict TypeScript**: بدون `any` وبدون Magic Strings.
3. **No Direct Axios in UI**: كل طلبات السيرفر تمر عبر `commands/` و `queries/`.
4. **Icons via Registry**: تسجل الأيقونة في `src/app/config/icons.ts` وتستعمل عبر `<Icon name="..." />`.
5. **Semantic Theme**: الألوان تأتي من التوكنز فقط (`src/app/config/theme.ts`).
6. **Full RTL & i18n**: كل النصوص من `src/locales/` واستعمال اتجاهات منطقية دائماً (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).
