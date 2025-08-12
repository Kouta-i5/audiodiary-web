'use client';

import { Grid } from '@mui/material';
import CalendarPanel from '../components/home/calendarPanel';
import ChatPanel from '../components/home/chatPanel';

export default function HomePage() {
  return (
    <Grid container spacing={0} sx={{ flex: 1, height: '100vh' }}>
      <Grid size={6} sx={{ height: '100%', p: 2, overflow: 'auto' }}>
        <ChatPanel />
      </Grid>
      {/* 右側: カレンダーパネル */}
      <Grid size={6} sx={{ height: '100%', p: 2, overflow: 'auto' }}>
        <CalendarPanel />
      </Grid>
    </Grid>
  );
}
