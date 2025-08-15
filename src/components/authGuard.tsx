'use client';

import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser, isLoggedIn } from '../utils/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // デバッグ情報を追加
        const token = localStorage.getItem('access_token');
        console.log('認証チェック開始:', { 
          hasToken: !!token, 
          tokenLength: token?.length,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'なし'
        });

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

  // 認証されていない場合は、useEffect内でリダイレクト
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/auth');
    }
  }, [loading, authenticated, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
