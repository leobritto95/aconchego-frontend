import { apiRequest } from './axios'
import { Attendance } from '../types'

export interface GetAttendancesParams {
  classId?: string
  studentId?: string
  startDate?: string
  endDate?: string
}

export interface CreateAttendanceData {
  classId: string
  studentId: string
  date: string
  status: 'PRESENT' | 'ABSENT'
}

export interface UpdateAttendanceData {
  date?: string
  status?: 'PRESENT' | 'ABSENT'
}

export interface BulkAttendanceItem {
  studentId: string
  status: 'PRESENT' | 'ABSENT'
}

export interface CreateBulkAttendanceData {
  classId: string
  date: string
  attendances: BulkAttendanceItem[]
}

export class AttendanceService {
  static async getAttendances(params?: GetAttendancesParams) {
    const queryParams: any = {}
    if (params?.classId) queryParams.classId = params.classId
    if (params?.studentId) queryParams.studentId = params.studentId
    if (params?.startDate) queryParams.startDate = params.startDate
    if (params?.endDate) queryParams.endDate = params.endDate
    return apiRequest<Attendance[]>('get', '/attendance', undefined, queryParams)
  }

  static async getAttendanceById(id: string) {
    return apiRequest<Attendance>('get', `/attendance/${id}`)
  }

  static async createAttendance(data: CreateAttendanceData) {
    return apiRequest<Attendance>('post', '/attendance', data)
  }

  static async updateAttendance(id: string, data: UpdateAttendanceData) {
    return apiRequest<Attendance>('put', `/attendance/${id}`, data)
  }

  static async deleteAttendance(id: string) {
    return apiRequest<{ success: boolean }>('delete', `/attendance/${id}`)
  }

  static async createBulkAttendance(data: CreateBulkAttendanceData) {
    return apiRequest<Attendance[]>('post', '/attendance/bulk', data)
  }
}

