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
    backgroundColor: '#c4b5fd',
    borderColor: '#a78bfa',
    label: 'Aula disponível',
  },
  // Para professores/admins (todas as classes aparecem nesta cor)
  classDefault: {
    backgroundColor: '#c4b5fd',
    borderColor: '#a78bfa',
    label: 'Aulas/Classes',
  },
  // Eventos únicos
  singleEvent: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    label: 'Evento único',
  },
} as const;
