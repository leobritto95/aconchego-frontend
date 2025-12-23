import { apiRequest } from './axios'
import { Event } from '../types'

export class EventService {
  static async getEvents(start?: string, end?: string) {
    const params: any = {}

    if (start) params.start = start
    if (end) params.end = end

    return apiRequest<Event[]>('get', '/events', undefined, params)
  }

  static async getEventById(id: string) {
    return apiRequest<Event | null>('get', `/events/${id}`)
  }

  static async createEvent(eventData: Omit<Event, 'id'>) {
    return apiRequest<Event>('post', '/events', eventData)
  }

  static async updateEvent(id: string, eventData: Partial<Event>) {
    return apiRequest<Event>('put', `/events/${id}`, eventData)
  }

  static async deleteEvent(id: string) {
    return apiRequest<boolean>('delete', `/events/${id}`)
  }

  static async getEventsByDateRange(startDate: string, endDate: string) {
    return apiRequest<Event[]>('get', '/events', undefined, { start: startDate, end: endDate })
  }
} 