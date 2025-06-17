import { apiRequest } from './axios'
import { News, PaginatedResponse } from '../types'

export class NewsService {
  static async getNews(page: number = 1, limit: number = 10) {
    return apiRequest<PaginatedResponse<News>>('get', '/news', undefined, { page, limit })
  }

  static async getNewsById(id: number) {
    return apiRequest<News>('get', `/news/${id}`)
  }

  static async createNews(newsData: Omit<News, 'id' | 'publishedAt'>) {
    return apiRequest<News>('post', '/news', newsData)
  }

  static async updateNews(id: number, newsData: Partial<News>) {
    return apiRequest<News>('put', `/news/${id}`, newsData)
  }

  static async deleteNews(id: number) {
    return apiRequest<boolean>('delete', `/news/${id}`)
  }

  static async searchNews(query: string) {
    return apiRequest<News[]>('get', '/news/search', { query })
  }

  static async getLatestNews(limit: number = 5) {
    return apiRequest<News[]>('get', '/news/latest', undefined, { limit })
  }
} 