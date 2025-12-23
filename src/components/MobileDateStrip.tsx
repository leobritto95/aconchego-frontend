import React, { useMemo, useCallback } from 'react';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function getWeekDates(centerDate: Date) {
  const start = new Date(centerDate);
  start.setDate(centerDate.getDate() - centerDate.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

interface MobileDateStripProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const MobileDateStrip: React.FC<MobileDateStripProps> = ({ selectedDate, onChange }) => {
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck.getTime() === today.getTime();
  }, []);

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-white px-2 py-1 sm:hidden overflow-x-auto scrollbar-hide border-b border-amber-200/50">
      <div className="flex-1 flex justify-between min-w-0 gap-1">
        {weekDates.map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const today = isToday(date);
          return (
            <div key={date.toISOString()} className="flex flex-col items-center flex-shrink-0 min-w-[40px]">
              <span className={`text-[8px] font-bold mb-0.5 uppercase ${isSelected ? 'text-amber-900' : 'text-gray-600'}`}>
                {weekDays[date.getDay()]}
              </span>
              <button
                className={`
                  rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-200 
                  focus:outline-none focus:ring-2 focus:ring-amber-300 active:scale-90
                  ${isSelected
                    ? 'bg-gradient-to-br from-amber-900 to-amber-800 text-white font-bold shadow-md scale-105 ring-1 ring-amber-300'
                    : today
                    ? 'bg-amber-200 text-amber-900 font-bold shadow-sm hover:bg-amber-300'
                    : 'text-amber-900 hover:bg-amber-100 active:bg-amber-200'
                  }
                `}
                onClick={() => onChange(date)}
              >
                <span className="text-xs font-bold">
                  {date.getDate()}
                </span>
              </button>
              {today && !isSelected && (
                <div className="w-1 h-1 bg-amber-600 rounded-full mt-0.5"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 