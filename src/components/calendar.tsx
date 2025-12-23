import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { EventClickArg, DateSelectArg, DatesSetArg } from "@fullcalendar/core";
import { MobileDateStrip } from "./MobileDateStrip";
import { useEvents } from "../hooks/useEvents";
import { useClasses } from "../hooks/useClasses";
import { CALENDAR_COLORS } from "../constants/calendarColors";
import { FULLCALENDAR_STYLES } from "./calendar.styles";
import { CreateChoiceModal, EventModal, ClassModal } from "./calendar-modals";
import { Class } from "../types";

interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
}

// Constantes
const MOBILE_BREAKPOINT = 768;

interface HoverHandlers {
  mouseenter: () => void;
  mouseleave: () => void;
}

function getEventDescription(event: EventClickArg["event"]): string | null {
  return event.extendedProps?.description || 
    ('description' in event && typeof (event as { description?: string }).description === 'string' 
      ? (event as { description: string }).description 
      : null);
}



// Componente de Legenda
interface LegendItemProps {
  color: typeof CALENDAR_COLORS[keyof typeof CALENDAR_COLORS];
}

function LegendItem({ color }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors duration-150 cursor-default">
      <div
        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded flex-shrink-0 shadow-sm"
        style={{
          backgroundColor: color.backgroundColor,
          border: `2px solid ${color.borderColor}`,
        }}
      />
      <span className="text-gray-700 font-medium text-[9px] sm:text-xs whitespace-nowrap">
        {color.label}
      </span>
    </div>
  );
}

interface CalendarLegendProps {
  userRole: string | null;
}

function CalendarLegend({ userRole }: CalendarLegendProps) {
  const legendItems = useMemo(() => {
    if (userRole === 'student') {
      return [
        CALENDAR_COLORS.enrolled,
        CALENDAR_COLORS.notEnrolled,
        CALENDAR_COLORS.singleEvent,
      ];
    }
    return [
      CALENDAR_COLORS.classDefault,
      CALENDAR_COLORS.singleEvent,
    ];
  }, [userRole]);

  return (
    <div className="px-2 sm:px-6 py-1 sm:py-2.5 bg-white border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm">
        <span className="text-gray-600 font-semibold text-[9px] sm:text-xs uppercase tracking-wide hidden sm:inline mr-1">
          Legenda:
        </span>
        {legendItems.map((color, index) => (
          <LegendItem key={index} color={color} />
        ))}
      </div>
    </div>
  );
}

