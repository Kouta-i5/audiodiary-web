'use client';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // サイドバーを削除したため、単純にchildrenを返す
  return <>{children}</>;
}