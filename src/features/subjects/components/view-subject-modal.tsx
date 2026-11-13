import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui';
import type { SubjectDto } from '../subjects.types';

interface ViewSubjectModalProps {
  subject: SubjectDto | null;
  onClose: () => void;
}

export function ViewSubjectModal({ subject, onClose }: ViewSubjectModalProps): JSX.Element | null {
  const { i18n } = useTranslation();
  if (!subject) return null;

  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 text-start select-none font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0F3D3A]/10 text-[#0F3D3A]">
              <Icon name="bookOpen" className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'ar' ? 'عرض المادة' : 'View Subject'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
          {/* Name Arabic */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
            </p>
            <p className="mt-1 font-bold text-slate-800">{subject.name.ar || '—'}</p>
          </div>

          {/* Name English */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
            </p>
            <p className="mt-1 font-bold text-slate-800">{subject.name.en || '—'}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'الحالة' : 'Status'}
            </p>
            <div className="mt-1.5">
              <span className="inline-flex items-center rounded-full border border-emerald-400 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-600">
                {subject.isActive
                  ? lang === 'ar'
                    ? 'مفعل'
                    : 'Active'
                  : lang === 'ar'
                    ? 'غير مفعل'
                    : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Created Date */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}
            </p>
            <p className="mt-1 font-semibold text-slate-700">
              {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'ملاحظات' : 'Notes'}
            </p>
            <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">
              {subject.note[lang] ??
                subject.note.ar ??
                subject.note.en ??
                (lang === 'ar'
                  ? 'شرح المنهج وحل امتحانات الثانوية العامة'
                  : 'Curriculum overview and exercises')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
