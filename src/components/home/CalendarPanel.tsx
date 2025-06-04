'use client';

import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

export default function CalendarPanel() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(currentMonth.year(year));
  };

  // 現在の年から前後10年分の年リストを生成
  const generateYearOptions = () => {
    const currentYear = dayjs().year();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const generateCalendarDays = () => {
    const daysInMonth = currentMonth.daysInMonth();
    const firstDayOfMonth = currentMonth.startOf('month');
    const startingDayOfWeek = firstDayOfMonth.day();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentMonth.date(day);
      const isSelected = selectedDate?.isSame(date, 'day');
      const isToday = date.isSame(dayjs(), 'day');

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            h-12 w-12 rounded-xl
            flex items-center justify-center
            text-base font-medium
            transition-all duration-200
            ${isSelected 
              ? 'bg-primary/20 text-primary ring-2 ring-primary shadow-lg scale-105' 
              : 'hover:bg-accent/10 hover:scale-105'
            }
            ${isToday && !isSelected 
              ? 'ring-2 ring-accent/60 bg-accent/10' 
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
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl p-6">
      <div className="card bg-white/90 shadow-xl rounded-2xl p-6 border border-base-200 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-3 rounded-xl">
              <span className="text-3xl">📅</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={currentMonth.year()}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="select select-bordered select-sm w-28 bg-white/90 border-accent/20 focus:border-accent/40 focus:ring-2 focus:ring-accent/20 rounded-xl font-semibold text-gray-700 text-xl"
              >
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
              <h2 className="card-title text-xl font-extrabold text-gray-700">
                {currentMonth.format('MMMM')}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="btn btn-ghost btn-sm rounded-xl hover:bg-accent/10 hover:text-accent transition-all duration-200"
              aria-label="前月"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleNextMonth}
              className="btn btn-ghost btn-sm rounded-xl hover:bg-accent/10 hover:text-accent transition-all duration-200"
              aria-label="次月"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <div key={day} className="text-sm font-semibold text-gray-500">
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