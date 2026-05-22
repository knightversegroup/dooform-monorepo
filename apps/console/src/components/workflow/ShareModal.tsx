import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, X } from 'lucide-react';
import { listUsers } from '../../lib/api/users';
import {
  createShare,
  deleteShare,
  listShares,
  updateShare,
  type ShareRole,
} from '../../lib/api/shares';
import { queryKeys } from '../../lib/queryClient';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Spinner } from '../ui/Spinner';

const ROLES: ShareRole[] = ['VIEWER', 'COMMENTER', 'EDITOR'];

interface ShareModalProps {
  documentId: string;
  ownerUserId: string;
  onClose: () => void;
}

export function ShareModal({ documentId, ownerUserId, onClose }: ShareModalProps) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => listUsers(),
  });
  const sharesQuery = useQuery({
    queryKey: queryKeys.shares.forDocument(documentId),
    queryFn: () => listShares(documentId),
  });

  const [pendingUserId, setPendingUserId] = useState('');
  const [pendingRole, setPendingRole] = useState<ShareRole>('VIEWER');

  const sharedUserIds = new Set(
    (sharesQuery.data?.data ?? []).map((s) => s.userId).concat([ownerUserId])
  );
  const candidateUsers = useMemo(
    () => (usersQuery.data?.data ?? []).filter((u) => !sharedUserIds.has(u.id)),
    [usersQuery.data, sharedUserIds]
  );

  const userById = useMemo(() => {
    const map = new Map<string, { displayName: string; email: string }>();
    for (const u of usersQuery.data?.data ?? []) {
      map.set(u.id, { displayName: u.displayName, email: u.email });
    }
    return map;
  }, [usersQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.shares.forDocument(documentId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.forDocument(documentId) });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createShare(documentId, { userId: pendingUserId, role: pendingRole }),
    onSuccess: () => {
      setPendingUserId('');
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { shareId: string; role: ShareRole }) =>
      updateShare(documentId, vars.shareId, { role: vars.role }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (shareId: string) => deleteShare(documentId, shareId),
    onSuccess: invalidate,
  });

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <h2 className="text-lg font-semibold">แชร์เอกสาร</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-2">
              ผู้มีสิทธิ์เข้าถึง
            </h3>
            <div className="border border-border-default rounded divide-y divide-border-default">
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <div className="font-medium">
                    {userById.get(ownerUserId)?.displayName ?? ownerUserId}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {userById.get(ownerUserId)?.email ?? '—'}
                  </div>
                </div>
                <span className="text-[10px] text-primary uppercase font-medium">
                  เจ้าของ
                </span>
              </div>
              {(sharesQuery.data?.data ?? []).map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {userById.get(share.userId)?.displayName ?? share.userId}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {userById.get(share.userId)?.email ?? '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={share.role}
                      onChange={(e) =>
                        updateMutation.mutate({
                          shareId: share.id,
                          role: e.target.value as ShareRole,
                        })
                      }
                      className="text-xs border border-border-default rounded px-2 py-1"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0) + r.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteMutation.mutate(share.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="เพิกถอน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {sharesQuery.data?.data?.length === 0 ? (
                <div className="px-3 py-2 text-sm text-ink-muted">
                  ยังไม่มีผู้ร่วมงานเพิ่มเติม
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-2">
              เพิ่มผู้ใช้
            </h3>
            <div className="flex gap-2">
              <select
                value={pendingUserId}
                onChange={(e) => setPendingUserId(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-border-default rounded"
              >
                <option value="">เลือกผู้ใช้…</option>
                {candidateUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.email})
                  </option>
                ))}
              </select>
              <select
                value={pendingRole}
                onChange={(e) => setPendingRole(e.target.value as ShareRole)}
                className="px-2 py-1.5 text-sm border border-border-default rounded"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={!pendingUserId || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? <Spinner className="text-white" /> : null}
                แชร์
              </Button>
            </div>
            {createMutation.error ? (
              <ErrorMessage error={createMutation.error} className="mt-2" />
            ) : null}
          </div>

          {(updateMutation.error || deleteMutation.error) ? (
            <ErrorMessage error={updateMutation.error ?? deleteMutation.error} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
