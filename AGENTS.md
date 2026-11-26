# EduCenter engineering rules

- Preserve feature-based boundaries: `features/<name>` owns its `commands/`, `queries/`, `components/`, `schemas/`, `types/`, and feature `constants/` or `utils/`; expose public members only through `index.ts`. Route pages live in `src/pages/` and compose features via their public `index.ts`.
- Keep TypeScript strict. Avoid `any`, magic strings, direct Axios calls in UI, and direct icon-library imports.
- Put colors only in `src/app/config/theme.ts`; use semantic Tailwind tokens. Put icons only in `src/app/config/icons.ts`; use `Icon`.
- Put UI text in `src/locales/` JSON files. Use logical directional classes, never left/right variants.
- Define routes, endpoints, keys, and query keys in `src/shared/constants/`; define roles and permissions in `src/app/config/permissions.ts`.
- API functions are pure and receive cancellation signals (`commands/` for writes, `queries/` for reads). Query/mutation hooks own server-state behavior.
- Cover loading, empty, error, offline, validation, and pending-submit states. Use `ApiError` and `setServerErrors` for failures.
- A page in `src/pages/` should compose feature components/hooks and remain small. Extract repeated behavior or visuals.
