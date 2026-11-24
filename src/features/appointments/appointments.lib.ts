import type { LocalizedName } from './appointments.types';
export function localizedName(value: LocalizedName, language: string): string {
  return value[language.startsWith('ar') ? 'ar' : 'en'] || value.en || value.ar || '';
}
export function timeMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
export function formatAppointmentTime(value: string, language: string, compact = false): string {
  const date = new Date(2000, 0, 1, Math.floor(timeMinutes(value) / 60), timeMinutes(value) % 60);
  return new Intl.DateTimeFormat(language, {
    hour: 'numeric',
    ...(compact && timeMinutes(value) % 60 === 0 ? {} : { minute: '2-digit' as const }),
  }).format(date);
}

export function appointmentLectureCount(
  days: number[],
  iteration: number,
  numberOfIterations: number,
): number {
  const safeCount = Math.max(numberOfIterations || 1, 1);
  const daysCount = Math.max(days?.length ?? 1, 1);
  if (iteration === 1) {
    return Math.max(1, safeCount * daysCount);
  }
  if (iteration === 2) {
    return Math.max(1, safeCount * daysCount * 4);
  }
  return safeCount;
}

export function appointmentCycleStartDate(from = new Date()): Date {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  date.setDate(date.getDate() - ((date.getDay() + 1) % 7));
  return date;
}

export function upcomingAppointmentDates(days: number[], count: number, from?: Date): Date[] {
  const base = from ?? appointmentCycleStartDate();
  const limit = Math.min(Math.max(count, 1), 100);
  const cursor = new Date(base.getFullYear(), base.getMonth(), base.getDate());

  if (!days || days.length === 0) {
    return Array.from({ length: limit }, (_, i) => {
      const date = new Date(cursor);
      date.setDate(date.getDate() + i * 7);
      return date;
    });
  }

  const selectedDays = new Set(days);
  const dates: Date[] = [];

  while (dates.length < limit) {
    if (selectedDays.has(cursor.getDay())) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function calendarDates(date: Date, period: 'daily' | 'weekly' | 'monthly'): Date[] {
  const first = new Date(
    date.getFullYear(),
    date.getMonth(),
    period === 'monthly' ? 1 : date.getDate(),
  );
  if (period !== 'daily') first.setDate(first.getDate() - ((first.getDay() + 1) % 7));
  const count =
    period === 'daily'
      ? 1
      : period === 'weekly'
        ? 7
        : Math.ceil(
            (((new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 1) % 7) +
              new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) /
              7,
          ) * 7;
  return Array.from(
    { length: count },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + i),
  );
}
export function layoutAppointments<T extends { id: string; startTime: string; endTime: string }>(
  rows: T[],
): { row: T; lane: number; lanes: number }[] {
  const sorted = [...rows].sort(
    (a, b) => timeMinutes(a.startTime) - timeMinutes(b.startTime) || a.id.localeCompare(b.id),
  );
  const result: { row: T; lane: number; lanes: number }[] = [];
  let group: typeof result = [];
  let ends: number[] = [];
  let groupEnd = -1;
  const flush = () => {
    for (const item of group) item.lanes = ends.length;
    result.push(...group);
    group = [];
    ends = [];
  };
  for (const row of sorted) {
    const start = timeMinutes(row.startTime);
    const end = timeMinutes(row.endTime);
    if (start >= groupEnd) flush();
    let lane = ends.findIndex((value) => value <= start);
    if (lane < 0) lane = ends.length;
    ends[lane] = end;
    group.push({ row, lane, lanes: 1 });
    groupEnd = Math.max(group.length === 1 ? end : groupEnd, end);
  }
  flush();
  return result;
}
