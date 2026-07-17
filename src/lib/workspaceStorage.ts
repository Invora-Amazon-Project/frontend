const CURRENT_WORKSPACE_KEY = "invora_current_workspace_id";

export function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_WORKSPACE_KEY);
}

export function setStoredWorkspaceId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_WORKSPACE_KEY, id);
}

export function clearStoredWorkspaceId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_WORKSPACE_KEY);
}
