import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_METADATA = 'requiredPermissions'

// Use one or more permission keys. The caller's role must have ALL listed permissions.
export const RequirePermission = (...keys: string[]) => SetMetadata(PERMISSIONS_METADATA, keys)
