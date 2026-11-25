import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, StatusSwitch, EmptyState } from '@/shared/components';
import { groupPermissions, humanizePermission } from '../roles.lib';
import type { PermissionDto } from '../roles.types';
export function PermissionGrid({
  permissions,
  selected,
  onChange,
  readOnly = false,
  disabled = false,
}: {
  permissions: readonly PermissionDto[];
  selected: readonly string[];
  onChange?: (ids: string[]) => void;
  readOnly?: boolean;
  disabled?: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(true);
  const groups = groupPermissions(permissions);
  return (
    <section className="rounded-2xl border border-primary p-3 sm:p-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 text-start text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-iconSurface text-primary">
            <Icon name="permission" className="size-5" />
          </span>
          {t('roleManagement.availablePermissions')}
        </span>
        <Icon name={open ? 'chevronDown' : 'chevronUp'} className="size-4" />
      </button>
      {open && (
        <div id={id} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {permissions.length === 0 ? (
            <EmptyState />
          ) : (
            [...groups].map(([group, entries]) => {
              const groupIds = entries.map((permission) => permission.permissionId);
              const selectedInGroup = groupIds.filter((permissionId) =>
                selected.includes(permissionId),
              );
              const allSelected = selectedInGroup.length === groupIds.length;
              const partiallySelected = selectedInGroup.length > 0 && !allSelected;
              const groupLabel = t(`permissionGroups.${group}`, {
                defaultValue: t(`permissionGroups.${group.replace(/\s+/g, '')}`, {
                  defaultValue: humanizePermission(group),
                }),
              });
              return (
                <div key={group} className="rounded-2xl bg-permissionSurface p-3">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h3 className="text-base font-medium">{groupLabel}</h3>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={partiallySelected ? 'mixed' : allSelected}
                      aria-label={t('roleManagement.selectGroupPermissions', {
                        group: groupLabel,
                      })}
                      disabled={disabled || readOnly || !onChange}
                      onClick={() => {
                        if (readOnly) return;
                        const selectedIds = new Set(selected);
                        if (allSelected) {
                          groupIds.forEach((permissionId) => selectedIds.delete(permissionId));
                        } else {
                          groupIds.forEach((permissionId) => selectedIds.add(permissionId));
                        }
                        onChange?.(
                          permissions
                            .filter((permission) => selectedIds.has(permission.permissionId))
                            .map((permission) => permission.permissionId),
                        );
                      }}
                      className="grid size-7 shrink-0 place-items-center rounded-lg border border-primary bg-card text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {allSelected ? (
                        <Icon name="check" className="size-4" />
                      ) : partiallySelected ? (
                        '−'
                      ) : null}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {entries.map((permission) => {
                      const action = permission.permissionName.slice(
                        permission.permissionName.lastIndexOf('.') + 1,
                      );
                      const label = t(`permissionActions.${action}`, {
                        defaultValue: t(`permissionActions.${action.replace(/\s+/g, '')}`, {
                          defaultValue: humanizePermission(action),
                        }),
                      });
                      const active = selected.includes(permission.permissionId);
                      return (
                        <div
                          key={permission.permissionId}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span>{label}</span>
                          <StatusSwitch
                            compact
                            label={label}
                            active={active}
                            disabled={disabled}
                            readOnly={readOnly}
                            onChange={() =>
                              onChange?.(
                                active
                                  ? selected.filter((id) => id !== permission.permissionId)
                                  : [...selected, permission.permissionId],
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
