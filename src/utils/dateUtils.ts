// Utilitários para formatação de datas

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDateTimeLocal(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Normaliza uma data removendo horas, minutos, segundos e milissegundos
 */
export function normalizeDate(date: Date | string): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Verifica se uma aula pode ser cancelada baseado na data selecionada e horário da turma
 */
export function canCancelClass(
  selectedDate: Date,
  scheduleTimes?: Record<string, { startTime: string; endTime: string }>
): boolean {
  const now = new Date();
  const selectedDateNormalized = normalizeDate(selectedDate);
  const today = normalizeDate(now);

  // Se a data é futura, pode cancelar
  if (selectedDateNormalized > today) {
    return true;
  }

  // Se a data é hoje, verificar o horário
  if (selectedDateNormalized.getTime() === today.getTime()) {
    const dayOfWeek = selectedDateNormalized.getDay();
    const schedule = scheduleTimes?.[dayOfWeek.toString()];

    // Se não tem horário definido para este dia, não pode cancelar
    if (!schedule?.startTime) {
      return false;
    }

    // Verificar se o horário de início da aula já passou
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const classStartTime = new Date(now);
    classStartTime.setHours(startHour, startMinute, 0, 0);

    // Se o horário de início ainda não passou, pode cancelar
    return now < classStartTime;
  }

  // Se a data é passada, não pode cancelar
  return false;
}

