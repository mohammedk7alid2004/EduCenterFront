import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LIST_PARAMS } from '@/shared/constants';
import { PERMISSIONS } from '@/app/config';
import { usePermission } from '@/shared/hooks';
import { useListControls } from '@/shared/hooks';
import { ManagementList } from '@/shared/components';
import {
  useStudents,
  STUDENT_FILTER_PARAMS,
  STUDENT_GENDER,
  StudentFilters,
  StudentsTable,
  StudentFormModal,
  ViewStudentModal,
  ImportStudentsModal,
  StudentExcelMenu,
  StudentQrModal,
} from '@/features/students';
import type { StudentDto } from '@/features/students';
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
  const filters = {
    ...controls.filters,
    educationLevelId: level || undefined,
    educationGradeId: grade || undefined,
    gender: gender || undefined,
  };
  const query = useStudents(filters);
  const can = usePermission();
  const [editing, setEditing] = useState<StudentDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [viewing, setViewing] = useState<StudentDto | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
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
        searchActions={<StudentExcelMenu filters={filters} onImport={() => setImportOpen(true)} />}
      >
        <StudentsTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
          onQr={setQrId}
          onEdit={(student) => {
            setEditing(student);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <StudentFormModal student={editing} onClose={() => setFormOpen(false)} />}
      {importOpen && <ImportStudentsModal onClose={() => setImportOpen(false)} />}
      {qrId && <StudentQrModal id={qrId} onClose={() => setQrId(null)} />}
      {viewing && (
        <ViewStudentModal
          id={viewing.id}
          onClose={() => setViewing(null)}
          onOpenQr={(id) => {
            setViewing(null);
            setQrId(id);
          }}
        />
      )}
    </>
  );
}
