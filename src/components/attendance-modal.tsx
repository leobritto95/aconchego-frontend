import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCalendar, FiCheckCircle, FiCheck, FiUser, FiUsers, FiChevronLeft, FiChevronRight, FiEdit2 } from "react-icons/fi";
import { Class, User } from "../types";
import { getPastClassDatesForRange, normalizeDate, formatDate, wasEnrolledOnDate, dateToISOString } from "../utils/dateUtils";
import { ClassException } from "../types";
import { DAY_NAMES, MONTH_NAMES } from "../utils/constants";
import { canManageAttendance, isStudent } from "../utils/permissions";

const CALENDAR_WEEKS = 6; // Semanas no calendário
const DAYS_PER_WEEK = 7; // Dias por semana
const TOTAL_CALENDAR_DAYS = CALENDAR_WEEKS * DAYS_PER_WEEK; // Total de dias no calendário
const CALENDAR_OFFSET = 8; // Offset em pixels para posicionar o calendário

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: Class;
  selectedDate: string | null;
  attendances: Map<string, 'PRESENT' | 'ABSENT'>;
  onSelectDate: (date: Date) => void;
  onAttendanceChange: (studentId: string, status: 'PRESENT' | 'ABSENT') => void;
  onSave: () => void;
  isPending: boolean;
  currentUser: User | null;
  students: Array<{
    id: string;
    studentId: string;
    student: {
      id: string;
      name: string;
      email: string;
      role: string;
    } | null;
    createdAt: string;
  }>;
  isLoadingStudents?: boolean;
  exceptions?: ClassException[];
}

