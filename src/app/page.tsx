'use client';

import { Box, Grid } from '@mui/material';
import CalendarPanel from '../components/home/CalendarPanel';
import ChatPanel from '../components/home/ChatPanel';

export default function HomePage() {
  return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* メイン2分割 - MUI v7 Gridを使用 */}
        <Grid container spacing={0} sx={{ flex: 1, overflow: 'hidden' }}>
          {/* 左側: チャットパネル */}
          <Grid size={6} sx={{ height: '100%', p: 2, overflow: 'hidden' }}>
            <ChatPanel />
          </Grid>
          {/* 右側: カレンダーパネル */}
          <Grid size={6} sx={{ height: '100%', p: 2, overflow: 'hidden' }}>
            <CalendarPanel />
          </Grid>
        </Grid>
      </Box>
  );
}
