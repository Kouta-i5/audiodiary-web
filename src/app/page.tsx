'use client';

import { Box } from '@mui/material';
import ChatPanel from '../components/ChatPanel';
import CalendarPanel from '../components/CalendarPanel';

export default function HomePage() {
  return (
    <Box display="flex" height="100vh">
      {/* 左：チャット欄 */}
      <Box flex={5}>
        <ChatPanel />
      </Box>

      {/* 右：カレンダー */}
      <Box flex={5}>
        <CalendarPanel />
      </Box>
    </Box>
  );
}
