import { RowActions } from '@/shared/ui';
import { useOnline } from '@/shared/lib';
import type { SubjectDto } from '../subjects.types';
export function SubjectRowActions({
  subject,
  onEdit,
  onView,
  onDelete,
  pending,
}: {
  subject: SubjectDto;
  onEdit: (row: SubjectDto) => void;
  onView: (row: SubjectDto) => void;
  onDelete: (row: SubjectDto) => void;
  pending: boolean;
}): JSX.Element {
  const online = useOnline();
  return (
    <RowActions
      onView={() => onView(subject)}
      onEdit={() => onEdit(subject)}
      onDelete={() => onDelete(subject)}
      disabled={!online || pending}
    />
  );
}
