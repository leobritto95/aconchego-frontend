import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthService } from '../services/authService'
import { LoginCredentials } from '../types'

export function useAuth() {
  const queryClient = useQueryClient()

  // Query para obter usuário atual
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: AuthService.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => AuthService.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Salva dados no localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)

        // Atualiza o cache do React Query
        queryClient.setQueryData(['user'], response.data.user)
      }
    },
    onError: (error) => {
      console.error('Erro no login:', error)
    }
  })

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      // Limpa o cache do React Query
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Erro no logout:', error)
    }
  })

  // Mutation para validar token
  const validateTokenMutation = useMutation({
    mutationFn: (token: string) => AuthService.validateToken(token),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.setQueryData(['user'], response.data)
      }
    }
  })

  return {
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    validateToken: validateTokenMutation.mutate,
    validateTokenAsync: validateTokenMutation.mutateAsync,
    isValidatingToken: validateTokenMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  }
} 