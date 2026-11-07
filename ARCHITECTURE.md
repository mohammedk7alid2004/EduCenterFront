# Architecture and data flow

## Request flow

```text
Component/Page
  → feature query or mutation hook (*.queries.ts)
  → pure feature API function (*.api.ts)
  → apiClient (Axios)
  → request interceptor attaches access token
  → backend
```

`apiClient` has a single refresh queue. When requests receive 401, the first request refreshes the access token; concurrent requests wait for that result and retry once. A failed refresh clears persisted auth and lets guards send the visitor to login.

## Error flow

```text
Backend / network failure
  → Axios response
  → normalizeApiError
  → ApiError(code, status, fieldErrors)
  → query/mutation caller
  → translated state, toast, or form errors
```

Use `setServerErrors(error, setError)` for a 422 `ApiError`. Reusable `LoadingState`, `EmptyState`, and `ErrorState` make asynchronous page states consistent. Route rendering failures use `RouteErrorBoundary`.

## Ownership boundaries

Features may import `config`, `core`, and `shared`. They must not import another feature's internal files; only its `index.ts` is public. Components do not call Axios, access raw storage, or contain hardcoded display text. The app folder wires feature exports together but contains no business logic.