export function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState<
    EventClickArg["event"] | null
  >(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [calendarRef, setCalendarRef] = useState<FullCalendar | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<Date | undefined>(undefined);
  
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(
    null
  );

  const { events, isLoading, isFetching, error, refetch } = useEvents(
    dateRange?.start,
    dateRange?.end
  );
  const { classes } = useClasses();
  const [userRole, setUserRole] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredClassId, setHoveredClassId] = useState<string | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // Contar eventos de hoje
  const todayEventsCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).length;
  }, [events]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData: UserData = JSON.parse(storedUser);
      setUserRole(userData.role);
      // Verificar se é admin ou secretaria
      setCanManage(userData.role === 'admin' || userData.role === 'secretary');
    }
  }, []);

  // Callbacks memoizados
  const goToToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    if (calendarRef) {
      calendarRef.getApi().gotoDate(today);
    }
  }, [calendarRef]);

  const navigatePrev = useCallback(() => {
    if (calendarRef) {
      calendarRef.getApi().prev();
      setSelectedDate(calendarRef.getApi().getDate());
    }
  }, [calendarRef]);

  const navigateNext = useCallback(() => {
    if (calendarRef) {
      calendarRef.getApi().next();
      setSelectedDate(calendarRef.getApi().getDate());
    }
  }, [calendarRef]);

  const handleDateFilter = useCallback((date: string) => {
    if (!date) return;
    const d = new Date(date);
    setSelectedDate(d);
    if (calendarRef) {
      calendarRef.getApi().gotoDate(d);
    }
  }, [calendarRef]);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    // Debounce para evitar múltiplas requisições rápidas
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDateRange({
        start: arg.start.toISOString(),
        end: arg.end.toISOString(),
      });
      
      if (isMobile) {
        setSelectedDate(arg.start);
      }
    }, 150); // 150ms de debounce para transições mais suaves
  }, [isMobile]);

  // Cleanup do debounce
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const isClass = info.event.extendedProps?.type === 'recurring-class';
    
    if (isClass) {
      const classId = info.event.extendedProps?.classId || info.event.id;
      const classData = classes.find((c) => c.id === classId);
      if (classData) {
        setSelectedClass(classData);
        setIsClassModalOpen(true);
      }
    } else {
      setSelectedEvent(info.event);
      setIsEventModalOpen(true);
    }
  }, [classes]);

  const clearSelection = useCallback(() => {
    if (calendarRef) {
      calendarRef.getApi().unselect();
    }
  }, [calendarRef]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (!canManage) return;
    setSelectedDateForCreate(selectInfo.start);
    setIsChoiceModalOpen(true);
  }, [canManage]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleMobileDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    if (calendarRef) {
      calendarRef.getApi().gotoDate(date);
    }
  }, [calendarRef]);

  // Função para destacar eventos relacionados da mesma turma
  const highlightRelatedEvents = useCallback((classId: string | null) => {
    if (!calendarContainerRef.current) return;
    
    const calendarRoot = calendarContainerRef.current.querySelector('.fc') as HTMLElement | null;
    if (!calendarRoot) return;
    
    // Remover classe de destaque de todos os eventos primeiro
    const allEventElements = calendarRoot.querySelectorAll('.fc-event');
    allEventElements.forEach((el: Element) => {
      const eventEl = el as HTMLElement;
      eventEl.classList.remove('fc-event-related-hover');
      eventEl.classList.remove('fc-event-related-active');
    });
    
    // Se há um classId em hover, destacar eventos relacionados
    if (classId) {
      const relatedEvents = calendarRoot.querySelectorAll(`[data-class-id="${classId}"]`);
      relatedEvents.forEach((el: Element) => {
        const eventEl = el as HTMLElement;
        eventEl.classList.add('fc-event-related-hover');
        // O evento que está sendo hovered recebe uma classe adicional
        if (eventEl.classList.contains('fc-event-hovered')) {
          eventEl.classList.add('fc-event-related-active');
        }
      });
    }
  }, []);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      highlightRelatedEvents(hoveredClassId);
    });
    return () => cancelAnimationFrame(rafId);
  }, [hoveredClassId, highlightRelatedEvents]);

  // Responsividade
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
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

  // Loading inicial (primeira vez)
  if (isLoading && !dateRange) {
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
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 flex flex-col bg-white sm:rounded-xl sm:shadow-xl overflow-hidden sm:border sm:border-gray-100 h-full md:shadow-lg shadow-md">
        {/* Header */}
        <div className="p-2 sm:p-6 border-b border-amber-200/50 bg-gradient-to-r from-amber-100/95 via-amber-100 to-amber-100/95 sm:shadow-sm shadow-sm">
          {/* Mobile: Layout Simplificado */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-amber-900 drop-shadow-sm truncate">Agenda</h2>
                {todayEventsCount > 0 && (
                  <p className="text-[9px] text-amber-700 font-medium mt-0.5 truncate">
                    {todayEventsCount} {todayEventsCount === 1 ? "evento hoje" : "eventos hoje"}
                  </p>
                )}
              </div>
              <button
                onClick={goToToday}
                className="flex items-center gap-1 text-[10px] text-amber-900 hover:text-amber-800 font-bold bg-white/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white active:scale-95 flex-shrink-0 ml-2"
              >
                <svg
                  className="w-3 h-3"
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
                <span>Hoje</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={navigatePrev}
                className="bg-amber-900 text-white hover:bg-amber-800 active:scale-95 rounded-lg p-1.5 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 flex-shrink-0"
                aria-label="Anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="relative flex-1 min-w-0">
                <input
                  type="date"
                  value={selectedDate.toISOString().slice(0, 10)}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="block w-full rounded-lg border-amber-300 shadow-sm focus:border-amber-600 focus:ring-2 focus:ring-amber-300 text-xs bg-white px-2.5 py-2 pl-8 font-medium transition-all duration-200 hover:border-amber-400"
                />
                <svg
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-600 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <button
                onClick={navigateNext}
                className="bg-amber-900 text-white hover:bg-amber-800 active:scale-95 rounded-lg p-1.5 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 flex-shrink-0"
                aria-label="Próximo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
              <div>
              <h2 className="text-3xl font-bold text-amber-900 drop-shadow-sm tracking-tight">
                Agenda
              </h2>
                {todayEventsCount > 0 && (
                  <p className="text-xs text-amber-700 font-medium mt-0.5">
                    {todayEventsCount} {todayEventsCount === 1 ? "evento hoje" : "eventos hoje"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Setas de navegação */}
              <div className="flex flex-row gap-1 items-center bg-white/70 backdrop-blur-sm rounded-lg p-1 shadow-md border border-amber-100/50">
                <button
                  onClick={navigatePrev}
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
                  onClick={navigateNext}
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
                  onClick={goToToday}
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
        <CalendarLegend userRole={userRole} />
        <MobileDateStrip
          selectedDate={selectedDate}
          onChange={handleMobileDateChange}
        />
        <div 
          ref={calendarContainerRef}
          className="flex-1 p-0 sm:p-6 overflow-hidden relative overscroll-contain touch-pan-y h-full"
        >
          {/* Loading overlay sutil durante atualizações */}
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-200 border-t-amber-600"></div>
                <p className="text-xs text-gray-600 font-medium">Atualizando eventos...</p>
              </div>
            </div>
          )}
          <style>{FULLCALENDAR_STYLES}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
            ref={(ref) => setCalendarRef(ref)}
            headerToolbar={false}
            locale={ptBrLocale}
            events={events}
            eventClick={handleEventClick}
            selectable={canManage}
            select={handleDateSelect}
            unselectAuto={false}
            selectMirror={true}
            selectOverlap={true}
            height="100%"
            slotMinTime="07:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            expandRows={true}
            stickyHeaderDates={true}
            dayMaxEvents={true}
            weekends={true}
            nowIndicator={true}
            dayMaxEventRows={true}
            editable={false}
            droppable={false}
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
            aspectRatio={isMobile ? undefined : 1.35}
            lazyFetching={true}
            eventDisplay="block"
            views={{
              timeGridDay: {
                titleFormat: { year: "numeric", month: "long", day: "numeric" },
                slotMinTime: "08:00:00",
                slotMaxTime: "22:00:00",
              },
              timeGridWeek: {
                titleFormat: { year: "numeric", month: "long" },
                slotMinTime: "07:00:00",
                slotMaxTime: "23:00:00",
              },
            }}
            eventDidMount={(info) => {
              // Tooltip automático com descrição
              const description = getEventDescription(info.event);
              
              if (description) {
                info.el.setAttribute("title", description);
                info.el.setAttribute("data-tooltip", description);
              }

              // Adicionar event listeners para hover em eventos de turma
              const eventType = info.event.extendedProps?.type;
              const classId = info.event.extendedProps?.classId;
              
              if (eventType === 'recurring-class' && classId) {
                // Adicionar data attribute para facilitar busca de eventos relacionados
                info.el.setAttribute("data-class-id", String(classId));
                
                const handleMouseEnter = () => {
                  info.el.classList.add('fc-event-hovered');
                  setHoveredClassId(String(classId));
                };
                
                const handleMouseLeave = () => {
                  info.el.classList.remove('fc-event-hovered');
                  setHoveredClassId(null);
                };
                
                info.el.addEventListener('mouseenter', handleMouseEnter);
                info.el.addEventListener('mouseleave', handleMouseLeave);
                
                // Armazenar referência aos handlers para cleanup posterior
                // Usando uma propriedade customizada no elemento
                const elWithHandlers = info.el as HTMLElement & { _hoverHandlers?: HoverHandlers };
                elWithHandlers._hoverHandlers = {
                  mouseenter: handleMouseEnter,
                  mouseleave: handleMouseLeave,
                };
              }
            }}
            eventWillUnmount={(info) => {
              // Cleanup: remover listeners quando o evento for desmontado
              const elWithHandlers = info.el as HTMLElement & { _hoverHandlers?: HoverHandlers };
              const handlers = elWithHandlers._hoverHandlers;
              if (handlers) {
                info.el.removeEventListener('mouseenter', handlers.mouseenter);
                info.el.removeEventListener('mouseleave', handlers.mouseleave);
                delete elWithHandlers._hoverHandlers;
              }
              
              // Limpar estado se este evento estava em hover
              if (info.el.classList.contains('fc-event-hovered')) {
                setHoveredClassId(null);
              }
            }}
            datesSet={handleDatesSet}
          />
        </div>
      </div>
      <CreateChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => {
          setIsChoiceModalOpen(false);
          clearSelection();
        }}
        selectedDate={selectedDateForCreate}
        onSelectEvent={() => {
          setSelectedEvent(null);
          setIsChoiceModalOpen(false);
          setIsEventModalOpen(true);
        }}
        onSelectClass={() => {
          setSelectedClass(null);
          setIsChoiceModalOpen(false);
          setIsClassModalOpen(true);
        }}
      />
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
          setSelectedDateForCreate(undefined);
          clearSelection();
        }}
        event={selectedEvent}
        selectedDate={selectedDateForCreate}
        canManage={canManage}
      />
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setSelectedClass(null);
          setSelectedDateForCreate(undefined);
          clearSelection();
        }}
        classData={selectedClass}
        selectedDate={selectedDateForCreate}
        canManage={canManage}
      />
    </div>
  );
}
