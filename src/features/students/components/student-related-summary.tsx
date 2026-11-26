import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components';
import { studentLocalizedName } from '../utils';
import type { StudentDto } from '../types';
export function StudentRelatedSummary({ student }: { student: StudentDto }): JSX.Element {
  const { t, i18n } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
      {(
        [
          { key: 'subjects', icon: 'graduationCap' },
          { key: 'groups', icon: 'users' },
        ] as const
      ).map((section) => (
        <section key={section.key}>
          <h3 className="mb-4 flex items-center gap-3 font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-iconSurface text-primary">
              <Icon name={section.icon} className="size-5" />
            </span>
            {t(`students.${section.key}`)}
          </h3>
          {student[section.key]?.length ? (
            <ol className="list-inside list-decimal space-y-3 text-sm">
              {student[section.key].map((item) => (
                <li key={item.id}>
                  {studentLocalizedName(item.name, i18n.language) || t('common.noValue')}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">{t(`students.empty.${section.key}`)}</p>
          )}
        </section>
      ))}
      <section>
        <h3 className="mb-4 flex items-center gap-3 font-semibold">
          <span className="grid size-9 place-items-center rounded-xl bg-iconSurface text-primary">
            <Icon name="payment" className="size-5" />
          </span>
          {t('students.fees')}
        </h3>
        <p className="text-sm">{student.fees || t('students.empty.fees')}</p>
      </section>
    </div>
  );
}
