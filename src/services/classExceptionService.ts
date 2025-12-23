import { apiRequest } from './axios'
import { ClassException } from '../types'

export class ClassExceptionService {
  static async createClassException(classId: string, date: string, reason?: string) {
    return apiRequest<ClassException>('post', '/class-exceptions', {
      classId,
      date,
      reason,
    })
  }

  static async getClassExceptions(classId: string) {
    return apiRequest<ClassException[]>('get', `/class-exceptions/class/${classId}`)
  }

  static async getAllClassExceptions(startDate?: string, endDate?: string) {
    const params = Object.fromEntries(
      Object.entries({ startDate, endDate }).filter(([, value]) => value !== undefined)
    ) as Record<string, string>;
    
    return apiRequest<ClassException[]>('get', '/class-exceptions/all', undefined, params)
  }

  static async deleteClassException(id: string) {
    return apiRequest<{ success: boolean; data: boolean }>('delete', `/class-exceptions/${id}`)
  }
}

