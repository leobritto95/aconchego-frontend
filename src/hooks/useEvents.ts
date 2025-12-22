import { useQuery } from '@tanstack/react-query'
import { EventService } from '../services/eventService'

export function useEvents(start?: string, end?: string) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['events', start, end],
    queryFn: () => EventService.getEvents(start, end),
    staleTime: 5 * 60 * 1000, // 5 minutos - aumenta cache
    gcTime: 10 * 60 * 1000, // 10 minutos - mantém cache mais tempo
    enabled: !!(start && end), // Só executa quando temos range de datas
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante transições
    refetchOnWindowFocus: false, // Evita refetch desnecessário ao focar janela
  })

  return {
    events: data?.success ? data.data : [],
    isLoading,
    isFetching, // Indica quando está buscando novos dados (mantém dados antigos)
    error: error?.message || null,
    refetch,
    success: data?.success || false,
    message: data?.message || ''
  }
}

export function useEventById(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => EventService.getEventById(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!id, // Só executa se tiver ID
  })

  return {
    event: data?.success ? data.data : null,
    isLoading,
    error: error?.message || null,
    success: data?.success || false,
    message: data?.message || ''
  }
} 