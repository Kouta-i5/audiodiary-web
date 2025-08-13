'use client';

import {
  Note as NoteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Summarize as SummarizeIcon
} from '@mui/icons-material';
import {
  Alert,
  Box, Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
    if (messages.length === 0) return;
    setSummaryLoading(true);
    try {
      const response = await fetchSummary(messages.join('\n'));
      if (response) {
        setSummary(response);
      }
    } catch (error) {
      console.error('要約エラー:', error);
    }
    setSummaryLoading(false);
  };

  const handleSave = async () => {
    if (!summary) return;
    setSaving(true);
    try {
      const diaryData: DiaryRequest = {
        summary: summary,
        context: {
          date: context.date,
          time_of_day: context.time_of_day,
          location: context.location,
          companion: context.companion,
          mood: context.mood,
        }
      };
      await saveDiary(diaryData);
      setSaveMessage('日記を保存しました！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('保存エラー:', error);
      setSaveMessage('保存に失敗しました');
      setTimeout(() => setSaveMessage(''), 3000);
    }
    setSaving(false);
  };

  const handleSetContext = async () => {
    if (!context.time_of_day || !context.location || !context.companion || !context.mood) {
      setContextMsg('すべての項目を選択してください');
      setTimeout(() => setContextMsg(''), 3000);
      return;
    }
    setContextLoading(true);
    try {
      await setChatContext(context);
      setContextMsg('コンテキストを設定しました！');
      setTimeout(() => setContextMsg(''), 3000);
    } catch (error) {
      console.error('コンテキスト設定エラー:', error);
      setContextMsg('コンテキストの設定に失敗しました');
      setTimeout(() => setContextMsg(''), 3000);
    }
    setContextLoading(false);
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* コンテキスト設定フォーム */}
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Grid container alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Grid size="auto">
                <NoteIcon color="primary" sx={{ fontSize: 28 }} />
              </Grid>
              <Grid size="grow">
                <Typography variant="h5" fontWeight="bold" color="primary">
                  今日はどんなことがありましたか？
                </Typography>
              </Grid>
            </Grid>
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
              <FormControl fullWidth>
                <InputLabel>時間帯</InputLabel>
                <Select
                  value={context.time_of_day}
                  label="時間帯"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'その他') {
                      setContext(c => ({ ...c, time_of_day: 'その他:' + other.time_of_day }));
                    } else {
                      setContext(c => ({ ...c, time_of_day: value }));
                    }
                  }}
                >
                  {timeOfDayOptions.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {context.time_of_day.startsWith('その他') && (
                <TextField
                  fullWidth
                  placeholder="その他の時間帯を入力"
                  value={other.time_of_day}
                  onChange={e => {
                    setOther(o => ({ ...o, time_of_day: e.target.value }));
                    setContext(c => ({ ...c, time_of_day: 'その他:' + e.target.value }));
                  }}
                />
              )}

              {/* 場所 */}
              <FormControl fullWidth>
                <InputLabel>場所</InputLabel>
                <Select
                  value={context.location}
                  label="場所"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'その他') {
                      setContext(c => ({ ...c, location: 'その他:' + other.location }));
                    } else {
                      setContext(c => ({ ...c, location: value }));
                    }
                  }}
                >
                  {locationOptions.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {context.location.startsWith('その他') && (
                <TextField
                  fullWidth
                  placeholder="その他の場所を入力"
                  value={other.location}
                  onChange={e => {
                    setOther(o => ({ ...o, location: e.target.value }));
                    setContext(c => ({ ...c, location: 'その他:' + e.target.value }));
                  }}
                />
              )}

              {/* 一緒にいる人 */}
              <FormControl fullWidth>
                <InputLabel>一緒にいる人</InputLabel>
                <Select
                  value={context.companion}
                  label="一緒にいる人"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'その他') {
                      setContext(c => ({ ...c, companion: 'その他:' + other.companion }));
                    } else {
                      setContext(c => ({ ...c, companion: value }));
                    }
                  }}
                >
                  {companionOptions.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {context.companion.startsWith('その他') && (
                <TextField
                  fullWidth
                  placeholder="その他の人を入力"
                  value={other.companion}
                  onChange={e => {
                    setOther(o => ({ ...o, companion: e.target.value }));
                    setContext(c => ({ ...c, companion: 'その他:' + e.target.value }));
                  }}
                />
              )}

              {/* 気分 */}
              <FormControl fullWidth>
                <InputLabel>気分</InputLabel>
                <Select
                  value={context.mood}
                  label="気分"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'その他') {
                      setContext(c => ({ ...c, mood: 'その他:' + other.mood }));
                    } else {
                      setContext(c => ({ ...c, mood: value }));
                    }
                  }}
                >
                  {moodOptions.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {context.mood.startsWith('その他') && (
                <TextField
                  fullWidth
                  placeholder="その他の気分を入力"
                  value={other.mood}
                  onChange={e => {
                    setOther(o => ({ ...o, mood: e.target.value }));
                    setContext(c => ({ ...c, mood: 'その他:' + e.target.value }));
                  }}
                />
              )}
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
        </Grid>

        {/* メッセージエリア */}
        <Grid size={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              bgcolor: 'grey.50',
              minHeight: 300
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
        </Grid>

        {/* 入力エリア */}
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size="grow">
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
              </Grid>
              <Grid size="auto">
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
              </Grid>
              <Grid size="auto">
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
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 要約表示エリア */}
        {summary && (
          <Grid size={12}>
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
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
