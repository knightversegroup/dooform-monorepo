import { useAuth } from './AuthContext';

/**
 * Mirror of the backend `assertCanEditTemplate` / `assertCanDeleteTemplate` policies
 * (apps/dooform-api/src/modules/template/application/policies/template-access.policy.ts):
 * only the original uploader (owner) or a GLOBAL_ADMIN may modify or delete a template.
 *
 * Used to hide buttons the server would 403. The backend remains the security boundary —
 * this hook is purely a UX layer that prevents users from clicking actions that will fail.
 */
export interface TemplateOwnerLike {
  ownerUserId?: string | null;
  owner?: { id: string } | null;
}

export function useTemplateOwnership() {
  const { user } = useAuth();

  const canEdit = (template: TemplateOwnerLike | null | undefined): boolean => {
    if (!user || !template) return false;
    if (user.role === 'GLOBAL_ADMIN') return true;
    const ownerId = template.ownerUserId ?? template.owner?.id ?? null;
    return !!ownerId && ownerId === user.id;
  };

  // Same rule as edit — kept as a separate helper so call sites read clearly.
  const canDelete = canEdit;

  return { canEdit, canDelete };
}
