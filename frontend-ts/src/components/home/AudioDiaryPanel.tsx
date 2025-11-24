'use client';

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { useEffect, useState } from 'react';

dayjs.locale('ja');

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
}

interface AudioDiaryPanelProps {
  currentMonth?: dayjs.Dayjs;
  onMonthChange?: (month: dayjs.Dayjs) => void;
}

export default function AudioDiaryPanel({
  currentMonth: externalCurrentMonth,
  onMonthChange,
}: AudioDiaryPanelProps) {
  const [selectedDiaryDate, setSelectedDiaryDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(externalCurrentMonth || dayjs());

  // 認証状態を確認
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('google_access_token');
      const refreshToken = localStorage.getItem('google_refresh_token');
      setIsAuthenticated(!!(accessToken && refreshToken));
    }
  }, []);

  // 予定を読み込む
  useEffect(() => {
    const loadEvents = async () => {
      if (!isAuthenticated) return;

      const accessToken = localStorage.getItem('google_access_token');
      const refreshToken = localStorage.getItem('google_refresh_token');

      if (!accessToken || !refreshToken) return;

      setLoading(true);
      try {
        const timeMin = currentMonth.startOf('month').toISOString();
        const timeMax = currentMonth.endOf('month').toISOString();
        const response = await fetch(
          `/api/calendar/events?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&timeMin=${timeMin}&timeMax=${timeMax}`
        );
        const data = await response.json();
        if (response.ok) {
          setEvents(data);
        }
      } catch {
        // エラーは無視
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentMonth, isAuthenticated]);

  // 外部のcurrentMonthが変更されたら更新
  useEffect(() => {
    if (externalCurrentMonth) {
      setCurrentMonth(externalCurrentMonth);
    }
  }, [externalCurrentMonth]);

  // すべてのAudioDiary予定を取得（フィルタリングなし）
  const getAllAudioDiaryEvents = () => {
    return events.filter((event) => {
      // 予定名が「AudioDiary」を含むものを抽出
      if (!event.summary || !event.summary.includes('AudioDiary')) {
        return false;
      }
      return true;
    });
  };

  // AudioDiaryの予定を取得（選択された日付または現在の月に基づく）
  const getAudioDiaryEvents = () => {
    const allAudioDiaryEvents = getAllAudioDiaryEvents();
    
    // 特定の日付が選択されている場合は、その日の予定のみを返す
    if (selectedDiaryDate) {
      const targetDate = dayjs(selectedDiaryDate);
      return allAudioDiaryEvents.filter((event) => {
        if (event.start.date) {
          // 終日の予定
          const startDate = dayjs(event.start.date);
          const endDate = event.end.date ? dayjs(event.end.date) : startDate;
          return targetDate.isSameOrAfter(startDate, 'day') && targetDate.isBefore(endDate, 'day');
        } else if (event.start.dateTime) {
          // 通常の予定
          const eventDate = dayjs(event.start.dateTime);
          return eventDate.isSame(targetDate, 'day');
        }
        return false;
      });
    }

    // 選択されていない場合は、現在の月の範囲内かチェック
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');

    return allAudioDiaryEvents.filter((event) => {
      if (event.start.date) {
        // 終日の予定
        const startDate = dayjs(event.start.date);
        const endDate = event.end.date ? dayjs(event.end.date) : startDate;
        return (
          (startDate.isSameOrAfter(startOfMonth, 'day') && startDate.isSameOrBefore(endOfMonth, 'day')) ||
          (endDate.isSameOrAfter(startOfMonth, 'day') && endDate.isSameOrBefore(endOfMonth, 'day')) ||
          (startDate.isBefore(startOfMonth, 'day') && endDate.isAfter(endOfMonth, 'day'))
        );
      } else if (event.start.dateTime) {
        // 通常の予定
        const eventDate = dayjs(event.start.dateTime);
        return eventDate.isSameOrAfter(startOfMonth, 'day') && eventDate.isSameOrBefore(endOfMonth, 'day');
      }
      return false;
    });
  };

  // AudioDiaryの予定を日付ごとにグループ化
  const getAudioDiaryEventsByDate = () => {
    const audioDiaryEvents = getAudioDiaryEvents();
    const grouped: { [key: string]: CalendarEvent[] } = {};

    audioDiaryEvents.forEach((event) => {
      let dateKey: string;
      if (event.start.date) {
        // 終日の予定
        dateKey = event.start.date;
      } else if (event.start.dateTime) {
        // 通常の予定
        dateKey = dayjs(event.start.dateTime).format('YYYY-MM-DD');
      } else {
        return;
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // 日付順にソート
    return Object.keys(grouped)
      .sort()
      .map((dateKey) => ({
        date: dateKey,
        events: grouped[dateKey],
      }));
  };

  // 初期状態で最初のAudioDiary予定の日付を設定
  useEffect(() => {
    if (!selectedDiaryDate && events.length > 0) {
      const allAudioDiaryEvents = events.filter((event) => {
        return event.summary && event.summary.includes('AudioDiary');
      });
      if (allAudioDiaryEvents.length > 0) {
        // 最初の予定の日付を取得
        const firstEvent = allAudioDiaryEvents[0];
        let firstDate: string;
        if (firstEvent.start.date) {
          firstDate = firstEvent.start.date;
        } else if (firstEvent.start.dateTime) {
          firstDate = dayjs(firstEvent.start.dateTime).format('YYYY-MM-DD');
        } else {
          return;
        }
        setSelectedDiaryDate(firstDate);
      }
    }
  }, [events, selectedDiaryDate]);

  // 日付変更時の処理
  const handleDateChange = (newDate: dayjs.Dayjs) => {
    setSelectedDiaryDate(newDate.format('YYYY-MM-DD'));
    // 月が変わった場合は親コンポーネントに通知
    if (newDate.month() !== currentMonth.month()) {
      setCurrentMonth(newDate);
      if (onMonthChange) {
        onMonthChange(newDate);
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
        {/* 日付ナビゲーション */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              size="small"
              onClick={() => {
                if (!selectedDiaryDate) return;
                const current = dayjs(selectedDiaryDate);
                const prevDate = current.subtract(1, 'day');
                handleDateChange(prevDate);
              }}
              disabled={!selectedDiaryDate}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={600} sx={{ minWidth: 150, textAlign: 'center' }}>
              {selectedDiaryDate
                ? dayjs(selectedDiaryDate).format('YYYY年M月D日')
                : getAudioDiaryEventsByDate()[0]?.date
                ? dayjs(getAudioDiaryEventsByDate()[0].date).format('YYYY年M月D日')
                : '日記を選択'}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                if (!selectedDiaryDate) return;
                const current = dayjs(selectedDiaryDate);
                const nextDate = current.add(1, 'day');
                handleDateChange(nextDate);
              }}
              disabled={!selectedDiaryDate}
            >
              <ChevronRightIcon />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TodayIcon />}
              onClick={() => {
                const today = dayjs();
                handleDateChange(today);
              }}
            >
              今日
            </Button>
          </Box>
        </Box>

        {/* AudioDiaryの予定がない場合 */}
        {getAudioDiaryEvents().length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
              {selectedDiaryDate
                ? `${dayjs(selectedDiaryDate).format('YYYY年M月D日')}のAudioDiaryはありません`
                : 'AudioDiaryはありません'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
            {getAudioDiaryEventsByDate().map(({ date, events: dateEvents }) => (
              <Box
                key={date}
                sx={{
                  borderLeft: '4px solid',
                  borderColor: 'secondary.main',
                  pl: 2,
                  pb: 2,
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1.5,
                    display: 'block',
                  }}
                >
                  {dayjs(date).format('M月D日')}
                </Typography>
                {dateEvents.map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.15)',
                        borderColor: 'secondary.light',
                      },
                    }}
                  >
                    {event.description ? (
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.8,
                          color: 'text.primary',
                          fontSize: '0.9375rem',
                        }}
                      >
                        {event.description}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        内容がありません
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

