import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/app/config';
import { fetchRecordedAttendance } from '../queries/attendance.queries.api';
import { recordAttendance } from '../commands/attendance.commands.api';
import { AttendanceFormModal } from './attendance-form-modal';

vi.mock('../queries/attendance.queries.api', () => ({
  fetchAttendanceStudents: vi
    .fn()
    .mockResolvedValue([{ id: 's1', name: 'Student One', phoneNumber: null }]),
  fetchAttendanceAppointmentOptions: vi.fn().mockResolvedValue([
    { id: 'g1', groupName: 'G1', classroomName: 'Room A', days: [0, 2] },
    { id: 'g2', groupName: 'G2', classroomName: 'Room B', days: [1] },
  ]),
  fetchRecordedAttendance: vi.fn().mockResolvedValue(null),
}));
vi.mock('../commands/attendance.commands.api', () => ({
  recordAttendance: vi.fn().mockResolvedValue(undefined),
}));

function renderModal() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AttendanceFormModal onClose={() => undefined} />
    </QueryClientProvider>,
  );
}

const selects = () => Array.from(document.querySelectorAll('select'));
const dateInput = () => document.querySelector('input[type="date"]') as HTMLInputElement;
const submit = () => document.querySelector('button[type="submit"]') as HTMLButtonElement;

async function pickStudentAndGroup(user: ReturnType<typeof userEvent.setup>, group: string) {
  await waitFor(() => expect(selects()[0].options.length).toBeGreaterThan(1));
  await user.selectOptions(selects()[0], 's1');
  await waitFor(() => expect(selects()[1].options.length).toBeGreaterThan(1));
  await user.selectOptions(selects()[1], group);
}

describe('attendance form lesson day', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 24, 12, 0, 0)); // Tuesday
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('offers only the group lesson days, fills the latest date, and sends it with AppointmentId', async () => {
    const user = userEvent.setup();
    renderModal();
    await pickStudentAndGroup(user, 'g1');
    expect(Array.from(selects()[2].options).map((option) => option.textContent)).toEqual([
      'Select lesson day',
      'Sunday',
      'Tuesday',
    ]);
    await user.selectOptions(selects()[2], '2');
    expect(dateInput().value).toBe('2026-11-24');
    await user.selectOptions(selects()[4], '1');
    await user.click(submit());

    await waitFor(() => expect(recordAttendance).toHaveBeenCalled());
    expect(vi.mocked(recordAttendance).mock.calls[0][0]).toMatchObject({
      studentId: 's1',
      appointmentId: 'g1',
      sessionDate: '2026-11-24',
      status: 1,
    });
  });

  it('allows an older lesson date on the same weekday and rejects other weekdays and future dates', async () => {
    const user = userEvent.setup();
    renderModal();
    await pickStudentAndGroup(user, 'g1');
    await user.selectOptions(selects()[2], '2');
    await user.selectOptions(selects()[4], '1');

    fireEvent.change(dateInput(), { target: { value: '2026-11-23' } }); // Monday
    await user.click(submit());
    await waitFor(() =>
      expect(screen.getByText(/not on the selected lesson day/i)).toBeInTheDocument(),
    );
    expect(recordAttendance).not.toHaveBeenCalled();

    fireEvent.change(dateInput(), { target: { value: '2026-12-01' } }); // future Tuesday
    await user.click(submit());
    await waitFor(() => expect(screen.getByText(/cannot be in the future/i)).toBeInTheDocument());

    fireEvent.change(dateInput(), { target: { value: '2026-09-15' } }); // older Tuesday
    await user.click(submit());
    await waitFor(() => expect(recordAttendance).toHaveBeenCalled());
    expect(vi.mocked(recordAttendance).mock.calls[0][0]).toMatchObject({
      appointmentId: 'g1',
      sessionDate: '2026-09-15',
    });
  });

  it('clears the lesson day and date when the group changes', async () => {
    const user = userEvent.setup();
    renderModal();
    await pickStudentAndGroup(user, 'g1');
    await user.selectOptions(selects()[2], '0');
    expect(dateInput().value).toBe('2026-11-22');
    await user.selectOptions(selects()[1], 'g2');
    expect(selects()[2].value).toBe('');
    expect(dateInput().value).toBe('');
    expect(Array.from(selects()[2].options).map((option) => option.textContent)).toEqual([
      'Select lesson day',
      'Monday',
    ]);
  });

  it('does not submit without a lesson day', async () => {
    const user = userEvent.setup();
    renderModal();
    await pickStudentAndGroup(user, 'g1');
    await user.selectOptions(selects()[4], '1');
    await user.click(submit());
    await waitFor(() => expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0));
    expect(recordAttendance).not.toHaveBeenCalled();
  });

  it('shows the server message and keeps the form open when the status is locked', async () => {
    vi.mocked(recordAttendance).mockRejectedValueOnce(
      new Error('Attendance is already recorded for this lesson. The status cannot be changed.'),
    );
    const user = userEvent.setup();
    renderModal();
    await pickStudentAndGroup(user, 'g1');
    await user.selectOptions(selects()[2], '2');
    await user.selectOptions(selects()[4], '2');
    await user.click(submit());
    await waitFor(() => expect(screen.getByText(/status cannot be changed/)).toBeTruthy());
    expect(submit()).toBeTruthy();
  });

  it('locks the status and keeps the notes editable when the lesson is already recorded', async () => {
    vi.mocked(fetchRecordedAttendance).mockResolvedValue({
      id: 'r1',
      status: 3,
      notes: 'old note',
      isStatusLocked: true,
    });
    const user = userEvent.setup();
    renderModal();
    await pickStudentAndGroup(user, 'g1');
    await user.selectOptions(selects()[2], '2');
    await waitFor(() => expect(selects()[4].value).toBe('3'));
    expect(selects()[4].closest('fieldset')?.disabled).toBe(true);
    const notes = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(notes.value).toBe('old note');
    expect(notes.disabled).toBe(false);
    await user.clear(notes);
    await user.type(notes, 'new note');
    await user.click(submit());
    await waitFor(() => expect(recordAttendance).toHaveBeenCalled());
    expect(vi.mocked(recordAttendance).mock.calls[0][0]).toMatchObject({
      status: 3,
      notes: 'new note',
      sessionDate: '2026-11-24',
    });
    vi.mocked(fetchRecordedAttendance).mockResolvedValue(null);
  });
});
