import { SetMetadata } from '@nestjs/common';

export const REQUIRE_QUOTA_KEY = 'requireQuota';
export const RequireQuota = () => SetMetadata(REQUIRE_QUOTA_KEY, true);
