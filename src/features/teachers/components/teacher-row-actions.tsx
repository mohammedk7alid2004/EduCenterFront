import { RowActions } from '@/shared/ui';
import { useOnline } from '@/shared/lib';
import type { TeacherDto } from '../teachers.types';
export function TeacherRowActions({
  teacher,
  onEdit,
  onView,
  onDelete,
  pending,
}: {
  teacher: TeacherDto;
  onEdit: (row: TeacherDto) => void;
  onView: (row: TeacherDto) => void;
  onDelete: (row: TeacherDto) => void;
  pending: boolean;
}): JSX.Element {
  const online = useOnline();
  return (
    <RowActions
      onView={() => onView(teacher)}
      onEdit={() => onEdit(teacher)}
      onDelete={() => onDelete(teacher)}
      disabled={!online || pending}
    />
  );
}
