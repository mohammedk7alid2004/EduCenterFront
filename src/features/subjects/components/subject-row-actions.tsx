import { useTranslation } from 'react-i18next';
import { Icon, useConfirm } from '@/shared/ui';
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
      <div className="flex items-center gap-2">
        {/* Edit Button - Rounded card matching Figma */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-[#0F3D3A] hover:bg-[#0F3D3A]/5 hover:text-[#0F3D3A]"
          title={t('common.edit')}
          onClick={() => onEdit(subject)}
        >
          <Icon name="pencil" className="size-4" />
        </button>

        {/* Toggle Status Button */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
          title={subject.isActive ? t('common.deactivate') : t('common.activate')}
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
        >
          <Icon
            name={subject.isActive ? 'toggleRight' : 'toggleLeft'}
            className={`size-5 ${subject.isActive ? 'text-success' : 'text-slate-400'}`}
          />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-xs transition hover:border-danger hover:bg-danger/5 hover:text-danger disabled:opacity-50"
          title={t('common.delete')}
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Icon name="trash" className="size-4" />
        </button>
      </div>
    </>
  );
}
