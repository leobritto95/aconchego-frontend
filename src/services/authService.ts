import { apiRequest } from './axios'
import { User, LoginCredentials, LoginResponse } from '../types'

export class AuthService {
  static async login(credentials: LoginCredentials) {
    return apiRequest<LoginResponse>('post', '/auth/login', credentials)
  }

  static async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  static async logout() {
    const result = await apiRequest('post', '/auth/logout')

    if (result.success) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }

    return result
  }

  static async validateToken(token: string) {
    return apiRequest<User>('get', '/auth/validate')
  }
} 