import { useSearchParams } from 'react-router-dom';

export function useUrlState(
  key: string,
  fallback = '',
): readonly [string, (value: string) => void] {
  const [params, setParams] = useSearchParams();
  return [
    params.get(key) ?? fallback,
    (value: string) =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      }),
  ] as const;
}
