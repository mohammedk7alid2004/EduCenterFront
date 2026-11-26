import { RowActions } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import type { TeacherDto } from '../types';
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
