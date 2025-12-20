import { apiRequest } from './axios'
import { User } from '../types'

export class UserService {
  static async getUserById(id: string | number) {
    return apiRequest<User>('get', `/users/${String(id)}`)
  }
}
