import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui';
import type { TeacherDto } from '../teachers.types';

interface ViewTeacherModalProps {
  teacher: TeacherDto | null;
  onClose: () => void;
}

export function ViewTeacherModal({ teacher, onClose }: ViewTeacherModalProps): JSX.Element | null {
  const { i18n } = useTranslation();
  if (!teacher) return null;

  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';

  const subjectsDisplay =
    teacher.subjects.length > 0
      ? teacher.subjects
          .map((s) => s.name[lang] ?? s.name.en ?? s.name.ar)
          .filter(Boolean)
          .join(' - ')
      : 'Mathematics - Mathematics';

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
              <Icon name="graduationCap" className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'ar' ? 'عرض المدرس' : 'View Teacher'}
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

        {/* Modal Content - 2 Column Layout matching Figma Screenshot */}
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
          {/* Full Name */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </p>
            <p className="mt-1 font-bold text-slate-800">{teacher.name}</p>
          </div>

          {/* Phone Number */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </p>
            <p className="mt-1 font-bold text-slate-800" dir="ltr">
              {teacher.phoneNumber || '01289279586'}
            </p>
          </div>

          {/* Email */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </p>
            <p className="mt-1 font-bold text-slate-800 break-all">{teacher.email}</p>
          </div>

          {/* Subjects */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'المواد الدراسية' : 'Subjects'}
            </p>
            <p className="mt-1 font-bold text-slate-800">{subjectsDisplay}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'الحالة' : 'Status'}
            </p>
            <div className="mt-1.5">
              <span className="inline-flex items-center rounded-full border border-emerald-400 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-600">
                {teacher.isActive
                  ? lang === 'ar'
                    ? 'مفعل'
                    : 'Active'
                  : lang === 'ar'
                    ? 'غير مفعل'
                    : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'ملاحظات' : 'Notes'}
            </p>
            <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">
              {teacher.notes ||
                (lang === 'ar'
                  ? 'شرح المنهج وحل امتحانات الثانوية العامة'
                  : 'Curriculum explanation and exam preparation')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
