import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Project {
  id?: number;
  projectName: string;
  projectDescription?: string;
  clientCompanyName: string;
  projectStartDate: string;
  projectEndDate?: string;
  projectStatus: string;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async () => {
    const response = await api.get('/projects');
    return response.data;
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData: Partial<Project>) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      });
  },
});

export const { clearError } = projectSlice.actions;
export default projectSlice.reducer;