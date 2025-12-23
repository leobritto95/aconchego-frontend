// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'secretary' | 'admin';
}

// Class types
export interface ScheduleTime {
  startTime: string; // "19:00"
  endTime: string; // "21:00"
}

export interface Class {
  id: number | string;
  name: string;
  style?: string;
  description?: string;
  teacherId?: string;
  active?: boolean;
  recurringDays: number[]; // [2, 3] = terça e quarta
  scheduleTimes: Record<string, ScheduleTime>; // { "2": { startTime: "19:00", endTime: "21:00" }, ... }
  startDate: string; // Data de início da recorrência (ou data única da classe)
  endDate?: string | null; // Data de fim (null = sem limite)
  createdAt?: string;
  updatedAt?: string;
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
  extendedProps?: {
    type: 'recurring-class' | 'single-event';
    classId?: string;
    isEnrolled?: boolean; // Se o aluno está matriculado (apenas para classes)
    teacherName?: string; // Nome do professor (apenas para classes)
  };
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
  studentId: number;
  classId: number;
  style: string;
  class: string;
  date: string;
  average: number;
  status: 'approved' | 'rejected' | 'pending';
  evaluatorFeedback?: string;
  parameters?: Record<string, { name: string; score: number }>;
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

// ClassException types
export interface ClassException {
  id: string;
  classId: string;
  date: string;
  reason?: string;
  className?: string;
  classStyle?: string;
  createdAt?: string;
  updatedAt?: string;
} 