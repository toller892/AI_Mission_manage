export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: 'admin' | 'member' | 'pa';
  avatarUrl?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  creatorId?: number;
  paId?: number;
  createdDate: string;
  dueDate?: string;
  completedDate?: string;
  estimatedDurationDays?: number;
  ticketUrl?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  pa?: User;
  assignees?: User[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  taskId: number;
  userId?: number;
  content: string;
  createdAt: string;
  user?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assigneeIds?: number[];
  paId?: number;
  ticketUrl?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  completedDate?: string;
}
