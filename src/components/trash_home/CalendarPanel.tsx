'use client';

import {
  Book as BookIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchDiaries } from '../../utils/api';
import { DiaryResponse } from '../../utils/schemas';

export default function CalendarPanel() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [diaries, setDiaries] = useState<DiaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 日記データを読み込む
  const loadDiaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDiaries();
      setDiaries(data);
    } catch (err) {
      console.error('日記データの読み込みエラー:', err);
      setError('日記データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiaries();
  }, []);

  // 指定された日付の日記を取得
  const getDiaryForDate = (date: Dayjs): DiaryResponse | undefined => {
    return diaries.find(diary => dayjs(diary.date).isSame(date, 'day'));
  };

  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startOfCalendar = startOfMonth.startOf('week');
    const endOfCalendar = endOfMonth.endOf('week');

    const days: Dayjs[] = [];
    let day = startOfCalendar;

    while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const handlePrevDate = () => {
    setSelectedDate(prev => prev.subtract(1, 'day'));
  };

  const handleNextDate = () => {
    setSelectedDate(prev => prev.add(1, 'day'));
  };

  const selectedDiary = getDiaryForDate(selectedDate);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, gap: 3 }}>
      {/* カレンダー */}
      <Paper elevation={1} sx={{ p: 3 }}>
        {/* カレンダーヘッダー */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            {currentMonth.format('YYYY年 M月')}
          </Typography>
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* 曜日ヘッダー */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
          {weekDays.map((day, idx) => (
            <Typography
              key={idx}
              variant="caption"
              align="center"
              fontWeight={600}
              color={idx === 0 ? 'error.main' : idx === 6 ? 'primary.main' : 'text.secondary'}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* カレンダー本体 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 256 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {generateCalendarDays().map((day, idx) => {
              const isCurrentMonth = day.month() === currentMonth.month();
              const isToday = day.isSame(dayjs(), 'day');
              const isSelected = day.isSame(selectedDate, 'day');
              const diary = getDiaryForDate(day);
              const hasDiary = !!diary;

              return (
                <Box
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  sx={{
                    aspectRatio: '1',
                    p: 1,
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: !isCurrentMonth ? 'text.disabled' : isSelected ? 'primary.contrastText' : 'text.primary',
                    bgcolor: isSelected
                      ? 'primary.main'
                      : isToday
                      ? 'primary.light'
                      : 'transparent',
                    fontWeight: isSelected || isToday ? 600 : 400,
                    '&:hover': {
                      bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                    },
                    border: hasDiary ? '2px solid' : 'none',
                    borderColor: hasDiary ? 'success.main' : 'transparent',
                  }}
                >
                  <Typography variant="body2">{day.date()}</Typography>
                  {hasDiary && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* 日記詳細 */}
      <Paper
        elevation={1}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 3,
        }}
      >
        {/* 日付ナビゲーション */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <IconButton onClick={handlePrevDate} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            {selectedDate.format('YYYY年 M月 D日')}
          </Typography>
          <IconButton onClick={handleNextDate} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* 日記内容 */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {selectedDiary ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* メタデータ */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedDiary.time_of_day && (
                  <Chip label={selectedDiary.time_of_day} size="small" color="primary" />
                )}
                {selectedDiary.location && (
                  <Chip label={selectedDiary.location} size="small" color="success" />
                )}
                {selectedDiary.companion && (
                  <Chip label={selectedDiary.companion} size="small" color="secondary" />
                )}
                {selectedDiary.mood && (
                  <Chip label={selectedDiary.mood} size="small" sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }} />
                )}
              </Stack>

              {/* 本文 */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BookIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    日記
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {selectedDiary.content}
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              <BookIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body2">この日の日記はありません</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
