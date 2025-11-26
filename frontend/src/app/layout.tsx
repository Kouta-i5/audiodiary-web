import type { Metadata } from "next";
import ClientThemeProvider from "../components/clientThemeProvider";
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
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}
