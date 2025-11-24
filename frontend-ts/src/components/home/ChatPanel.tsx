'use client';

import {
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchMessage } from '../../utils/api';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
}

interface ChatPanelProps {
  selectedDate?: string | null;
}

export default function ChatPanel({ selectedDate }: ChatPanelProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);

  // 選択された日付のイベントを取得
  useEffect(() => {
    const loadEventsForDate = async () => {
      if (!selectedDate) {
        setEvents([]);
        return;
      }

      setLoadingEvents(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('google_access_token');
        const refreshToken = localStorage.getItem('google_refresh_token');
        
        if (!accessToken || !refreshToken) {
          setError('認証が必要です');
          return;
        }

        const targetDate = dayjs(selectedDate);
        const timeMin = targetDate.startOf('day').toISOString();
        const timeMax = targetDate.endOf('day').toISOString();

        const response = await fetch(
          `/api/calendar/events?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&timeMin=${timeMin}&timeMax=${timeMax}`
        );
        const data = await response.json();
        
        if (response.ok) {
          setEvents(data);
          setSelectedEvents(new Set()); // イベントが更新されたら選択をリセット
          setConversationStarted(false); // 会話もリセット
          setMessages([]);
        } else {
          setError(data.error || '予定の取得に失敗しました');
        }
      } catch {
        setError('予定の取得に失敗しました');
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEventsForDate();
  }, [selectedDate]);

  // イベントの選択/選択解除
  const handleEventToggle = (eventId: string) => {
    setSelectedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // すべて選択/すべて解除
  const handleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map((e) => e.id)));
    }
  };

  // 選択したイベントで会話を開始
  const handleStartConversation = async () => {
    if (selectedEvents.size === 0) {
      setError('少なくとも1つの予定を選択してください');
      return;
    }

    setLoading(true);
    setError(null);
    setConversationStarted(true);

    try {
      // 選択されたイベントの情報をまとめる
      const selectedEventsData = events.filter((e) => selectedEvents.has(e.id));
      const eventsText = selectedEventsData
        .map((event) => {
          const timeText = event.start.date
            ? '終日'
            : event.start.dateTime
            ? `${dayjs(event.start.dateTime).format('HH:mm')} - ${dayjs(event.end.dateTime).format('HH:mm')}`
            : '';
          return `- ${timeText} ${event.summary}${event.description ? `: ${event.description}` : ''}${event.location ? ` (場所: ${event.location})` : ''}`;
        })
        .join('\n');

      const contextMessage = `以下の予定について会話を始めたいです:\n\n${eventsText}`;

      // バックエンドに送信
      const response = await fetchMessage(contextMessage);
      
      if (!response) {
        throw new Error('APIからのレスポンスが空です');
      }

      // AIの初期メッセージを表示
      setMessages([{ role: 'assistant', content: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '会話の開始に失敗しました');
      setConversationStarted(false);
    } finally {
      setLoading(false);
    }
  };

  // メッセージを送信
  const handleSend = async () => {
    if (!input.trim() || !conversationStarted) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetchMessage(input);
      if (!response) {
        throw new Error('APIからのレスポンスが空です');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メッセージの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ChatIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            AudioDiary
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!selectedDate ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            カレンダーから日付を選択してください
          </Typography>
        </Box>
      ) : (
        <>
          {/* イベント一覧 */}
          {!conversationStarted && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {dayjs(selectedDate).format('YYYY年M月D日')}の予定
                </Typography>
                {events.length > 0 && (
                  <Button size="small" onClick={handleSelectAll}>
                    {selectedEvents.size === events.length ? 'すべて解除' : 'すべて選択'}
                  </Button>
                )}
              </Box>

              {loadingEvents ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : events.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    この日の予定はありません
                  </Typography>
                </Paper>
              ) : (
                <Paper variant="outlined" sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  <List dense>
                    {events.map((event) => {
                      const isSelected = selectedEvents.has(event.id);
                      const timeText = event.start.date
                        ? '終日'
                        : event.start.dateTime
                        ? `${dayjs(event.start.dateTime).format('HH:mm')} - ${dayjs(event.end.dateTime).format('HH:mm')}`
                        : '';
                      
                      return (
                        <ListItem
                          key={event.id}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => handleEventToggle(event.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleEventToggle(event.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                          />
                          <ListItemText
                            primary={event.summary}
                            secondary={
                              <Box>
                                {timeText && (
                                  <Typography variant="caption" display="block">
                                    {timeText}
                                  </Typography>
                                )}
                                {event.description && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {event.description}
                                  </Typography>
                                )}
                                {event.location && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    場所: {event.location}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              )}

              {selectedEvents.size > 0 && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={handleStartConversation}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? '会話を開始中...' : 'この内容で会話を開始しますか？'}
                </Button>
              )}
            </Box>
          )}

          {/* チャット履歴 */}
          {conversationStarted && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  mb: 2,
                  bgcolor: 'grey.50',
                }}
              >
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {messages.map((msg, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            maxWidth: '80%',
                            bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                            color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {msg.content}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                    {loading && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <CircularProgress size={20} />
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>

              {/* メッセージ入力 */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="メッセージを入力..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={loading}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

