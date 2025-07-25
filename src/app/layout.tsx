import "@/app/globals.css";
import ClientThemeProvider from "@/components/clientThemeProvider";
import Sidebar from "@/components/sidebar";
import { Box } from '@mui/material';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AudioDiary",
  description: "音声日記アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientThemeProvider>
          <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <Box component="main" sx={{ flex: 1, ml: '240px' }}>
              {children}
            </Box>
          </Box>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
