'use client';

import {
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Popover,
  TextField,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useCallback, useEffect, useRef, useState } from 'react';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);
dayjs.locale('ja');

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
}

interface CalendarPanelProps {
  onDateSelect?: (date: string | null) => void;
  onMonthChange?: (month: dayjs.Dayjs) => void;
}

export default function CalendarPanel({ onDateSelect, onMonthChange }: CalendarPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    startDate: '',
    endDate: '',
    location: '',
    isAllDay: false,
  });
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [maxEventsPerDay, setMaxEventsPerDay] = useState(3);
  const calendarGridRef = useRef<HTMLDivElement>(null);
  type ViewMode = 'month' | 'week' | '3day' | 'day';
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // URLパラメータからトークンを取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const accessTokenParam = params.get('access_token');
      const refreshTokenParam = params.get('refresh_token');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(errorParam);
      }

      if (accessTokenParam && refreshTokenParam) {
        setAccessToken(accessTokenParam);
        setRefreshToken(refreshTokenParam);
        setIsAuthenticated(true);
        // URLからパラメータを削除
        window.history.replaceState({}, '', '/dashboard');
      } else {
        // ローカルストレージからトークンを取得
        const storedAccessToken = localStorage.getItem('google_access_token');
        const storedRefreshToken = localStorage.getItem('google_refresh_token');
        if (storedAccessToken && storedRefreshToken) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setIsAuthenticated(true);
        }
      }
    }
  }, []);

  // トークンを保存
  useEffect(() => {
    if (accessToken && refreshToken) {
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_refresh_token', refreshToken);
    }
  }, [accessToken, refreshToken]);

  // Google認証を開始
  const handleGoogleAuth = async () => {
    try {
      window.location.href = '/api/auth/google/login';
    } catch {
      setError('認証の開始に失敗しました');
    }
  };

  // 予定を読み込む
  const loadEvents = useCallback(async (token: string, refresh: string, month?: dayjs.Dayjs) => {
    setLoading(true);
    setError(null);
    try {
      const targetMonth = month || currentMonth;
      const timeMin = targetMonth.startOf('month').toISOString();
      const timeMax = targetMonth.endOf('month').toISOString();
      const response = await fetch(
        `/api/calendar/events?accessToken=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refresh)}&timeMin=${timeMin}&timeMax=${timeMax}`
      );
      const data = await response.json();
      if (response.ok) {
        setEvents(data);
      } else {
        setError(data.error || '予定の取得に失敗しました');
      }
    } catch {
      setError('予定の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  // 月が変更されたときに予定を再読み込み
  useEffect(() => {
    if (isAuthenticated && accessToken && refreshToken) {
      loadEvents(accessToken, refreshToken, currentMonth);
    }
  }, [currentMonth, isAuthenticated, accessToken, refreshToken, loadEvents]);

  // 予定作成ダイアログを開く
  const handleOpenDialog = (event?: CalendarEvent) => {
    if (event) {
      const isAllDay = !event.start.dateTime && !!event.start.date;
      setEditingEvent(event);
      setFormData({
        summary: event.summary,
        description: event.description || '',
        startDateTime: event.start.dateTime ? dayjs(event.start.dateTime).format('YYYY-MM-DDTHH:mm') : '',
        endDateTime: event.end.dateTime ? dayjs(event.end.dateTime).format('YYYY-MM-DDTHH:mm') : '',
        startDate: event.start.date || (event.start.dateTime ? dayjs(event.start.dateTime).format('YYYY-MM-DD') : ''),
        endDate: event.end.date ? dayjs(event.end.date).subtract(1, 'day').format('YYYY-MM-DD') : (event.end.dateTime ? dayjs(event.end.dateTime).format('YYYY-MM-DD') : ''),
        location: event.location || '',
        isAllDay,
      });
    } else {
      setEditingEvent(null);
      const today = dayjs();
      setFormData({
        summary: '',
        description: '',
        startDateTime: today.format('YYYY-MM-DDTHH:mm'),
        endDateTime: today.add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
        startDate: today.format('YYYY-MM-DD'),
        endDate: today.format('YYYY-MM-DD'),
        location: '',
        isAllDay: false,
      });
    }
    setOpenDialog(true);
  };

  // 予定を保存
  const handleSaveEvent = async () => {
    if (!accessToken || !refreshToken) {
      setError('認証が必要です');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let eventData: {
        summary: string;
        description?: string;
        location?: string;
        start: { dateTime?: string; date?: string; timeZone?: string };
        end: { dateTime?: string; date?: string; timeZone?: string };
      };

      if (formData.isAllDay) {
        // 終日の場合は date フィールドを使用
        eventData = {
          summary: formData.summary,
          description: formData.description || undefined,
          location: formData.location || undefined,
          start: {
            date: formData.startDate,
          },
          // 終日の場合は終了日は開始日の翌日（Google Calendarの仕様）
          end: {
            date: dayjs(formData.endDate).add(1, 'day').format('YYYY-MM-DD'),
          },
        };
      } else {
        // 通常の予定は dateTime フィールドを使用
        eventData = {
          summary: formData.summary,
          description: formData.description || undefined,
          location: formData.location || undefined,
          start: {
            dateTime: new Date(formData.startDateTime).toISOString(),
            timeZone: 'Asia/Tokyo',
          },
          end: {
            dateTime: new Date(formData.endDateTime).toISOString(),
            timeZone: 'Asia/Tokyo',
          },
        };
      }

      let response;
      if (editingEvent) {
        // 更新
        response = await fetch('/api/calendar/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken,
            refreshToken,
            eventId: editingEvent.id,
            eventData,
          }),
        });
      } else {
        // 作成
        response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken,
            refreshToken,
            eventData,
          }),
        });
      }

      const data = await response.json();
      if (response.ok) {
        setOpenDialog(false);
        loadEvents(accessToken, refreshToken);
      } else {
        setError(data.error || '予定の保存に失敗しました');
      }
    } catch {
      setError('予定の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 予定を削除
  const handleDeleteEvent = async (eventId: string) => {
    if (!accessToken || !refreshToken) {
      setError('認証が必要です');
      return;
    }

    if (!confirm('この予定を削除しますか？')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/calendar/events?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&eventId=${eventId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      if (response.ok) {
        loadEvents(accessToken, refreshToken);
      } else {
        setError(data.error || '予定の削除に失敗しました');
      }
    } catch {
      setError('予定の削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setEvents([]);
  };

  // 表示範囲の日付配列を生成
  const getVisibleDays = useCallback(() => {
    if (viewMode === 'month') {
      const startOfMonth = currentMonth.startOf('month');
      const endOfMonth = currentMonth.endOf('month');
      const startOfCalendar = startOfMonth.startOf('isoWeek');
      const endOfCalendar = endOfMonth.endOf('isoWeek');
      const days: dayjs.Dayjs[] = [];
      let day = startOfCalendar;
      while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
        days.push(day);
        day = day.add(1, 'day');
      }
      return days;
    }
    if (viewMode === 'week') {
      const start = currentMonth.startOf('isoWeek');
      return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
    }
    if (viewMode === '3day') {
      const start = currentMonth.startOf('day');
      return Array.from({ length: 3 }, (_, i) => start.add(i, 'day'));
    }
    return [currentMonth.startOf('day')];
  }, [currentMonth, viewMode]);

  // 特定の日の予定を取得
  const getEventsForDay = (date: dayjs.Dayjs) => {
    return events.filter((event) => {
      // 終日の予定か通常の予定かを判定
      if (event.start.date) {
        // 終日の予定
        const startDate = dayjs(event.start.date);
        const endDate = event.end.date ? dayjs(event.end.date) : startDate;
        return date.isSameOrAfter(startDate, 'day') && date.isBefore(endDate, 'day');
      } else if (event.start.dateTime) {
        // 通常の予定
        const eventDate = dayjs(event.start.dateTime);
        return eventDate.isSame(date, 'day');
      }
      return false;
    });
  };

  // カレンダーグリッドの高さに応じて予定の表示数を調整
  useEffect(() => {
    const updateMaxEvents = () => {
      if (!calendarGridRef.current) return;

      const gridHeight = calendarGridRef.current.clientHeight;
      const days = getVisibleDays();
      const weekCount = viewMode === 'month' ? Math.ceil(days.length / 7) : 1;
      const availableHeightPerWeek = gridHeight / weekCount;
      const headerHeight = 48; // 曜日ヘッダーの高さ（概算）
      const padding = 8; // パディング
      const dateHeight = 20; // 日付表示の高さ
      
      const availableHeightForEvents = availableHeightPerWeek - headerHeight - padding - dateHeight;
      
      // 予定1件あたりの高さ（フォントサイズ + パディング + gap）
      const eventHeight = 24; // 0.75rem (12px) + py: 0.25 (2px*2) + gap: 0.25
      
      // 表示可能な予定数を計算
      const calculatedMaxEvents = Math.max(1, Math.floor(availableHeightForEvents / eventHeight));
      setMaxEventsPerDay(Math.min(calculatedMaxEvents, 5)); // 最大5件まで
    };

    // 初期実行
    const timer = setTimeout(updateMaxEvents, 0);
    
    const resizeObserver = new ResizeObserver(updateMaxEvents);
    if (calendarGridRef.current) {
      resizeObserver.observe(calendarGridRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [currentMonth, events, viewMode, getVisibleDays]);

  // 日をクリック
  const handleDayClick = (date: dayjs.Dayjs, event: React.MouseEvent<HTMLElement>) => {
    const dayEvents = getEventsForDay(date);
    const dateString = date.format('YYYY-MM-DD');
    setSelectedDate(dateString);
    setSelectedDayEvents(dayEvents);
    setAnchorEl(event.currentTarget);
    // 親コンポーネントに選択された日付を通知
    if (onDateSelect) {
      onDateSelect(dateString);
    }
  };

  // 予定をクリック
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenDialog(event);
    setAnchorEl(null);
  };

  // 前へ
  const handlePrevMonth = () => {
    const step =
      viewMode === 'month' ? { unit: 'month', amount: 1 } :
      viewMode === 'week' ? { unit: 'week', amount: 1 } :
      viewMode === '3day' ? { unit: 'day', amount: 3 } :
      { unit: 'day', amount: 1 } as const;
    const newMonth = currentMonth.subtract(step.amount as number, step.unit as dayjs.ManipulateType);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  // 次へ
  const handleNextMonth = () => {
    const step =
      viewMode === 'month' ? { unit: 'month', amount: 1 } :
      viewMode === 'week' ? { unit: 'week', amount: 1 } :
      viewMode === '3day' ? { unit: 'day', amount: 3 } :
      { unit: 'day', amount: 1 } as const;
    const newMonth = currentMonth.add(step.amount as number, step.unit as dayjs.ManipulateType);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  // 今日に戻る
  const handleToday = () => {
    const today = dayjs();
    setCurrentMonth(today);
    if (onMonthChange) {
      onMonthChange(today);
    }
  };

  // 日付をクリックして予定を作成
  const handleCreateEventForDate = (date: dayjs.Dayjs) => {
    setFormData({
      summary: '',
      description: '',
      startDateTime: date.format('YYYY-MM-DDTHH:mm'),
      endDateTime: date.add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
      startDate: date.format('YYYY-MM-DD'),
      endDate: date.format('YYYY-MM-DD'),
      location: '',
      isAllDay: false,
    });
    setEditingEvent(null);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            GoogleClaendar
          </Typography>
        </Box>
        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              予定を追加
            </Button>
            <Button variant="outlined" onClick={handleLogout}>
              ログアウト
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!isAuthenticated ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Googleカレンダーと連携
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            予定の作成・編集・削除を行うには、Googleアカウントでの認証が必要です。
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoogleAuth}
            sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#357ae8' } }}
          >
            Googleで認証
          </Button>
        </Paper>
      ) : (
        <>
          {/* カレンダーナビゲーション */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handlePrevMonth}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h5" fontWeight={600} sx={{ minWidth: 150, textAlign: 'center' }}>
                {viewMode === 'month' && currentMonth.format('YYYY年M月')}
                {viewMode === 'week' && `${currentMonth.startOf('isoWeek').format('YYYY年M月D日')} - ${currentMonth.endOf('isoWeek').format('M月D日')}`}
                {viewMode === '3day' && `${currentMonth.startOf('day').format('YYYY年M月D日')} - ${currentMonth.startOf('day').add(2, 'day').format('M月D日')}`}
                {viewMode === 'day' && currentMonth.format('YYYY年M月D日')}
              </Typography>
              <IconButton onClick={handleNextMonth}>
                <ChevronRightIcon />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<TodayIcon />}
                onClick={handleToday}
                size="small"
              >
                今日
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant={viewMode === 'month' ? 'contained' : 'outlined'} onClick={() => setViewMode('month')}>
                月
              </Button>
              <Button size="small" variant={viewMode === 'week' ? 'contained' : 'outlined'} onClick={() => setViewMode('week')}>
                週
              </Button>
              <Button size="small" variant={viewMode === '3day' ? 'contained' : 'outlined'} onClick={() => setViewMode('3day')}>
                3日
              </Button>
              <Button size="small" variant={viewMode === 'day' ? 'contained' : 'outlined'} onClick={() => setViewMode('day')}>
                日
              </Button>
            </Box>
          </Box>

          {/* カレンダーグリッド */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <Paper
              elevation={2}
              sx={{
                overflowY: 'auto',
                overflowX: 'hidden',
                width: '100%',
                maxWidth: '1400px',
                height: '100%',
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
            {/* ヘッダー */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${viewMode === 'month' ? 7 : getVisibleDays().length}, 1fr)`,
                borderBottom: 2,
                borderColor: 'divider',
                background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                width: '100%',
                flexShrink: 0,
              }}
            >
              {(viewMode === 'month'
                ? ['月', '火', '水', '木', '金', '土', '日']
                : getVisibleDays().map(d => `${d.format('M/D')}(${['日','月','火','水','木','金','土'][d.day()]})`)
              ).map((label, index) => (
                <Box
                  key={`${label}-${index}`}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: (
                      viewMode === 'month'
                        ? (index === 6 ? 'error.main' : index === 5 ? 'primary.main' : 'text.primary')
                        : (getVisibleDays()[index].day() === 0
                            ? 'error.main'
                            : getVisibleDays()[index].day() === 6
                              ? 'primary.main'
                              : 'text.primary')
                    ),
                    minWidth: 0,
                    overflow: 'hidden',
                    letterSpacing: '0.05em',
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>

            {/* カレンダー日付グリッド */}
            {loading && events.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, flex: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                ref={calendarGridRef}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${viewMode === 'month' ? 7 : getVisibleDays().length}, minmax(0, 1fr))`,
                  gridAutoRows: '1fr',
                  gap: 0.5,
                  p: 0.5,
                  width: '100%',
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {getVisibleDays().map((date, index) => {
                  const isCurrentMonth = date.month() === currentMonth.month();
                  const isToday = date.isSame(dayjs(), 'day');
                  const dayEvents = getEventsForDay(date);
                  const dayOfWeek = date.day();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <Box
                      key={index}
                      onClick={(e) => handleDayClick(date, e)}
                      sx={{
                        minHeight: 0,
                        minWidth: 0,
                        width: '100%',
                        height: '100%',
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: isCurrentMonth
                          ? isToday
                            ? 'rgba(25, 118, 210, 0.04)'
                            : 'background.paper'
                          : viewMode === 'month' ? 'grey.50' : 'background.paper',
                        p: 0.75,
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: isToday ? 'rgba(25, 118, 210, 0.08)' : 'action.hover',
                          transform: 'scale(1.01)',
                          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                          zIndex: 1,
                        },
                      }}
                    >
                      {/* 日付 */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday ? 700 : 400,
                          color: isToday
                            ? 'primary.main'
                            : isWeekend && isCurrentMonth
                            ? dayOfWeek === 0
                              ? 'error.main'
                              : 'primary.main'
                            : isCurrentMonth
                            ? 'text.primary'
                            : 'text.disabled',
                          mb: 0.5,
                        }}
                      >
                        {date.date()}
                      </Typography>

                      {/* 予定リスト */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, width: '100%', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        {dayEvents.slice(0, maxEventsPerDay).map((event) => {
                          const isAllDay = !event.start.dateTime && !!event.start.date;
                          const isAudioDiary = event.summary?.includes('AudioDiary');
                          const timeText = isAllDay ? '終日' : dayjs(event.start.dateTime).format('HH:mm');
                          
                          // イベントIDに基づいて色を決定（Google Calendar風の24色）
                          const eventColors = [
                            { bg: '#4285f4', hover: '#3367d6' }, // 青
                            { bg: '#34a853', hover: '#2e7d32' }, // 緑
                            { bg: '#fbbc04', hover: '#f9ab00' }, // 黄色
                            { bg: '#ea4335', hover: '#d33b2c' }, // 赤
                            { bg: '#9c27b0', hover: '#7b1fa2' }, // 紫
                            { bg: '#ff9800', hover: '#f57c00' }, // オレンジ
                            { bg: '#00acc1', hover: '#0097a7' }, // シアン
                            { bg: '#8bc34a', hover: '#7cb342' }, // ライトグリーン
                            { bg: '#ff5722', hover: '#e64a19' }, // ディープオレンジ
                            { bg: '#607d8b', hover: '#546e7a' }, // ブルーグレー
                            { bg: '#e91e63', hover: '#c2185b' }, // ピンク
                            { bg: '#3f51b5', hover: '#303f9f' }, // インディゴ
                          ];
                          
                          // AudioDiaryは特別な色
                          let eventColor = isAudioDiary
                            ? { bg: '#6366f1', hover: '#4f46e5' } // インディゴ系
                            : eventColors[Math.abs(event.id.charCodeAt(0) % eventColors.length)];
                          
                          // 終日イベントは少し濃く
                          if (isAllDay && !isAudioDiary) {
                            eventColor = { bg: '#1a73e8', hover: '#1557b0' };
                          }
                          
                          return (
                            <Box
                              key={event.id}
                              onClick={(e) => handleEventClick(event, e)}
                              sx={{
                                bgcolor: eventColor.bg,
                                color: 'white',
                                px: 0.75,
                                py: 0.35,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                width: '100%',
                                minWidth: 0,
                                maxWidth: '100%',
                                transition: 'all 0.2s ease',
                                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                  bgcolor: eventColor.hover,
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
                                },
                              }}
                              title={`${timeText} ${event.summary}`}
                            >
                              {timeText} {event.summary}
                            </Box>
                          );
                        })}
                        {dayEvents.length > maxEventsPerDay && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              px: 0.5,
                              fontSize: '0.7rem',
                              mt: 'auto',
                            }}
                          >
                            他{dayEvents.length - maxEventsPerDay}件
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          {/* 日付クリック時のポップオーバー */}
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 2, minWidth: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedDate && dayjs(selectedDate).format('YYYY年M月D日')}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (selectedDate) {
                      handleCreateEventForDate(dayjs(selectedDate));
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              {selectedDayEvents.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  予定がありません
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedDayEvents.map((event) => (
                    <Box
                      key={event.id}
                      sx={{
                        p: 1,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {event.summary}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {!event.start.dateTime && event.start.date
                              ? '終日'
                              : `${dayjs(event.start.dateTime).format('HH:mm')} - ${dayjs(event.end.dateTime).format('HH:mm')}`}
                          </Typography>
                          {event.location && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              場所: {event.location}
                            </Typography>
                          )}
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              handleOpenDialog(event);
                              setAnchorEl(null);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              handleDeleteEvent(event.id);
                              setAnchorEl(null);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Popover>
          </Box>
        </>
      )}

      {/* 予定作成・編集ダイアログ */}

      {/* 予定作成・編集ダイアログ */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? '予定を編集' : '予定を作成'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="タイトル"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="説明"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                />
              }
              label="終日"
            />
            {formData.isAllDay ? (
              <>
                <TextField
                  label="開始日"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="終了日"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </>
            ) : (
              <>
                <TextField
                  label="開始日時"
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="終了日時"
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
            <TextField
              label="場所"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>キャンセル</Button>
          <Button
            onClick={handleSaveEvent}
            variant="contained"
            disabled={!formData.summary || loading}
          >
            {loading ? <CircularProgress size={24} /> : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

