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
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = today.date(day);
      const isSelected = selectedDate?.isSame(date, 'day');
      const isToday = date.isSame(dayjs(), 'day');

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`btn btn-circle btn-sm
            ${isSelected ? 'btn-primary' : 'btn-ghost'}
            ${isToday ? 'ring-2 ring-primary' : ''}
            hover:bg-base-300 transition-colors`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="p-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4">
          <h2 className="card-title justify-center mb-4">
            {selectedDate?.format('YYYY年 MMMM')}
          </h2>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-sm font-semibold">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays()}
          </div>
        </div>
      </div>
    </div>
  );
}