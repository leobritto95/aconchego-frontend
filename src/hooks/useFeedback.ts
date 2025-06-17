import { useQuery } from '@tanstack/react-query'
import { FeedbackService } from '../services/feedbackService'

export function useFeedbacks(
  page: number = 1,
  limit: number = 10,
  style?: string,
  classFilter?: string,
  year?: string
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feedbacks', page, limit, style, classFilter, year],
    queryFn: () => FeedbackService.getFeedbacks(page, limit, style, classFilter, year),
    staleTime: 3 * 60 * 1000, // 3 minutos
  })

  return {
    feedbacks: data?.success ? data.data.data : [],
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

// Alias para compatibilidade com código existente
export const useFeedback = useFeedbacks

export function useFeedbackById(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => FeedbackService.getFeedbackById(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!id, // Só executa se tiver ID
  })

  return {
    feedback: data?.success ? data.data : null,
    isLoading,
    error: error?.message || null,
    success: data?.success || false,
    message: data?.message || ''
  }
}

export function useFilterOptions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: FeedbackService.getFilterOptions,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    styles: data?.styles || [],
    classes: data?.classes || [],
    years: data?.years || [],
    isLoading,
    error: error?.message || null
  }
} 