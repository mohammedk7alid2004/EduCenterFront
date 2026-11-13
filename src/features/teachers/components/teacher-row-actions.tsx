import { useTranslation } from 'react-i18next';
import { Button, Icon, useConfirm } from '@/shared/ui';
import type { TeacherDto } from '../teachers.types';
import { useDeleteTeachers, useToggleTeacherStatus } from '../teachers.queries';

interface TeacherRowActionsProps {
  teacher: TeacherDto;
  onEdit: (teacher: TeacherDto) => void;
}

export function TeacherRowActions({ teacher, onEdit }: TeacherRowActionsProps): JSX.Element {
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();

  const deleteMutation = useDeleteTeachers();
  const toggleMutation = useToggleTeacherStatus();

  function handleDelete() {
    confirm({
      title: t('teachers.delete.confirmTitle'),
      description: t('teachers.delete.confirmDescription'),
      onConfirm: () => deleteMutation.mutate({ ids: [teacher.id] }),
    });
  }

  function handleToggle() {
    toggleMutation.mutate(teacher.id);
  }

  return (
    <>
      {dialog}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          className="size-8 p-0"
          title={t('common.edit')}
          onClick={() => onEdit(teacher)}
        >
          <Icon name="pencil" className="size-4 text-primary" />
        </Button>

        <Button
          variant="ghost"
          className="size-8 p-0"
          title={teacher.isActive ? t('common.deactivate') : t('common.activate')}
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
        >
          <Icon
            name={teacher.isActive ? 'toggleRight' : 'toggleLeft'}
            className={`size-5 ${teacher.isActive ? 'text-success' : 'text-muted'}`}
          />
        </Button>

        <Button
          variant="ghost"
          className="size-8 p-0"
          title={t('common.delete')}
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Icon name="trash" className="size-4 text-danger" />
        </Button>
      </div>
    </>
  );
}
