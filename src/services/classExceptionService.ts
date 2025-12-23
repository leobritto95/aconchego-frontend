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

  static async deleteClassException(id: string) {
    return apiRequest<{ success: boolean; data: boolean }>('delete', `/class-exceptions/${id}`)
  }
}

