import { useQuery } from '@tanstack/react-query'
import { NewsService } from '../services/newsService'

export function useNews(page: number = 1, limit: number = 10) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['news', page, limit],
    queryFn: () => NewsService.getNews(page, limit),
    staleTime: 3 * 60 * 1000, // 3 minutos
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

export function useNewsById(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['news', id],
    queryFn: () => NewsService.getNewsById(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
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