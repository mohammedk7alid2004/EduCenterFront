import { useState } from 'react';
import { API_BASE_URL } from '@/shared/constants';
export function ProfileAvatar({
  name,
  imageUrl,
  className = 'size-8',
  rounded = false,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
  rounded?: boolean;
}): JSX.Element {
  const [failed, setFailed] = useState<string>();
  let source: string | undefined;
  try {
    source = imageUrl ? new URL(imageUrl, `${new URL(API_BASE_URL).origin}/`).href : undefined;
  } catch {
    source = undefined;
  }
  return source && failed !== source ? (
    <img
      src={source}
      alt=""
      onError={() => setFailed(source)}
      className={`${className} shrink-0 ${rounded ? 'rounded-2xl' : 'rounded-full'} object-cover object-top`}
    />
  ) : (
    <span
      className={`${className} grid shrink-0 place-items-center ${rounded ? 'rounded-2xl' : 'rounded-full'} bg-primary/10 font-semibold text-primary`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
