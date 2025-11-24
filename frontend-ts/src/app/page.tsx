'use client';

import { Box, CircularProgress, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import AudioDiaryPanel from '../components/home/AudioDiaryPanel';
import CalendarPanel from '../components/home/CalendarPanel';
import ChatPanel from '../components/home/ChatPanel';
import dayjs from 'dayjs';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [isResizing, setIsResizing] = useState(false);

  // 認証状態をチェック（すべてのHooksは条件分岐の前に呼ぶ必要がある）
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

  // リサイズ中はスクロールを禁止
  useEffect(() => {
    const checkDraggingState = () => {
      const draggingHandle = document.querySelector('.calendar-resize-handle[data-panel-resize-handle-state="dragging"]');
      setIsResizing(!!draggingHandle);
    };

    const observer = new MutationObserver(checkDraggingState);

    // resize-handle要素を監視（複数の要素を監視するため、documentを監視対象にする）
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-panel-resize-handle-state'],
      subtree: true,
    });

    // 定期的に状態をチェック（MutationObserverのフォールバック）
    const intervalId = setInterval(checkDraggingState, 50);

    if (isResizing) {
      document.body.style.overflow = 'hidden';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.userSelect = '';
    }

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
      document.body.style.overflow = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

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
    <>
      {/* モバイル表示（縦並び） */}
      <Box
        sx={{
          height: '100vh',
          display: { xs: 'flex', lg: 'none' },
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
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
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
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
            <ChatPanel selectedDate={selectedDate} />
          </Paper>
        </Box>
      </Box>

      {/* デスクトップ表示（resizableパネル） */}
      <Box
        sx={{
          height: '100vh',
          display: { xs: 'none', lg: 'flex' },
        }}
      >
        <PanelGroup direction="horizontal" style={{ height: '100vh', width: '100%' }}>
          {/* 左側: カレンダーパネルとAudioDiaryの上下分割 */}
          <Panel defaultSize={66.667} minSize={33.333}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
              <PanelGroup direction="vertical" style={{ height: '100%', width: '100%' }}>
                {/* 上側: カレンダー */}
                <Panel defaultSize={75} minSize={50}>
                  <Box sx={{ height: '100%', p: 1 }}>
                    <Paper
                      elevation={2}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRadius: 2,
                      }}
                    >
                      <CalendarPanel
                        onDateSelect={setSelectedDate}
                        onMonthChange={setCurrentMonth}
                        isResizing={isResizing}
                      />
                    </Paper>
                  </Box>
                </Panel>

                {/* Resizable Handle */}
                <PanelResizeHandle
                  style={{
                    height: '4px',
                    backgroundColor: 'transparent',
                    cursor: 'row-resize',
                    position: 'relative',
                    transition: isResizing ? 'none' : 'background-color 0.2s',
                  }}
                  className="resize-handle calendar-resize-handle"
                >
                  <Box
                    component="div"
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      height: '20px',
                      width: '40px',
                      borderRadius: '4px',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 1,
                      pointerEvents: 'none',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          height: '3px',
                          width: '20px',
                          backgroundColor: 'text.secondary',
                          borderRadius: '1px',
                        }}
                      />
                      <Box
                        sx={{
                          height: '3px',
                          width: '20px',
                          backgroundColor: 'text.secondary',
                          borderRadius: '1px',
                        }}
                      />
                    </Box>
                  </Box>
                </PanelResizeHandle>

                {/* 下側: AudioDiary */}
                <Panel defaultSize={25} minSize={25}>
                  <Box sx={{ height: '100%', p: 1.5 }}>
                    <Paper
                      elevation={2}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRadius: 2,
                      }}
                    >
                      <AudioDiaryPanel
                        currentMonth={currentMonth}
                        onMonthChange={setCurrentMonth}
                      />
                    </Paper>
                  </Box>
                </Panel>
              </PanelGroup>
            </Box>
          </Panel>

          {/* Resizable Handle */}
          <PanelResizeHandle
            style={{
              width: '4px',
              backgroundColor: 'transparent',
              cursor: 'col-resize',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
            className="resize-handle"
          >
            <Box
              component="div"
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '40px',
                borderRadius: '4px',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 1,
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: '3px',
                    height: '20px',
                    backgroundColor: 'text.secondary',
                    borderRadius: '1px',
                  }}
                />
                <Box
                  sx={{
                    width: '3px',
                    height: '20px',
                    backgroundColor: 'text.secondary',
                    borderRadius: '1px',
                  }}
                />
              </Box>
            </Box>
          </PanelResizeHandle>

          {/* 右側: チャットパネル */}
          <Panel defaultSize={33.333} minSize={33.333}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
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
                <ChatPanel selectedDate={selectedDate} />
              </Paper>
            </Box>
          </Panel>
        </PanelGroup>
      </Box>
    </>
  );
}
