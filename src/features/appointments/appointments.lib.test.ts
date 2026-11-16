import { describe, it, expect } from 'vitest';
import { calendarDates, layoutAppointments, timeMinutes } from './appointments.lib';
describe('appointment calendar', () => {
  it('starts weeks on Saturday and crosses month/year boundaries', () => {
    const dates = calendarDates(new Date(2027, 0, 1), 'weekly');
    expect(dates).toHaveLength(7);
    expect(dates[0].getDay()).toBe(6);
    expect(dates[0].getFullYear()).toBe(2026);
    expect(dates[6].getFullYear()).toBe(2027);
  });
  it('covers every day of a leap February with complete calendar weeks', () => {
    const dates = calendarDates(new Date(2028, 1, 15), 'monthly');
    expect(dates.filter((day) => day.getMonth() === 1)).toHaveLength(29);
    expect(dates.length % 7).toBe(0);
    expect(dates[0].getDay()).toBe(6);
  });
  it('separates overlapping sessions, reuses a free lane and gives independent sessions full width', () => {
    const layout = layoutAppointments([
      { id: 'a', startTime: '10:00:00', endTime: '12:00:00' },
      { id: 'b', startTime: '10:30:00', endTime: '11:00:00' },
      { id: 'c', startTime: '11:00:00', endTime: '13:00:00' },
      { id: 'd', startTime: '13:00:00', endTime: '14:00:00' },
    ]);
    expect(layout.map((item) => [item.lane, item.lanes])).toEqual([
      [0, 2],
      [1, 2],
      [1, 2],
      [0, 1],
    ]);
    expect(timeMinutes('00:30:00')).toBe(30);
  });
});
