# EduCenter frontend foundation

React 18 + Vite + TypeScript foundation organized by feature. It supplies architecture and cross-cutting concerns; business flows are deliberately not implemented yet.

## Run

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
```

Copy `.env.example` to `.env` and set the API URL for your environment.

## Architecture

- `src/config`: application-wide constants, permissions, icon adapter, and the single theme definition.
- `src/core`: infrastructure—Axios/interceptors, auth store, i18n, and global providers.
- `src/shared`: reusable presentational components, styles, and framework-agnostic helpers.
- `src/features`: independently owned product areas. Import another feature only from its `index.ts` public API.
- `src/app`: composition root: layouts, routes, guards, and route-level error handling.

Data flows through **page/component → query hook → API function → configured Axios client**. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Common changes

### Change colors

Edit only `src/config/theme.ts`. Semantic Tailwind classes such as `bg-primary` and `text-muted` derive from its generated CSS variables. Never put hex values or palette utility classes in components.

### Change icons

Map a replacement implementation in `src/config/icons.ts`; components use `<Icon name="..." />` from `@/shared/ui` and never import an icon package directly.

### Add a feature

1. Copy `src/features/_template` to `src/features/<name>`.
2. Rename the files and types.
3. Add endpoint constants in `src/config/constants.ts`.
4. Put pure HTTP calls in `<name>.api.ts` and TanStack Query hooks in `<name>.queries.ts`.
5. Export only public pieces from that feature's `index.ts`.
6. Register its route in `src/app/routes/router.tsx`.

### Add a page or route

Keep the page in its owning feature and add an entry to `src/app/routes/router.tsx`. Add a route constant to `ROUTES`; wrap with `ProtectedRoute`, `GuestRoute`, and/or a role/permission guard as appropriate.

### Add an API

Define the endpoint in `API_ENDPOINTS`, create a typed pure function using `apiClient`, then expose a query or mutation hook. Pass React Query's `signal` to Axios so requests cancel on unmount. UI should never use Axios directly.

### Add a language

Add `src/core/i18n/locales/<code>.json`, import it in `src/core/i18n/index.ts`, add its code to `supportedLanguages`, and add a language selector where appropriate. `setLanguage` handles `lang` and RTL direction.

## Conventions

Use named exports, strict types, semantic tokens, logical Tailwind spacing (`ms`, `me`, `ps`, `pe`), and translation keys for all UI text. New permissions belong only in `src/config/permissions.ts`; new durable browser keys belong in `STORAGE_KEYS`. Pages compose; hooks hold UI/data logic; API modules remain React-free.
