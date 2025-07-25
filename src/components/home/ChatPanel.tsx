'use client';

import {
  Note as NoteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Summarize as SummarizeIcon
} from '@mui/icons-material';
import {
  Alert,
  Box, Button, Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { fetchMessage, fetchSummary, saveDiary, setChatContext } from '../../utils/api';
import { DiaryRequest } from '../../utils/schemas';

// 今日の日付をYYYY-MM-DD形式で取得
const getToday = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // コンテキスト入力用state
  const [context, setContext] = useState({
    date: getToday(),
    time_of_day: '',
    location: '',
    companion: '',
    mood: '',
  });
  const [contextMsg, setContextMsg] = useState('');
  const [contextLoading, setContextLoading] = useState(false);

  // その他入力用state
  const [other, setOther] = useState({
    time_of_day: '',
    location: '',
    companion: '',
    mood: '',
  });

  // 選択肢
  const timeOfDayOptions = ['朝', '昼', '夕方', '夜', 'その他'];
  const locationOptions = ['自宅', '学校', '職場', '外出先', 'その他'];
  const companionOptions = ['一人', '家族', '友人', '同僚', 'その他'];
  const moodOptions = ['良い', '普通', '悪い', 'その他'];

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages((prev) => [...prev, `🧑‍💬: ${input}`]);

    // まず空のAIメッセージを追加
    setMessages((prev) => [...prev, `🤖: `]);
    try {
      console.log('送信するメッセージ:', input);
      const response = await fetchMessage(input);
      console.log('APIレスポンス:', response);

      if (!response) {
        throw new Error('APIからのレスポンスが空です');
      }

      // 1文字ずつストリーミング風に表示
      for (let i = 0; i < response.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 18));
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.startsWith('🤖: ')) {
            return [
              ...prev.slice(0, -1),
              `🤖: ${response.slice(0, i + 1)}`
            ];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      setMessages((prev) => [...prev, '⚠️: エラーが発生しました']);
    }
    setInput('');
    setLoading(false);
  };

  const handleSummarize = async () => {
    setSummaryLoading(true);
    try {
      const conversation = messages.join('\n');
      const result = await fetchSummary(conversation);
      setSummary(result);
    } catch {
      setSummary('要約に失敗しました');
    }
    setSummaryLoading(false);
  };

  const handleSetContext = async () => {
    setContextLoading(true);
    setContextMsg('');
    try {
      console.log('送信するコンテキスト:', context);
      const result = await setChatContext(context);
      console.log('APIレスポンス:', result);
      setContextMsg(result.message);
      if (result.initial_message) {
        setMessages(prev => [...prev, `🤖: ${result.initial_message}`]);
      }
    } catch (error) {
      console.error('コンテキスト送信エラー:', error);
      setContextMsg('コンテキスト送信に失敗しました');
    }
    setContextLoading(false);
  };

  const handleSave = async () => {
    if (!summary) {
      setSaveMessage('要約を生成してから保存してください');
      return;
    }
  
    setSaving(true);
    setSaveMessage('');
  
    try {
      const payload: DiaryRequest = context
        ? { summary, context }
        : { summary };
  
      await saveDiary(payload);
      setSaveMessage('日記を保存しました');
    } catch (err) {
      console.error('保存エラー:', err);
      setSaveMessage('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100%', py: 3 }}>
      <Stack spacing={3} sx={{ height: '100%' }}>
        {/* コンテキスト設定フォーム */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <NoteIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold" color="primary">
              今日はどんなことがありましたか？
            </Typography>
          </Stack>
          
          <Stack spacing={3}>
            <TextField
              fullWidth
              type="date"
              label="日付"
              value={context.date}
              onChange={e => setContext(c => ({ ...c, date: e.target.value }))}
              variant="outlined"
              size="medium"
            />
            
            {/* 時間帯 */}
            <Box>
              <Typography variant="subtitle1" fontWeight="semibold" sx={{ mb: 1 }}>
                時間帯
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {timeOfDayOptions.map(opt => (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => {
                      if (opt === 'その他') {
                        setContext(c => ({ ...c, time_of_day: 'その他:' + other.time_of_day }));
                      } else {
                        setContext(c => ({ ...c, time_of_day: opt }));
                      }
                    }}
                    color={context.time_of_day.startsWith(opt) ? 'primary' : 'default'}
                    variant={context.time_of_day.startsWith(opt) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
              {context.time_of_day.startsWith('その他') && (
                <TextField
                  fullWidth
                  placeholder="その他の時間帯を入力"
                  value={other.time_of_day}
                  onChange={e => {
                    setOther(o => ({ ...o, time_of_day: e.target.value }));
                    setContext(c => ({ ...c, time_of_day: 'その他:' + e.target.value }));
                  }}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>

            {/* 場所 */}
            <Box>
              <Typography variant="subtitle1" fontWeight="semibold" sx={{ mb: 1 }}>
                場所
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {locationOptions.map(opt => (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => {
                      if (opt === 'その他') {
                        setContext(c => ({ ...c, location: 'その他:' + other.location }));
                      } else {
                        setContext(c => ({ ...c, location: opt }));
                      }
                    }}
                    color={context.location.startsWith(opt) ? 'primary' : 'default'}
                    variant={context.location.startsWith(opt) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
              {context.location.startsWith('その他') && (
                <TextField
                  fullWidth
                  placeholder="その他の場所を入力"
                  value={other.location}
                  onChange={e => {
                    setOther(o => ({ ...o, location: e.target.value }));
                    setContext(c => ({ ...c, location: 'その他:' + e.target.value }));
                  }}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>

            {/* 一緒にいる人 */}
            <Box>
              <Typography variant="subtitle1" fontWeight="semibold" sx={{ mb: 1 }}>
                一緒にいる人
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {companionOptions.map(opt => (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => {
                      if (opt === 'その他') {
                        setContext(c => ({ ...c, companion: 'その他:' + other.companion }));
                      } else {
                        setContext(c => ({ ...c, companion: opt }));
                      }
                    }}
                    color={context.companion.startsWith(opt) ? 'primary' : 'default'}
                    variant={context.companion.startsWith(opt) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
              {context.companion.startsWith('その他') && (
                <TextField
                  fullWidth
                  placeholder="その他の人を入力"
                  value={other.companion}
                  onChange={e => {
                    setOther(o => ({ ...o, companion: e.target.value }));
                    setContext(c => ({ ...c, companion: 'その他:' + e.target.value }));
                  }}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>

            {/* 気分 */}
            <Box>
              <Typography variant="subtitle1" fontWeight="semibold" sx={{ mb: 1 }}>
                気分
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {moodOptions.map(opt => (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => {
                      if (opt === 'その他') {
                        setContext(c => ({ ...c, mood: 'その他:' + other.mood }));
                      } else {
                        setContext(c => ({ ...c, mood: opt }));
                      }
                    }}
                    color={context.mood.startsWith(opt) ? 'primary' : 'default'}
                    variant={context.mood.startsWith(opt) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
              {context.mood.startsWith('その他') && (
                <TextField
                  fullWidth
                  placeholder="その他の気分を入力"
                  value={other.mood}
                  onChange={e => {
                    setOther(o => ({ ...o, mood: e.target.value }));
                    setContext(c => ({ ...c, mood: 'その他:' + e.target.value }));
                  }}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSetContext}
            disabled={contextLoading}
            sx={{ mt: 3, borderRadius: 2 }}
          >
            {contextLoading ? '読み込み中...' : '会話を始めてみよう'}
          </Button>
          
          {contextMsg && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {contextMsg}
            </Alert>
          )}
        </Paper>

        {/* メッセージエリア */}
        <Paper 
          elevation={2} 
          sx={{ 
            flex: 1, 
            p: 3, 
            borderRadius: 3,
            overflow: 'auto',
            bgcolor: 'grey.50'
          }}
        >
          <Stack spacing={2}>
            {messages.map((msg, i) => {
              const isUser = msg.startsWith('🧑‍💬');
              return (
                <Box
                  key={i}
                  display="flex"
                  justifyContent={isUser ? 'flex-end' : 'flex-start'}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      borderRadius: 3,
                      bgcolor: isUser ? 'primary.light' : 'white',
                      color: isUser ? 'primary.contrastText' : 'text.primary',
                      borderTopRightRadius: isUser ? 1 : 3,
                      borderTopLeftRadius: isUser ? 3 : 1,
                    }}
                  >
                    <Typography variant="body1">
                      {msg}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Stack>
        </Paper>

        {/* 入力エリア */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="メッセージを入力..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              variant="outlined"
              size="medium"
              sx={{ borderRadius: 2 }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
            <IconButton
              color="secondary"
              onClick={handleSummarize}
              disabled={summaryLoading || messages.length === 0}
              sx={{ 
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
                '&:hover': { bgcolor: 'secondary.main' },
                '&:disabled': { bgcolor: 'grey.300' }
              }}
            >
              {summaryLoading ? <CircularProgress size={24} color="inherit" /> : <SummarizeIcon />}
            </IconButton>
          </Stack>
        </Paper>

        {/* 要約表示エリア */}
        {summary && (
          <Alert 
            severity="info" 
            action={
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<SaveIcon />}
                >
                  {saving ? '保存中...' : '日記を保存'}
                </Button>
                {saveMessage && (
                  <Typography 
                    variant="body2" 
                    color={saveMessage.includes('失敗') ? 'error.main' : 'success.main'}
                  >
                    {saveMessage}
                  </Typography>
                )}
              </Stack>
            }
            sx={{ borderRadius: 3 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              要約：
            </Typography>
            <Typography variant="body1">
              {summary}
            </Typography>
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
