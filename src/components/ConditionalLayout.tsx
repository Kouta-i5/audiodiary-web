'use client';

import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    // ログインページの場合はサイドバーなし
    return <>{children}</>;
  }

  // その他のページはサイドバーあり
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flex: 1, overflowY: 'auto', width: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

