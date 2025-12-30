import { apiRequest } from './axios'
import { Class, User } from '../types'

export class ClassService {
  static async getClasses(params?: { studentId?: string; teacherId?: string }) {
    const queryParams: Record<string, string> = {}
    if (params?.studentId) queryParams.studentId = params.studentId
    if (params?.teacherId) queryParams.teacherId = params.teacherId
    return apiRequest<Class[]>('get', '/classes', undefined, Object.keys(queryParams).length > 0 ? queryParams : undefined)
  }

  static async getClassById(id: string) {
    return apiRequest<Class>('get', `/classes/${id}`)
  }

  static async createClass(classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<Class>('post', '/classes', classData)
  }

  static async updateClass(id: string, classData: Partial<Class>) {
    return apiRequest<Class>('put', `/classes/${id}`, classData)
  }

  static async deleteClass(id: string) {
    return apiRequest<{ id: string; name: string }>('delete', `/classes/${id}`)
  }

  static async addStudentToClass(classId: string, studentId: string) {
    return apiRequest<{ id: string; classId: string; studentId: string }>('post', `/classes/${classId}/student`, { studentId })
  }

  static async removeStudentFromClass(classId: string, studentId: string) {
    return apiRequest<{ success: boolean }>('delete', `/classes/${classId}/student/${studentId}`)
  }

  static async getAvailableStudents(classId: string, params?: { search?: string; page?: number; limit?: number }) {
    const queryParams: Record<string, string | number> = {}
    if (params?.search) queryParams.search = params.search
    if (params?.page) queryParams.page = params.page
    if (params?.limit) queryParams.limit = params.limit
    return apiRequest<{ data: User[]; page: number; limit: number; total: number; totalPages: number }>('get', `/classes/${classId}/available-students`, undefined, Object.keys(queryParams).length > 0 ? queryParams : undefined)
  }
}

