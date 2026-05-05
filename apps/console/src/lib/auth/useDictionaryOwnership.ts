import { useAuth } from './AuthContext';
import type { DictionaryCollection, DictionaryScope } from '../api/types';

/**
 * Mirror of the backend `assertCanEditCollection` policy:
 *  - GLOBAL_ADMIN: can edit anything.
 *  - PERSONAL: only the owner.
 *  - ORGANIZATION: ORG_ADMIN of the same org, or the original author.
 *  - GLOBAL: GLOBAL_ADMIN only.
 *
 * Visibility (read) and edit are checked at the collection level only — entries
 * inherit from their collection.
 */
export function useDictionaryOwnership() {
  const { user } = useAuth();

  const canEdit = (collection: DictionaryCollection | null | undefined): boolean => {
    if (!user || !collection) return false;
    if (user.role === 'GLOBAL_ADMIN') return true;
    if (collection.scope === 'GLOBAL') return false;
    if (collection.scope === 'PERSONAL') return collection.ownerUserId === user.id;
    const sameOrg =
      !!user.organizationId && user.organizationId === (collection.organizationId ?? null);
    if (!sameOrg) return false;
    return user.role === 'ORG_ADMIN' || collection.ownerUserId === user.id;
  };

  const canDelete = canEdit;

  const canCreateScope = (scope: DictionaryScope): boolean => {
    if (!user) return false;
    if (user.role === 'GLOBAL_ADMIN') return true;
    if (scope === 'PERSONAL') return true;
    if (scope === 'ORGANIZATION') return user.role === 'ORG_ADMIN' && !!user.organizationId;
    return false; // GLOBAL — admin only
  };

  return { canEdit, canDelete, canCreateScope };
}
