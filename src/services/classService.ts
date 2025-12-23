import { apiRequest } from './axios'
import { Class } from '../types'

export class ClassService {
  static async getClasses() {
    return apiRequest<Class[]>('get', '/classes')
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
}

