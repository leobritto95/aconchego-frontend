import { apiRequest } from './axios'
import { Feedback, PaginatedResponse } from '../types'

export interface GroupedClasses {
  classId: number;
  className: string;
  style: string;
  date: string;
  feedbackCount: number;
}

export class FeedbackService {
  static async getFeedbacks(
    page: number = 1,
    limit: number = 10,
    style?: string,
    classFilter?: string,
    startDate?: string,
    endDate?: string,
    userId?: number
  ) {
    const params: any = { page, limit }

    if (style) params.style = style
    if (classFilter) params.class = classFilter
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (userId) params.userId = userId

    return apiRequest<PaginatedResponse<Feedback>>('get', '/feedback', undefined, params)
  }

  static async getFeedbackById(id: number) {
    return apiRequest<Feedback>('get', `/feedback/${id}`)
  }

  static async getGroupedClasses(style?: string, classFilter?: string, startDate?: string, endDate?: string) {
    const params: any = {}
    if (style) params.style = style
    if (classFilter) params.class = classFilter
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    return apiRequest<GroupedClasses[]>('get', '/feedback/classes', undefined, params)
  }

  static async getStudentGroupedClasses(
    userId: number,
    style?: string,
    classFilter?: string,
    startDate?: string,
    endDate?: string
  ) {
    const params: any = { userId }
    if (style) params.style = style
    if (classFilter) params.class = classFilter
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    return apiRequest<GroupedClasses[]>('get', '/feedback/student/classes', undefined, params)
  }

  static async getFeedbacksByClassId(classId: number) {
    return apiRequest<Feedback[]>('get', `/feedback/class/${classId}`)
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
    const [styles, classes] = await Promise.all([
      apiRequest<string[]>('get', '/filters/styles'),
      apiRequest<string[]>('get', '/filters/classes')
    ])

    return {
      styles: styles.success ? styles.data : [],
      classes: classes.success ? classes.data : []
    }
  }
} 