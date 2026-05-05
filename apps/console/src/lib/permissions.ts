import type { ShareRole } from './api/shares';
import type { LifecycleStatus } from './api/lifecycle';

export interface AccessSnapshot {
  ownerUserId: string;
  currentUserId: string;
  // Effective role of currentUserId on this document. `null` = no access.
  role: ShareRole | null;
  lifecycleStatus: LifecycleStatus;
}

const ROLE_RANK: Record<ShareRole, number> = {
  OWNER: 4,
  EDITOR: 3,
  COMMENTER: 2,
  VIEWER: 1,
};

function meets(role: ShareRole | null, minimum: ShareRole): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export interface Permissions {
  isOwner: boolean;
  canView: boolean;
  canComment: boolean;
  canEdit: boolean;
  canShare: boolean;
  canTransition: boolean;
  canSign: boolean;
  canArchive: boolean;
}

/**
 * Resolve which UI affordances a user gets on a document. Server still enforces
 * the same rules — this is purely for hiding/disabling buttons.
 */
export function resolvePermissions(snapshot: AccessSnapshot): Permissions {
  const isOwner =
    snapshot.role === 'OWNER' ||
    snapshot.ownerUserId === snapshot.currentUserId;
  const role = isOwner ? 'OWNER' : snapshot.role;

  const isArchived = snapshot.lifecycleStatus === 'ARCHIVED';
  const canSignNow =
    !isArchived &&
    (snapshot.lifecycleStatus === 'APPROVED' ||
      snapshot.lifecycleStatus === 'SIGNED') &&
    meets(role, 'EDITOR');

  return {
    isOwner,
    canView: meets(role, 'VIEWER'),
    canComment: !isArchived && meets(role, 'COMMENTER'),
    canEdit: !isArchived && meets(role, 'EDITOR'),
    canShare: isOwner && !isArchived,
    canTransition: !isArchived && meets(role, 'EDITOR'),
    canSign: canSignNow,
    canArchive: isOwner && !isArchived,
  };
}
