import React, { useMemo } from 'react';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

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

  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200 sm:hidden overflow-x-auto">
      <div className="flex-1 flex justify-between mx-2 min-w-0">
        {weekDates.map((date) => {
          const isSelected =
            date.toDateString() === selectedDate.toDateString();
          return (
            <div key={date.toISOString()} className="flex flex-col items-center mx-1 flex-shrink-0">
              <span className="text-xs text-gray-600">{weekDays[date.getDay()]}</span>
              <span className="text-xs text-gray-500">{months[date.getMonth()]}</span>
              <button
                className={`rounded-full w-8 h-8 flex items-center justify-center mt-1 transition-all focus:outline-none ${
                  isSelected
                    ? 'bg-amber-900 text-white font-bold scale-110 shadow-lg'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
                onClick={() => onChange(date)}
              >
                {String(date.getDate()).padStart(2, '0')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 