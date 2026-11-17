import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/core/auth';
import { Button, EmptyState, Icon } from '@/shared/ui';
import {
  calendarDates,
  formatAppointmentTime,
  layoutAppointments,
  localizedName,
  timeMinutes,
} from '../appointments.lib';
import { CALENDAR_HOUR_HEIGHT, CALENDAR_PERIOD, WEEK_DAYS } from '../appointments.constants';
import type { AppointmentDto } from '../appointments.types';
import { AppointmentCalendarEvent } from './appointment-calendar-event';
const eventColors = [
  'bg-calendarTeal text-qrPaper',
  'bg-calendarPurple text-qrPaper',
  'bg-calendarMaroon text-qrPaper',
  'bg-calendarNavy text-qrPaper',
  'bg-calendarInk text-qrPaper',
  'bg-calendarYellow text-calendarInk',
];
function color(id: string) {
  return eventColors[
    Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % eventColors.length
  ];
}
export function AppointmentsCalendar({
  rows,
  onView,
  onQr,
}: {
  rows: AppointmentDto[];
  onView: (row: AppointmentDto) => void;
  onQr: (id: string) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const [date, setDate] = useState(() => new Date());
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>(CALENDAR_PERIOD.weekly);
  const dates = calendarDates(date, period);
  const move = (direction: number) =>
    setDate((current) =>
      period === CALENDAR_PERIOD.monthly
        ? new Date(current.getFullYear(), current.getMonth() + direction, 1)
        : new Date(
            current.getFullYear(),
            current.getMonth(),
            current.getDate() + direction * (period === CALENDAR_PERIOD.weekly ? 7 : 1),
          ),
    );
  const firstHour = rows.length
    ? Math.floor(Math.min(...rows.map((row) => timeMinutes(row.startTime))) / 60)
    : 8;
  const lastHour = rows.length
    ? Math.min(24, Math.ceil(Math.max(...rows.map((row) => timeMinutes(row.endTime))) / 60))
    : 18;
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i);
  const label = new Intl.DateTimeFormat(
    i18n.language,
    period === CALENDAR_PERIOD.monthly ? { month: 'long', year: 'numeric' } : { dateStyle: 'long' },
  );
  const dayLabel = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });
  const matching = (day: Date) => rows.filter((row) => row.days.includes(day.getDay()));
  const eventTitle = (row: AppointmentDto) =>
    `${row.groupName} · ${localizedName(row.subject, i18n.language)} · ${formatAppointmentTime(row.startTime, i18n.language)} – ${formatAppointmentTime(row.endTime, i18n.language)} · ${row.teacher}`;
  return (
    <section
      aria-label={t('appointments.calendar.title')}
      className="rounded-3xl bg-card p-4 shadow-sm sm:p-7"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={t('appointments.calendar.previous')}
            onClick={() => move(-1)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-iconSurface text-primary"
          >
            <Icon name="chevronLeft" className="size-5 shrink-0 rtl:rotate-180" />
          </button>
          <h2 className="text-base font-semibold sm:text-lg">{label.format(date)}</h2>
          <button
            type="button"
            aria-label={t('appointments.calendar.next')}
            onClick={() => move(1)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-iconSurface text-primary"
          >
            <Icon name="chevronRight" className="size-5 shrink-0 rtl:rotate-180" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={() => setDate(new Date())}>
            {t('appointments.calendar.today')}
          </Button>
          <div
            role="group"
            aria-label={t('appointments.calendar.period')}
            className="flex rounded-full bg-permissionSurface p-1.5 shadow-sm"
          >
            {Object.values(CALENDAR_PERIOD).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${period === value ? 'bg-primary text-card shadow-sm ring-2 ring-card' : 'text-primary hover:bg-primary/10'}`}
              >
                {t(`appointments.calendar.${value}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mb-6 flex items-start gap-2 rounded-xl bg-iconSurface/50 p-3 text-xs leading-5 text-tableHeading">
        <Icon name="info" className="mt-0.5 size-4 shrink-0" />
        {t('appointments.calendar.previewNote')}
      </p>
      {!rows.length ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto pb-4">
          {period === CALENDAR_PERIOD.monthly ? (
            <div className="min-w-[840px]">
              <div className="grid grid-cols-7">
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-xs font-semibold text-tableHeading"
                  >
                    {t(`appointments.days.${day}`)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-border">
                {dates.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`min-h-40 border-b border-e border-border p-2 ${day.getMonth() !== date.getMonth() ? 'bg-subtle text-muted' : ''}`}
                  >
                    <button
                      type="button"
                      aria-label={new Intl.DateTimeFormat(i18n.language, {
                        dateStyle: 'full',
                      }).format(day)}
                      onClick={() => {
                        setDate(day);
                        setPeriod(CALENDAR_PERIOD.daily);
                      }}
                      className={`mb-2 grid size-8 place-items-center rounded-full text-sm ${day.toDateString() === date.toDateString() ? 'bg-primary text-card' : 'hover:bg-primary/10'}`}
                    >
                      {number.format(day.getDate())}
                    </button>
                    <div className="space-y-1">
                      {matching(day)
                        .slice(0, 3)
                        .map((row) => (
                          <div
                            key={row.id}
                            className={`flex items-center gap-1 rounded-lg px-1 py-1 ${color(row.id)}`}
                          >
                            <button
                              type="button"
                              title={eventTitle(row)}
                              disabled={!can(PERMISSIONS.appointments.detail)}
                              onClick={() => onView(row)}
                              className="min-w-0 flex-1 truncate px-1 py-1 text-start text-[10px]"
                            >
                              {formatAppointmentTime(row.startTime, i18n.language)} ·{' '}
                              {row.groupName}
                            </button>
                            {can(PERMISSIONS.appointments.detail) && (
                              <button
                                type="button"
                                aria-label={t('appointments.qr.open', { name: row.groupName })}
                                onClick={() => onQr(row.id)}
                                className="grid size-6 shrink-0 place-items-center rounded-md bg-permissionSurface text-primary"
                              >
                                <Icon name="qrCode" className="size-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      {matching(day).length > 3 && (
                        <button
                          type="button"
                          className="text-xs text-primary underline"
                          onClick={() => {
                            setDate(day);
                            setPeriod(CALENDAR_PERIOD.daily);
                          }}
                        >
                          {t('appointments.calendar.more', { count: matching(day).length - 3 })}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ minWidth: period === CALENDAR_PERIOD.weekly ? 940 : 320 }}>
              <div
                className="mb-6 grid gap-3"
                style={{ gridTemplateColumns: `76px repeat(${dates.length}, minmax(0, 1fr))` }}
              >
                <span className="self-end pb-2 text-xs text-tableHeading">
                  {
                    new Intl.DateTimeFormat(i18n.language, { timeZoneName: 'shortOffset' })
                      .formatToParts(new Date())
                      .find((part) => part.type === 'timeZoneName')?.value
                  }
                </span>
                {dates.map((day) => (
                  <button
                    type="button"
                    key={day.toISOString()}
                    onClick={() => {
                      setDate(day);
                      setPeriod(CALENDAR_PERIOD.daily);
                    }}
                    className={`rounded-[28px] py-6 text-center ${day.toDateString() === date.toDateString() ? 'bg-primary text-card' : 'bg-table text-foreground'}`}
                  >
                    <span className="block text-2xl font-semibold">
                      {number.format(day.getDate())}
                    </span>
                    <span className="mt-2 block font-medium">{dayLabel.format(day)}</span>
                  </button>
                ))}
              </div>
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `76px repeat(${dates.length}, minmax(0, 1fr))` }}
              >
                <div
                  className="relative"
                  style={{ height: (lastHour - firstHour) * CALENDAR_HOUR_HEIGHT }}
                >
                  {hours.map((hour) => (
                    <span
                      key={hour}
                      className="absolute inset-x-0 text-[11px] text-tableHeading"
                      style={{ top: (hour - firstHour) * CALENDAR_HOUR_HEIGHT - 8 }}
                    >
                      {formatAppointmentTime(
                        `${String(hour % 24).padStart(2, '0')}:00`,
                        i18n.language,
                      )}
                    </span>
                  ))}
                </div>
                {dates.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="relative"
                    style={{ height: (lastHour - firstHour) * CALENDAR_HOUR_HEIGHT }}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="absolute inset-x-0 border-t border-border"
                        style={{ top: (hour - firstHour) * CALENDAR_HOUR_HEIGHT }}
                      />
                    ))}
                    {layoutAppointments(matching(day)).map(({ row, lane, lanes }) => (
                      <AppointmentCalendarEvent
                        key={row.id}
                        row={row}
                        title={eventTitle(row)}
                        color={color(row.id)}
                        onView={onView}
                        onQr={onQr}
                        style={{
                          top:
                            ((timeMinutes(row.startTime) - firstHour * 60) / 60) *
                              CALENDAR_HOUR_HEIGHT +
                            2,
                          height: Math.max(
                            28,
                            ((timeMinutes(row.endTime) - timeMinutes(row.startTime)) / 60) *
                              CALENDAR_HOUR_HEIGHT -
                              4,
                          ),
                          insetInlineStart: `calc(${(lane / lanes) * 100}% + 2px)`,
                          width: `calc(${100 / lanes}% - 4px)`,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
