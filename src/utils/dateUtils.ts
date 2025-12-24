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

/**
 * Calcula informações de badge contextual para uma data
 */
export interface DateBadgeInfo {
  type: "today" | "tomorrow" | "days" | "nextWeek" | null;
  label: string;
  className: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDateBadgeInfo(date: Date, today: Date = normalizeDate(new Date())): DateBadgeInfo {
  const dateNormalized = normalizeDate(date);
  const daysUntil = Math.ceil((dateNormalized.getTime() - today.getTime()) / MS_PER_DAY);

  if (daysUntil === 0) {
    return {
      type: "today",
      label: "Hoje",
      className: "bg-blue-100 text-blue-700",
    };
  }

  if (daysUntil === 1) {
    return {
      type: "tomorrow",
      label: "Amanhã",
      className: "bg-purple-100 text-purple-700",
    };
  }

  // Verificar se está na semana atual
  const currentDayOfWeek = today.getDay();
  const daysUntilSunday = 7 - currentDayOfWeek;
  const isInCurrentWeek = daysUntil > 0 && daysUntil <= daysUntilSunday;

  if (isInCurrentWeek) {
    return {
      type: "days",
      label: daysUntil === 1 ? "1 dia" : `${daysUntil} dias`,
      className: "bg-green-100 text-green-700",
    };
  }

  // Verificar se está na próxima semana
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilSunday + 1);
  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);
  const isInNextWeek = dateNormalized >= normalizeDate(nextMonday) && dateNormalized <= normalizeDate(nextSunday);

  if (isInNextWeek) {
    return {
      type: "nextWeek",
      label: "Próxima semana",
      className: "bg-indigo-100 text-indigo-700",
    };
  }

  return {
    type: null,
    label: "",
    className: "",
  };
}

