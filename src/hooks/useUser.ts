import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserService, CreateUserData, UpdateUserData, GetUsersParams, UserCounts } from '../services/userService'

export function useUserById(id: string | number | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => UserService.getUserById(id!),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id, // Só executa se tiver ID
  })

  return {
    user: data?.success ? data.data : null,
    isLoading,
    error: error?.message || null,
    success: data?.success || false,
    message: data?.message || ''
  }
}

export function useUsers(params?: GetUsersParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', params],
    queryFn: () => UserService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    users: data?.success ? data.data.data || [] : [],
    pagination: data?.success ? data.data.pagination : null,
    isLoading,
    error: error?.message || null,
    refetch,
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserData) => UserService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userCounts'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userData }: { id: string | number; userData: UpdateUserData }) =>
      UserService.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['userCounts'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userCounts'] })
    },
  })
}

export function useUserCounts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userCounts'],
    queryFn: () => UserService.getUserCounts(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    counts: data?.success ? data.data : null,
    isLoading,
    error: error?.message || null,
  }
}
