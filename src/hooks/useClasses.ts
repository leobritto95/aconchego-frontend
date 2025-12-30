import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClassService } from '../services/classService'
import { Class } from '../types'
import { useAuth } from './useAuth'
import { isTeacher, isStudent } from '../utils/permissions'

export function useClasses() {
  const { user: currentUser } = useAuth()
  
  // Determinar query params baseado no papel do usuário
  const queryParams = useMemo(() => {
    if (!currentUser) return undefined
    
    if (isStudent(currentUser)) {
      return {
        studentId: String(currentUser.id),
      }
    }
    
    if (isTeacher(currentUser)) {
      return {
        teacherId: String(currentUser.id),
      }
    }
    
    // Admin e secretary não precisam de filtros
    return undefined
  }, [currentUser])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['classes', queryParams],
    queryFn: async () => {
      const response = await ClassService.getClasses(queryParams)
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

// Hook para buscar todas as classes (usado no calendário onde todas as classes são visíveis)
export function useAllClasses() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: async () => {
      // Sem query params = busca todas as classes
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

export function useAddStudentToClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      ClassService.addStudentToClass(classId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class', variables.classId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useRemoveStudentFromClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      ClassService.removeStudentFromClass(classId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class', variables.classId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

