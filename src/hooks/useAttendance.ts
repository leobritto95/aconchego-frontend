import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AttendanceService, GetAttendancesParams, CreateAttendanceData, UpdateAttendanceData, CreateBulkAttendanceData } from '../services/attendanceService'

const STALE_TIME = 5 * 60 * 1000; // 5 minutos

export function useAttendances(params?: GetAttendancesParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attendances', params],
    queryFn: () => AttendanceService.getAttendances(params),
    staleTime: STALE_TIME,
  })

  return {
    attendances: data?.success ? data.data : [],
    isLoading,
    error: error?.message || null,
    refetch,
  }
}

export function useAttendanceById(id: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => AttendanceService.getAttendanceById(id!),
    enabled: !!id,
    staleTime: STALE_TIME,
  })

  return {
    attendance: data?.success ? data.data : null,
    isLoading,
    error: error?.message || null,
    refetch,
  }
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAttendanceData) => AttendanceService.createAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceData }) =>
      AttendanceService.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
  })
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AttendanceService.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
  })
}

export function useCreateBulkAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBulkAttendanceData) => AttendanceService.createBulkAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
  })
}

