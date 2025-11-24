'use client';

import {
  Note as NoteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Summarize as SummarizeIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
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
    setMessages((prev) => [...prev, `🤖: `]);
    
    try {
      const response = await fetchMessage(input);
      if (!response) throw new Error('APIからのレスポンスが空です');

      // 1文字ずつストリーミング風に表示
      for (let i = 0; i < response.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 18));
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.startsWith('🤖: ')) {
            return [...prev.slice(0, -1), `🤖: ${response.slice(0, i + 1)}`];
          }
          return prev;
        });
      }
    } catch {
      setMessages((prev) => [...prev.slice(0, -1), `🤖: エラーが発生しました`]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleSummarize = async () => {
    setSummaryLoading(true);
    try {
      const conversation = messages.join('\n');
      const summaryText = await fetchSummary(conversation);
      setSummary(summaryText);
    } catch {
      setSaveMessage('要約に失敗しました');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const payload: DiaryRequest = {
        date: context.date,
        content: summary,
        time_of_day: context.time_of_day || undefined,
        location: context.location || undefined,
        companion: context.companion || undefined,
        mood: context.mood || undefined,
      };
      await saveDiary(payload);
      setSaveMessage('保存に成功しました！');
    } catch {
      setSaveMessage('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSetContext = async () => {
    setContextLoading(true);
    setContextMsg('');
    try {
      const res = await setChatContext(context);
      setContextMsg(res.initial_message);
      if (res.initial_message) {
        setMessages((prev) => [...prev, `🤖: ${res.initial_message}`]);
      }
    } catch {
      setContextMsg('コンテキスト設定に失敗しました');
    } finally {
      setContextLoading(false);
    }
  };

  const handleContextChange = (field: keyof typeof context, value: string) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  const handleOtherChange = (field: keyof typeof other, value: string) => {
    setOther(prev => ({ ...prev, [field]: value }));
    if (value.trim()) {
      setContext(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, gap: 3 }}>
      {/* コンテキスト設定エリア */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <NoteIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            日記のコンテキスト
          </Typography>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
          {/* 日付 */}
          <TextField
            label="日付"
            type="date"
            value={context.date}
            onChange={(e) => handleContextChange('date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* 時間帯 */}
          <FormControl fullWidth>
            <InputLabel>時間帯</InputLabel>
            <Select
              value={context.time_of_day}
              onChange={(e) => handleContextChange('time_of_day', e.target.value)}
              label="時間帯"
            >
              <MenuItem value="">選択してください</MenuItem>
              {timeOfDayOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {context.time_of_day === 'その他' && (
            <TextField
              label="具体的に入力..."
              value={other.time_of_day}
              onChange={(e) => handleOtherChange('time_of_day', e.target.value)}
              fullWidth
              sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
            />
          )}

          {/* 場所 */}
          <FormControl fullWidth>
            <InputLabel>場所</InputLabel>
            <Select
              value={context.location}
              onChange={(e) => handleContextChange('location', e.target.value)}
              label="場所"
            >
              <MenuItem value="">選択してください</MenuItem>
              {locationOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {context.location === 'その他' && (
            <TextField
              label="具体的に入力..."
              value={other.location}
              onChange={(e) => handleOtherChange('location', e.target.value)}
              fullWidth
              sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
            />
          )}

          {/* 同伴者 */}
          <FormControl fullWidth>
            <InputLabel>同伴者</InputLabel>
            <Select
              value={context.companion}
              onChange={(e) => handleContextChange('companion', e.target.value)}
              label="同伴者"
            >
              <MenuItem value="">選択してください</MenuItem>
              {companionOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {context.companion === 'その他' && (
            <TextField
              label="具体的に入力..."
              value={other.companion}
              onChange={(e) => handleOtherChange('companion', e.target.value)}
              fullWidth
              sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
            />
          )}

          {/* 気分 */}
          <FormControl fullWidth sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
            <InputLabel>気分</InputLabel>
            <Select
              value={context.mood}
              onChange={(e) => handleContextChange('mood', e.target.value)}
              label="気分"
            >
              <MenuItem value="">選択してください</MenuItem>
              {moodOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {context.mood === 'その他' && (
            <TextField
              label="具体的に入力..."
              value={other.mood}
              onChange={(e) => handleOtherChange('mood', e.target.value)}
              fullWidth
              sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
            />
          )}
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSetContext}
          disabled={contextLoading}
          sx={{ bgcolor: 'primary.main' }}
        >
          {contextLoading ? '設定中...' : 'コンテキストを設定'}
        </Button>
        
        {contextMsg && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {contextMsg}
          </Alert>
        )}
      </Paper>

      {/* チャット表示エリア */}
      <Paper
        elevation={1}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            チャット
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg, idx) => {
            const isUser = msg.startsWith('🧑‍💬:');
            return (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: '80%',
                    p: 2,
                    bgcolor: isUser ? 'primary.main' : 'grey.100',
                    color: isUser ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* 入力エリア */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { bgcolor: 'grey.300' } }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        </IconButton>
        <IconButton
          color="success"
          onClick={handleSummarize}
          disabled={summaryLoading || messages.length === 0}
          sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' }, '&:disabled': { bgcolor: 'grey.300' } }}
        >
          {summaryLoading ? <CircularProgress size={20} color="inherit" /> : <SummarizeIcon />}
        </IconButton>
      </Box>

      {/* 要約表示エリア */}
      {summary && (
        <Alert
          severity="info"
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ bgcolor: 'info.main' }}
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
        >
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            要約：
          </Typography>
          <Typography variant="body1">{summary}</Typography>
        </Alert>
      )}
    </Box>
  );
}
