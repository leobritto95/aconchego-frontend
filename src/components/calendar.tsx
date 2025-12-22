import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { EventClickArg, DateSelectArg, DatesSetArg } from "@fullcalendar/core";
import { MobileDateStrip } from "./MobileDateStrip";
import { useEvents } from "../hooks/useEvents";
import { CALENDAR_COLORS } from "../constants/calendarColors";

interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventClickArg["event"] | null;
  canManageEvents?: boolean;
}

function hasEventManagementPermission(role: string): boolean {
  return ["teacher", "secretary", "admin"].includes(role);
}

function EventModal({
  isOpen,
  onClose,
  event,
  canManageEvents = false,
}: EventModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {event ? "Detalhes do Evento" : "Novo Evento"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
            aria-label="Fechar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {event ? (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-4 border border-amber-200">
              <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-2">Título</h4>
              <p className="text-base font-semibold text-gray-900">{event.title}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Horário
              </h4>
              {event.start && event.end && 
                event.start.toDateString() === event.end.toDateString() ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white rounded-md px-2.5 py-1.5 border border-gray-200">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-md">
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">Data</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {event.start.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-white rounded-md px-2.5 py-1.5 border border-gray-200">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-md flex-shrink-0">
                        <svg className="w-3 h-3 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Início</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {event.start.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-md px-2.5 py-1.5 border border-gray-200">
                      <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-md flex-shrink-0">
                        <svg className="w-3 h-3 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Fim</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {event.end.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white rounded-md px-2.5 py-1.5 border border-gray-200">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-md flex-shrink-0">
                      <svg className="w-3 h-3 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Início</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {event.start?.toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-md px-2.5 py-1.5 border border-gray-200">
                    <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-md flex-shrink-0">
                      <svg className="w-3 h-3 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Fim</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {event.end?.toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Descrição */}
            {(() => {
              const description = event.extendedProps?.description || 
                ('description' in event && typeof (event as { description?: string }).description === 'string' 
                  ? (event as { description: string }).description 
                  : null);
              return description ? (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descrição
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white/70 rounded-lg px-3 py-2.5 border border-gray-100">
                    {description}
                  </p>
                </div>
              ) : null;
            })()}

            {canManageEvents && (
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow"
                >
                  Editar
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Título
              </label>
              <input
                type="text"
                id="title"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-600 focus:ring-amber-600 sm:text-sm px-4 py-2.5 transition-colors"
                placeholder="Digite o título do evento"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Início
                </label>
                <input
                  type="datetime-local"
                  id="start"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-600 focus:ring-amber-600 sm:text-sm px-4 py-2.5 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="end"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Fim
                </label>
                <input
                  type="datetime-local"
                  id="end"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-600 focus:ring-amber-600 sm:text-sm px-4 py-2.5 transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-900 rounded-lg hover:bg-amber-800 transition-colors shadow-sm hover:shadow-md"
              >
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState<
    EventClickArg["event"] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canManageEvents, setCanManageEvents] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [calendarRef, setCalendarRef] = useState<FullCalendar | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(
    null
  );

  const { events, isLoading, error, refetch } = useEvents(
    dateRange?.start,
    dateRange?.end
  );
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData: UserData = JSON.parse(storedUser);
      setUserRole(userData.role);
      setCanManageEvents(hasEventManagementPermission(userData.role));
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (calendarRef) {
        calendarRef
          .getApi()
          .changeView(mobile ? "timeGridDay" : "timeGridWeek");
        calendarRef.getApi().gotoDate(selectedDate);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [calendarRef, selectedDate]);

  const handleDatesSet = (arg: DatesSetArg) => {
    setDateRange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    });
    
    if (isMobile) {
      setSelectedDate(arg.start);
    }
  };

  const handleDateFilter = (date: string) => {
    if (!date) return;
    const d = new Date(date);
    setSelectedDate(d);
    if (calendarRef) {
      calendarRef.getApi().gotoDate(d);
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (canManageEvents) {
      setSelectedEvent(null);
      setIsModalOpen(true);
      console.log("Data selecionada:", selectInfo.start, "até", selectInfo.end);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-900 mx-auto shadow-lg"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Carregando eventos...</p>
          <p className="mt-2 text-gray-500 text-sm">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center bg-white rounded-xl shadow-xl p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 mb-6 font-semibold text-lg">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-amber-900 text-white rounded-lg hover:bg-amber-800 font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-20">
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-amber-200/60 bg-gradient-to-r from-amber-50 via-amber-100/80 to-amber-50 shadow-sm">
          {/* Mobile: Layout Simplificado */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-amber-900 drop-shadow-sm">Agenda</h2>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  if (calendarRef) {
                    calendarRef.getApi().gotoDate(new Date());
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-amber-900 hover:text-amber-800 font-bold bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm hover:shadow-md hover:shadow-amber-200/50 transition-all duration-200 hover:bg-white hover:scale-105 hover:border hover:border-amber-300 active:scale-95"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Hoje
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (calendarRef) {
                    calendarRef.getApi().prev();
                    setSelectedDate(calendarRef.getApi().getDate());
                  }
                }}
                className="bg-amber-900 text-white hover:bg-amber-800 active:scale-95 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                aria-label="Anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={selectedDate.toISOString().slice(0, 10)}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="block w-full rounded-lg border-amber-300 shadow-sm focus:border-amber-600 focus:ring-2 focus:ring-amber-300 text-sm bg-white px-3 py-2 pl-9 font-medium transition-all duration-200 hover:border-amber-400"
                />
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <button
                onClick={() => {
                  if (calendarRef) {
                    calendarRef.getApi().next();
                    setSelectedDate(calendarRef.getApi().getDate());
                  }
                }}
                className="bg-amber-900 text-white hover:bg-amber-800 active:scale-95 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                aria-label="Próximo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Desktop: Layout completo */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-900 to-amber-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-amber-900 drop-shadow-sm tracking-tight">
                Agenda
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Setas de navegação */}
              <div className="flex flex-row gap-1 items-center bg-white/70 backdrop-blur-sm rounded-lg p-1 shadow-md border border-amber-100/50">
                <button
                  onClick={() => {
                    if (calendarRef) {
                      calendarRef.getApi().prev();
                      setSelectedDate(calendarRef.getApi().getDate());
                    }
                  }}
                  className="bg-amber-900 text-white hover:bg-amber-800 active:scale-95 cursor-pointer rounded-md shadow-sm hover:shadow-md transition-all duration-200 outline-none focus:outline-none focus:ring-2 focus:ring-amber-300 p-2.5"
                  aria-label="Período anterior"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (calendarRef) {
                      calendarRef.getApi().next();
                      setSelectedDate(calendarRef.getApi().getDate());
                    }
                  }}
                  className="bg-amber-900 text-white hover:bg-amber-800 active:scale-95 cursor-pointer rounded-md shadow-sm hover:shadow-md transition-all duration-200 outline-none focus:outline-none focus:ring-2 focus:ring-amber-300 p-2.5"
                  aria-label="Próximo período"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate.toISOString().slice(0, 10)}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="block w-auto rounded-lg border-amber-300 shadow-sm focus:border-amber-600 focus:ring-2 focus:ring-amber-300 text-sm bg-white px-4 py-2.5 pl-10 font-medium transition-all duration-200 hover:border-amber-400 hover:shadow-md"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              {selectedDate && (
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    if (calendarRef) {
                      calendarRef.getApi().gotoDate(new Date());
                    }
                  }}
                  className="text-sm text-amber-900 hover:text-amber-800 font-bold flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:shadow-amber-200/50 transition-all duration-200 hover:bg-white hover:scale-105 hover:border hover:border-amber-300 active:scale-95"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Hoje
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Legenda de cores */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-50 via-gray-100/30 to-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="text-gray-700 font-semibold text-[10px] sm:text-sm uppercase tracking-wide hidden sm:inline">Legenda:</span>
            {userRole === 'student' ? (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-default">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded shadow-sm flex-shrink-0 ring-1 ring-gray-100"
                    style={{
                      backgroundColor: CALENDAR_COLORS.enrolled.backgroundColor,
                      border: `2px solid ${CALENDAR_COLORS.enrolled.borderColor}`,
                    }}
                  ></div>
                  <span className="text-gray-700 font-medium text-[10px] sm:text-sm whitespace-nowrap">{CALENDAR_COLORS.enrolled.label}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-default">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded shadow-sm flex-shrink-0 ring-1 ring-gray-100"
                    style={{
                      backgroundColor: CALENDAR_COLORS.notEnrolled.backgroundColor,
                      border: `2px solid ${CALENDAR_COLORS.notEnrolled.borderColor}`,
                    }}
                  ></div>
                  <span className="text-gray-700 font-medium text-[10px] sm:text-sm whitespace-nowrap">{CALENDAR_COLORS.notEnrolled.label}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-default">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded shadow-sm flex-shrink-0 ring-1 ring-gray-100"
                    style={{
                      backgroundColor: CALENDAR_COLORS.singleEvent.backgroundColor,
                      border: `2px solid ${CALENDAR_COLORS.singleEvent.borderColor}`,
                    }}
                  ></div>
                  <span className="text-gray-700 font-medium text-[10px] sm:text-sm whitespace-nowrap">{CALENDAR_COLORS.singleEvent.label}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-default">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded shadow-sm flex-shrink-0 ring-1 ring-gray-100"
                    style={{
                      backgroundColor: CALENDAR_COLORS.classDefault.backgroundColor,
                      border: `2px solid ${CALENDAR_COLORS.classDefault.borderColor}`,
                    }}
                  ></div>
                  <span className="text-gray-700 font-medium text-[10px] sm:text-sm whitespace-nowrap">{CALENDAR_COLORS.classDefault.label}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-default">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded shadow-sm flex-shrink-0 ring-1 ring-gray-100"
                    style={{
                      backgroundColor: CALENDAR_COLORS.singleEvent.backgroundColor,
                      border: `2px solid ${CALENDAR_COLORS.singleEvent.borderColor}`,
                    }}
                  ></div>
                  <span className="text-gray-700 font-medium text-[10px] sm:text-sm whitespace-nowrap">{CALENDAR_COLORS.singleEvent.label}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <MobileDateStrip
          selectedDate={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            if (calendarRef) {
              calendarRef.getApi().gotoDate(date);
            }
          }}
        />
        <div className="flex-1 p-2 sm:p-6 overflow-auto">
          <style>{`
            .fc {
              font-family: inherit;
            }
            .fc-theme-standard td, .fc-theme-standard th {
              border-color: #e5e7eb;
            }
            .fc-col-header-cell {
              background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
              padding: 12px 8px;
              font-weight: 600;
              font-size: 0.875rem;
              color: #111827;
              border-bottom: 2px solid #e5e7eb;
            }
            .fc-timegrid-slot {
              height: 3em;
              border-color: #f3f4f6;
            }
            .fc-timegrid-slot-label {
              font-size: 0.75rem;
              color: #6b7280;
              font-weight: 500;
              padding: 4px 8px;
            }
            .fc-event {
              border-radius: 6px;
              border-width: 2px;
              padding: 2px 4px;
              font-weight: 500;
              font-size: 0.8125rem;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              transition: all 0.2s ease;
            }
            .fc-event:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
              z-index: 10;
            }
            .fc-event-title {
              font-weight: 600;
              line-height: 1.3;
              color: #000000 !important;
            }
            .fc-event-time {
              font-weight: 600;
              opacity: 0.9;
              color: #000000 !important;
            }
            .fc-daygrid-day-number {
              font-weight: 600;
              color: #374151;
              padding: 8px;
            }
            .fc-timegrid-now-indicator-line {
              border-color: #ef4444;
              border-width: 2px;
              opacity: 0.8;
            }
            .fc-button {
              background-color: #92400e;
              border-color: #92400e;
              font-weight: 600;
              padding: 8px 16px;
              border-radius: 8px;
              transition: all 0.2s;
            }
            .fc-button:hover {
              background-color: #78350f;
              border-color: #78350f;
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .fc-button:active {
              transform: translateY(0);
            }
            .fc-today-button {
              background-color: #f59e0b;
              border-color: #f59e0b;
            }
            .fc-today-button:hover {
              background-color: #d97706;
              border-color: #d97706;
            }
            @media (max-width: 768px) {
              .fc-col-header-cell {
                padding: 6px 2px;
                font-size: 0.7rem;
                font-weight: 600;
              }
              .fc-timegrid-slot {
                height: 2.2em;
              }
              .fc-timegrid-slot-label {
                font-size: 0.65rem;
                padding: 2px 4px;
              }
              .fc-event {
                font-size: 0.7rem;
                padding: 2px 4px;
                border-radius: 4px;
                font-weight: 600;
              }
              .fc-event-title {
                font-size: 0.7rem;
                line-height: 1.2;
                color: #000000 !important;
              }
              .fc-event-time {
                font-size: 0.65rem;
                color: #000000 !important;
              }
            }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
            ref={(ref) => setCalendarRef(ref)}
            headerToolbar={false}
            locale={ptBrLocale}
            events={events}
            eventClick={handleEventClick}
            selectable={canManageEvents}
            select={handleDateSelect}
            height="100%"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            expandRows={true}
            stickyHeaderDates={true}
            dayMaxEvents={true}
            weekends={true}
            nowIndicator={true}
            selectMirror={true}
            dayMaxEventRows={true}
            editable={canManageEvents}
            droppable={canManageEvents}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            eventClassNames="cursor-pointer hover:opacity-90 transition-all [&_.fc-event-title]:text-black [&_.fc-event-time]:text-black [&_.fc-event-title]:font-semibold"
            dayHeaderClassNames="text-sm font-semibold text-gray-900"
            nowIndicatorClassNames="border-red-500"
            moreLinkClassNames="text-amber-700 hover:text-amber-800 font-semibold"
            moreLinkContent={(args) => `+${args.num} mais`}
            contentHeight="auto"
            aspectRatio={1.35}
            views={{
              timeGridDay: {
                titleFormat: { year: "numeric", month: "long", day: "numeric" },
              },
              timeGridWeek: {
                titleFormat: { year: "numeric", month: "long" },
              },
            }}
            datesSet={handleDatesSet}
          />
        </div>
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        canManageEvents={canManageEvents}
      />
    </div>
  );
}
