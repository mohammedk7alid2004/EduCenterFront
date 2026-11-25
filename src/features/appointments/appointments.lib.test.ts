import { describe, it, expect } from 'vitest';
import {
  appointmentCycleStartDate,
  appointmentDayDate,
  appointmentEndMinutes,
  appointmentLectureCount,
  calendarDates,
  layoutAppointments,
  timeMinutes,
  upcomingAppointmentDates,
} from './appointments.lib';
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
  it('calculates total lecture counts based on iteration pattern and days', () => {
    expect(appointmentLectureCount([0, 2], 1, 4)).toBe(8);
    expect(appointmentLectureCount([1], 1, 4)).toBe(4);
    expect(appointmentLectureCount([0, 2], 2, 1)).toBe(8);
    expect(appointmentLectureCount([], 1, 5)).toBe(5);
  });
  it('generates correct upcoming appointment dates matching days of week', () => {
    const saturday = new Date(2026, 10, 21); // Nov 21, 2026 is Saturday (6)
    const dates = upcomingAppointmentDates([0, 2], 4, saturday);
    expect(dates).toHaveLength(4);
    expect(dates[0].getDay()).toBe(0); // Sunday Nov 22
    expect(dates[1].getDay()).toBe(2); // Tuesday Nov 24
    expect(dates[2].getDay()).toBe(0); // Sunday Nov 29
    expect(dates[3].getDay()).toBe(2); // Tuesday Dec 1
  });
  it('rewinds cycle start date to Saturday', () => {
    const tuesday = new Date(2026, 10, 24);
    const start = appointmentCycleStartDate(tuesday);
    expect(start.getDay()).toBe(6);
  });
  it('maps day of week to date in the cycle', () => {
    const tuesday = new Date(2026, 10, 24); // Tuesday Nov 24
    const saturdayDate = appointmentDayDate(6, tuesday);
    const tuesdayDate = appointmentDayDate(2, tuesday);
    expect(saturdayDate.getDay()).toBe(6);
    expect(tuesdayDate.getDay()).toBe(2);
    expect(saturdayDate.getDate()).toBe(21);
    expect(tuesdayDate.getDate()).toBe(24);
  });
  it('handles midnight and daytime session end minutes correctly', () => {
    expect(appointmentEndMinutes('10:00', '12:00')).toBe(720);
    expect(appointmentEndMinutes('22:15', '00:00')).toBe(1440);
    expect(appointmentEndMinutes('22:15', '00:00') - timeMinutes('22:15')).toBe(105);
    expect(appointmentEndMinutes('23:00', '00:30') - timeMinutes('23:00')).toBe(90);
  });
});
