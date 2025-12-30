import { User } from '../types'

export function canViewAllFeedbacks(user: User | null): boolean {
  if (!user) return false

  return ['admin', 'teacher', 'secretary'].includes(user.role)
}

export function canViewFeedback(user: User | null, feedbackStudentId: number): boolean {
  if (!user) return false

  if (canViewAllFeedbacks(user)) {
    return true
  }

  if (user.role === 'student') {
    return user.id === feedbackStudentId
  }

  return false
}

export function canManageEventsAndClasses(user: User | null): boolean {
  if (!user) return false
  return ['admin', 'secretary'].includes(user.role)
}

export function canManageUsers(user: User | null): boolean {
  if (!user) return false
  return ['admin', 'secretary'].includes(user.role)
}

export function canManageNews(user: User | null): boolean {
  if (!user) return false
  return ['admin', 'secretary'].includes(user.role)
}

export function getCurrentUserId(): number | null {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    const user = JSON.parse(userStr)
    return user.id
  } catch {
    return null
  }
}

export function canManageAttendance(user: User | null): boolean {
  if (!user) return false
  return ['admin', 'secretary', 'teacher'].includes(user.role)
}

export function canViewClasses(user: User | null): boolean {
  if (!user) return false
  return ['admin', 'secretary', 'teacher', 'student'].includes(user.role)
}

export function isTeacher(user: User | null): boolean {
  if (!user) return false
  return user.role === 'teacher'
}

export function isStudent(user: User | null): boolean {
  if (!user) return false
  return user.role === 'student'
} 