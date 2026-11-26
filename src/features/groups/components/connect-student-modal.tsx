import { useState, useId, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, ErrorState, FeedbackDialog, Icon, LoadingState, Modal } from '@/shared/components';
import { useOnline, useDebouncedValue } from '@/shared/hooks';
import { useGroup, useStudentsOption } from '../queries';
import { useConnectStudents } from '../commands';
import { groupLocalizedName } from '../utils';
import type { StudentOption } from '../types';
import { GroupStatusBadge } from './group-status-badge';

export function ConnectStudentModal({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const query = useGroup(groupId);
  const group = query.data;
  const connectMutation = useConnectStudents();

  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [enrolledOpen, setEnrolledOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputId = useId();
  const enrolledRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  // A grade belongs to a level in the API, so both selections are required before loading students.
  const studentsQuery = useStudentsOption(
    group?.levelId ?? undefined,
    group?.gradeId ?? undefined,
    debouncedSearch || undefined,
  );

  // Initialize selected students once group data loads
  if (group && !initialized) {
    if (group.enrolledStudents && group.enrolledStudents.length > 0) {
      setSelectedStudents(
        group.enrolledStudents.map((s) => ({
          id: s.id,
          name: s.name,
          phoneNumber: s.phoneNumber,
        })),
      );
    }
    setInitialized(true);
  }

  // Close enrolled popover on outside click
  useEffect(() => {
    if (!enrolledOpen) return;
    function handleClick(e: MouseEvent) {
      if (enrolledRef.current && !enrolledRef.current.contains(e.target as Node)) {
        setEnrolledOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [enrolledOpen]);

  function handleSelectStudent(student: StudentOption) {
    if (selectedStudents.some((s) => s.id === student.id)) return;
    if (group && selectedStudents.length >= group.maxCapacity) {
      toast.error(t('groups.capacityReached', { max: group.maxCapacity }));
      return;
    }
    setSelectedStudents((prev) => [...prev, student]);
    setSearch('');
    setDropdownOpen(false);
  }

  function handleRemoveStudent(id: string) {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!online || !group) return;

    connectMutation.mutate(
      {
        appointmentId: group.id,
        studentIds: selectedStudents.map((s) => s.id),
      },
      {
        onSuccess: () => setSuccess(true),
        onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
      },
    );
  }

  if (success) {
    return (
      <FeedbackDialog
        title={t('groups.connectTitle')}
        description={t('groups.feedback.connected')}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      title={t('groups.connectTitle')}
      icon="users"
      size="form"
      onClose={onClose}
      pending={connectMutation.isPending}
    >
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : group ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group details summary */}
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            <div>
              <span className="block text-xs text-muted">{t('groups.groupName')}</span>
              <span className="font-semibold text-foreground">{group.groupName}</span>
            </div>
            <div>
              <span className="block text-xs text-muted">{t('groups.subject')}</span>
              <span className="font-semibold text-foreground">
                {groupLocalizedName(group.subject, i18n.language) || t('common.noValue')}
              </span>
            </div>
            <div>
              <span className="block text-xs text-muted">{t('groups.level')}</span>
              <span className="font-semibold text-foreground">
                {groupLocalizedName(group.levelName, i18n.language) ||
                  group.level ||
                  t('common.noValue')}
              </span>
            </div>
            <div>
              <span className="block text-xs text-muted">{t('groups.grade')}</span>
              <span className="font-semibold text-foreground">
                {groupLocalizedName(group.gradeName, i18n.language) ||
                  group.grade ||
                  t('common.noValue')}
              </span>
            </div>
            <div>
              <span className="block text-xs text-muted">{t('groups.maxCapacity')}</span>
              <span className="font-semibold text-foreground">
                {t('groups.personCount', { count: group.maxCapacity })}
              </span>
            </div>
            <div className="relative" ref={enrolledRef}>
              <span className="block text-xs text-muted">{t('groups.noOfStudents')}</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-lg border border-success bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                  {selectedStudents.length}
                </span>
                {selectedStudents.length > 0 && (
                  <button
                    type="button"
                    aria-label={t('groups.enrolledStudents')}
                    title={t('groups.enrolledStudents')}
                    onClick={() => setEnrolledOpen((o) => !o)}
                    className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-subtle hover:text-primary"
                  >
                    <Icon name="menu" className="size-4" />
                  </button>
                )}
              </div>
              {/* Enrolled students popover */}
              {enrolledOpen && selectedStudents.length > 0 && (
                <div className="absolute start-0 top-full z-50 mt-2 max-h-64 w-72 overflow-y-auto rounded-xl border border-muted/40 bg-card p-2 shadow-lg">
                  <p className="mb-2 px-2 text-xs font-semibold text-muted">
                    {t('groups.enrolledStudents')} ({selectedStudents.length})
                  </p>
                  {selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-subtle"
                    >
                      <span className="min-w-0 truncate">
                        {student.name}
                        {student.phoneNumber ? (
                          <span className="ms-1 text-xs text-muted">
                            (<bdi>{student.phoneNumber}</bdi>)
                          </span>
                        ) : null}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(student.id)}
                        className="grid size-6 shrink-0 place-items-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger"
                        aria-label={t('common.delete')}
                      >
                        <Icon name="close" className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs text-muted">{t('groups.status')}</span>
              <GroupStatusBadge status={group.status} />
            </div>
          </div>

          {/* Student selection field */}
          <div className="space-y-2">
            <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
              {t('groups.student')} <span className="text-danger">*</span>
            </label>

            {/* Search input */}
            <div className="min-h-12 w-full rounded-xl border border-muted/60 bg-card p-2 transition focus-within:border-primary">
              <div className="flex items-center gap-2">
                {/* Search input inline */}
                <div className="relative min-w-[200px] flex-1">
                  <input
                    id={inputId}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder={t('groups.searchStudents')}
                    className="w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted"
                  />
                </div>
                <button
                  type="button"
                  aria-label={t('groups.selectStudents')}
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-subtle hover:text-primary"
                >
                  <Icon name={dropdownOpen ? 'chevronUp' : 'chevronDown'} className="size-4" />
                </button>
              </div>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div className="relative mt-2">
                  <div className="absolute start-0 top-0 z-50 max-h-56 w-full overflow-y-auto rounded-xl border border-muted/40 bg-card p-1 shadow-lg">
                    {studentsQuery.isPending ? (
                      <div className="p-3 text-center text-xs text-muted">
                        <Icon name="loader" className="mx-auto size-4 animate-spin" />
                      </div>
                    ) : studentsQuery.data && studentsQuery.data.length > 0 ? (
                      studentsQuery.data.map((student) => {
                        const isSelected = selectedStudents.some((s) => s.id === student.id);
                        return (
                          <button
                            key={student.id}
                            type="button"
                            disabled={isSelected}
                            onClick={() => handleSelectStudent(student)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition ${
                              isSelected
                                ? 'bg-muted/10 text-muted cursor-not-allowed'
                                : 'hover:bg-secondary text-foreground'
                            }`}
                          >
                            <span>
                              <span className="font-medium">{student.name}</span>
                              {student.phoneNumber && (
                                <span className="ms-2 text-xs text-muted">
                                  (<bdi>{student.phoneNumber}</bdi>)
                                </span>
                              )}
                            </span>
                            {isSelected ? (
                              <Icon name="check" className="size-4 text-primary" />
                            ) : (
                              <Icon name="plus" className="size-4 text-muted" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-muted">
                        {t('common.noValue')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Helper message / capacity status */}
            <div className="flex justify-between text-xs text-muted">
              <span>
                {selectedStudents.length === 0
                  ? t('groups.noStudentsSelected')
                  : t('groups.studentCount', { count: selectedStudents.length })}
              </span>
              <span>
                {t('groups.maxCapacity')}: {group.maxCapacity}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl border border-primary text-primary"
              disabled={connectMutation.isPending}
              onClick={onClose}
            >
              {t('common.cancel')}
              <Icon name="close" className="size-4" />
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={connectMutation.isPending}
              disabled={!online || connectMutation.isPending}
              className="rounded-xl px-6"
            >
              {t('common.save')}
              <Icon name="check" className="size-5" />
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}
