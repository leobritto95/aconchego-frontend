import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClassExceptionService } from '../services/classExceptionService'

export function useClassExceptions(classId?: string | null, startDate?: string, endDate?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['class-exceptions', classId, startDate, endDate],
    queryFn: async () => {
      const response = await ClassExceptionService.getClassExceptions(classId || undefined, startDate, endDate)
      return response.success ? response.data : []
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-exceptions'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteClassException() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { id: string; classId: string }) =>
      ClassExceptionService.deleteClassException(variables.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-exceptions'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

