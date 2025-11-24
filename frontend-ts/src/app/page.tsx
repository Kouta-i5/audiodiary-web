'use client';

import { Box, CircularProgress, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CalendarPanel from '../components/home/CalendarPanel';
import ChatPanel from '../components/home/ChatPanel';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 認証状態をチェック
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // URLパラメータからトークンを取得（認証コールバック後）
      const params = new URLSearchParams(window.location.search);
      const accessTokenParam = params.get('access_token');
      const refreshTokenParam = params.get('refresh_token');
      
      if (accessTokenParam && refreshTokenParam) {
        // トークンを保存
        localStorage.setItem('google_access_token', accessTokenParam);
        localStorage.setItem('google_refresh_token', refreshTokenParam);
        // URLからパラメータを削除
        window.history.replaceState({}, '', '/');
        setIsAuthenticated(true);
        return;
      }
      
      // ローカルストレージからトークンを確認
      const accessToken = localStorage.getItem('google_access_token');
      const refreshToken = localStorage.getItem('google_refresh_token');
      
      if (accessToken && refreshToken) {
        setIsAuthenticated(true);
      } else {
        // 未認証の場合は /login にリダイレクト
        router.push('/login');
      }
    }
  }, [router]);

  // 認証チェック中はローディング表示
  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated) {
    return null;
  }

  // 認証済みの場合のみコンテンツを表示
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>
      {/* 左側: チャットパネル (2/3) */}
      <Box sx={{ flex: '0 0 66.667%', display: 'flex', flexDirection: 'column', minWidth: 0, p: 2 }}>
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
          <CalendarPanel onDateSelect={setSelectedDate} />
        </Paper>
      </Box>

      {/* 右側: チャットパネル (1/3) */}
      <Box sx={{ flex: '0 0 33.333%', display: 'flex', flexDirection: 'column', minWidth: 0, p: 2 }}>
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
          <ChatPanel selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </Paper>
      </Box>
    </Box>
  );
}
