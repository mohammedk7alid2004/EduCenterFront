import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LIST_PARAMS, PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useListControls } from '@/shared/hooks';
import { ManagementList } from '@/shared/components';
import { useStudents } from './students.queries';
import { STUDENT_FILTER_PARAMS, STUDENT_GENDER } from './students.constants';
import type { StudentDto } from './students.types';
import { StudentFilters } from './components/student-filters';
import { StudentsTable } from './components/students-table';
import { StudentFormModal } from './components/student-form-modal';
import { ViewStudentModal } from './components/view-student-modal';
export function StudentsPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const [params, setParams] = useSearchParams();
  const level = params.get(STUDENT_FILTER_PARAMS.level) ?? '';
  const grade = level ? (params.get(STUDENT_FILTER_PARAMS.grade) ?? '') : '';
  const gender =
    Object.values(STUDENT_GENDER).find(
      (value) => value === params.get(STUDENT_FILTER_PARAMS.gender),
    ) ?? '';
  const query = useStudents({
    ...controls.filters,
    educationLevelId: level || undefined,
    educationGradeId: grade || undefined,
    gender: gender || undefined,
  });
  const can = usePermission();
  const [editing, setEditing] = useState<StudentDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<StudentDto | null>(null);
  function changeFilter(key: keyof typeof STUDENT_FILTER_PARAMS, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(STUDENT_FILTER_PARAMS[key], value);
      else next.delete(STUDENT_FILTER_PARAMS[key]);
      next.delete(LIST_PARAMS.page);
      if (key === 'level') next.delete(STUDENT_FILTER_PARAMS.grade);
      return next;
    });
  }
  return (
    <>
      <ManagementList
        title={t('students.title')}
        description={t('students.description')}
        createLabel={t('students.create')}
        controls={controls}
        canCreate={can(PERMISSIONS.students.create)}
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
        filterContent={
          <StudentFilters
            level={level}
            grade={grade}
            gender={gender}
            onChange={changeFilter}
            onClear={() =>
              setParams((current) => {
                const next = new URLSearchParams(current);
                for (const key of Object.values(STUDENT_FILTER_PARAMS)) next.delete(key);
                next.delete(LIST_PARAMS.status);
                next.delete(LIST_PARAMS.page);
                return next;
              })
            }
          />
        }
      >
        <StudentsTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
          onEdit={(student) => {
            setEditing(student);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <StudentFormModal student={editing} onClose={() => setFormOpen(false)} />}
      {viewing && <ViewStudentModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
