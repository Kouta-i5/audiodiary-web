'use client';

import {
  Book as BookIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography
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
  const [isSwiping, setIsSwiping] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // 日記データを読み込む
  const loadDiaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDiaries();
      console.log('取得した日記データ:', data);
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

    const days: (Dayjs | null)[] = [];
    let day = startOfCalendar;

    while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }

    return days;
  };

  // 前月に移動
  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  // 翌月に移動
  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  // 日付を選択
  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
  };

  // 前の日付に移動
  const handlePrevDate = () => {
    setSelectedDate(prev => prev.subtract(1, 'day'));
  };

  // 次の日付に移動
  const handleNextDate = () => {
    setSelectedDate(prev => prev.add(1, 'day'));
  };

  // スワイプ処理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isEnoughDistance = Math.abs(distance) > 50;

    if (isEnoughDistance) {
      if (distance > 0) {
        // 上スワイプ - 次の日付
        handleNextDate();
      } else {
        // 下スワイプ - 前の日付
        handlePrevDate();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };

  const calendarDays = generateCalendarDays();
  const selectedDiary = getDiaryForDate(selectedDate);

  return (
    <Container maxWidth="lg" sx={{ height: '100%', py: 3 }}>
      <Stack spacing={4} sx={{ height: '100%' }}>
        {/* カレンダーセクション */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: 'primary.50' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <CalendarIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold" color="primary">
              カレンダー
            </Typography>
          </Stack>

          {/* 月ナビゲーション */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <IconButton onClick={handlePrevMonth} color="primary">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              {currentMonth.format('YYYY年 M月')}
            </Typography>
            <IconButton onClick={handleNextMonth} color="primary">
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          {/* 曜日ヘッダー */}
          <Stack direction="row" sx={{ mb: 1 }}>
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <Box key={day} sx={{ flex: 1, p: 1, textAlign: 'center' }}>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  color={day === '日' ? 'error.main' : day === '土' ? 'primary.main' : 'text.primary'}
                >
                  {day}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* カレンダーグリッド */}
          <Stack direction="row" flexWrap="wrap">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <Box key={`empty-${index}`} sx={{ flex: 1, minHeight: 48 }} />;
              }

              const isCurrentMonth = day.month() === currentMonth.month();
              const isSelected = day.isSame(selectedDate, 'day');
              const isToday = day.isSame(dayjs(), 'day');
              const hasDiary = getDiaryForDate(day);

              return (
                <Box key={day.format('YYYY-MM-DD')} sx={{ flex: 1 }}>
                  <Button
                    fullWidth
                    onClick={() => handleDateClick(day)}
                    sx={{
                      minHeight: 48,
                      position: 'relative',
                      color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover'
                      },
                      border: isToday ? 2 : 0,
                      borderColor: 'primary.main',
                      fontWeight: isToday ? 'bold' : 'normal'
                    }}
                  >
                    <Stack alignItems="center" spacing={0.5}>
                      <Typography variant="body2">
                        {day.date()}
                      </Typography>
                      {hasDiary && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: isSelected ? 'primary.contrastText' : 'primary.main'
                          }}
                        />
                      )}
                    </Stack>
                  </Button>
                </Box>
              );
            })}
          </Stack>
        </Paper>

        <Divider />

        {/* 日記セクション */}
        <Paper elevation={3} sx={{ flex: 1, p: 4, borderRadius: 3, bgcolor: 'secondary.50' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <BookIcon color="secondary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold" color="secondary">
              日記
            </Typography>
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 200 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Box
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              sx={{ height: '100%' }}
            >
              <Card
                elevation={isSwiping ? 2 : 4}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  transform: isSwiping ? 'scale(0.98)' : 'scale(1)',
                  height: 'auto'
                }}
              >
                {/* 日付ヘッダー */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                  <IconButton
                    onClick={handlePrevDate}
                    color="primary"
                    size="small"
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {selectedDate.format('YYYY年 M月 D日 (dddd)')}
                  </Typography>
                  
                  <IconButton
                    onClick={handleNextDate}
                    color="primary"
                    size="small"
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Stack>

                {/* 日記内容 */}
                {selectedDiary ? (
                  <Stack spacing={3}>
                    {/* 要約 */}
                    <Paper elevation={1} sx={{ p: 3, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <BookIcon color="primary" sx={{ fontSize: 32, mt: 0.5 }} />
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                            要約
                          </Typography>
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {selectedDiary.summary}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>

                    {/* コンテキスト */}
                    {selectedDiary.context && selectedDiary.context.length > 0 && (
                      <Paper elevation={1} sx={{ p: 3, bgcolor: 'secondary.50', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" color="secondary" sx={{ mb: 2 }}>
                          コンテキスト
                        </Typography>
                        <Stack spacing={2}>
                          {selectedDiary.context.map((ctx, index) => (
                            <Box key={index}>
                              <Typography variant="subtitle2" fontWeight="semibold" color="text.secondary">
                                {ctx.date}
                              </Typography>
                              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                                {ctx.time_of_day && (
                                  <Chip label={`時間: ${ctx.time_of_day}`} size="small" />
                                )}
                                {ctx.location && (
                                  <Chip label={`場所: ${ctx.location}`} size="small" />
                                )}
                                {ctx.companion && (
                                  <Chip label={`同伴: ${ctx.companion}`} size="small" />
                                )}
                                {ctx.mood && (
                                  <Chip label={`気分: ${ctx.mood}`} size="small" />
                                )}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                ) : (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ py: 8 }}
                  >
                    <BookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" textAlign="center">
                      この日の日記はありません
                    </Typography>
                    <Typography variant="body2" color="text.disabled" textAlign="center" sx={{ mt: 1 }}>
                      日記を作成して記録を残しましょう
                    </Typography>
                  </Box>
                )}
              </Card>
            </Box>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
