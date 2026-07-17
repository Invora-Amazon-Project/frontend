import { axiosInstance } from "../authService";

export type MembershipRole = "OWNER" | "ADMIN" | "STAFF" | "CUSTOMER";

export interface SubscriptionPlanInfo {
  id: string;
  name: string;
  price: number;
}

export interface EmbeddedSubscription {
  status: string;
  trial_end?: string;
  plan: SubscriptionPlanInfo;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name?: string;
  role: MembershipRole;
  created_at?: string;
  subscriptions?: EmbeddedSubscription[];
}

export interface GetAdminUsersParams {
  role?: MembershipRole;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  data: AdminUserListItem[];
  total: number;
}

export async function getAdminUsers(
  params: GetAdminUsersParams = {}
): Promise<PaginatedUsersResponse> {
  const res = await axiosInstance.get<
    AdminUserListItem[] | { data: AdminUserListItem[]; total?: number }
  >("/admin/users", { params });

  if (Array.isArray(res.data)) {
    return { data: res.data, total: res.data.length };
  }
  return {
    data: res.data.data,
    total: res.data.total ?? res.data.data.length,
  };
}

