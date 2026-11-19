import { useRouteError } from 'react-router-dom';
import { ErrorState } from '@/shared/components';
export function RouteErrorBoundary(): JSX.Element {
  const error = useRouteError();
  console.error(error);
  return <ErrorState onRetry={() => window.location.reload()} />;
}
