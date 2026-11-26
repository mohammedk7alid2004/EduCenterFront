export function toIsoDate(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

/** Most recent date (today included, never in the future) that falls on the given weekday (0 = Sunday). */
export function latestDateForWeekday(weekday: number, today: Date = new Date()): string {
  const offset = (today.getDay() - weekday + 7) % 7;
  return toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset));
}

export function weekdayOfIsoDate(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getDay();
}
