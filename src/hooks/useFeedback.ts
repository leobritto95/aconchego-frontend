import { useQuery } from '@tanstack/react-query'
import { FeedbackService } from '../services/feedbackService'
import { useAuth } from './useAuth'
import { canViewAllFeedbacks, getCurrentUserId } from '../utils/permissions'

export function useFeedback(
  page: number = 1,
  limit: number = 10,
  style?: string,
  classFilter?: string,
  startDate?: string,
  endDate?: string
) {
  const { user } = useAuth()

  // Determina se deve filtrar por usuário baseado no papel
  const shouldFilterByUser = user && !canViewAllFeedbacks(user || null)
  const userId = shouldFilterByUser ? getCurrentUserId() || undefined : undefined

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feedbacks', page, limit, style, classFilter, startDate, endDate, userId],
    queryFn: () => FeedbackService.getFeedbacks(page, limit, style, classFilter, startDate, endDate, userId),
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!user, // Só executa se tiver usuário logado
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

export function useGroupedClasses(style?: string, classFilter?: string, startDate?: string, endDate?: string) {
  const { user } = useAuth()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['groupedClasses', style, classFilter, startDate, endDate],
    queryFn: () => FeedbackService.getGroupedClasses(style, classFilter, startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user && canViewAllFeedbacks(user || null), // Só executa se tiver usuário logado e puder ver todos os feedbacks
  })

  return {
    classes: data?.success ? data.data : [],
    isLoading,
    error: error?.message || null,
    refetch,
    success: data?.success || false,
    message: data?.message || ''
  }
}

export function useStudentGroupedClasses(
  style?: string,
  classFilter?: string,
  startDate?: string,
  endDate?: string
) {
  const { user } = useAuth()
  const userId = getCurrentUserId()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['studentGroupedClasses', userId, style, classFilter, startDate, endDate],
    queryFn: () => FeedbackService.getStudentGroupedClasses(userId!, style, classFilter, startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user && !!userId && !canViewAllFeedbacks(user || null), // Só executa se tiver usuário logado e for aluno
  })

  return {
    classes: data?.success ? data.data : [],
    isLoading,
    error: error?.message || null,
    refetch,
    success: data?.success || false,
    message: data?.message || ''
  }
}

export function useFeedbacksByClassId(classId: number) {
  const { user } = useAuth()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feedbacksByClassId', classId],
    queryFn: () => FeedbackService.getFeedbacksByClassId(classId),
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!user && canViewAllFeedbacks(user || null) && !!classId,
  })

  return {
    feedbacks: data?.success ? data.data : [],
    isLoading,
    error: error?.message || null,
    refetch,
    success: data?.success || false,
    message: data?.message || ''
  }
}

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
    isLoading,
    error: error?.message || null
  }
} 