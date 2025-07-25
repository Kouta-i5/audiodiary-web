'use client';

import { useState, useEffect, useRef } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { fetchDiaries } from '../../utils/api';
import { DiaryResponse } from '../../utils/schemas';
import { FaCalendarAlt, FaBookOpen, FaClock, FaMapMarkerAlt, FaUserFriends, FaSmile } from 'react-icons/fa';

export default function CalendarPanel() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [diaries, setDiaries] = useState<DiaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDiaries = async () => {
      try {
        setLoading(true);
        const data = await fetchDiaries();
        console.log('取得した日記データ:', data);
        setDiaries(data);
        setError(null);
      } catch (err) {
        setError('日記の読み込みに失敗しました');
        console.error('日記読み込みエラー:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDiaries();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !isSwiping) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && selectedDate) {
      const nextDate = selectedDate.add(1, 'day');
      setSelectedDate(nextDate);
      if (nextDate.month() !== currentMonth.month()) {
        setCurrentMonth(nextDate);
      }
    } else if (isDownSwipe && selectedDate) {
      const prevDate = selectedDate.subtract(1, 'day');
      setSelectedDate(prevDate);
      if (prevDate.month() !== currentMonth.month()) {
        setCurrentMonth(prevDate);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };

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

  const handlePrevDate = () => {
    if (!selectedDate) return;
    const prevDate = selectedDate.subtract(1, 'day');
    setSelectedDate(prevDate);
    if (prevDate.month() !== currentMonth.month()) {
      setCurrentMonth(prevDate);
    }
  };

  const handleNextDate = () => {
    if (!selectedDate) return;
    const nextDate = selectedDate.add(1, 'day');
    setSelectedDate(nextDate);
    if (nextDate.month() !== currentMonth.month()) {
      setCurrentMonth(nextDate);
    }
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

  const getDiaryForDate = (date: Dayjs) => {
    return diaries.find(diary => {
      const diaryDate = dayjs(diary.date);
      return diaryDate.isSame(date, 'day');
    });
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
      const hasDiary = getDiaryForDate(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            h-12  rounded-xl
            flex items-center justify-center
            text-base font-medium
            transition-all duration-200
            relative
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
          {hasDiary && (
            <span className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full"></span>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl p-6">  
      {/* カレンダーセクション */}
      <section className="bg-white/95 shadow-2xl rounded-2xl p-6 mb-6 border border-blue-100 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-6 -left-6 opacity-10 text-blue-400 text-8xl pointer-events-none select-none">
          <FaCalendarAlt />
        </div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold mb-4 text-blue-700 border-b-2 border-blue-100 pb-2">
          <FaCalendarAlt className="text-blue-400" /> カレンダー
        </h2>
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
            <div key={day} className="text-sm font-semibold text-gray-500 text-center">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {generateCalendarDays()}
        </div>
      </section>
      {/* 日記セクション */}
      <section className="bg-gradient-to-br from-white via-blue-50 to-green-50 rounded-2xl shadow-xl p-6 mb-6 ßborder border-green-100 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 opacity-10 text-green-400 text-8xl pointer-events-none select-none">
          <FaBookOpen />ß
        </div>
        <h2 className="flex items-center gap-2 text-lg font-extrabold mb-2 text-green-700 border-b border-green-100 pb-1">
          <FaBookOpen className="text-green-400" /> 日記
        </h2>
        <div
          ref={containerRef}
          className="w-full flex items-start justify-start"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {selectedDate && (
            <div className={`
              card bg-white/95 shadow-2xl rounded-2xl p-4 border border-base-200
              transition-all duration-300 h-auto w-full  relative
              ${isSwiping ? 'scale-95' : 'scale-100'}
            `}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevDate}
                  className="btn btn-circle btn-sm bg-blue-50 hover:bg-blue-100 shadow border border-blue-200 hover:border-blue-400 text-blue-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-bold text-blue-700 tracking-wide">
                  {selectedDate.format('YYYY年MM月DD日')}の日記
                </h3>
                <button
                  onClick={handleNextDate}
                  className="btn btn-circle btn-sm bg-blue-50 hover:bg-blue-100 shadow border border-blue-200 hover:border-blue-400 text-blue-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : error ? (
                <div className="text-error">{error}</div>
              ) : (() => {
                const diary = getDiaryForDate(selectedDate);
                if (!diary) {
                  return (
                    <div className="text-center text-gray-400 py-8 text-lg">
                      この日の日記はありません
                    </div>
                  );
                }
                return (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 flex items-start gap-4">
                      <FaBookOpen className="text-blue-400 text-3xl mt-1" />
                      <div>
                        <h4 className="font-semibold mb-3 text-blue-700 text-xl">要約</h4>
                        <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">{diary.summary}</p>
                      </div>
                    </div>
                    {diary.context && diary.context[0] && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-2">
                          <FaClock className="text-green-400" />
                          <div>
                            <div className="font-semibold text-green-700">時間帯</div>
                            <div className="text-gray-700">{diary.context[0].time_of_day}</div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-green-400" />
                          <div>
                            <div className="font-semibold text-green-700">場所</div>
                            <div className="text-gray-700">{diary.context[0].location}</div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-2">
                          <FaUserFriends className="text-green-400" />
                          <div>
                            <div className="font-semibold text-green-700">一緒にいた人</div>
                            <div className="text-gray-700">{diary.context[0].companion}</div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-2">
                          <FaSmile className="text-green-400" />
                          <div>
                            <div className="font-semibold text-green-700">気分</div>
                            <div className="text-gray-700">{diary.context[0].mood}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}