import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClassExceptionService } from '../services/classExceptionService'

export function useClassExceptions(classId: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['class-exceptions', classId],
    queryFn: async () => {
      if (!classId) return []
      const response = await ClassExceptionService.getClassExceptions(classId)
      return response.success ? response.data : []
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    exceptions: data || [],
    isLoading,
    error: error?.message || null,
    refetch,
  }
}

export function useCreateClassException() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, date, reason }: { classId: string; date: string; reason?: string }) =>
      ClassExceptionService.createClassException(classId, date, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-exceptions', variables.classId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteClassException() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { id: string; classId: string }) =>
      ClassExceptionService.deleteClassException(variables.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-exceptions', variables.classId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

