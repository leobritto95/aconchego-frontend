import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { EventClickArg, DateSelectArg, DatesSetArg } from '@fullcalendar/core';
import { MobileDateStrip } from './MobileDateStrip';

// Mock data - será substituído por dados do backend
const mockEvents = [
  {
    id: '1',
    title: 'Aula de Yoga',
    start: '2025-06-02T08:00:00',
    end: '2025-06-02T09:00:00',
    backgroundColor: '#D1FAE5', // green-100
    borderColor: '#059669', // green-600
  },
  {
    id: '2',
    title: 'Consulta Médica',
    start: '2025-06-02T10:00:00',
    end: '2025-06-02T11:00:00',
    backgroundColor: '#E0E7FF', // indigo-100
    borderColor: '#4F46E5', // indigo-600
  },
  {
    id: '3',
    title: 'Terapia em Grupo',
    start: '2024-03-21T14:00:00',
    end: '2024-03-21T15:30:00',
    backgroundColor: '#FEF3C7', // amber-100
    borderColor: '#D97706', // amber-600
  },
];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventClickArg['event'] | null;
  isAdmin?: boolean;
}

function EventModal({ isOpen, onClose, event, isAdmin = false }: EventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {event ? 'Detalhes do Evento' : 'Novo Evento'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {event ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Título</h4>
              <p className="mt-1 text-sm text-gray-900">{event.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Horário</h4>
              <p className="mt-1 text-sm text-gray-900">
                {event.start?.toLocaleString('pt-BR')} - {event.end?.toLocaleString('pt-BR')}
              </p>
            </div>
            {isAdmin && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Editar
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-700">
                Início
              </label>
              <input
                type="datetime-local"
                id="start"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-gray-700">
                Fim
              </label>
              <input
                type="datetime-local"
                id="end"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
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
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg['event'] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [calendarRef, setCalendarRef] = useState<FullCalendar | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (calendarRef) {
        calendarRef.getApi().changeView(mobile ? 'timeGridDay' : 'timeGridWeek');
        calendarRef.getApi().gotoDate(selectedDate);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [calendarRef, selectedDate]);

  const handleDatesSet = (arg: DatesSetArg) => {
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
    if (isAdmin) {
      setSelectedEvent(null);
      setIsModalOpen(true);
      console.log('Data selecionada:', selectInfo.start, 'até', selectInfo.end);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-20">
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b border-amber-200 bg-amber-100 rounded-t-lg shadow-sm">
          <div className="flex items-center justify-between sm:justify-between flex-col sm:flex-row gap-4 sm:gap-0">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-amber-900 hidden sm:block drop-shadow-sm">Agenda</h2>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              {/* Setas de navegação */}
              <div className="flex flex-row gap-0 items-center">
                <button
                  onClick={() => {
                    if (calendarRef) {
                      calendarRef.getApi().prev();
                      setSelectedDate(calendarRef.getApi().getDate());
                    }
                  }}
                  className="bg-amber-900 border border-amber-900 text-white hover:bg-amber-800 hover:border-amber-800 cursor-pointer rounded shadow-md transition-colors duration-150 outline-none focus:outline-none p-1 mx-0.5 border-2 border-amber-200"
                  aria-label="Semana anterior"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={() => {
                    if (calendarRef) {
                      calendarRef.getApi().next();
                      setSelectedDate(calendarRef.getApi().getDate());
                    }
                  }}
                  className="bg-amber-900 border border-amber-900 text-white hover:bg-amber-800 hover:border-amber-800 cursor-pointer rounded shadow-md transition-colors duration-150 outline-none focus:outline-none p-1 mx-0.5 border-2 border-amber-200"
                  aria-label="Próxima semana"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate.toISOString().slice(0, 10)}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="block w-full sm:w-auto rounded-md border-amber-200 shadow-sm focus:border-amber-900 sm:text-sm bg-white/80 backdrop-blur-sm pl-8"
                />
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                  className="text-sm text-amber-900 hover:text-amber-800 font-bold flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Hoje
                </button>
              )}
            </div>
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
        <div className="flex-1 p-0 sm:p-4 overflow-hidden">
          <div className="relative fc-theme-standard [&_.fc-header-toolbar]:hidden [&_.fc-button]:bg-slate-600 [&_.fc-button]:border-slate-600 [&_.fc-button:hover]:bg-slate-500 [&_.fc-button:hover]:border-slate-500 [&_.fc-button]:transition-colors [&_.fc-button]:duration-150 [&_.fc-button]:outline-none [&_.fc-button:focus]:outline-none [&_.fc-button:focus]:ring-2 [&_.fc-button:focus]:ring-slate-300 [&_.fc-event]:shadow-sm [&_.fc-event]:border-l-4 [&_.fc-event]:rounded-md [&_.fc-event]:transition-all [&_.fc-event]:duration-150 [&_.fc-event:hover]:shadow-md [&_.fc-event:hover]:scale-[1.02] [&_.fc-timegrid-slot]:border-gray-100 [&_.fc-timegrid-slot-label]:text-gray-500 [&_.fc-timegrid-slot-label]:font-medium [&_.fc-col-header-cell]:bg-gray-50 [&_.fc-col-header-cell]:text-gray-700 [&_.fc-col-header-cell]:font-bold [&_.fc-col-header-cell]:text-lg [&_.fc-col-header-cell]:py-4 [&_.fc-timegrid-axis]:align-top [&_.fc-timegrid-axis]:w-20 [&_.fc-col-header-cell:first-child]:w-20">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
              ref={(ref) => setCalendarRef(ref)}
              headerToolbar={false}
              locale={ptBrLocale}
              events={mockEvents}
              eventClick={handleEventClick}
              selectable={isAdmin}
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
              editable={isAdmin}
              droppable={isAdmin}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              eventClassNames="cursor-pointer hover:opacity-90 transition-opacity [&_.fc-event-title]:text-black [&_.fc-event-time]:text-black"
              dayHeaderClassNames="text-sm font-medium text-gray-900"
              nowIndicatorClassNames="border-red-500"
              moreLinkClassNames="text-indigo-600 hover:text-indigo-700"
              moreLinkContent={(args) => `+${args.num} mais`}
              contentHeight="auto"
              aspectRatio={1.35}
              views={{
                timeGridDay: {
                  titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
                },
                timeGridWeek: {
                  titleFormat: { year: 'numeric', month: 'long' }
                }
              }}
              datesSet={handleDatesSet}
            />
          </div>
        </div>
        
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
