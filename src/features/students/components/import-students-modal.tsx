import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import { Button, Icon, Modal } from '@/shared/components';
import { STUDENT_IMPORT } from '../students.constants';
import { useImportStudents } from '../students.queries';

export function ImportStudentsModal({ onClose }: { onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const mutation = useImportStudents();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ file: FileList }>();
  const result = mutation.data;

  return (
    <Modal
      title={t('students.import')}
      icon="upload"
      onClose={onClose}
      pending={mutation.isPending}
    >
      {result ? (
        <div className="space-y-5">
          <p role="status" className="rounded-2xl bg-success/10 p-4 text-sm text-success">
            {t('students.imported', {
              total: result.totalRows,
              uploaded: result.uploadedCount,
              skipped: result.skippedCount,
            })}
          </p>
          {!!result.skippedCount && (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border p-4 text-sm">
              <h3 className="font-medium">{t('students.skippedRows')}</h3>
              {result.skippedDetails?.length ? (
                result.skippedDetails.map((item, idx) => (
                  <p key={`${item.rowNumber}-${idx}`}>
                    {item.rowNumber > 0 ? `${t('students.row', { count: item.rowNumber })}: ` : ''}
                    {item.message ||
                      t(`students.skipReasons.${item.reason}`, {
                        defaultValue: t('students.skipReasons.4'),
                      })}
                  </p>
                ))
              ) : (
                <p>{result.skippedRows?.join(t('students.separator'))}</p>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={onClose}>{t('common.close')}</Button>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit((values) => {
            const selected = values.file?.[0];
            if (online && selected)
              mutation.mutate(selected, { onError: (error) => setServerErrors(error, setError) });
          })}
        >
          <p className="mb-5 text-sm leading-6 text-tableHeading">{t('students.importHint')}</p>
          {(!online || mutation.error) && (
            <p role="alert" className="mb-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">
              {!online
                ? t('errors.network')
                : t(mutation.error?.message ?? 'errors.unknown', {
                    defaultValue: mutation.error?.message,
                  })}
            </p>
          )}
          <label htmlFor="students-import-file" className="mb-2 block text-sm font-medium">
            {t('students.file')}
          </label>
          <input
            id="students-import-file"
            type="file"
            accept={STUDENT_IMPORT.accept}
            disabled={mutation.isPending}
            aria-invalid={Boolean(errors.file)}
            aria-describedby={errors.file ? 'students-file-error' : undefined}
            className="block w-full rounded-xl border border-border bg-subtle p-4 text-sm file:me-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-card"
            {...register('file', {
              required: t('validation.required'),
              validate: (files) => {
                const selected = files?.[0];
                if (!selected) return t('validation.required');
                return (
                  (STUDENT_IMPORT.extensions.some((extension) =>
                    selected.name.toLowerCase().endsWith(extension),
                  ) &&
                    selected.size > 0 &&
                    selected.size <= STUDENT_IMPORT.maxBytes) ||
                  t('students.invalidFile')
                );
              },
            })}
          />
          {errors.file && (
            <p id="students-file-error" role="alert" className="mt-2 text-xs text-danger">
              {errors.file.message}
            </p>
          )}
          <div className="mt-8 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="border border-primary text-primary"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={mutation.isPending} disabled={!online}>
              <Icon name="upload" className="size-4" />
              {t('students.import')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
