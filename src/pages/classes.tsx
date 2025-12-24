import { useState, useEffect, useMemo, useRef } from "react";
import { FiEdit2, FiPlus, FiSearch, FiX, FiBook, FiUsers, FiCheckCircle, FiXCircle, FiCalendar, FiTrash2 } from "react-icons/fi";
import { useClasses, useAddStudentToClass, useRemoveStudentFromClass, useDeleteClass, useClassById } from "../hooks/useClasses";
import { ClassService } from "../services/classService";
import { toast, getErrorMessage } from "../utils/toast";
import { useAuth } from "../hooks/useAuth";
import { Class } from "../types";
import { DAY_NAMES } from "../utils/constants";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/userService";
import { ClassModal } from "../components/calendar-modals";
import { ConfirmModal } from "../components/confirm-modal";

const DEBOUNCE_DELAY = 300; // ms

export function Classes() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isManageStudentsModalOpen, setIsManageStudentsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const { classes, isLoading, refetch } = useClasses();
  const addStudentMutation = useAddStudentToClass();
  const removeStudentMutation = useRemoveStudentFromClass();
  const deleteClassMutation = useDeleteClass();

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
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
    enabled: isManageStudentsModalOpen && !!selectedClass,
  });

  // Buscar dados da turma selecionada
  const { class: selectedClassDetails, refetch: refetchClassDetails } = useClassById(
    isManageStudentsModalOpen && selectedClass ? String(selectedClass.id) : null
  );

  // Verificar permissão
  useEffect(() => {
    if (currentUser && !["secretary", "admin"].includes(currentUser.role)) {
      window.location.href = "/";
    }
  }, [currentUser]);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isManageStudentsModalOpen) {
          setIsManageStudentsModalOpen(false);
        }
      }
    };

    if (isManageStudentsModalOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isManageStudentsModalOpen]);

  // Função helper para formatar dias e horários
  const formatSchedule = (classItem: Class) => {
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
  };

  // Filtrar turmas
  const filteredClasses = useMemo(() => {
    let filtered = classes;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.name?.toLowerCase().includes(searchLower) ||
          cls.description?.toLowerCase().includes(searchLower) ||
          cls.style?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((cls) => cls.active !== false);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((cls) => cls.active === false);
    }

    return filtered;
  }, [classes, searchTerm, statusFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = classes.length;
    const active = classes.filter((cls) => cls.active !== false).length;
    const inactive = classes.filter((cls) => cls.active === false).length;
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentsCount || 0), 0);

    return { total, active, inactive, totalStudents };
  }, [classes]);

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

  // Alunos disponíveis
  const availableStudents = availableStudentsData?.data || [];

  if (!currentUser || !["secretary", "admin"].includes(currentUser.role)) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-8">
      {/* Header */}
      <div className="mb-4 md:mb-8 flex items-center justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-4xl font-bold text-amber-900 mb-1 md:mb-2">Gerenciar Turmas</h1>
          <p className="text-gray-600 text-xs md:text-base hidden md:block">Gerencie todas as turmas do sistema</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 md:gap-2 bg-amber-900 text-white px-3 py-2 md:px-5 md:py-3 rounded-lg hover:bg-amber-800 transition-all font-medium text-sm md:text-base shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl flex-shrink-0"
        >
          <FiPlus size={18} className="md:w-5 md:h-5" />
          <span className="hidden sm:inline">Nova Turma</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
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
              : "Comece criando a primeira turma"}
          </p>
          {!searchTerm && !statusFilter && (
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
                <div
                  key={classItem.id}
                  className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all flex flex-col"
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{classItem.name}</h3>
                      {classItem.style && (
                        <p className="text-sm text-gray-600 mb-1">Estilo: {classItem.style}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            classItem.active !== false
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {classItem.active !== false ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenDeleteModal(classItem)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110 flex-shrink-0 ml-2"
                      title="Excluir"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>

                  {classItem.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{classItem.description}</p>
                  )}

                  <div className="space-y-2 mb-4 text-xs text-gray-600">
                    {teacher && (
                      <div className="flex items-center gap-2">
                        <FiUsers className="w-4 h-4" />
                        <span className="truncate">Prof: {teacher.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4" />
                      <span>{classItem.studentsCount || 0} aluno(s)</span>
                    </div>
                    {classItem.recurringDays && classItem.recurringDays.length > 0 && (() => {
                      const scheduleGroups = formatSchedule(classItem);
                      return scheduleGroups && scheduleGroups.length > 0 ? (
                        <div className="flex items-start gap-2">
                          <FiCalendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-col gap-1">
                            {scheduleGroups.map((group, idx) => (
                              <span key={idx} className="text-xs text-gray-600">
                                {group}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
                    <button
                      onClick={() => handleOpenManageStudentsModal(classItem)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
                    >
                      <FiUsers size={14} />
                      Alunos
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(classItem)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
                    >
                      <FiEdit2 size={14} />
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: Cards List */}
          <div className="md:hidden space-y-2.5">
            {filteredClasses.map((classItem, index) => {
              const teacher = teachersData?.find((t) => String(t.id) === String(classItem.teacherId));
              return (
                <div
                  key={classItem.id}
                  className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all"
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base truncate">{classItem.name}</h3>
                      {classItem.style && (
                        <p className="text-xs text-gray-600 mt-0.5">Estilo: {classItem.style}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            classItem.active !== false
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {classItem.active !== false ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenDeleteModal(classItem)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110 flex-shrink-0 ml-2"
                      title="Excluir"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-1 mb-2 text-xs text-gray-600">
                    {teacher && (
                      <div className="flex items-center gap-1.5">
                        <FiUsers className="w-3 h-3" />
                        <span className="truncate">{teacher.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="w-3 h-3" />
                      <span>{classItem.studentsCount || 0} aluno(s)</span>
                    </div>
                    {classItem.recurringDays && classItem.recurringDays.length > 0 && (() => {
                      const scheduleGroups = formatSchedule(classItem);
                      return scheduleGroups && scheduleGroups.length > 0 ? (
                        <div className="flex items-start gap-1.5">
                          <FiCalendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-col gap-0.5">
                            {scheduleGroups.map((group, idx) => (
                              <span key={idx} className="text-[10px] text-gray-600">
                                {group}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenManageStudentsModal(classItem)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
                    >
                      <FiUsers size={14} />
                      Alunos
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(classItem)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
                    >
                      <FiEdit2 size={14} />
                      Editar
                    </button>
                  </div>
                </div>
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
                <h2 className="text-lg md:text-2xl font-bold text-amber-900">Gerenciar Alunos</h2>
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
                        <button
                          onClick={() => handleRemoveStudent(String(enrollment.studentId))}
                          disabled={removeStudentMutation.isPending}
                          className="ml-3 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    Nenhum aluno matriculado
                  </p>
                )}
              </div>

              {/* Adicionar Alunos */}
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
            </div>
          </div>
        </div>
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