export function AttendanceModal({
  isOpen,
  onClose,
  selectedClass,
  selectedDate,
  attendances,
  onSelectDate,
  onAttendanceChange,
  onSave,
  isPending,
  currentUser,
  students,
  isLoadingStudents = false,
  exceptions = [],
}: AttendanceModalProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

  // Calcular a última data válida para inicializar o mês do calendário
  // Busca apenas no último mês para otimização
  const lastValidDateInfo = useMemo(() => {
    const today = normalizeDate(new Date());
    const classStartDate = selectedClass.startDate ? normalizeDate(new Date(selectedClass.startDate)) : today;
    
    // Buscar apenas no último mês (ou até o startDate, o que for menor)
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const searchStart = lastMonth < classStartDate ? classStartDate : lastMonth;
    
    const dates = getPastClassDatesForRange(selectedClass, exceptions, searchStart, today);
    
    // Se não encontrou no último mês, buscar no histórico completo
    if (dates.length === 0 && searchStart > classStartDate) {
      const allDates = getPastClassDatesForRange(selectedClass, exceptions, classStartDate, searchStart);
      return allDates[0] || null;
    }
    
    return dates[0] || null;
  }, [selectedClass, exceptions]);

  // Inicializar currentMonth com o mês da última data válida, ou mês atual se não houver
  const [currentMonth, setCurrentMonth] = useState(() => {
    return lastValidDateInfo ? new Date(lastValidDateInfo.date) : new Date();
  });

  // Calcular range do calendário (mês atual + dias adjacentes visíveis na grade)
  const calendarRange = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startingDayOfWeek = new Date(year, month, 1).getDay();
    
    // Data inicial: primeiro dia visível no calendário (pode ser do mês anterior)
    const rangeStart = new Date(year, month, 1);
    rangeStart.setDate(rangeStart.getDate() - startingDayOfWeek);
    
    // Data final: último dia visível no calendário (último dia do mês atual)
    // Limitar a hoje para não incluir datas futuras
    const today = normalizeDate(new Date());
    const monthEnd = new Date(year, month + 1, 0);
    const rangeEnd = monthEnd > today ? today : monthEnd;
    
    return { rangeStart, rangeEnd };
  }, [currentMonth]);

  // Atualizar currentMonth quando lastValidDateInfo mudar
  useEffect(() => {
    if (lastValidDateInfo) {
      setCurrentMonth(new Date(lastValidDateInfo.date));
    }
  }, [lastValidDateInfo]);

  // Criar map de datas válidas calculadas apenas para o range visível no calendário
  const validDatesMap = useMemo(() => {
    const validDates = getPastClassDatesForRange(selectedClass, exceptions, calendarRange.rangeStart, calendarRange.rangeEnd);
    
    return new Map(
      validDates.map((d) => [dateToISOString(d.date), d])
    );
  }, [calendarRange, selectedClass, exceptions]);

  // Filtrar alunos que estavam matriculados na data selecionada
  // Alunos veem apenas suas próprias presenças
  const enrolledStudents = useMemo(() => {
    if (!selectedDate || !validDatesMap.has(selectedDate)) return [];
    let filtered = students.filter((enrollment) => wasEnrolledOnDate(enrollment.createdAt, selectedDate));
    
    // Se for aluno, mostrar apenas sua própria presença
    if (currentUser && isStudent(currentUser)) {
      filtered = filtered.filter((enrollment) => String(enrollment.studentId) === String(currentUser.id));
    }
    
    return filtered;
  }, [students, selectedDate, validDatesMap, currentUser]);

  // Resetar modo de edição quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  // Selecionar automaticamente a última data válida quando o modal abrir
  useEffect(() => {
    if (!isOpen) return;
    
    // selecionar a última data para todos
    if (lastValidDateInfo && !selectedDate) {
      onSelectDate(lastValidDateInfo.date);
    }
  }, [isOpen, lastValidDateInfo, selectedDate, onSelectDate]);

  // Memorizar hoje uma vez para evitar recálculos
  const today = useMemo(() => normalizeDate(new Date()), []);
  
  // Calcular período válido da turma para limitar navegação
  const classPeriod = useMemo(() => {
    const startDate = selectedClass.startDate ? normalizeDate(new Date(selectedClass.startDate)) : null;
    return { startDate, today };
  }, [selectedClass.startDate, today]);

  // Verificar se pode navegar para o mês anterior
  const canNavigatePrev = useMemo(() => {
    if (!classPeriod.startDate) return true;
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const prevMonthLastDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
    return normalizeDate(prevMonthLastDay) >= classPeriod.startDate;
  }, [currentMonth, classPeriod]);

  // Verificar se pode navegar para o próximo mês
  const canNavigateNext = useMemo(() => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return normalizeDate(nextMonth) < classPeriod.today;
  }, [currentMonth, classPeriod]);

  // Calcular posição do calendário no momento do clique (antes de abrir)
  const handleToggleCalendar = () => {
    if (!isPending && !isEditMode && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCalendarPosition({
        top: rect.bottom + window.scrollY + CALENDAR_OFFSET,
        left: rect.left + window.scrollX,
      });
      setIsCalendarOpen(!isCalendarOpen);
    }
  };

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Gerar dias do mês
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = new Date(year, month, 1).getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Helper para criar objeto de dia
    const createDay = (date: Date, isCurrentMonth: boolean) => {
      const dateStr = dateToISOString(date);
      const dateInfo = validDatesMap.get(dateStr);
      return {
        date,
        isCurrentMonth,
        isValid: !!dateInfo,
        schedule: dateInfo?.schedule,
      };
    };

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isValid: boolean;
      schedule?: { startTime: string; endTime: string };
    }> = [];

    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(createDay(date, false));
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(createDay(date, true));
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = TOTAL_CALENDAR_DAYS - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(createDay(date, false));
    }

    return days;
  }, [currentMonth, validDatesMap]);

  const handleDateClick = (date: Date, isValid: boolean) => {
    if (!isValid || isEditMode) return;
    
    const dateInfo = validDatesMap.get(dateToISOString(date));
    if (dateInfo) {
      onSelectDate(dateInfo.date);
      setIsCalendarOpen(false);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev" && !canNavigatePrev) return;
    if (direction === "next" && !canNavigateNext) return;

    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  if (!isOpen) return null;

  const canEdit = canManageAttendance(currentUser);
  // Alunos não podem editar presenças, apenas visualizar
  const canEditForCurrentUser = canEdit && !isStudent(currentUser);
  const isEditMode = canEditForCurrentUser && isEditing;
  const hasSelectedDate = !!selectedDate;
  const selectedDateObj = selectedDate ? validDatesMap.get(selectedDate) : null;
  const hasStudents = enrolledStudents.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-[110] animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg md:rounded-xl shadow-2xl p-4 md:p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 relative z-[111]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <FiUsers className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                {isEditMode ? 'Gerenciar Presenças' : 'Visualizar Presenças'}
              </h3>
            </div>
            <p className="text-gray-600 text-xs md:text-sm mt-0.5 ml-7">{selectedClass.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all flex-shrink-0"
            disabled={isPending}
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Seleção de Data */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FiCalendar className="w-4 h-4 text-amber-600" />
              Selecione uma data <span className="text-red-500">*</span>
            </label>

            {!lastValidDateInfo ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-sm text-gray-600">Não há datas passadas disponíveis para esta turma</p>
              </div>
            ) : (
              <div className="relative">
                {/* Input que abre o calendário */}
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={handleToggleCalendar}
                  disabled={isPending || isEditMode}
                  className="w-full md:w-auto md:max-w-md px-4 py-2.5 md:px-5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between gap-3"
                >
                  <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
                    {selectedDate && selectedDateObj
                      ? `${formatDate(selectedDateObj.date)}${selectedDateObj.schedule ? ` - ${selectedDateObj.schedule.startTime} às ${selectedDateObj.schedule.endTime}` : ""}`
                      : "Selecione uma data"}
                  </span>
                  <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>

                {/* Calendário dropdown */}
                {isCalendarOpen &&
                  createPortal(
                    <div
                      ref={calendarRef}
                      className="fixed z-[120] bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-full max-w-[320px]"
                      style={{
                        top: `${calendarPosition.top}px`,
                        left: `${calendarPosition.left}px`,
                      }}
                    >
                      {/* Cabeçalho do calendário */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() => navigateMonth("prev")}
                          disabled={!canNavigatePrev}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <FiChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h4>
                        <button
                          type="button"
                          onClick={() => navigateMonth("next")}
                          disabled={!canNavigateNext}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <FiChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Dias da semana */}
                      <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                        {DAY_NAMES.map((day, index) => (
                          <div
                            key={index}
                            className="text-center text-[10px] font-semibold text-gray-600 py-1"
                          >
                            {day.substring(0, 3)}
                          </div>
                        ))}
                      </div>

                      {/* Dias do calendário */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {calendarDays.map((day, index) => {
                          const dateStr = dateToISOString(day.date);
                          const isSelected = selectedDate === dateStr;
                          const isToday = normalizeDate(day.date).getTime() === today.getTime();

                          return (
                            <button
                              key={index}
                              type="button"
                            onClick={() => handleDateClick(day.date, day.isValid)}
                            disabled={!day.isValid || isPending || isEditMode}
                            className={`
                              aspect-square flex flex-col items-center justify-center rounded transition-all text-[11px] min-h-[36px]
                              ${!day.isCurrentMonth
                                ? "text-gray-300"
                                : !day.isValid
                                ? "text-gray-400 bg-gray-50 cursor-not-allowed hover:bg-gray-50"
                                : isSelected
                                ? "bg-amber-500 text-white font-semibold shadow-md ring-2 ring-amber-300"
                                : isToday
                                ? "bg-blue-50 text-blue-700 font-semibold border-2 border-blue-400 shadow-sm"
                                : "text-gray-900 bg-amber-50/50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 hover:shadow-sm font-medium"
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                              title={
                                day.isValid && day.schedule
                                  ? `${formatDate(day.date)} - ${day.schedule.startTime} às ${day.schedule.endTime}`
                                  : day.isValid
                                  ? formatDate(day.date)
                                  : "Data inválida"
                              }
                            >
                              <span className="leading-none">{day.date.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
            )}
          </div>

          {/* Tabela de Alunos */}
          {hasSelectedDate && (
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <FiUser className="w-4 h-4 text-amber-600" />
                Alunos ({enrolledStudents.length})
              </label>

              {isLoadingStudents ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Carregando alunos...</p>
                </div>
              ) : !hasStudents ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                  <FiUsers className="mx-auto text-gray-300 mb-2 w-8 h-8" />
                  <p className="text-sm text-gray-600">
                    {selectedDate && selectedDateObj
                      ? `Nenhum aluno estava matriculado no dia ${formatDate(selectedDateObj.date)}`
                      : "Não há alunos matriculados nesta turma"}
                  </p>
                </div>
              ) : (
                <>
                  {attendances.size === 0 && !isEditMode && selectedDate ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <FiCalendar className="mx-auto text-gray-400 mb-3 w-10 h-10" />
                      <p className="text-sm font-medium text-gray-900 mb-1">Nenhuma presença registrada</p>
                      <p className="text-xs text-gray-600">Não há presenças registradas para esta data. Clique em "Editar" para registrar as presenças.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrolledStudents.map((enrollment) => {
                        const studentId = enrollment.studentId;
                        const currentStatus = attendances.get(studentId) || (isEditMode ? 'ABSENT' : null);
                        const studentName = enrollment.student?.name || 'Aluno';
                        const studentEmail = enrollment.student?.email || '';

                        return (
                          <div
                            key={enrollment.id}
                            className={`bg-white border rounded-lg transition-all ${
                              currentStatus === 'PRESENT'
                                ? 'border-green-200 bg-green-50/30'
                                : currentStatus === 'ABSENT'
                                ? 'border-red-200 bg-red-50/30'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${isEditMode ? 'hover:shadow-md' : 'hover:shadow-sm'}`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 md:p-4">
                              {/* Informações do Aluno */}
                              <div className="flex-1 min-w-0">
                                <p className="text-base md:text-sm font-semibold text-gray-900">{studentName}</p>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{studentEmail}</p>
                              </div>

                              {/* Botões de Presença/Ausência */}
                              <div className="flex gap-2 md:flex-shrink-0">
                                <label
                                  className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border-2 cursor-pointer transition-all font-medium ${
                                    isEditMode
                                      ? currentStatus === 'PRESENT'
                                        ? 'border-green-600 bg-green-600 text-white shadow-sm hover:bg-green-700 hover:border-green-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-green-50 hover:border-green-400'
                                      : currentStatus === 'PRESENT'
                                      ? 'border-green-600 bg-green-600 text-white'
                                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                  } ${!isEditMode ? 'opacity-75' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={`attendance-${studentId}`}
                                    checked={currentStatus === 'PRESENT'}
                                    onChange={() => isEditMode && onAttendanceChange(studentId, 'PRESENT')}
                                    disabled={!isEditMode || isPending}
                                    className="sr-only"
                                  />
                                  <FiCheckCircle className="w-4 h-4" />
                                  <span className="text-xs md:text-xs">Presente</span>
                                </label>
                                <label
                                  className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border-2 cursor-pointer transition-all font-medium ${
                                    isEditMode
                                      ? currentStatus === 'ABSENT'
                                        ? 'border-red-600 bg-red-600 text-white shadow-sm hover:bg-red-700 hover:border-red-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:border-red-400'
                                      : currentStatus === 'ABSENT'
                                      ? 'border-red-600 bg-red-600 text-white'
                                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                  } ${!isEditMode ? 'opacity-75' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={`attendance-${studentId}`}
                                    checked={currentStatus === 'ABSENT'}
                                    onChange={() => isEditMode && onAttendanceChange(studentId, 'ABSENT')}
                                    disabled={!isEditMode || isPending}
                                    className="sr-only"
                                  />
                                  <FiX className="w-4 h-4" />
                                  <span className="text-xs md:text-xs">Ausente</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Botões de ação */}
          {isEditMode && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await onSave();
                  setIsEditing(false);
                }}
                disabled={isPending || !hasSelectedDate || !hasStudents}
                className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span>Salvar</span>
                  </>
                )}
              </button>
            </div>
          )}
          {canEditForCurrentUser && !isEditing && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Fechar
              </button>
              <button
                onClick={() => setIsEditing(true)}
                disabled={isPending || !hasSelectedDate || !hasStudents}
                className="px-4 py-2.5 text-sm font-medium text-white bg-amber-900 rounded-lg hover:bg-amber-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Editar
              </button>
            </div>
          )}
          {!canEditForCurrentUser && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

