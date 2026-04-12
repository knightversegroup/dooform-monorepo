// Auth Types

// Role types
export type RoleName = 'admin' | 'user';

// Tier types
export type UserTierName = 'free' | 'pro' | 'max';

export interface TierCapabilities {
  allowed_formats: ('pdf' | 'docx')[];
  allowed_template_tiers: string[];
  monthly_document_limit: number; // -1 = unlimited
  has_pdf_editor: boolean;
  forced_watermark: boolean;
}

export interface MonthlyUsage {
  used: number;
  limit: number;
}

export interface TierInfo {
  tier_name: UserTierName;
  capabilities: TierCapabilities;
  monthly_usage?: MonthlyUsage;
  period_start?: string;
  period_end?: string;
  watermark_disabled?: boolean;
}

// Quota information
export interface QuotaInfo {
  total: number;
  used: number;
  remaining: number;
}

export interface User {
  id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  picture_url?: string;
  phone?: string;
  organization?: string;
  google_id?: string;
  auth_provider: string;
  is_active: boolean;
  profile_completed: boolean;
  roles?: RoleName[];
  quota?: QuotaInfo;
  tier?: TierInfo;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setAuthState: (user: User, accessToken: string, refreshToken: string) => void;
  // Role-based helpers
  isAdmin: boolean;
  hasRole: (role: RoleName) => boolean;
  canGenerate: boolean;
  refreshQuota: () => Promise<void>;
  // Tier-based helpers
  userTier: UserTierName;
  canDownloadDocx: boolean;
  canAccessTemplate: (templateTier: string) => boolean;
  hasPdfEditor: boolean;
  monthlyUsage: MonthlyUsage | null;
  refreshTier: () => Promise<void>;
}

// Admin types for user management
export interface UserListItem {
  id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  picture_url?: string;
  auth_provider: string;
  is_active: boolean;
  roles: RoleName[];
  quota?: QuotaInfo;
  tier?: TierInfo;
  created_at?: string;
  updated_at?: string;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data: {
    users: UserListItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
}

export interface RolesListResponse {
  success: boolean;
  message: string;
  data: {
    roles: Role[];
  };
}

export interface QuotaTransaction {
  id: number;
  user_id: number;
  transaction_type: 'add' | 'use' | 'refund' | 'reset' | 'set';
  amount: number;
  balance_after: number;
  reason?: string;
  performed_by?: number;
  document_id?: string;
  created_at: string;
}

export interface QuotaHistoryResponse {
  success: boolean;
  message: string;
  data: {
    transactions: QuotaTransaction[];
  };
}

export interface QuotaResponse {
  success: boolean;
  message: string;
  data: QuotaInfo;
}

// Admin action request types
export interface SetQuotaRequest {
  amount: number;
  reason?: string;
}

export interface AddQuotaRequest {
  amount: number;
  reason?: string;
}

export interface AssignRoleRequest {
  role_name: string;
}

export interface UseQuotaRequest {
  document_id?: string;
}
