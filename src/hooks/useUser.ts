import { useQuery } from '@tanstack/react-query'
import { UserService } from '../services/userService'

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
