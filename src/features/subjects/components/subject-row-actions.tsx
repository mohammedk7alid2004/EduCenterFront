import { useTranslation } from 'react-i18next';
import { Button, Icon, useConfirm } from '@/shared/ui';
import type { SubjectDto } from '../subjects.types';
import { useDeleteSubjects, useToggleSubjectStatus } from '../subjects.queries';

interface SubjectRowActionsProps {
  subject: SubjectDto;
  onEdit: (subject: SubjectDto) => void;
}

export function SubjectRowActions({ subject, onEdit }: SubjectRowActionsProps): JSX.Element {
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();

  const deleteMutation = useDeleteSubjects();
  const toggleMutation = useToggleSubjectStatus();

  function handleDelete() {
    confirm({
      title: t('subjects.delete.confirmTitle'),
      description: t('subjects.delete.confirmDescription'),
      onConfirm: () => deleteMutation.mutate({ ids: [subject.id] }),
    });
  }

  function handleToggle() {
    toggleMutation.mutate(subject.id);
  }

  return (
    <>
      {dialog}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          className="size-8 p-0"
          title={t('common.edit')}
          onClick={() => onEdit(subject)}
        >
          <Icon name="pencil" className="size-4 text-primary" />
        </Button>

        <Button
          variant="ghost"
          className="size-8 p-0"
          title={subject.isActive ? t('common.deactivate') : t('common.activate')}
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
        >
          <Icon
            name={subject.isActive ? 'toggleRight' : 'toggleLeft'}
            className={`size-5 ${subject.isActive ? 'text-success' : 'text-muted'}`}
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
