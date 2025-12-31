import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { FiPlus, FiSearch, FiX, FiBook, FiUsers, FiCheckCircle, FiXCircle, FiCalendar } from "react-icons/fi";
import { useClasses, useAddStudentToClass, useRemoveStudentFromClass, useDeleteClass, useClassById } from "../hooks/useClasses";
import { useClassExceptions, useDeleteClassException, useCreateClassException } from "../hooks/useClassException";
import { useAttendances, useCreateBulkAttendance } from "../hooks/useAttendance";
import { ClassService } from "../services/classService";
import { toast, getErrorMessage } from "../utils/toast";
import { useAuth } from "../hooks/useAuth";
import { Class, ScheduleTime } from "../types";
import { DAY_NAMES } from "../utils/constants";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/userService";
import { useUserCounts } from "../hooks/useUser";
import { ClassModal } from "../components/calendar-modals";
import { ConfirmModal } from "../components/confirm-modal";
import { ClassCard } from "../components/class-card";
import { CreateExceptionModal } from "../components/create-exception-modal";
import { AttendanceModal } from "../components/attendance-modal";
import { normalizeDate, formatDate, getDateBadgeInfo, wasEnrolledOnDate, dateToISOString } from "../utils/dateUtils";
import { canManageAttendance, canManageEventsAndClasses, canViewClasses, isTeacher, isStudent } from "../utils/permissions";

const DEBOUNCE_DELAY = 300; // ms
const MAX_UPCOMING_CLASS_DATES = 20; // Limite de próximas aulas a exibir
const MAX_SEARCH_MONTHS = 6; // Meses no futuro para buscar aulas
const MS_PER_DAY = 1000 * 60 * 60 * 24; // Milissegundos em um dia
const DAYS_PER_MONTH = 30; // Dias aproximados por mês para cálculos

