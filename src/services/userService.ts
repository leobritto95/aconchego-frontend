import { apiRequest } from './axios'
import { User } from '../types'

export class UserService {
  static async getUserById(id: string | number) {
    return apiRequest<User>('get', `/users/${String(id)}`)
  }

  static async getUsers(role?: string) {
    const params: any = {}
    if (role) params.role = role.toUpperCase()
    return apiRequest<{ data: User[]; pagination: any }>('get', '/users', undefined, params)
  }

  static async getTeachers() {
    const response = await this.getUsers('teacher')
    if (response.success) {
      return {
        ...response,
        data: response.data.data || []
      }
    }
    return response
  }
}
