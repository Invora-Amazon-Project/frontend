import { axiosInstance } from "../authService";

export interface Workspace {
  id: string;
  name: string;
  owner_user_id: string;
  created_at?: string;
  updated_at?: string;
}

export async function createWorkspace(data: { name: string }): Promise<Workspace> {
  const res = await axiosInstance.post("/workspaces", data);
  return res.data;
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const res = await axiosInstance.get("/workspaces");
  return res.data;
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const res = await axiosInstance.get(`/workspaces/${id}`);
  return res.data;
}

export async function updateWorkspace(id: string, data: { name: string }): Promise<Workspace> {
  const res = await axiosInstance.patch(`/workspaces/${id}`, data);
  return res.data;
}
