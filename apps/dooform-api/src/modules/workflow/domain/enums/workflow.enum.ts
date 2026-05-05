export enum ShareRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  COMMENTER = 'COMMENTER',
  VIEWER = 'VIEWER',
}

export enum ActivityType {
  CREATED = 'CREATED',
  SHARED = 'SHARED',
  UNSHARED = 'UNSHARED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  EDITED = 'EDITED',
  COMMENTED = 'COMMENTED',
  STATE_CHANGED = 'STATE_CHANGED',
  SIGNED = 'SIGNED',
  FINALIZED = 'FINALIZED',
  ARCHIVED = 'ARCHIVED',
}

export enum NotificationType {
  SHARED_WITH_YOU = 'SHARED_WITH_YOU',
  NEW_COMMENT = 'NEW_COMMENT',
  STATE_CHANGED = 'STATE_CHANGED',
  SIGNATURE_REQUESTED = 'SIGNATURE_REQUESTED',
  SIGNED = 'SIGNED',
}

// Same lifecycle list as DocumentLifecycleStatus — re-exported here so workflow code
// doesn't need to reach into the document module's enums.
export {
  DocumentLifecycleStatus as LifecycleStatus,
} from '../../../document/domain/enums/document.enum'
