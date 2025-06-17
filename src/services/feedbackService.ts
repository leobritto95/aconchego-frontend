import { apiRequest } from './axios'
import { Feedback, PaginatedResponse } from '../types'

export class FeedbackService {
  static async getFeedbacks(
    page: number = 1,
    limit: number = 10,
    style?: string,
    classFilter?: string,
    year?: string
  ) {
    const params: any = { page, limit }

    if (style) params.style = style
    if (classFilter) params.class = classFilter
    if (year) params.year = year

    return apiRequest<PaginatedResponse<Feedback>>('get', '/feedback', undefined, params)
  }

  static async getFeedbackById(id: number) {
    return apiRequest<Feedback>('get', `/feedback/${id}`)
  }

  static async createFeedback(feedbackData: Omit<Feedback, 'id'>) {
    return apiRequest<Feedback>('post', '/feedback', feedbackData)
  }

  static async updateFeedback(id: number, feedbackData: Partial<Feedback>) {
    return apiRequest<Feedback>('put', `/feedback/${id}`, feedbackData)
  }

  static async deleteFeedback(id: number) {
    return apiRequest<boolean>('delete', `/feedback/${id}`)
  }

  static async getFilterOptions() {
    const [styles, classes, years] = await Promise.all([
      apiRequest<string[]>('get', '/filters/styles'),
      apiRequest<string[]>('get', '/filters/classes'),
      apiRequest<string[]>('get', '/filters/years')
    ])

    return {
      styles: styles.success ? styles.data : [],
      classes: classes.success ? classes.data : [],
      years: years.success ? years.data : []
    }
  }
} 