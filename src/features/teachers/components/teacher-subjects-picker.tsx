import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubjectOptions } from '@/features/subjects';
import { useDebouncedValue } from '@/shared/hooks';
import { Button, ErrorState, Icon } from '@/shared/components';
import type { TeacherSubjectRef } from '../types';
export function TeacherSubjectsPicker({
  selected,
  onChange,
  initialSubjects,
  error,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  initialSubjects: TeacherSubjectRef[];
  error?: string;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const id = useId();
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const query = useSubjectOptions(useDebouncedValue(search, 300));
  const options = query.data?.pages.flatMap((page) => page.items) ?? [];
  const labels = [...initialSubjects, ...options]
    .filter(
      (subject, index, all) =>
        all.findIndex((item) => item.id === subject.id) === index && selected.includes(subject.id),
    )
    .map((subject) => subject.name[lang] || subject.name.en || subject.name.ar);
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {t('teachers.form.subjects')}
        <span className="ms-1 text-danger">*</span>
      </label>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-invalid={Boolean(error)}
        onClick={() => setOpen(!open)}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-full border bg-card px-4 text-start text-xs ${error ? 'border-danger' : 'border-muted/60'}`}
      >
        <span className="truncate">
          {labels.join(', ') ||
            (selected.length
              ? t('common.selected', { count: selected.length })
              : t('teachers.form.selectSubjects'))}
        </span>
        <Icon name="chevronDown" className="size-4 shrink-0" />
      </button>
      {open && (
        <div
          id={`${id}-options`}
          className="absolute inset-x-0 top-full z-10 mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-xl"
        >
          <input
            type="search"
            autoFocus
            value={search}
            aria-label={t('subjects.search')}
            placeholder={t('subjects.search')}
            onChange={(event) => setSearch(event.target.value)}
            className="mb-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {query.isPending ? (
            <p className="p-2 text-sm text-muted">{t('common.loading')}</p>
          ) : query.error ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : options.length === 0 ? (
            <p className="p-2 text-sm text-muted">{t('teachers.form.noSubjects')}</p>
          ) : (
            options.map((subject) => (
              <label
                key={subject.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm hover:bg-subtle"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(subject.id)}
                  onChange={() =>
                    onChange(
                      selected.includes(subject.id)
                        ? selected.filter((value) => value !== subject.id)
                        : [...selected, subject.id],
                    )
                  }
                  className="size-4 accent-primary"
                />
                {subject.name[lang] || subject.name.en || subject.name.ar}
              </label>
            ))
          )}
          {query.hasNextPage && (
            <Button
              type="button"
              variant="ghost"
              loading={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
              className="w-full"
            >
              {t('common.loadMore')}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="mt-2 w-full border border-border"
          >
            {t('common.done')}
          </Button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
