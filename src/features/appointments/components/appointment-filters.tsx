import { useTranslation } from 'react-i18next';
import { Button, ErrorState } from '@/shared/components';
import { useAppointmentOptions, useAppointmentTeachers } from '../queries';
import { localizedName } from '../utils';
import { AppointmentSelect } from './appointment-select';
export function AppointmentFilters({
  subject,
  classroom,
  teacher,
  onChange,
  onClear,
}: {
  subject: string;
  classroom: string;
  teacher: string;
  onChange: (key: 'subject' | 'classroom' | 'teacher', value: string) => void;
  onClear: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const subjects = useAppointmentOptions('subjects');
  const classrooms = useAppointmentOptions('classrooms');
  const teachers = useAppointmentTeachers(subject || undefined);
  const error = subjects.error || classrooms.error || teachers.error;
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      {error && (
        <ErrorState
          error={error}
          onRetry={() => {
            void subjects.refetch();
            void classrooms.refetch();
            void teachers.refetch();
          }}
        />
      )}
      <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AppointmentSelect
          id="subject-filter"
          label={t('appointments.fields.subject')}
          value={subject}
          onChange={(event) => onChange('subject', event.target.value)}
          placeholder={t('common.all')}
          options={(subjects.data ?? []).map((option) => ({
            id: option.id,
            name: localizedName(option.name, i18n.language),
          }))}
          disabled={subjects.isPending}
        />
        <AppointmentSelect
          id="teacher-filter"
          label={t('appointments.fields.teacher')}
          value={teacher}
          onChange={(event) => onChange('teacher', event.target.value)}
          placeholder={t('common.all')}
          options={teachers.data ?? []}
          disabled={teachers.isPending}
        />
        <AppointmentSelect
          id="classroom-filter"
          label={t('appointments.fields.classroom')}
          value={classroom}
          onChange={(event) => onChange('classroom', event.target.value)}
          placeholder={t('common.all')}
          options={(classrooms.data ?? []).map((option) => ({
            id: option.id,
            name: localizedName(option.name, i18n.language),
          }))}
          disabled={classrooms.isPending}
        />
        <Button variant="ghost" onClick={onClear}>
          {t('common.clearFilters')}
        </Button>
      </div>
    </div>
  );
}
