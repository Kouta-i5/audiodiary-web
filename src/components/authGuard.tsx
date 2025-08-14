'use client';

import { getCurrentUser, isLoggedIn } from '@/utils/auth';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // トークンの存在チェック
        if (isLoggedIn()) {
          // トークンが有効かどうかサーバーで確認
          await getCurrentUser();
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('認証チェックエラー:', error);
        // トークンが無効な場合は削除
        localStorage.removeItem('access_token');
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated) {
    router.push('/auth');
    return null;
  }

  return <>{children}</>;
}
