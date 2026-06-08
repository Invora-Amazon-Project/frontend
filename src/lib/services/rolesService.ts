import { axiosInstance } from "../authService";

export async function createRole(data: { name: string }) {
  const res = await axiosInstance.post("/roles", data);
  return res.data;
}

export async function getRoles() {
  const res = await axiosInstance.get("/roles");
  return res.data;
}