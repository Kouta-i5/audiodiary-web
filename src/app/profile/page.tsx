'use client';

import { getCurrentUser } from '@/utils/auth';
import {
    CalendarToday as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Paper,
    Skeleton,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

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

  if (loading) {
    return (
      <Box sx={{ height: '100vh', py: 3, px: 2 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Skeleton variant="text" width="60%" height={60} />
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
            </Paper>
          </Grid>
          <Grid size={12}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Skeleton variant="text" width="40%" height={40} />
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {[...Array(4)].map((_, i) => (
                  <Grid size={6} key={i}>
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
        <Alert severity="error" sx={{ borderRadius: 3 }}>
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
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          ユーザー情報が見つかりません
        </Alert>
      </Box>
    );
  }

  // アカウント作成からの日数を計算
  const getDaysSinceCreation = () => {
    if (!user.created_at) return 0;
    const created = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Box sx={{ height: '100vh', py: 3, px: 2 }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* プロフィールヘッダー */}
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: 'primary.50' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size="auto">
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    border: '3px solid white',
                    boxShadow: 2
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid size="grow">
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                  {user.username}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={user.is_active ? "アクティブ" : "非アクティブ"}
                    color={user.is_active ? "success" : "default"}
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    ユーザーID: #{user.user_id}
                  </Typography>
                </Box>
              </Grid>
              <Grid size="auto">
                <IconButton
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ユーザー詳細情報 */}
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom sx={{ mb: 3 }}>
              プロフィール情報
            </Typography>
            
            <Grid container spacing={3}>
              {/* ユーザー名 */}
              <Grid size={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        ユーザー名
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {user.username}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* メールアドレス */}
              <Grid size={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        メールアドレス
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {user.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* アカウント作成日 */}
              <Grid size={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        アカウント作成日
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {user.created_at ? 
                        new Date(user.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : '不明'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* ユーザーID */}
              <Grid size={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        ユーザーID
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      #{user.user_id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* アカウント統計情報 */}
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: 'secondary.50' }}>
            <Typography variant="h5" fontWeight="bold" color="secondary" gutterBottom sx={{ mb: 3 }}>
              アカウント統計
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {user.is_active ? '1' : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      アクティブセッション
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {getDaysSinceCreation()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      アカウント作成からの日数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {user.is_active ? '有効' : '無効'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      アカウント状態
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
