import { axiosInstance } from "../authService";

export async function addWorkspaceUser(data: { workspace_id: string; user_id: string }) {
  const res = await axiosInstance.post("/workspace-users", data);
  return res.data;
}

export async function getWorkspaceUsers(workspace_id: string) {
  const res = await axiosInstance.get(`/workspace-users/${workspace_id}`);
  return res.data;
}