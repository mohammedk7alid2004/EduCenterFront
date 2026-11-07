import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; import type { PropsWithChildren } from 'react'; import { Toaster } from 'sonner';
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });
export function AppProviders({ children }: PropsWithChildren): JSX.Element { return <QueryClientProvider client={queryClient}>{children}<Toaster richColors position="top-end" /></QueryClientProvider>; }
