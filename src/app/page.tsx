'use client';

import { Box, Paper, Typography } from '@mui/material';
import CalendarPanel from '../components/home/calendarPanel';
import ChatPanel from '../components/home/chatPanel';

export default function HomePage() {
  return (
    <Box sx={{ height: 'calc(100vh - 48px)', display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
      {/* 左側: チャットパネル */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          チャット
        </Typography>
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <ChatPanel />
        </Paper>
      </Box>

      {/* 右側: カレンダーパネル */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          カレンダー
        </Typography>
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <CalendarPanel />
        </Paper>
      </Box>
    </Box>
  );
}
