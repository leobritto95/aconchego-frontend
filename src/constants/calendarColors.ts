/**
 * Cores do calendário - Fonte única de verdade
 * Estas cores devem corresponder às definidas no backend
 */

export const CALENDAR_COLORS = {
  // Classes/Aulas
  enrolled: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
    label: 'Aula matriculada',
  },
  notEnrolled: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    label: 'Aula disponível',
  },
  // Para professores/admins (todas as classes aparecem nesta cor)
  classDefault: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
    label: 'Aulas/Classes',
  },
  // Eventos únicos
  singleEvent: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    label: 'Evento único',
  },
} as const;
