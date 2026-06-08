import { axiosInstance } from "../authService";

export async function createWorkspace(data: { name: string }) {
  const res = await axiosInstance.post("/workspaces", data);
  return res.data;
}

export async function getWorkspaces() {
  const res = await axiosInstance.get("/workspaces");
  return res.data;
}