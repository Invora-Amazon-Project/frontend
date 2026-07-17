import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { createWorkspace, getWorkspaces, updateWorkspace, Workspace } from "./services/workspacesService";
import { getStoredWorkspaceId, setStoredWorkspaceId } from "./workspaceStorage";

interface WorkspaceState {
  current: Workspace | null;
  all: Workspace[];
  loading: boolean;
  error: string | null;
  renaming: boolean;
  renameError: string | null;
  creating: boolean;
  createError: string | null;
}

const initialState: WorkspaceState = {
  current: null,
  all: [],
  loading: false,
  error: null,
  renaming: false,
  renameError: null,
  creating: false,
  createError: null,
};

function extractErrorMessage(err: AxiosError<{ message?: string }>): string {
  return err.response?.data?.message ?? err.message;
}

export const fetchCurrentWorkspace = createAsyncThunk(
  "workspace/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const workspaces = await getWorkspaces();
      const storedId = getStoredWorkspaceId();
      const current = workspaces.find((w) => w.id === storedId) ?? workspaces[0] ?? null;
      return { workspaces, current };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err as AxiosError<{ message?: string }>));
    }
  }
);

export const renameCurrentWorkspace = createAsyncThunk(
  "workspace/renameCurrent",
  async (name: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { workspace: WorkspaceState };
      const id = state.workspace.current?.id;
      if (!id) throw new Error("No active workspace.");
      return await updateWorkspace(id, { name });
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err as AxiosError<{ message?: string }>));
    }
  }
);

export const createNewWorkspace = createAsyncThunk(
  "workspace/create",
  async (name: string, { rejectWithValue }) => {
    try {
      return await createWorkspace({ name });
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err as AxiosError<{ message?: string }>));
    }
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    clearRenameError(state) {
      state.renameError = null;
    },
    clearCreateError(state) {
      state.createError = null;
    },
    switchWorkspace(state, action: PayloadAction<string>) {
      const target = state.all.find((w) => w.id === action.payload);
      if (target) {
        state.current = target;
        setStoredWorkspaceId(target.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCurrentWorkspace.fulfilled,
        (state, action: PayloadAction<{ workspaces: Workspace[]; current: Workspace | null }>) => {
          state.loading = false;
          state.all = action.payload.workspaces;
          state.current = action.payload.current;
          if (action.payload.current) setStoredWorkspaceId(action.payload.current.id);
        }
      )
      .addCase(fetchCurrentWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(renameCurrentWorkspace.pending, (state) => {
        state.renaming = true;
        state.renameError = null;
      })
      .addCase(renameCurrentWorkspace.fulfilled, (state, action: PayloadAction<Workspace>) => {
        state.renaming = false;
        state.current = action.payload;
        state.all = state.all.map((w) => (w.id === action.payload.id ? action.payload : w));
      })
      .addCase(renameCurrentWorkspace.rejected, (state, action) => {
        state.renaming = false;
        state.renameError = action.payload as string;
      });

    builder
      .addCase(createNewWorkspace.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createNewWorkspace.fulfilled, (state, action: PayloadAction<Workspace>) => {
        state.creating = false;
        state.all = [...state.all, action.payload];
        state.current = action.payload;
        setStoredWorkspaceId(action.payload.id);
      })
      .addCase(createNewWorkspace.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      });
  },
});

export const { clearRenameError, clearCreateError, switchWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
