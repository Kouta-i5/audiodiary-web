import { Box } from '@mui/material';
import type { Metadata } from "next";
import ClientThemeProvider from "../components/ClientThemeProvider";
import Sidebar from "../components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AudioDiary",
  description: "音声日記アプリケーション",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ClientThemeProvider>
          <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <Box component="main" sx={{ flex: 1, overflowY: 'auto' }}>
              <Box sx={{ maxWidth: '1400px', mx: 'auto', p: 3 }}>
                {children}
              </Box>
            </Box>
          </Box>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
