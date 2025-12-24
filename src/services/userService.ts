import { apiRequest } from './axios'
import { User } from '../types'

export interface CreateUserData {
  email: string
  password: string
  name: string
  role: 'student' | 'teacher' | 'secretary' | 'admin'
  classIds?: string[]
}

export interface UpdateUserData {
  email?: string
  password?: string
  name?: string
  role?: 'student' | 'teacher' | 'secretary' | 'admin'
}

export interface GetUsersParams {
  role?: string
  search?: string
  page?: number
  limit?: number
}

export interface UserCounts {
  total: number
  students: number
  teachers: number
  secretaries: number
  admins: number
}

export class UserService {
  static async getUserById(id: string | number) {
    return apiRequest<User>('get', `/users/${String(id)}`)
  }

  static async getUsers(params?: GetUsersParams) {
    const queryParams: any = {}
    if (params?.role) queryParams.role = params.role.toUpperCase()
    if (params?.search) queryParams.search = params.search
    if (params?.page) queryParams.page = params.page
    if (params?.limit) queryParams.limit = params.limit
    return apiRequest<{ data: User[]; pagination: any }>('get', '/users', undefined, queryParams)
  }

  static async getTeachers() {
    const response = await this.getUsers({ role: 'teacher' })
    if (response.success) {
      return {
        ...response,
        data: response.data.data || []
      }
    }
    return response
  }

  static async createUser(userData: CreateUserData) {
    return apiRequest<User>('post', '/users', userData)
  }

  static async updateUser(id: string | number, userData: UpdateUserData) {
    return apiRequest<User>('put', `/users/${String(id)}`, userData)
  }

  static async deleteUser(id: string | number) {
    return apiRequest<{ success: boolean }>('delete', `/users/${String(id)}`)
  }

  static async getUserCounts() {
    return apiRequest<UserCounts>('get', '/users/count')
  }
}
