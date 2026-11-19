import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { Icon } from '@/shared/components';
import { localizedName, formatAppointmentTime } from '../appointments.lib';
import { APPOINTMENT_STATUS } from '../appointments.constants';
import type { AppointmentDto } from '../appointments.types';
export function AppointmentCalendarEvent({
  row,
  title,
  color,
  style,
  onView,
  onQr,
}: {
  row: AppointmentDto;
  title: string;
  color: string;
  style: CSSProperties;
  onView: (row: AppointmentDto) => void;
  onQr: (id: string) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const canView = can(PERMISSIONS.appointments.detail);
  const compact = Number(style.height) < 120;
  const minimal = Number(style.height) < 64;
  return (
    <article
      className={`absolute min-h-6 overflow-hidden rounded-2xl text-xs shadow-sm ${color} ${row.status !== APPOINTMENT_STATUS.active ? 'opacity-60' : ''}`}
      style={style}
    >
      <button
        type="button"
        aria-label={title}
        title={title}
        disabled={!canView}
        onClick={() => onView(row)}
        className="absolute inset-0 z-0 rounded-2xl outline-none transition hover:bg-qrPaper/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-qrPaper"
      />
      <div
        className={`pointer-events-none relative flex h-full flex-col ${minimal ? 'p-1' : compact ? 'p-2' : 'p-2.5'}`}
      >
        <div className="flex min-w-0 shrink-0 items-center justify-between gap-1">
          <span className="flex min-w-0 items-center gap-1 font-semibold">
            <Icon name="bookOpen" className={minimal ? 'size-3 shrink-0' : 'size-4 shrink-0'} />
            <span className="truncate">{localizedName(row.subject, i18n.language)}</span>
          </span>
          {canView && (
            <button
              type="button"
              aria-label={t('appointments.qr.open', { name: row.groupName })}
              title={t('appointments.qr.title')}
              onClick={() => onQr(row.id)}
              className={`pointer-events-auto grid shrink-0 place-items-center rounded-lg bg-permissionSurface text-primary transition hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${minimal ? 'size-5' : compact ? 'size-6' : 'size-7'}`}
            >
              <Icon name="qrCode" className="size-4" />
            </button>
          )}
        </div>
        {!minimal && (
          <span
            className={`shrink-0 truncate ${compact ? 'mt-1 text-[10px]' : 'mt-2 text-[11px]'}`}
          >
            <bdi>
              {formatAppointmentTime(row.startTime, i18n.language, true)} –{' '}
              {formatAppointmentTime(row.endTime, i18n.language, true)}
            </bdi>
          </span>
        )}
        {!compact && <span className="mt-1 shrink-0 truncate text-[10px]">{row.groupName}</span>}
        {!minimal && (
          <span
            className={`mt-auto shrink-0 truncate ${compact ? 'pt-1 text-[10px]' : 'pt-2 text-[11px]'}`}
          >
            {row.teacher}
          </span>
        )}
      </div>
    </article>
  );
}
