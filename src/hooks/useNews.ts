import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NewsService } from '../services/newsService'
import { News } from '../types'
import { toast } from '../utils/toast'

const STALE_TIME_NEWS_LIST = 3 * 60 * 1000; // 3 minutos
const STALE_TIME_NEWS_BY_ID = 5 * 60 * 1000; // 5 minutos

interface UseNewsReturn {
  news: News[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  success: boolean;
  message: string;
}

export function useNews(page: number = 1, limit: number = 10): UseNewsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['news', page, limit],
    queryFn: () => NewsService.getNews(page, limit),
    staleTime: STALE_TIME_NEWS_LIST,
  })

  return {
    news: data?.success ? data.data.data : [],
    pagination: data?.success ? {
      total: data.data.total,
      page: data.data.page,
      limit: data.data.limit,
      totalPages: data.data.totalPages
    } : null,
    isLoading,
    error: error?.message || null,
    refetch,
    success: data?.success || false,
    message: data?.message || ''
  }
}

interface UseNewsByIdReturn {
  news: News | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  message: string;
}

export function useNewsById(id: number): UseNewsByIdReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['news', id],
    queryFn: () => NewsService.getNewsById(id),
    staleTime: STALE_TIME_NEWS_BY_ID,
    enabled: !!id, // Só executa se tiver ID
  })

  return {
    news: data?.success ? data.data : null,
    isLoading,
    error: error?.message || null,
    success: data?.success || false,
    message: data?.message || ''
  }
}

export type CreateNewsData = Omit<News, 'id' | 'publishedAt'>;
export type UpdateNewsData = Partial<Omit<News, 'id' | 'publishedAt'>>;

export function useCreateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newsData: CreateNewsData) => 
      NewsService.createNews(newsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('Notícia criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar notícia')
    }
  })
}

export function useUpdateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newsData }: { id: number; newsData: UpdateNewsData }) =>
      NewsService.updateNews(id, newsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('Notícia atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar notícia')
    }
  })
}

export function useDeleteNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => NewsService.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('Notícia deletada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao deletar notícia')
    }
  })
} 