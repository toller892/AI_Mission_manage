import { apiClient } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Task,
  User,
  CreateTaskRequest,
  UpdateTaskRequest,
  Comment,
} from '../types';

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

// Task API
export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get('/api/tasks');
    return response.data;
  },

  getTaskById: async (id: number): Promise<Task> => {
    const response = await apiClient.get(`/api/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post('/api/tasks', data);
    return response.data;
  },

  updateTask: async (id: number, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.put(`/api/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/${id}`);
  },

  addComment: async (taskId: number, content: string): Promise<Comment> => {
    const response = await apiClient.post(`/api/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get('/api/tasks/dashboard');
    return response.data;
  },
};

// User API
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/api/users/${id}`, data);
    return response.data;
  },

  createUser: async (data: { username: string; email: string; password?: string; fullName?: string; role?: string }): Promise<User> => {
    const response = await apiClient.post('/api/users', data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`);
  },

  resetPassword: async (id: number, password: string): Promise<void> => {
    await apiClient.put(`/api/users/${id}/password`, { password });
  },

  getStats: async () => {
    const response = await apiClient.get('/api/users/stats');
    return response.data;
  },
};
