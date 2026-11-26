import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/infrastructure/api';
import { useCenterBrand } from '@/features/system-management';
import { useOnline } from '@/shared/hooks';
import { exportQrCard, generateQrDataUrl, QR_EXPORT_FORMAT } from '@/shared/utils';
import { Button, ErrorState, Icon, LoadingState, Modal, StatusBadge } from '@/shared/components';
import { useStudent } from '../students.queries';
import { studentLocalizedName } from '../students.lib';
import { STUDENT_GENDER_NAMES, STUDENT_QR } from '../students.constants';
import type { StudentDto } from '../students.types';

export function StudentQrModal({ id, onClose }: { id: string; onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const query = useStudent(id);
  const online = useOnline();

  if (!query.data)
    return (
      <Modal title={t('students.qr.title')} icon="qrCode" onClose={onClose}>
        {query.isPending && !online ? (
          <ErrorState error={new ApiError('NETWORK')} onRetry={() => void query.refetch()} />
        ) : query.isPending ? (
          <LoadingState />
        ) : (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        )}
      </Modal>
    );

  return <StudentQrContent student={query.data} onClose={onClose} />;
}

function StudentQrContent({
  student,
  onClose,
}: {
  student: StudentDto;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const brand = useCenterBrand();
  const logoSource = brand.data?.navbarLogoUrl || undefined;

  const { payload, labels, levelName, gradeName, genderLabel, subjectNames, groupNames } =
    useMemo(() => {
      const resolvedLevel = studentLocalizedName(student.educationLevel, i18n.language);
      const resolvedGrade = studentLocalizedName(student.educationGrade, i18n.language);
      const resolvedGender =
        student.gender === STUDENT_GENDER_NAMES.male
          ? t('students.gender.male')
          : student.gender === STUDENT_GENDER_NAMES.female
            ? t('students.gender.female')
            : '';
      const resolvedSubjects =
        student.subjects
          ?.map((item) => studentLocalizedName(item.name, i18n.language))
          .filter(Boolean) ?? [];
      const resolvedGroups =
        student.groups
          ?.map((item) => studentLocalizedName(item.name, i18n.language))
          .filter(Boolean) ?? [];

      const jsonPayload = JSON.stringify({
        id: student.id,
        userId: student.userId,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber ?? '',
        parentPhoneNumber: student.parentPhoneNumber ?? '',
        gender: resolvedGender || student.gender || '',
        educationLevel: resolvedLevel,
        educationGrade: resolvedGrade,
        status: student.isActive ? t('common.active') : t('common.inactive'),
        isActive: student.isActive,
        subjects: resolvedSubjects,
        groups: resolvedGroups,
        fees: student.fees ?? '',
      });

      const cardLabels = [
        student.name,
        [resolvedLevel, resolvedGrade].filter(Boolean).join(' · '),
        [student.email, student.phoneNumber].filter(Boolean).join(' · '),
      ].filter(Boolean);

      return {
        payload: jsonPayload,
        labels: cardLabels,
        levelName: resolvedLevel,
        gradeName: resolvedGrade,
        genderLabel: resolvedGender,
        subjectNames: resolvedSubjects,
        groupNames: resolvedGroups,
      };
    }, [student, i18n.language, t]);

  const [image, setImage] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImage('');
    setError(null);

    void generateQrDataUrl(payload, undefined, logoSource)
      .then((result) => {
        if (!cancelled) setImage(result);
      })
      .catch(() => {
        if (!cancelled) setError(new Error('students.qr.generationFailed'));
      });

    return () => {
      cancelled = true;
    };
  }, [payload, retry, logoSource]);

  async function handleExport(format: (typeof QR_EXPORT_FORMAT)[keyof typeof QR_EXPORT_FORMAT]) {
    if (busy) return;
    setBusy(format);
    setExportError(null);
    const sanitizedId = student.id.replace(/[^a-zA-Z0-9-]/g, '');
    try {
      await exportQrCard({
        payload,
        labels,
        fileNameBase: `${STUDENT_QR.filePrefix}-${sanitizedId}-qr`,
        language: i18n.language,
        format,
        logoSource,
      });
    } catch {
      setExportError(new Error('students.qr.exportFailed'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal title={t('students.qr.title')} icon="qrCode" onClose={onClose} pending={Boolean(busy)}>
      {error ? (
        <ErrorState error={error} onRetry={() => setRetry((current) => current + 1)} />
      ) : !image ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col items-center">
          <img
            src={image}
            alt={t('students.qr.alt', { name: student.name })}
            width={320}
            height={320}
            className="aspect-square w-64 max-w-full rounded-2xl bg-qrPaper shadow-sm sm:w-72"
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <StatusBadge active={student.isActive} />
            {genderLabel && (
              <span className="rounded-full bg-permissionSurface px-3 py-1 text-xs font-semibold text-primary">
                {genderLabel}
              </span>
            )}
          </div>

          <p className="mt-2 text-center text-base font-bold text-foreground">{student.name}</p>

          {(levelName || gradeName) && (
            <p className="mt-1 text-center text-sm text-tableHeading">
              {[levelName, gradeName].filter(Boolean).join(' · ')}
            </p>
          )}

          <p className="mt-1 text-center text-xs text-muted">
            <bdi>{student.email}</bdi>
            {student.phoneNumber ? (
              <>
                {' · '}
                <bdi>{student.phoneNumber}</bdi>
              </>
            ) : null}
          </p>

          {(subjectNames.length > 0 || groupNames.length > 0) && (
            <p className="mt-1 text-center text-xs text-muted">
              {[...subjectNames, ...groupNames].join(' – ')}
            </p>
          )}

          {exportError && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {t(exportError.message)}
            </p>
          )}

          <div className="mt-6 flex w-full flex-wrap justify-center gap-3">
            <Button
              variant="ghost"
              className="rounded-xl border border-primary text-primary"
              disabled={Boolean(busy)}
              loading={busy === QR_EXPORT_FORMAT.png}
              onClick={() => void handleExport(QR_EXPORT_FORMAT.png)}
            >
              <Icon name="imageFile" className="size-4" />
              {t('students.qr.png')}
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl border border-primary text-primary"
              disabled={Boolean(busy)}
              loading={busy === QR_EXPORT_FORMAT.pdf}
              onClick={() => void handleExport(QR_EXPORT_FORMAT.pdf)}
            >
              <Icon name="pdfFile" className="size-4" />
              {t('students.qr.pdf')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
