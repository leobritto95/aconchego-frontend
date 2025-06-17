// Configuração da API
export const API_CONFIG = {
  // URL base da API (será usada quando migrar para backend real)
  BASE_URL: process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost:3000/api',

  // Timeout padrão para requisições (em ms)
  TIMEOUT: 10000,

  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  // Configurações de retry
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Configurações de cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};

// Endpoints da API
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VALIDATE: '/auth/validate',
  },

  // Eventos
  EVENTS: {
    LIST: '/events',
    DETAIL: (id: string) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
  },

  // Notícias
  NEWS: {
    LIST: '/news',
    DETAIL: (id: number) => `/news/${id}`,
    CREATE: '/news',
    UPDATE: (id: number) => `/news/${id}`,
    DELETE: (id: number) => `/news/${id}`,
    SEARCH: '/news/search',
    LATEST: '/news/latest',
  },

  // Feedbacks
  FEEDBACKS: {
    LIST: '/feedback',
    DETAIL: (id: number) => `/feedback/${id}`,
    CREATE: '/feedback',
    UPDATE: (id: number) => `/feedback/${id}`,
    DELETE: (id: number) => `/feedback/${id}`,
  },

  // Filtros
  FILTERS: {
    STYLES: '/filters/styles',
    CLASSES: '/filters/classes',
    YEARS: '/filters/years',
  },
};

// Códigos de status HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique as informações e tente novamente.',
  TIMEOUT: 'Tempo limite excedido. Tente novamente.',
};

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Configurações de cache do React Query
export const CACHE_KEYS = {
  USER: 'user',
  EVENTS: 'events',
  NEWS: 'news',
  FEEDBACKS: 'feedbacks',
  FILTER_OPTIONS: 'filterOptions',
};

// Tempos de cache para React Query (em ms)
export const CACHE_TIMES = {
  USER: 5 * 60 * 1000, // 5 minutos
  EVENTS: 2 * 60 * 1000, // 2 minutos
  NEWS: 3 * 60 * 1000, // 3 minutos
  FEEDBACKS: 3 * 60 * 1000, // 3 minutos
  FILTER_OPTIONS: 10 * 60 * 1000, // 10 minutos
};

// Função para construir URL completa
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para adicionar token de autenticação
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}; 