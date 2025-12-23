import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClassService } from '../services/classService'
import { Class } from '../types'

export function useClasses() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await ClassService.getClasses()
      return response.success ? response.data : []
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    classes: data || [],
    isLoading,
    error: error?.message || null,
    refetch,
  }
}

export function useClassById(id: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['class', id],
    queryFn: async () => {
      if (!id) return null
      const response = await ClassService.getClassById(id)
      return response.success ? response.data : null
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  return {
    class: data || null,
    isLoading,
    error: error?.message || null,
    refetch,
  }
}

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) =>
      ClassService.createClass(classData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, classData }: { id: string; classData: Partial<Class> }) =>
      ClassService.updateClass(id, classData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ClassService.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

