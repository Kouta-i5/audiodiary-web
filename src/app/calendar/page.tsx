'use client';

import {
    Add as AddIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
}

export default function CalendarPage() {
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
    location: '',
  });

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
        window.history.replaceState({}, '', '/calendar');
        loadEvents(accessTokenParam, refreshTokenParam);
      } else {
        // ローカルストレージからトークンを取得
        const storedAccessToken = localStorage.getItem('google_access_token');
        const storedRefreshToken = localStorage.getItem('google_refresh_token');
        if (storedAccessToken && storedRefreshToken) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setIsAuthenticated(true);
          loadEvents(storedAccessToken, storedRefreshToken);
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
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError('認証URLの取得に失敗しました');
      }
    } catch {
      setError('認証の開始に失敗しました');
    }
  };

  // 予定を読み込む
  const loadEvents = async (token: string, refresh: string) => {
    setLoading(true);
    setError(null);
    try {
      const timeMin = dayjs().startOf('month').toISOString();
      const timeMax = dayjs().endOf('month').toISOString();
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
  };

  // 予定作成ダイアログを開く
  const handleOpenDialog = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        summary: event.summary,
        description: event.description || '',
        startDateTime: dayjs(event.start.dateTime).format('YYYY-MM-DDTHH:mm'),
        endDateTime: dayjs(event.end.dateTime).format('YYYY-MM-DDTHH:mm'),
        location: event.location || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        summary: '',
        description: '',
        startDateTime: dayjs().format('YYYY-MM-DDTHH:mm'),
        endDateTime: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
        location: '',
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
      const eventData = {
        summary: formData.summary,
        description: formData.description || undefined,
        start: {
          dateTime: new Date(formData.startDateTime).toISOString(),
          timeZone: 'Asia/Tokyo',
        },
        end: {
          dateTime: new Date(formData.endDateTime).toISOString(),
          timeZone: 'Asia/Tokyo',
        },
        location: formData.location || undefined,
      };

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Googleカレンダー
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
          {loading && events.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : events.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                予定がありません
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 2 }}>
              <List>
                {events.map((event) => (
                  <ListItem key={event.id} divider>
                    <ListItemText
                      primary={event.summary}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(event.start.dateTime).format('YYYY年M月D日 HH:mm')} -{' '}
                            {dayjs(event.end.dateTime).format('HH:mm')}
                          </Typography>
                          {event.location && (
                            <Typography variant="caption" color="text.secondary">
                              場所: {event.location}
                            </Typography>
                          )}
                          {event.description && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {event.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenDialog(event)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteEvent(event.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </>
      )}

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
