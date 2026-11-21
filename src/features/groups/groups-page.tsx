import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LIST_PARAMS } from '@/config';
import { useListControls, useOnline } from '@/shared/hooks';
import { ManagementList, useConfirm } from '@/shared/components';
import { useGroups, useDeleteGroups } from './groups.queries';
import { GROUP_FILTER_PARAMS } from './groups.constants';
import type { GroupDto } from './groups.types';
import { GroupsTable } from './components/groups-table';
import { GroupsFilters } from './components/groups-filters';
import { ViewGroupModal } from './components/view-group-modal';
import { ConnectStudentModal } from './components/connect-student-modal';

export function GroupsPage(): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const controls = useListControls();
  const [params, setParams] = useSearchParams();

  const subjectId = params.get(GROUP_FILTER_PARAMS.subject) ?? '';
  const levelId = params.get(GROUP_FILTER_PARAMS.level) ?? '';
  const gradeId = levelId ? (params.get(GROUP_FILTER_PARAMS.grade) ?? '') : '';

  const query = useGroups({
    ...controls.filters,
    subjectId: subjectId || undefined,
    levelId: levelId || undefined,
    gradeId: gradeId || undefined,
  });

  const deleteMutation = useDeleteGroups();
  const { confirm, dialog } = useConfirm();

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const pending = !online || deleteMutation.isPending;

  function changeFilter(key: 'subjectId' | 'levelId' | 'gradeId', value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      const paramKey =
        key === 'subjectId'
          ? GROUP_FILTER_PARAMS.subject
          : key === 'levelId'
            ? GROUP_FILTER_PARAMS.level
            : GROUP_FILTER_PARAMS.grade;

      if (value) next.set(paramKey, value);
      else next.delete(paramKey);

      next.delete(LIST_PARAMS.page);
      if (key === 'levelId') next.delete(GROUP_FILTER_PARAMS.grade);
      return next;
    });
  }

  function handleDeleteSingle(group: GroupDto) {
    confirm({
      title: t('groups.delete.title'),
      description: t('groups.delete.description'),
      onConfirm: () => deleteMutation.mutateAsync([group.id]),
      successTitle: t('groups.delete.title'),
      successDescription: t('groups.feedback.deleted'),
    });
  }

  function handleDeleteSelected(ids: string[]) {
    confirm({
      title: t('groups.delete.bulkTitle'),
      description: t('groups.delete.bulkDescription', { count: ids.length }),
      onConfirm: () => deleteMutation.mutateAsync(ids),
      successTitle: t('groups.delete.bulkTitle'),
      successDescription: t('groups.feedback.bulkDeleted'),
    });
  }

  return (
    <>
      {dialog}
      <ManagementList
        title={t('groups.title')}
        description={t('groups.description')}
        createLabel=""
        onCreate={() => {}}
        canCreate={false}
        controls={controls}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        loading={query.isPending}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        filterContent={
          <GroupsFilters
            subjectId={subjectId}
            levelId={levelId}
            gradeId={gradeId}
            onChange={changeFilter}
            onClear={() =>
              setParams((current) => {
                const next = new URLSearchParams(current);
                next.delete(GROUP_FILTER_PARAMS.subject);
                next.delete(GROUP_FILTER_PARAMS.level);
                next.delete(GROUP_FILTER_PARAMS.grade);
                next.delete(LIST_PARAMS.status);
                next.delete(LIST_PARAMS.page);
                return next;
              })
            }
          />
        }
      >
        <GroupsTable
          rows={query.data?.items ?? []}
          pending={pending}
          onView={(group) => setViewingId(group.id)}
          onConnect={(group) => setConnectingId(group.id)}
          onDelete={handleDeleteSingle}
          onDeleteSelected={handleDeleteSelected}
        />
      </ManagementList>

      {viewingId && <ViewGroupModal id={viewingId} onClose={() => setViewingId(null)} />}
      {connectingId && (
        <ConnectStudentModal groupId={connectingId} onClose={() => setConnectingId(null)} />
      )}
    </>
  );
}
