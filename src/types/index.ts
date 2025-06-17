// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'secretary' | 'admin';
}

// Event types
export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  description?: string;
}

// News types
export interface News {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  author?: string;
  imageUrl?: string;
}

// Feedback types
export interface Feedback {
  id: number;
  style: string;
  class: string;
  date: string;
  grade: number;
  status: 'approved' | 'rejected';
  evaluatorFeedback?: string;
  parameters?: {
    parameter1: number;
    parameter2: number;
    parameter3: number;
    parameter4: number;
    parameter5: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Login types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
} 