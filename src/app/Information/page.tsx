'use client';

import { Box, Stack } from '@mui/material';
import CalendarPanel from '../../components/home/calendarPanel';
import ChatPanel from '../../components/home/chatPanel';

export default function InformationPage() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* メイン2分割 */}
      <Stack direction="row" sx={{ flex: 1, overflow: 'hidden' }}>
        <Box sx={{ width: '50%', height: '100%', p: 2 }}>
          <ChatPanel />
        </Box>
        <Box sx={{ width: '50%', height: '100%', p: 2 }}>
          <CalendarPanel />
        </Box>
      </Stack>
    </Box>
  );
}
