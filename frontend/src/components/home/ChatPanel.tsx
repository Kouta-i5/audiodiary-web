'use client';

import {
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Chat as ChatIcon,
  Summarize as SummarizeIcon,
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { fetchMessage, fetchSummary } from '../../utils/api';

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
  const [selectedEventsForChat, setSelectedEventsForChat] = useState<CalendarEvent[]>([]);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryTitle, setSummaryTitle] = useState('');
  const [summaryDateTime, setSummaryDateTime] = useState('');
  const [creatingDiary, setCreatingDiary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          setSelectedEventsForChat([]); // 選択した予定情報もリセット
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

  // メッセージが更新されたら自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

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
      // 選択されたイベントの情報を構造化データとしてまとめる
      const selectedEventsData = events.filter((e) => selectedEvents.has(e.id));
      const context = selectedEventsData.map((event) => {
        return {
          summary: event.summary || '',
          description: event.description || '',
          start: event.start.dateTime || event.start.date || '',
          end: event.end?.dateTime || event.end?.date || '',
          location: event.location || '',
        };
      });

      // ユーザーの初期メッセージ（シンプルに）
      const initialMessage = '今日の予定について話したいです。';

      // バックエンドに送信（contextパラメータとして構造化データを渡す）
      const response = await fetchMessage(initialMessage, [], context);
      
      if (!response) {
        throw new Error('APIからのレスポンスが空です');
      }

      // 選択した予定情報をチャット画面に表示するために保持
      setSelectedEventsForChat(selectedEventsData);

      // AIの初期メッセージを表示
      setMessages([
        { role: 'user', content: initialMessage },
        { role: 'assistant', content: response }
      ]);
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
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // 会話履歴を送信（現在のメッセージ配列をそのまま送信）
      const response = await fetchMessage(input, messages);
      if (!response) {
        throw new Error('APIからのレスポンスが空です');
      }

      setMessages([...currentMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メッセージの送信に失敗しました');
      // エラー時はユーザーメッセージを元に戻す
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  // 会話履歴をテキストに変換
  const convertMessagesToText = (): string => {
    return messages
      .map((msg) => `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}`)
      .join('\n\n');
  };

  // 会話を終了して要約を作成
  const handleCreateSummary = async () => {
    if (messages.length === 0) {
      setError('会話履歴がありません');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 会話履歴をテキストに変換
      const conversationText = convertMessagesToText();
      
      // 要約APIを呼び出し
      const summaryText = await fetchSummary(conversationText);
      
      // 要約ダイアログを表示
      setSummary(summaryText);
      setSummaryTitle('AudioDiary');
      
      // デフォルトの日付を設定（終日イベントなので日付のみ）
      if (selectedDate) {
        setSummaryDateTime(dayjs(selectedDate).format('YYYY-MM-DD'));
      } else {
        setSummaryDateTime(dayjs().format('YYYY-MM-DD'));
      }
      
      setShowSummaryDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '要約の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // AudioDiaryをGoogle Calendarに登録
  const handleSaveToCalendar = async () => {
    if (!summary.trim() || !summaryTitle.trim() || !summaryDateTime.trim()) {
      setError('要約、タイトル、日付を入力してください');
      return;
    }

    const accessToken = localStorage.getItem('google_access_token');
    const refreshToken = localStorage.getItem('google_refresh_token');

    if (!accessToken || !refreshToken) {
      setError('認証が必要です');
      return;
    }

    // 日付をパース（終日イベント）
    const eventDate = dayjs(summaryDateTime).format('YYYY-MM-DD');
    const nextDate = dayjs(summaryDateTime).add(1, 'day').format('YYYY-MM-DD');

    setCreatingDiary(true);
    setError(null);

    try {
      // 終日イベントとして登録
      const eventData = {
        summary: summaryTitle,
        description: summary,
        start: {
          date: eventDate,
        },
        end: {
          date: nextDate,
        },
      };

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          eventData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '予定の作成に失敗しました');
      }

      // 成功時の処理：すべてをリセット
      setShowSummaryDialog(false);
      setSummary('');
      setSummaryTitle('');
      setSummaryDateTime('');
      setError(null);
      
      // 会話関連をリセット
      setMessages([]);
      setConversationStarted(false);
      setSelectedEventsForChat([]);
      setSelectedEvents(new Set());
      setInput('');
      
      // 成功メッセージを表示
      alert('AudioDiaryをGoogle Calendarに登録しました！');
    } catch (err) {
      setError(err instanceof Error ? err.message : '予定の登録に失敗しました');
    } finally {
      setCreatingDiary(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* イベント一覧（会話開始前のみ表示） */}
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
                <Paper
                  variant="outlined"
                  sx={{
                    maxHeight: 200,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
                    width: '100%',
                    maxWidth: '100%',
                  }}
                >
                  <List dense sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                    {events.map((event) => {
                      const isSelected = selectedEvents.has(event.id);
                      const isAudioDiary = event.summary?.includes('AudioDiary');
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
                            bgcolor: isSelected ? 'action.selected' : 'transparent',
                            transition: 'all 0.2s ease',
                            borderLeft: isSelected ? '3px solid' : '3px solid transparent',
                            borderColor: isSelected ? 'primary.main' : 'transparent',
                            width: '100%',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            '&:hover': {
                              bgcolor: isSelected ? 'action.selected' : 'action.hover',
                              transform: 'translateX(2px)',
                            },
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
                            sx={{
                              color: 'primary.main',
                              '&.Mui-checked': {
                                color: 'primary.main',
                              },
                            }}
                          />
                          <ListItemText
                            primary={event.summary}
                            primaryTypographyProps={{
                              component: 'div',
                              fontWeight: isSelected ? 600 : 500,
                              color: isAudioDiary && isSelected ? 'secondary.main' : 'text.primary',
                              sx: {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              },
                            }}
                            secondaryTypographyProps={{
                              component: 'div',
                              sx: {
                                overflow: 'hidden',
                              },
                            }}
                            secondary={
                              <Box sx={{ width: '100%', overflow: 'hidden' }}>
                                {timeText && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{
                                      color: isAudioDiary ? 'secondary.main' : 'text.secondary',
                                      fontWeight: 500,
                                      mt: 0.25,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {timeText}
                                  </Typography>
                                )}
                                {event.description && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{
                                      mt: 0.25,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {event.description}
                                  </Typography>
                                )}
                                {event.location && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{
                                      mt: 0.25,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
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

          {/* 選択した予定の表示（会話開始後） */}
          {conversationStarted && selectedEventsForChat.length > 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0px 4px 12px rgba(102, 126, 234, 0.3)',
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ mb: 1, display: 'block', opacity: 0.95 }}>
                話している予定:
              </Typography>
              {selectedEventsForChat.map((event, index) => {
                const timeText = event.start.date
                  ? '終日'
                  : event.start.dateTime
                  ? `${dayjs(event.start.dateTime).format('HH:mm')} - ${dayjs(event.end?.dateTime).format('HH:mm')}`
                  : '';
                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: index < selectedEventsForChat.length - 1 ? 1 : 0,
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'white',
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {timeText && `${timeText} `}{event.summary}
                      {event.location && ` • ${event.location}`}
                    </Typography>
                  </Box>
                );
              })}
            </Paper>
          )}

          {/* チャット履歴（常に表示） */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              p: 2,
              mb: 2,
              background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
              border: '1px solid',
              borderColor: 'divider',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            {!conversationStarted ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ChatIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
                  予定を選択して会話を開始してください
                </Typography>
              </Box>
            ) : messages.length === 0 ? (
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
                      elevation={msg.role === 'user' ? 3 : 2}
                      sx={{
                        p: 1.75,
                        maxWidth: '80%',
                        bgcolor: msg.role === 'user'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'background.paper',
                        color: msg.role === 'user' ? 'white' : 'text.primary',
                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        boxShadow: msg.role === 'user'
                          ? '0px 4px 12px rgba(102, 126, 234, 0.25)'
                          : '0px 2px 8px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: msg.role === 'user'
                            ? '0px 6px 16px rgba(102, 126, 234, 0.3)'
                            : '0px 4px 12px rgba(0, 0, 0, 0.12)',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {msg.content}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.paper',
                        borderRadius: '18px 18px 18px 4px',
                      }}
                    >
                      <CircularProgress size={20} />
                    </Paper>
                  </Box>
                )}
                {/* 自動スクロール用のダミー要素 */}
                <div ref={messagesEndRef} />
              </Box>
            )}
          </Paper>

          {/* メッセージ入力とアクション（会話開始後のみ有効） */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={conversationStarted ? "メッセージを入力..." : "予定を選択して会話を開始してください"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && conversationStarted) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading || !conversationStarted}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={loading || !input.trim() || !conversationStarted}
              >
                <SendIcon />
              </IconButton>
            </Box>
            
            {/* 会話終了ボタン */}
            {conversationStarted && messages.length > 0 && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SummarizeIcon />}
                onClick={handleCreateSummary}
                disabled={loading}
                fullWidth
              >
                会話を終了してAudioDiaryを作成
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* 要約確認・編集ダイアログ */}
      <Dialog
        open={showSummaryDialog}
        onClose={() => !creatingDiary && setShowSummaryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>AudioDiaryを作成</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="タイトル"
              value={summaryTitle}
              onChange={(e) => setSummaryTitle(e.target.value)}
              fullWidth
              disabled={creatingDiary}
            />
            
            <TextField
              label="日付"
              type="date"
              value={summaryDateTime}
              onChange={(e) => setSummaryDateTime(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="終日イベントとして登録されます"
              disabled={creatingDiary}
            />
            
            <TextField
              label="要約内容"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              fullWidth
              multiline
              rows={10}
              disabled={creatingDiary}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSummaryDialog(false);
              setSummary('');
              setSummaryTitle('');
              setSummaryDateTime('');
            }}
            disabled={creatingDiary}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSaveToCalendar}
            variant="contained"
            disabled={creatingDiary || !summary.trim() || !summaryTitle.trim() || !summaryDateTime.trim()}
            startIcon={creatingDiary ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            {creatingDiary ? '登録中...' : 'Google Calendarに登録'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

