import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/shared/ui';
export function PasswordField({
  field,
  label,
  error,
  current = false,
}: {
  field: UseFormRegisterReturn;
  label: string;
  error?: string;
  current?: boolean;
}): JSX.Element {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...field}
      label={label}
      type={visible ? 'text' : 'password'}
      autoComplete={current ? 'current-password' : 'new-password'}
      requiredAsterisk
      error={error}
      endIcon={visible ? 'eyeOff' : 'eye'}
      onEndIconClick={() => setVisible(!visible)}
    />
  );
}
