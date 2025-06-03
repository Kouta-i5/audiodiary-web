'use client';

import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

export default function CalendarPanel() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const generateCalendarDays = () => {
    const today = dayjs();
    const daysInMonth = today.daysInMonth();
    const firstDayOfMonth = today.startOf('month');
    const startingDayOfWeek = firstDayOfMonth.day();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = today.date(day);
      const isSelected = selectedDate?.isSame(date, 'day');
      const isToday = date.isSame(dayjs(), 'day');

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            h-12 w-12 rounded-full
            flex items-center justify-center
            text-base font-medium
            transition-all duration-200
            ${isSelected 
              ? 'bg-accent text-white shadow-lg scale-110' 
              : 'hover:bg-base-200 hover:scale-105'
            }
            ${isToday && !isSelected 
              ? 'ring-2 ring-accent/60' 
              : ''
            }
            ${date.day() === 0 ? 'text-red-500' : ''}
            ${date.day() === 6 ? 'text-blue-500' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-base-100 via-base-200 to-base-100 rounded-2xl shadow-2xl p-6">
      <div className="card bg-white/80 shadow-lg rounded-xl p-6 border border-base-200">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📅</span>
          <h2 className="card-title text-xl font-extrabold text-gray-700">
            {selectedDate?.format('YYYY年 MMMM')}
          </h2>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <div key={day} className="text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {generateCalendarDays()}
        </div>
      </div>
    </div>
  );
}