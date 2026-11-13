import { useTranslation } from 'react-i18next';
import { Icon, useConfirm } from '@/shared/ui';
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
      <div className="flex items-center gap-2">
        {/* Edit Button - Rounded card matching Figma */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-[#0F3D3A] hover:bg-[#0F3D3A]/5 hover:text-[#0F3D3A]"
          title={t('common.edit')}
          onClick={() => onEdit(teacher)}
        >
          <Icon name="pencil" className="size-4" />
        </button>

        {/* Toggle Status Button */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
          title={teacher.isActive ? t('common.deactivate') : t('common.activate')}
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
        >
          <Icon
            name={teacher.isActive ? 'toggleRight' : 'toggleLeft'}
            className={`size-5 ${teacher.isActive ? 'text-success' : 'text-slate-400'}`}
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
