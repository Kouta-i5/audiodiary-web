'use client';

import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 既に認証済みかチェック
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('google_access_token');
      const refreshToken = localStorage.getItem('google_refresh_token');
      
      if (accessToken && refreshToken) {
        // 既に認証済みの場合はホームにリダイレクト
        router.push('/');
      } else {
        setCheckingAuth(false);
      }
    }
  }, [router]);

  // Google認証を開始
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      window.location.href = '/api/auth/google/login';
    } catch {
      setError('認証の開始に失敗しました');
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* ロゴ */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            AI-Diary
          </Typography>
          <Typography variant="body1" color="text.secondary">
            音声日記アプリケーション
          </Typography>
        </Box>

        {/* メインカード */}
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Googleカレンダーと連携
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            予定の作成・編集・削除を行うには、Googleアカウントでの認証が必要です。
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={handleGoogleAuth}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CalendarIcon />}
            sx={{
              bgcolor: '#4285f4',
              '&:hover': { bgcolor: '#357ae8' },
              minWidth: 200,
            }}
          >
            {loading ? '認証中...' : 'Googleで認証'}
          </Button>
        </Paper>

        {/* フッター */}
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} AudioDiary. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

