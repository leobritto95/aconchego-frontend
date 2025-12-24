import { FiX, FiXCircle, FiCalendar, FiCheckCircle, FiClock, FiCheck, FiMessageSquare } from "react-icons/fi";
import { Class, ScheduleTime } from "../types";
import { DAY_NAMES } from "../utils/constants";
import { formatDate, getDateBadgeInfo } from "../utils/dateUtils";

interface ClassDateInfo {
  date: Date;
  dayOfWeek: number;
  schedule?: ScheduleTime;
  badgeInfo: ReturnType<typeof getDateBadgeInfo>;
}

interface CreateExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: Class;
  upcomingClassDates: ClassDateInfo[];
  selectedClassDate: string | null;
  newExceptionReason: string;
  onSelectClassDate: (date: Date) => void;
  onReasonChange: (reason: string) => void;
  onCreateException: () => void;
  isPending: boolean;
}

export function CreateExceptionModal({
  isOpen,
  onClose,
  selectedClass,
  upcomingClassDates,
  selectedClassDate,
  newExceptionReason,
  onSelectClassDate,
  onReasonChange,
  onCreateException,
  isPending,
}: CreateExceptionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-[110] animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg md:rounded-xl shadow-2xl p-4 md:p-6 max-w-md w-full animate-in zoom-in-95 relative z-[111]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <FiXCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Adicionar Cancelamento</h3>
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
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FiCalendar className="w-4 h-4 text-amber-600" />
              Selecione uma aula para cancelar <span className="text-red-500">*</span>
            </label>
            
            {upcomingClassDates.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                <FiCalendar className="mx-auto text-gray-300 mb-2 w-8 h-8" />
                <p className="text-sm text-gray-600">Não há aulas futuras disponíveis para cancelar</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {upcomingClassDates.map((classDate) => {
                  const dateStr = classDate.date.toISOString().split("T")[0];
                  const isSelected = selectedClassDate === dateStr;
                  const dayName = DAY_NAMES[classDate.dayOfWeek];
                  const schedule = classDate.schedule;
                  const badgeInfo = classDate.badgeInfo;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => onSelectClassDate(classDate.date)}
                      disabled={isPending}
                      className={`w-full text-left p-3 md:p-3.5 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-200"
                          : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-amber-500" : "bg-gray-100"
                          }`}>
                            <FiCalendar className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-600"}`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm md:text-base">
                              {formatDate(classDate.date)}
                            </p>
                            <span className="text-xs text-gray-600 font-medium">
                              {dayName}
                            </span>
                            {badgeInfo.type && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeInfo.className}`}>
                                {badgeInfo.label}
                              </span>
                            )}
                          </div>
                          {schedule ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <FiClock className="w-3.5 h-3.5" />
                              <span>{schedule.startTime} - {schedule.endTime}</span>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">Sem horário definido</p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                              <FiCheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label htmlFor="exceptionReason" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FiMessageSquare className="w-4 h-4 text-amber-600" />
              Motivo do cancelamento <span className="text-gray-500 text-xs font-normal">(opcional)</span>
            </label>
            <textarea
              id="exceptionReason"
              value={newExceptionReason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 md:px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
              placeholder="Ex: Feriado, professor ausente, manutenção..."
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              onClick={onCreateException}
              disabled={isPending || !selectedClassDate}
              className="px-4 py-2.5 text-sm font-medium text-white bg-amber-900 rounded-lg hover:bg-amber-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Confirmar cancelamento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

