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

  const handlePrev = () => {
    const prev = new Date(selectedDate);
    prev.setDate(selectedDate.getDate() - 7);
    onChange(prev);
  };
  const handleNext = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 7);
    onChange(next);
  };

  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200 sm:hidden overflow-x-auto">
      <button onClick={handlePrev} className="text-gray-500 px-2 text-xl flex-shrink-0">&#60;</button>
      <div className="flex-1 flex justify-between mx-2 min-w-0">
        {weekDates.map((date) => {
          const isSelected =
            date.toDateString() === selectedDate.toDateString();
          return (
            <div key={date.toISOString()} className="flex flex-col items-center mx-1 flex-shrink-0">
              <span className="text-xs text-gray-600">{weekDays[date.getDay()]}</span>
              <span className="text-xs text-gray-500">{months[date.getMonth()]}</span>
              <button
                className={`rounded-full w-8 h-8 flex items-center justify-center mt-1 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  isSelected
                    ? 'bg-purple-600 text-white font-bold scale-110 shadow-lg'
                    : 'text-purple-800 hover:bg-gray-100'
                }`}
                onClick={() => onChange(date)}
              >
                {String(date.getDate()).padStart(2, '0')}
              </button>
            </div>
          );
        })}
      </div>
      <button onClick={handleNext} className="text-gray-500 px-2 text-xl flex-shrink-0">&#62;</button>
    </div>
  );
}; 