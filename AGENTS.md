# EduCenter engineering rules

- Preserve feature-based boundaries: `features/<name>` owns its page, components, API functions, and query hooks; expose public members only through `index.ts`.
- Keep TypeScript strict. Avoid `any`, magic strings, direct Axios calls in UI, and direct icon-library imports.
- Put colors only in `src/config/theme.ts`; use semantic Tailwind tokens. Put icons only in `src/config/icons.ts`; use `Icon`.
- Put UI text in i18n JSON files. Use logical directional classes, never left/right variants.
- Define routes, endpoints, keys, roles, permissions, and query keys as constants.
- API functions are pure and receive cancellation signals. Query/mutation hooks own server-state behavior.
- Cover loading, empty, error, offline, validation, and pending-submit states. Use `ApiError` and `setServerErrors` for failures.
- A page should compose feature components/hooks and remain small. Extract repeated behavior or visuals.
