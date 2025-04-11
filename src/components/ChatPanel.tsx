'use client';

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useState } from 'react';

export default function ChatPanel() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    // 送信メッセージを先に追加
    setMessages((prev) => [...prev, `🧑‍💬: ${input}`]);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, `🤖: ${data.response}`]);
    } catch (error) {
      setMessages((prev) => [...prev, '⚠️: エラーが発生しました']);
      console.error(error);
    }

    setInput('');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        AudioDiary チャット
      </Typography>
      <Paper
        variant="outlined"
        sx={{ height: '75vh', overflowY: 'auto', mb: 2, p: 2 }}
      >
        <List>
          {messages.map((msg, i) => (
            <ListItem key={i}>
              <ListItemText primary={msg} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box display="flex">
        <TextField
          fullWidth
          label="話しかけてみよう"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <IconButton onClick={handleSend} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}