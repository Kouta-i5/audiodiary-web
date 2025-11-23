'use client';

import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../utils/auth';

interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  created_at?: string;
  is_active?: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('ユーザー情報取得エラー:', err);
        setError(err instanceof Error ? err.message : 'ユーザー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // アカウント作成からの日数を計算
  const getDaysSinceCreation = () => {
    if (!user?.created_at) return 0;
    const created = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              <Skeleton variant="text" width="60%" height={60} />
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              <Skeleton variant="text" width="40%" height={40} />
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {[...Array(4)].map((_, i) => (
                  <Grid item xs={6} key={i}>
                    <Skeleton variant="rectangular" width="100%" height={120} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            エラーが発生しました
          </Typography>
          <Typography variant="body1">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">ユーザー情報が見つかりません</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* プロフィールヘッダー */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {user.username}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon color="action" />
                  <Typography variant="body1" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                {user.is_active && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="アクティブ"
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 統計情報 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              統計情報
            </Typography>
            <Grid container spacing={3}>
              {/* ユーザーID */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">ユーザーID</Typography>
                      <PersonIcon />
                    </Box>
                    <Typography variant="h4" fontWeight={700}>
                      #{user.user_id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 登録日 */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">登録日</Typography>
                      <CalendarIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP') : '不明'}
                    </Typography>
                    <Typography variant="caption">
                      {getDaysSinceCreation()}日間使用中
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* メールアドレス */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">メールアドレス</Typography>
                      <EmailIcon />
                    </Box>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {user.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* ステータス */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">アカウントステータス</Typography>
                      <CheckCircleIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {user.is_active ? 'アクティブ' : '非アクティブ'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