export function Classes() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isManageStudentsModalOpen, setIsManageStudentsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExceptionsModalOpen, setIsExceptionsModalOpen] = useState(false);
  const [isCreateExceptionModalOpen, setIsCreateExceptionModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>("");
  const [exceptionsFilter, setExceptionsFilter] = useState<string>("future"); // "all", "future", "past"
  const [selectedClassDate, setSelectedClassDate] = useState<string | null>(null);
  const [newExceptionReason, setNewExceptionReason] = useState<string>("");
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string | null>(null);
  const [attendancesMap, setAttendancesMap] = useState<Map<string, 'PRESENT' | 'ABSENT'>>(new Map());
  const lastProcessedDateRef = useRef<string | null>(null);

  const { classes, isLoading, refetch } = useClasses();
  const { counts: userCounts } = useUserCounts();
  const addStudentMutation = useAddStudentToClass();
  const removeStudentMutation = useRemoveStudentFromClass();
  const deleteClassMutation = useDeleteClass();
  const deleteExceptionMutation = useDeleteClassException();
  const createExceptionMutation = useCreateClassException();
  const createBulkAttendanceMutation = useCreateBulkAttendance();

  // Buscar exceções da turma selecionada (quando modal de exceções ou presença está aberto)
  const selectedClassId = (isExceptionsModalOpen || isAttendanceModalOpen) && selectedClass ? String(selectedClass.id) : null;
  const { exceptions, isLoading: isLoadingExceptions, refetch: refetchExceptions } = useClassExceptions(selectedClassId);

  // Buscar professores
  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await UserService.getTeachers();
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });

  // Debounce para busca de alunos
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(studentSearchTerm);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [studentSearchTerm]);

  // Verificar permissão para gerenciar
  const canManage = currentUser ? canManageEventsAndClasses(currentUser) : false;
  
  // Buscar alunos disponíveis (não matriculados na turma)
  const { data: availableStudentsData, isLoading: isLoadingStudents, refetch: refetchAvailableStudents } = useQuery({
    queryKey: ["availableStudents", selectedClass?.id, debouncedSearchTerm],
    queryFn: async () => {
      const response = await ClassService.getAvailableStudents(String(selectedClass!.id), {
        search: debouncedSearchTerm || undefined,
        page: 1,
        limit: 10,
      });
      return response.success ? response.data : { data: [], page: 1, limit: 20, total: 0, totalPages: 0 };
    },
    enabled: isManageStudentsModalOpen && !!selectedClass && canManage,
  });

  // Buscar dados da turma selecionada
  const { class: selectedClassDetails, refetch: refetchClassDetails } = useClassById(
    (isManageStudentsModalOpen || isAttendanceModalOpen) && selectedClass ? String(selectedClass.id) : null
  );

  // Verificar permissão
  useEffect(() => {
    if (currentUser && !canViewClasses(currentUser)) {
      window.location.href = "/";
    }
  }, [currentUser]);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const modals = [
      { isOpen: isManageStudentsModalOpen, close: () => setIsManageStudentsModalOpen(false) },
      { isOpen: isExceptionsModalOpen, close: () => setIsExceptionsModalOpen(false) },
      { isOpen: isCreateExceptionModalOpen, close: () => setIsCreateExceptionModalOpen(false) },
      { isOpen: isAttendanceModalOpen, close: () => setIsAttendanceModalOpen(false) },
    ];

    const hasOpenModal = modals.some(m => m.isOpen);
    if (!hasOpenModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const openModal = modals.find(m => m.isOpen);
        openModal?.close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isManageStudentsModalOpen, isExceptionsModalOpen, isCreateExceptionModalOpen, isAttendanceModalOpen]);

  // Função helper para formatar dias e horários
  const formatSchedule = useCallback((classItem: Class): string[] | null => {
    if (!classItem.recurringDays || classItem.recurringDays.length === 0) return null;

    // Agrupar dias por horário
    const scheduleGroups = new Map<string, number[]>();
    
    classItem.recurringDays.forEach((day) => {
      const schedule = classItem.scheduleTimes?.[day.toString()];
      const timeKey = schedule 
        ? `${schedule.startTime}-${schedule.endTime}`
        : 'sem-horario';
      
      if (!scheduleGroups.has(timeKey)) {
        scheduleGroups.set(timeKey, []);
      }
      scheduleGroups.get(timeKey)!.push(day);
    });

    // Formatar cada grupo
    const formattedGroups: string[] = [];
    scheduleGroups.forEach((days, timeKey) => {
      const dayNames = days.map(day => DAY_NAMES[day].substring(0, 3)).join(', ');
      if (timeKey !== 'sem-horario') {
        const [startTime, endTime] = timeKey.split('-');
        formattedGroups.push(`${dayNames} (${startTime} - ${endTime})`);
      } else {
        formattedGroups.push(dayNames);
      }
    });

    return formattedGroups;
  }, []);

  // Filtrar turmas (busca e status)
  const filteredClasses = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return classes.filter((cls) => {
      // Filtro de busca
      if (searchTerm) {
        const matchesSearch = 
          cls.name?.toLowerCase().includes(searchLower) ||
          cls.description?.toLowerCase().includes(searchLower) ||
          cls.style?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (statusFilter === "active") return cls.active !== false;
      if (statusFilter === "inactive") return cls.active === false;
      
      return true;
    });
  }, [classes, searchTerm, statusFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = classes.length;
    let active = 0;
    let inactive = 0;

    classes.forEach((cls) => {
      if (cls.active === false) {
        inactive++;
      } else {
        active++;
      }
    });

    const totalStudents = userCounts?.students || 0;

    return { total, active, inactive, totalStudents };
  }, [classes, userCounts]);

  const handleOpenCreateModal = () => {
    setSelectedClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsClassModalOpen(true);
  };

  const handleOpenManageStudentsModal = async (classItem: Class) => {
    setSelectedClass(classItem);
    setIsManageStudentsModalOpen(true);
  };

  const handleOpenExceptionsModal = (classItem: Class) => {
    setSelectedClass(classItem);
    // Professores e alunos veem apenas cancelamentos futuros
    if (currentUser && (isTeacher(currentUser) || isStudent(currentUser))) {
      setExceptionsFilter("future");
    }
    setIsExceptionsModalOpen(true);
  };

  const handleOpenCreateExceptionModal = () => {
    setSelectedClassDate(null);
    setNewExceptionReason("");
    setIsCreateExceptionModalOpen(true);
  };

  const handleOpenAttendanceModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setSelectedAttendanceDate(null);
    setAttendancesMap(new Map());
    setIsAttendanceModalOpen(true);
  };

  const handleSelectAttendanceDate = (date: Date) => {
    const dateStr = dateToISOString(date);
    setSelectedAttendanceDate(dateStr);
  };

  const handleAttendanceChange = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    const newMap = new Map(attendancesMap);
    newMap.set(studentId, status);
    setAttendancesMap(newMap);
  };

  const handleSaveAttendances = async () => {
    if (!selectedClass || !selectedAttendanceDate) {
      return;
    }

    try {
      // Criar mapa com todas as presenças incluindo ausências padrão
      const allAttendances = new Map<string, 'PRESENT' | 'ABSENT'>(attendancesMap);
      
      // Adicionar ausências padrão para alunos que estavam matriculados e não têm presença registrada
      selectedClassDetails?.students?.forEach((enrollment) => {
        if (!allAttendances.has(enrollment.studentId) && 
            wasEnrolledOnDate(enrollment.createdAt, selectedAttendanceDate)) {
          allAttendances.set(enrollment.studentId, 'ABSENT');
        }
      });

      // Só salvar se houver pelo menos uma presença/ausência
      if (allAttendances.size === 0) {
        return;
      }

      const attendances = Array.from(allAttendances.entries()).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await createBulkAttendanceMutation.mutateAsync({
        classId: String(selectedClass.id),
        date: selectedAttendanceDate,
        attendances,
      });

      toast.success("Presenças registradas com sucesso!");
      // Não fechar o modal manter aberto para visualização
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao registrar presenças"));
    }
  };

  const handleSelectClassDate = useCallback((date: Date) => {
    const dateStr = dateToISOString(date);
    setSelectedClassDate(dateStr);
  }, []);

  const handleCreateException = useCallback(async () => {
    if (!selectedClass || !selectedClassDate) return;

    try {
      await createExceptionMutation.mutateAsync({
        classId: String(selectedClass.id),
        date: selectedClassDate,
        reason: newExceptionReason || undefined,
      });
      toast.success("Cancelamento criado com sucesso!");
      setIsCreateExceptionModalOpen(false);
      setSelectedClassDate(null);
      setNewExceptionReason("");
      await refetchExceptions();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao criar cancelamento"));
    }
  }, [selectedClass, selectedClassDate, newExceptionReason, createExceptionMutation, refetchExceptions]);

  const handleOpenDeleteModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      await deleteClassMutation.mutateAsync(String(selectedClass.id));
      toast.success("Turma excluída com sucesso!");
      setIsDeleteModalOpen(false);
      setSelectedClass(null);
      refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao excluir turma"));
    }
  };

  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
    setSelectedClass(null);
    refetch();
  };

  const handleAddStudent = async (studentId: string) => {
    if (!selectedClass) return;

    try {
      await addStudentMutation.mutateAsync({
        classId: String(selectedClass.id),
        studentId: String(studentId),
      });
      toast.success("Aluno adicionado com sucesso!");
      await refetchClassDetails();
      await refetchAvailableStudents();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao adicionar aluno"));
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClass) return;

    try {
      await removeStudentMutation.mutateAsync({
        classId: String(selectedClass.id),
        studentId: String(studentId),
      });
      toast.success("Aluno removido com sucesso!");
      await refetchClassDetails();
      await refetchAvailableStudents();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao remover aluno"));
    }
  };

  const handleRemoveException = async (exceptionId: string) => {
    if (!selectedClass) return;

    try {
      await deleteExceptionMutation.mutateAsync({
        id: exceptionId,
        classId: String(selectedClass.id),
      });
      toast.success("Dia reativado com sucesso!");
      await refetchExceptions();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao reativar dia"));
    }
  };

  // Memorizar hoje uma vez para evitar recálculos
  const today = useMemo(() => normalizeDate(new Date()), []);

  // Separar exceções futuras e passadas
  const futureExceptions = useMemo(() => {
    return exceptions.filter((ex) => {
      const exceptionDate = normalizeDate(ex.date);
      return exceptionDate >= today;
    });
  }, [exceptions, today]);

  const pastExceptions = useMemo(() => {
    return exceptions.filter((ex) => {
      const exceptionDate = normalizeDate(ex.date);
      return exceptionDate < today;
    });
  }, [exceptions, today]);

  // Filtrar exceções baseado no filtro selecionado
  // Professores e alunos veem apenas cancelamentos futuros
  const filteredExceptions = useMemo(() => {
    const isRestrictedUser = currentUser && (isTeacher(currentUser) || isStudent(currentUser));
    if (isRestrictedUser) return futureExceptions;
    
    // Admin/Secretary podem escolher o filtro
    const filterMap: Record<string, typeof exceptions> = {
      future: futureExceptions,
      past: pastExceptions,
      all: exceptions,
    };
    
    return filterMap[exceptionsFilter] || futureExceptions;
  }, [futureExceptions, pastExceptions, exceptions, exceptionsFilter, currentUser]);


  // Buscar presenças existentes quando selecionar uma data
  const selectedClassIdForAttendance = isAttendanceModalOpen && selectedClass ? String(selectedClass.id) : null;
  const { attendances: existingAttendances, isLoading: isLoadingAttendances, refetch: refetchAttendances } = useAttendances(
    selectedClassIdForAttendance && selectedAttendanceDate
      ? {
          classId: selectedClassIdForAttendance,
          startDate: selectedAttendanceDate,
          endDate: selectedAttendanceDate,
        }
      : undefined
  );

  const handleCancelAttendanceEdit = useCallback(async () => {
    // Resetar o ref para forçar reprocessamento
    lastProcessedDateRef.current = null;
    
    // Aguardar o refetch completar
    const result = await refetchAttendances();
    
    if (selectedAttendanceDate && result?.data?.success && Array.isArray(result.data.data)) {
      const newMap = new Map<string, 'PRESENT' | 'ABSENT'>();
      result.data.data.forEach((att) => {
        const attDateStr = dateToISOString(att.date);
        if (attDateStr === selectedAttendanceDate) {
          newMap.set(att.studentId, att.status);
        }
      });
      setAttendancesMap(newMap);
      lastProcessedDateRef.current = selectedAttendanceDate;
    } else if (selectedAttendanceDate) {
      // Se não houver dados, limpar o Map
      setAttendancesMap(new Map());
      lastProcessedDateRef.current = selectedAttendanceDate;
    }
  }, [refetchAttendances, selectedAttendanceDate]);


  // Carregar presenças existentes no mapa quando mudar a data ou quando carregar
  useEffect(() => {
    if (!selectedAttendanceDate) {
      setAttendancesMap(new Map());
      lastProcessedDateRef.current = null;
      return;
    }
    
    if (isLoadingAttendances) return;
    if (lastProcessedDateRef.current === selectedAttendanceDate && lastProcessedDateRef.current !== null) return;
    
    // Criar novo mapa apenas com presenças da data selecionada
    const newMap = new Map<string, 'PRESENT' | 'ABSENT'>();
    if (existingAttendances && Array.isArray(existingAttendances)) {
      existingAttendances.forEach((att) => {
        const attDateStr = dateToISOString(att.date);
        if (attDateStr === selectedAttendanceDate) {
          newMap.set(att.studentId, att.status);
        }
      });
    }
    
    setAttendancesMap(newMap);
    lastProcessedDateRef.current = selectedAttendanceDate;
  }, [selectedAttendanceDate, existingAttendances, isLoadingAttendances]);

  // Calcular próximas aulas programadas
  const upcomingClassDates = useMemo(() => {
    if (!selectedClass || !selectedClass.recurringDays || selectedClass.recurringDays.length === 0) {
      return [];
    }

    const startDate = selectedClass.startDate ? normalizeDate(selectedClass.startDate) : today;
    const endDate = selectedClass.endDate ? normalizeDate(selectedClass.endDate) : null;
    
    // Criar set de datas já canceladas
    const cancelledDates = new Set(
      exceptions.map((ex) => dateToISOString(ex.date))
    );

    const upcomingDates: Array<{ date: Date; dayOfWeek: number; schedule?: ScheduleTime; badgeInfo: ReturnType<typeof getDateBadgeInfo> }> = [];
    const initialDate = startDate > today ? startDate : today;
    const maxDate = new Date(today.getTime() + MAX_SEARCH_MONTHS * DAYS_PER_MONTH * MS_PER_DAY);
    
    // Buscar próximas aulas até atingir o limite
    for (let dayOffset = 0; upcomingDates.length < MAX_UPCOMING_CLASS_DATES; dayOffset++) {
      const currentDate = new Date(initialDate);
      currentDate.setDate(initialDate.getDate() + dayOffset);
      
      // Limitar busca até MAX_SEARCH_MONTHS meses no futuro
      if (currentDate > maxDate) {
        break;
      }

      // Verificar se passou da endDate
      if (endDate && currentDate > endDate) {
        break;
      }

      const dayOfWeek = currentDate.getDay();
      
      // Verificar se este dia da semana tem aula
      if (selectedClass.recurringDays.includes(dayOfWeek)) {
        const dateStr = dateToISOString(currentDate);
        
        // Verificar se não está cancelada
        if (!cancelledDates.has(dateStr)) {
          const schedule = selectedClass.scheduleTimes?.[dayOfWeek.toString()] as ScheduleTime | undefined;
          const badgeInfo = getDateBadgeInfo(new Date(currentDate), today);
          upcomingDates.push({
            date: new Date(currentDate),
            dayOfWeek,
            schedule,
            badgeInfo,
          });
        }
      }
    }

    return upcomingDates;
  }, [selectedClass, exceptions, today]);

  // Alunos disponíveis
  const availableStudents = availableStudentsData?.data || [];

  if (!currentUser || !canViewClasses(currentUser)) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-8">
      {/* Header */}
      <div className="mb-4 md:mb-8 flex items-center justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-4xl font-bold text-amber-900 mb-1 md:mb-2">
            {canManage ? "Gerenciar Turmas" : "Minhas Turmas"}
          </h1>
          <p className="text-gray-600 text-xs md:text-base hidden md:block">
            {canManage 
              ? "Gerencie as turmas do sistema" 
              : currentUser && isTeacher(currentUser)
              ? "Visualize e gerencie suas turmas"
              : "Visualize suas turmas e presenças"}
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 md:gap-2 bg-amber-900 text-white px-3 py-2 md:px-5 md:py-3 rounded-lg hover:bg-amber-800 transition-all font-medium text-sm md:text-base shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl flex-shrink-0"
          >
            <FiPlus size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Nova Turma</span>
            <span className="sm:hidden">Nova</span>
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className={`grid grid-cols-2 ${canManage ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-2 md:gap-4 mb-4 md:mb-8`}>
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Total</p>
              <p className="text-lg md:text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-amber-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
              <FiBook className="text-amber-900 w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Ativas</p>
              <p className="text-lg md:text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-green-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
              <FiCheckCircle className="text-green-600 w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Inativas</p>
              <p className="text-lg md:text-3xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="bg-red-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
              <FiXCircle className="text-red-600 w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
        {canManage && (
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Alunos</p>
                <p className="text-lg md:text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <div className="bg-blue-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
                <FiUsers className="text-blue-600 w-4 h-4 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-4 md:mb-6 bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-5 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou estilo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-12 pr-9 md:pr-12 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white font-medium text-sm w-full md:w-auto md:min-w-[180px]"
          >
            <option value="">Todas as turmas</option>
            <option value="active">Apenas ativas</option>
            <option value="inactive">Apenas inativas</option>
          </select>
        </div>
      </div>

      {/* Lista de turmas */}
      {isLoading ? (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-8 md:p-16 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-amber-900 mx-auto mb-3 md:mb-4"></div>
          <p className="text-gray-600 font-medium text-sm md:text-base">Carregando turmas...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-8 md:p-16 text-center border border-gray-100">
          <FiBook className="mx-auto text-gray-300 mb-3 md:mb-4 w-10 h-10 md:w-12 md:h-12" />
          <p className="text-gray-600 mb-1 md:mb-2 font-medium text-base md:text-lg">Nenhuma turma encontrada</p>
          <p className="text-gray-500 text-xs md:text-sm mb-4 md:mb-6">
            {searchTerm || statusFilter
              ? "Tente ajustar os filtros de busca"
              : canManage
              ? "Comece criando a primeira turma"
              : currentUser && isTeacher(currentUser)
              ? "Você ainda não é professor de nenhuma turma"
              : "Você ainda não está matriculado em nenhuma turma"}
          </p>
          {!searchTerm && !statusFilter && canManage && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 md:gap-2 bg-amber-900 text-white px-4 py-2 md:px-5 md:py-3 rounded-lg hover:bg-amber-800 transition-all font-medium text-sm md:text-base shadow-md hover:shadow-lg"
            >
              <FiPlus size={18} className="md:w-5 md:h-5" />
              Criar Primeira Turma
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop: Cards Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((classItem, index) => {
              const teacher = teachersData?.find((t) => String(t.id) === String(classItem.teacherId));
              return (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  teacher={teacher || null}
                  index={index}
                  formatSchedule={formatSchedule}
                  onEdit={canManage ? handleOpenEditModal : undefined}
                  onDelete={canManage ? handleOpenDeleteModal : undefined}
                  onManageStudents={!isStudent(currentUser) ? handleOpenManageStudentsModal : undefined}
                  onManageExceptions={handleOpenExceptionsModal}
                  onManageAttendance={canManageAttendance(currentUser) || isStudent(currentUser) ? handleOpenAttendanceModal : undefined}
                  isMobile={false}
                />
              );
            })}
          </div>

          {/* Mobile: Cards List */}
          <div className="md:hidden space-y-2.5">
            {filteredClasses.map((classItem, index) => {
              const teacher = teachersData?.find((t) => String(t.id) === String(classItem.teacherId));
              return (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  teacher={teacher || null}
                  index={index}
                  formatSchedule={formatSchedule}
                  onEdit={canManage ? handleOpenEditModal : undefined}
                  onDelete={canManage ? handleOpenDeleteModal : undefined}
                  onManageStudents={!isStudent(currentUser) ? handleOpenManageStudentsModal : undefined}
                  onManageExceptions={handleOpenExceptionsModal}
                  onManageAttendance={canManageAttendance(currentUser) || isStudent(currentUser) ? handleOpenAttendanceModal : undefined}
                  isMobile={true}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Modal de Turma (Criar/Editar/Excluir) */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={handleCloseClassModal}
        classData={selectedClass}
        canManage={true}
        initialEditMode={!!selectedClass} // Se tem turma selecionada, abre em modo de edição
      />

      {/* Modal Gerenciar Alunos */}
      {isManageStudentsModalOpen && selectedClass && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-[100] animate-in fade-in"
          onClick={() => setIsManageStudentsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg md:rounded-xl shadow-2xl p-4 md:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg md:text-2xl font-bold text-amber-900">
                  {canManage ? "Gerenciar Alunos" : "Alunos"}
                </h2>
                <p className="text-gray-600 text-xs md:text-sm mt-0.5">{selectedClass.name}</p>
              </div>
              <button
                onClick={() => setIsManageStudentsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all flex-shrink-0"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Alunos Matriculados */}
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">
                  Alunos Matriculados ({selectedClassDetails?.students?.length || 0})
                </h3>
                {selectedClassDetails?.students && selectedClassDetails.students.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedClassDetails.students.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {enrollment.student?.name || "Aluno"}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{enrollment.student?.email}</p>
                        </div>
                        {canManage && (
                          <button
                            onClick={() => handleRemoveStudent(String(enrollment.studentId))}
                            disabled={removeStudentMutation.isPending}
                            className="ml-3 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    Nenhum aluno matriculado
                  </p>
                )}
              </div>

              {/* Adicionar Alunos - apenas para admin/secretary */}
              {canManage && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">Adicionar Alunos</h3>
                  <div className="relative mb-3">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar alunos..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                    />
                  </div>
                  {isLoadingStudents ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Carregando alunos...</p>
                    </div>
                  ) : availableStudents.length === 0 ? (
                    <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                      {studentSearchTerm
                        ? "Nenhum aluno encontrado"
                        : "Todos os alunos já estão matriculados"}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                            <p className="text-xs text-gray-600 truncate">{student.email}</p>
                          </div>
                          <button
                            onClick={() => handleAddStudent(String(student.id))}
                            disabled={addStudentMutation.isPending}
                            className="ml-3 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Adicionar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelamentos */}
      {isExceptionsModalOpen && selectedClass && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-[100] animate-in fade-in"
          onClick={() => setIsExceptionsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg md:rounded-xl shadow-2xl p-4 md:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg md:text-2xl font-bold text-amber-900">Cancelamentos</h2>
                <p className="text-gray-600 text-xs md:text-sm mt-0.5">{selectedClass.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    onClick={handleOpenCreateExceptionModal}
                    className="flex items-center gap-1.5 md:gap-2 bg-amber-900 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-amber-800 transition-all font-medium text-xs md:text-sm shadow-md hover:shadow-lg flex-shrink-0"
                  >
                    <FiPlus size={16} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </button>
                )}
                <button
                  onClick={() => setIsExceptionsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all flex-shrink-0"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {isLoadingExceptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900 mx-auto mb-3"></div>
                <p className="text-gray-600 font-medium text-sm">Carregando cancelamentos...</p>
              </div>
            ) : exceptions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                <FiCalendar className="mx-auto text-gray-300 mb-3 w-10 h-10" />
                <p className="text-gray-600 mb-2 font-medium">Nenhum cancelamento encontrado</p>
                <p className="text-gray-500 text-sm">
                  Não há datas canceladas para esta turma
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Filtro Radio Buttons - apenas para admin/secretary */}
                {canManage && (
                  <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exceptionsFilter"
                        value="future"
                        checked={exceptionsFilter === "future"}
                        onChange={(e) => setExceptionsFilter(e.target.value)}
                        className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Datas futuras
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exceptionsFilter"
                        value="all"
                        checked={exceptionsFilter === "all"}
                        onChange={(e) => setExceptionsFilter(e.target.value)}
                        className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Todas
                      </span>
                    </label>
                  </div>
                )}

                {filteredExceptions.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                    <FiCalendar className="mx-auto text-gray-300 mb-3 w-10 h-10" />
                    <p className="text-gray-600 mb-2 font-medium">Nenhum cancelamento encontrado</p>
                    <p className="text-gray-500 text-sm">
                      Não há cancelamentos {exceptionsFilter === "future" ? "futuros" : exceptionsFilter === "past" ? "passados" : ""} para esta turma
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredExceptions.map((exception) => {
                      const isFuture = futureExceptions.some((ex) => ex.id === exception.id);
                      return (
                        <div
                          key={exception.id}
                          className={`bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200 ${isFuture ? "flex items-center justify-between" : ""}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-sm md:text-base font-semibold text-gray-900">
                                {formatDate(exception.date)}
                              </p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isFuture
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}>
                                {isFuture ? "Cancelada" : "Passada"}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 italic mt-1">
                              Motivo: {exception.reason || "Não informado"}
                            </p>
                          </div>
                          {isFuture && canManage && (
                            <button
                              onClick={() => handleRemoveException(exception.id)}
                              disabled={deleteExceptionMutation.isPending}
                              className="ml-3 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex-shrink-0"
                            >
                              Reativar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Criar Cancelamento */}
      {isCreateExceptionModalOpen && selectedClass && (
        <CreateExceptionModal
          isOpen={isCreateExceptionModalOpen}
          onClose={() => {
            setIsCreateExceptionModalOpen(false);
            setSelectedClassDate(null);
            setNewExceptionReason("");
          }}
          selectedClass={selectedClass}
          upcomingClassDates={upcomingClassDates}
          selectedClassDate={selectedClassDate}
          newExceptionReason={newExceptionReason}
          onSelectClassDate={handleSelectClassDate}
          onReasonChange={setNewExceptionReason}
          onCreateException={handleCreateException}
          isPending={createExceptionMutation.isPending}
        />
      )}

      {/* Modal de Presenças */}
      {isAttendanceModalOpen && selectedClass && selectedClassDetails && (
        <AttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => {
            setIsAttendanceModalOpen(false);
            setSelectedAttendanceDate(null);
            setAttendancesMap(new Map());
          }}
          selectedClass={selectedClass}
          selectedDate={selectedAttendanceDate}
          attendances={attendancesMap}
          onSelectDate={handleSelectAttendanceDate}
          onAttendanceChange={handleAttendanceChange}
          onSave={handleSaveAttendances}
          isPending={createBulkAttendanceMutation.isPending}
          currentUser={currentUser}
          students={selectedClassDetails.students || []}
          isLoadingStudents={!selectedClassDetails}
          exceptions={exceptions || []}
          onCancelEdit={handleCancelAttendanceEdit}
        />
      )}

      {/* Modal Confirmar Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClass}
        title="Excluir Turma"
        message={`Tem certeza que deseja excluir a turma "${selectedClass?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={deleteClassMutation.isPending}
      />
    </div>
  );
}

