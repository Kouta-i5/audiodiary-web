'use client';

import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginUser, registerUser, saveToken } from '../../utils/auth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // ログイン用のstate
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // 登録用のstate
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await loginUser(loginData);
      
      // トークンを保存
      saveToken(response.access_token);
      
      // 成功時の処理
      setSuccess('ログインに成功しました！');
      
      // ホームページにリダイレクト
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // パスワード確認
    if (registerData.password !== registerData.confirmPassword) {
      setError('パスワードが一致しません。');
      setLoading(false);
      return;
    }
    
    try {
      await registerUser({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });
      
      // 成功時の処理
      setSuccess('アカウントの登録が完了しました！ログインしてください。');
      setTabValue(0); // ログインタブに切り替え
      
      // 登録データをクリア
      setRegisterData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アカウントの登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* ヘッダー */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            AI-Diary
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            日記をAIと一緒に作成しましょう
          </Typography>
        </Box>

        {/* タブ */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="ログイン" />
            <Tab label="新規登録" />
          </Tabs>
        </Box>

        {/* ログインフォーム */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleLogin} sx={{ px: 3 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="ユーザー名"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="パスワード"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'ログイン中...' : 'ログイン'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* 登録フォーム */}
        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleRegister} sx={{ px: 3 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="ユーザー名"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="メールアドレス"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="パスワード"
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="パスワード確認"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? '登録中...' : 'アカウント登録'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* エラー・成功メッセージ */}
        {error && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        {success && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Alert severity="success">{success}</Alert>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
