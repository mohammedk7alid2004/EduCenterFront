import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LIST_PARAMS } from '@/shared/constants';
import { PERMISSIONS } from '@/app/config';
import { useListControls, usePermission } from '@/shared/hooks';
import { Icon, ManagementList } from '@/shared/components';
import {
  useAppointments,
  APPOINTMENT_PARAMS,
  APPOINTMENT_VIEW,
  AppointmentExcelMenu,
  AppointmentsTable,
  AppointmentsCalendar,
  AppointmentFormModal,
  ImportAppointmentsModal,
  ViewAppointmentModal,
  AppointmentFilters,
} from '@/features/appointments';
import type { AppointmentDto } from '@/features/appointments';

export function AppointmentsPage(): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();
  const controls = useListControls();
  const [params, setParams] = useSearchParams();
  const calendar = params.get(APPOINTMENT_PARAMS.view) !== APPOINTMENT_VIEW.list;
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDto | null>(null);
  const [viewing, setViewing] = useState<AppointmentDto | null>(null);
  const subject = params.get(APPOINTMENT_PARAMS.subject) ?? '';
  const teacher = params.get(APPOINTMENT_PARAMS.teacher) ?? '';
  const classroom = params.get(APPOINTMENT_PARAMS.classroom) ?? '';
  const filters = {
    ...controls.filters,
    subjectId: subject || undefined,
    teacherId: teacher || undefined,
    classroomId: classroom || undefined,
  };
  const query = useAppointments(filters, calendar);

  const changeFilter = (key: 'subject' | 'teacher' | 'classroom', value: string) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(APPOINTMENT_PARAMS[key], value);
      else next.delete(APPOINTMENT_PARAMS[key]);
      if (key === 'subject') next.delete(APPOINTMENT_PARAMS.teacher);
      next.delete(LIST_PARAMS.page);
      return next;
    });

  return (
    <>
      <ManagementList
        title={t('appointments.title')}
        description={t('appointments.description')}
        createLabel={t('appointments.create')}
        controls={controls}
        canCreate={can(PERMISSIONS.appointments.create)}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        loading={query.isPending}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        onCreate={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        pagination={!calendar}
        filterContent={
          <div className="mb-6">
            <AppointmentFilters
              subject={subject}
              teacher={teacher}
              classroom={classroom}
              onChange={changeFilter}
              onClear={() =>
                setParams((current) => {
                  const next = new URLSearchParams(current);
                  [
                    APPOINTMENT_PARAMS.subject,
                    APPOINTMENT_PARAMS.teacher,
                    APPOINTMENT_PARAMS.classroom,
                    LIST_PARAMS.page,
                  ].forEach((key) => next.delete(key));
                  return next;
                })
              }
            />
          </div>
        }
        searchActions={
          <>
            <AppointmentExcelMenu filters={filters} onImport={() => setImportOpen(true)} />
            <div
              role="group"
              aria-label={t('appointments.viewMode')}
              className="flex gap-1 rounded-xl border border-border p-1"
            >
              {[APPOINTMENT_VIEW.calendar, APPOINTMENT_VIEW.list].map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-label={t(`appointments.${value}View`)}
                  aria-pressed={calendar === (value === APPOINTMENT_VIEW.calendar)}
                  onClick={() =>
                    setParams((current) => {
                      const next = new URLSearchParams(current);
                      next.set(APPOINTMENT_PARAMS.view, value);
                      return next;
                    })
                  }
                  className={`grid size-9 place-items-center rounded-lg ${calendar === (value === APPOINTMENT_VIEW.calendar) ? 'bg-primary text-card' : 'bg-subtle text-primary'}`}
                >
                  <Icon
                    name={value === APPOINTMENT_VIEW.calendar ? 'scheduleGrid' : 'scheduleList'}
                    className="size-5"
                  />
                </button>
              ))}
            </div>
          </>
        }
      >
        {calendar ? (
          <AppointmentsCalendar rows={query.data?.items ?? []} onView={setViewing} />
        ) : (
          <AppointmentsTable
            rows={query.data?.items ?? []}
            startIndex={(controls.page - 1) * controls.pageSize}
            onView={setViewing}
            onEdit={(row) => {
              setEditing(row);
              setFormOpen(true);
            }}
          />
        )}
      </ManagementList>
      {formOpen && (
        <AppointmentFormModal appointment={editing} onClose={() => setFormOpen(false)} />
      )}
      {importOpen && <ImportAppointmentsModal onClose={() => setImportOpen(false)} />}
      {viewing && <ViewAppointmentModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
