import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components';
import { SETTINGS_IMAGE } from '../constants';
export function LogoUpload({
  label,
  value,
  currentUrl,
  onChange,
  error,
}: {
  label: string;
  value?: File;
  currentUrl?: string | null;
  onChange: (file: File) => void;
  error?: string;
}): JSX.Element {
  const { t } = useTranslation();
  const id = useId();
  const [preview, setPreview] = useState<string>();
  useEffect(() => {
    if (!value) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <label
        htmlFor={id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) onChange(file);
        }}
        className="relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary p-5 text-center text-primary focus-within:ring-2 focus-within:ring-primary/30"
      >
        <input
          id={id}
          type="file"
          accept={SETTINGS_IMAGE.accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
            e.target.value = '';
          }}
          className="sr-only"
        />
        {preview || currentUrl ? (
          <img
            src={preview ?? currentUrl ?? undefined}
            alt={label}
            className="h-16 max-w-full object-contain"
          />
        ) : (
          <span className="grid size-10 place-items-center rounded-lg bg-permissionSurface">
            <Icon name="upload" className="size-6" />
          </span>
        )}
        <span className="text-sm font-medium">{value?.name ?? t('systemManagement.dropFile')}</span>
        <span className="text-xs text-primary/70">{t('systemManagement.imageHint')}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
