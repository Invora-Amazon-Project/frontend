import { axiosInstance } from "../authService";

export type MembershipRole = "OWNER" | "ADMIN" | "STAFF" | "CUSTOMER";

export interface AdminUserListItem {
  id: string;
  email: string;
  name?: string;
  role: MembershipRole;
  created_at?: string;
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

export interface SubscriptionPlanInfo {
  id: string;
  name: string;
  price: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  plan?: SubscriptionPlanInfo;
  trial_end?: string;
  renewal_date?: string;
}

export async function getUserSubscription(userId: string) {
  const res = await axiosInstance.get<UserSubscription>(`/user-subscriptions/${userId}`);
  return res.data;
}
