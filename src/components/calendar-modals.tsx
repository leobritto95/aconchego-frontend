import { useState, useEffect, useMemo, useRef, FormEvent } from "react";
import { EventClickArg } from "@fullcalendar/core";
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from "../hooks/useEvents";
import { useCreateClass, useUpdateClass, useDeleteClass } from "../hooks/useClasses";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/userService";
import { Class, ScheduleTime } from "../types";
import { toast } from "../utils/toast";
import { formatDateTime, toDateTimeLocal } from "../utils/dateUtils";
import { DEFAULT_START_TIME, DEFAULT_END_TIME, DAYS_OF_WEEK, DAY_NAMES } from "../utils/constants";
import { CloseIcon, ClockIcon, CalendarIcon, UserIcon, TagIcon, DocumentIcon, BookIcon } from "./icons";
import { ConfirmModal } from "./confirm-modal";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal de escolha entre Evento ou Turma
interface CreateChoiceModalProps extends BaseModalProps {
  selectedDate?: Date;
  onSelectEvent: () => void;
  onSelectClass: () => void;
}

export function CreateChoiceModal({
  isOpen,
  onClose,
  onSelectEvent,
  onSelectClass,
}: CreateChoiceModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Criar novo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
            aria-label="Fechar"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              onSelectEvent();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Criar novo evento"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Evento único</h4>
              <p className="text-sm text-gray-500">Criar um evento único no calendário</p>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectClass();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Criar nova turma"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Turma</h4>
              <p className="text-sm text-gray-500">Criar uma turma</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Evento
interface EventModalProps extends BaseModalProps {
  event: EventClickArg["event"] | null;
  selectedDate?: Date;
  canManage: boolean;
}

const initialEventFormData = {
  title: "",
  description: "",
  start: "",
  end: "",
};

export function EventModal({ isOpen, onClose, event, selectedDate, canManage }: EventModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState(initialEventFormData);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const isClass = useMemo(() => event?.extendedProps?.type === "recurring-class", [event]);
  const eventId = useMemo(() => {
    if (!event?.id) return null;
    return typeof event.id === "string" ? event.id : String(event.id);
  }, [event]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showDeleteConfirm) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, showDeleteConfirm]);

  useEffect(() => {
    if (isOpen && !event && !isEditing && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen, event, isEditing]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setFormData(initialEventFormData);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  // Load event data
  useEffect(() => {
    if (!isOpen) return;
    
    if (event && !isEditing) {
      setFormData({
        title: event.title || "",
        description: event.extendedProps?.description || "",
        start: event.start ? toDateTimeLocal(event.start) : "",
        end: event.end ? toDateTimeLocal(event.end) : "",
      });
    } else if (!event && selectedDate) {
      const start = new Date(selectedDate);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      setFormData({
        title: "",
        description: "",
        start: toDateTimeLocal(start),
        end: toDateTimeLocal(end),
      });
    } else if (!event && !selectedDate) {
      setFormData(initialEventFormData);
    }
  }, [event, selectedDate, isEditing, isOpen]);

  const validateEventForm = (): string | null => {
    if (!formData.title?.trim()) return "Título é obrigatório";
    if (!formData.start) return "Data de início é obrigatória";
    if (!formData.end) return "Data de fim é obrigatória";
    if (new Date(formData.end) <= new Date(formData.start)) {
      return "A data/hora de fim deve ser posterior à de início";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const error = validateEventForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      if (event && !isClass && eventId) {
        await updateMutation.mutateAsync({
          id: eventId,
          eventData: {
            title: formData.title,
            description: formData.description,
            start: new Date(formData.start).toISOString(),
            end: new Date(formData.end).toISOString(),
          },
        });
        toast.success("Evento atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          start: new Date(formData.start).toISOString(),
          end: new Date(formData.end).toISOString(),
        });
        toast.success("Evento criado com sucesso!");
      }
      setIsEditing(false);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar evento";
      toast.error(message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!event || isClass || !eventId) return;

    try {
      await deleteMutation.mutateAsync(eventId);
      toast.success("Evento excluído com sucesso!");
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir evento";
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={event ? "event-title" : "new-event-title"}
        >
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 id={event ? "event-title" : "new-event-title"} className="text-xl font-bold text-gray-900">
                  {isEditing ? "Editar Evento" : event ? "Detalhes do Evento" : "Novo Evento"}
                </h3>
                {!event && (
                  <p className="text-sm text-gray-500 mt-1">Crie um evento único no calendário</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
              aria-label="Fechar"
              disabled={isLoading}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {isClass ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Este é uma turma recorrente. Use o modal de turmas para editá-la.</p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : isEditing || !event ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações do Evento */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-gray-800">Informações do Evento</h4>
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Ex: Reunião de planejamento"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none shadow-sm"
                    placeholder="Adicione detalhes sobre o evento..."
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Data e Horário */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <ClockIcon className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800">Data e Horário</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-2">
                      Data e Hora de Início <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="start"
                      required
                      value={formData.start}
                      onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-2">
                      Data e Hora de Fim <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="end"
                      required
                      value={formData.end}
                      onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (!event) onClose();
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Evento"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 sm:space-y-5">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <h4 className="text-[10px] sm:text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1 sm:mb-2">Título</h4>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{event.title}</p>
              </div>

              {event.start && event.end && (
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-200">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 sm:mb-2 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Horário
                  </h4>
                  <div className="space-y-0.5 sm:space-y-1 mt-1.5 sm:mt-2">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="font-semibold">Início:</span> {formatDateTime(event.start)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="font-semibold">Fim:</span> {formatDateTime(event.end)}
                    </p>
                  </div>
                </div>
              )}

              {event.extendedProps?.description && (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-1">
                    <DocumentIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    Descrição
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white/70 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-100">
                    {event.extendedProps.description}
                  </p>
                </div>
              )}

              {canManage && (
                <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={isLoading}
      />
    </>
  );
}

// Modal de Turma
interface ClassModalProps extends BaseModalProps {
  classData: Class | null;
  selectedDate?: Date;
  canManage: boolean;
}

const initialClassFormData = {
  name: "",
  description: "",
  teacherId: "",
  style: "",
  active: true,
  recurringDays: [] as number[],
  scheduleTimes: {} as Record<string, ScheduleTime>,
  startDate: "",
  endDate: "",
};

export function ClassModal({ isOpen, onClose, classData, selectedDate, canManage }: ClassModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState(initialClassFormData);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await UserService.getTeachers();
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
    enabled: isOpen,
  });

  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showDeleteConfirm) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, showDeleteConfirm]);

  useEffect(() => {
    if (isOpen && !classData && !isEditing && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, classData, isEditing]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setFormData(initialClassFormData);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  // Load class data
  useEffect(() => {
    if (!isOpen) return;
    
    if (classData && !isEditing) {
      setFormData({
        name: classData.name || "",
        description: classData.description || "",
        teacherId: classData.teacherId || "",
        style: classData.style || "",
        active: classData.active !== false,
        recurringDays: classData.recurringDays || [],
        scheduleTimes: classData.scheduleTimes || {},
        startDate: classData.startDate ? new Date(classData.startDate).toISOString().slice(0, 10) : "",
        endDate: classData.endDate ? new Date(classData.endDate).toISOString().slice(0, 10) : "",
      });
    } else if (!classData && selectedDate) {
      const start = new Date(selectedDate);
      const dayOfWeek = start.getDay();
      
      // Formatar o horário no formato HH:mm
      const hours = String(start.getHours()).padStart(2, "0");
      const minutes = String(start.getMinutes()).padStart(2, "0");
      const startTime = `${hours}:${minutes}`;
      
      // Calcular horário de fim (1 hora depois)
      const endDate = new Date(start);
      endDate.setHours(endDate.getHours() + 1);
      const endHours = String(endDate.getHours()).padStart(2, "0");
      const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
      const endTime = `${endHours}:${endMinutes}`;
      
      setFormData({
        name: "",
        description: "",
        teacherId: "",
        style: "",
        active: true,
        recurringDays: [dayOfWeek],
        scheduleTimes: {
          [dayOfWeek.toString()]: {
            startTime: startTime,
            endTime: endTime,
          },
        },
        startDate: start.toISOString().slice(0, 10),
        endDate: "",
      });
    } else if (!classData && !selectedDate) {
      setFormData(initialClassFormData);
    }
  }, [classData, selectedDate, isEditing, isOpen]);

  const handleDayToggle = (day: number) => {
    const isAdding = !formData.recurringDays.includes(day);
    const newDays = isAdding
      ? [...formData.recurringDays, day].sort()
      : formData.recurringDays.filter((d) => d !== day);

    const newScheduleTimes = { ...formData.scheduleTimes };
    
    if (isAdding) {
      const existingDays = formData.recurringDays;
      let lastSchedule = { startTime: DEFAULT_START_TIME, endTime: DEFAULT_END_TIME };
      
      if (existingDays.length > 0) {
        const lastDay = existingDays[existingDays.length - 1];
        const lastDaySchedule = formData.scheduleTimes[lastDay.toString()];
        if (lastDaySchedule) {
          lastSchedule = lastDaySchedule;
        }
      }
      
      newScheduleTimes[day.toString()] = {
        startTime: lastSchedule.startTime,
        endTime: lastSchedule.endTime,
      };
    } else {
      delete newScheduleTimes[day.toString()];
    }

    setFormData({
      ...formData,
      recurringDays: newDays,
      scheduleTimes: newScheduleTimes,
    });
  };

  const handleScheduleTimeChange = (day: number, field: "startTime" | "endTime", value: string) => {
    const currentSchedule = formData.scheduleTimes[day.toString()] || { startTime: DEFAULT_START_TIME, endTime: DEFAULT_END_TIME };
    
    setFormData({
      ...formData,
      scheduleTimes: {
        ...formData.scheduleTimes,
        [day.toString()]: {
          ...currentSchedule,
          [field]: value,
        },
      },
    });
  };

  const handleScheduleTimeBlur = (day: number, field: "startTime" | "endTime", value: string) => {
    // Só valida quando o campo perde o foco e o formato está completo (HH:MM)
    if (!value || value.length !== 5 || !value.includes(":")) {
      return; // Formato incompleto, não valida ainda
    }

    const schedule = formData.scheduleTimes[day.toString()] || { startTime: DEFAULT_START_TIME, endTime: DEFAULT_END_TIME };
    
    // Valida apenas quando ambos os horários estão completos
    if (field === "endTime") {
      const startTime = schedule.startTime;
      if (startTime && startTime.length === 5 && value <= startTime) {
        toast.error("O horário de fim deve ser posterior ao de início");
      }
    } else if (field === "startTime") {
      const endTime = schedule.endTime;
      if (endTime && endTime.length === 5 && endTime <= value) {
        toast.error("O horário de início deve ser anterior ao de fim");
      }
    }
  };

  const validateClassForm = (): string | null => {
    if (!formData.name?.trim()) return "Nome da turma é obrigatório";
    if (!formData.teacherId) return "Professor é obrigatório";
    if (formData.recurringDays.length === 0) return "Selecione pelo menos um dia da semana";
    if (!formData.startDate) return "Data de início é obrigatória";
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      return "A data de fim deve ser posterior à de início";
    }
    // Validate schedule times
    for (const day of formData.recurringDays) {
      const schedule = formData.scheduleTimes[day.toString()];
      if (schedule && schedule.endTime <= schedule.startTime) {
        const dayName = DAY_NAMES[day];
        return `O horário de fim deve ser posterior ao de início para ${dayName}`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const error = validateClassForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const classPayload: Omit<Class, "id" | "createdAt" | "updatedAt"> = {
        name: formData.name,
        description: formData.description,
        teacherId: formData.teacherId,
        style: formData.style,
        active: formData.active,
        recurringDays: formData.recurringDays,
        scheduleTimes: formData.scheduleTimes,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (classData) {
        const classId = typeof classData.id === "string" ? classData.id : String(classData.id);
        await updateMutation.mutateAsync({
          id: classId,
          classData: classPayload,
        });
        toast.success("Turma atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(classPayload);
        toast.success("Turma criada com sucesso!");
      }
      setIsEditing(false);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar turma";
      toast.error(message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!classData) return;

    try {
      const classId = typeof classData.id === "string" ? classData.id : String(classData.id);
      await deleteMutation.mutateAsync(classId);
      toast.success("Turma excluída com sucesso!");
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir turma";
      toast.error(message);
    }
  };

  const handleToggleActive = async () => {
    if (!classData) return;

    try {
      const classId = typeof classData.id === "string" ? classData.id : String(classData.id);
      await updateMutation.mutateAsync({
        id: classId,
        classData: { active: !formData.active },
      });
      setFormData({ ...formData, active: !formData.active });
      toast.success(`Turma ${!formData.active ? "ativada" : "desativada"} com sucesso!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao alterar status da turma";
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={classData ? "class-title" : "new-class-title"}
        >
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                <BookIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 id={classData ? "class-title" : "new-class-title"} className="text-xl font-bold text-gray-900">
                  {isEditing ? "Editar Turma" : classData ? "Detalhes da Turma" : "Nova Turma"}
                </h3>
                {!classData && (
                  <p className="text-sm text-gray-500 mt-1">Configure uma turma recorrente</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
              aria-label="Fechar"
              disabled={isLoading}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {isEditing || !classData ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-gray-800">Informações Básicas</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Turma <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                      placeholder="Ex: Dança de Salão - Iniciantes"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
                      Professor <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="teacherId"
                      required
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                      disabled={isLoading}
                    >
                      <option value="">Selecione um professor</option>
                      {teachersData?.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                      Estilo
                    </label>
                    <input
                      type="text"
                      id="style"
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                      placeholder="Ex: Salsa, Bachata, Forró"
                      disabled={isLoading}
                    />
                  </div>
                  {classData && (
                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        disabled={isLoading}
                      />
                      <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Turma ativa
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none shadow-sm"
                    placeholder="Descreva a turma, objetivos, público-alvo..."
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Período */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800">Período</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Fim <span className="text-gray-500 text-xs font-normal">(opcional)</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Dias e Horários */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <ClockIcon className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800">Dias e Horários</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dias da Semana <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.recurringDays.includes(day.value)
                            ? "border-green-500 bg-green-50 text-green-900 shadow-sm"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                        disabled={isLoading}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.recurringDays.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Horários por Dia</label>
                    <div className="space-y-2">
                      {formData.recurringDays.map((day) => {
                        const dayLabel = DAYS_OF_WEEK.find((d) => d.value === day)?.label || "";
                        const schedule = formData.scheduleTimes[day.toString()] || { startTime: DEFAULT_START_TIME, endTime: DEFAULT_END_TIME };
                        return (
                          <div key={day} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">{dayLabel}</span>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) => handleScheduleTimeChange(day, "startTime", e.target.value)}
                              onBlur={(e) => handleScheduleTimeBlur(day, "startTime", e.target.value)}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                              disabled={isLoading}
                            />
                            <span className="text-sm text-gray-500 font-medium">até</span>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) => handleScheduleTimeChange(day, "endTime", e.target.value)}
                              onBlur={(e) => handleScheduleTimeBlur(day, "endTime", e.target.value)}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (!classData) onClose();
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Turma"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 sm:space-y-5">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <h4 className="text-[10px] sm:text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1 sm:mb-2">Nome</h4>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{classData.name}</p>
              </div>

              {classData.teacherId && teachersData && (
                <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3 border border-blue-200">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1.5 sm:mb-2 flex items-center gap-1">
                    <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Professor
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {teachersData.find((t) => String(t.id) === String(classData.teacherId))?.name || "Não definido"}
                  </p>
                </div>
              )}

              {classData.style && (
                <div className="bg-purple-50 rounded-lg p-2.5 sm:p-3 border border-purple-200">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-purple-900 uppercase tracking-wide mb-1.5 sm:mb-2 flex items-center gap-1">
                    <TagIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Estilo
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{classData.style}</p>
                </div>
              )}

              {classData.description && (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-1">
                    <DocumentIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    Descrição
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white/70 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-100">
                    {classData.description}
                  </p>
                </div>
              )}

              {classData.recurringDays && classData.recurringDays.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-200">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 sm:mb-2 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Horários
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
                    {classData.recurringDays.map((day) => {
                      const schedule = classData.scheduleTimes?.[day.toString()];
                      if (!schedule) return null;
                      return (
                        <div key={day} className="flex items-center justify-between bg-white rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{DAY_NAMES[day]}</span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-200">
                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 sm:mb-2 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Período
                </h4>
                <div className="space-y-0.5 sm:space-y-1 mt-1.5 sm:mt-2">
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold">Início:</span>{" "}
                    {classData.startDate ? new Date(classData.startDate).toLocaleDateString("pt-BR") : "Não definido"}
                  </p>
                  {classData.endDate && (
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="font-semibold">Fim:</span> {new Date(classData.endDate).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {!classData.endDate && (
                    <p className="text-xs sm:text-sm text-gray-500 italic">Sem data de fim definida</p>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleToggleActive}
                    className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md ${
                      formData.active
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    disabled={isLoading}
                  >
                    {formData.active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Turma"
        message="Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={isLoading}
      />
    </>
  );
}
