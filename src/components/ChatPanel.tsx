'use client';

import { Box, Typography, TextField, IconButton, Paper, List, ListItem, ListItemText } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useState } from 'react';

export default function ChatPanel() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, input]);
      setInput('');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        AudioDiary チャット
      </Typography>
      <Paper variant="outlined" sx={{ height: '75vh', overflowY: 'auto', mb: 2, p: 2 }}>
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
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <IconButton onClick={handleSend} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}