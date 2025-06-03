'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="h-full w-64 bg-base-200 shadow-lg flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-base-300">
        メニュー
      </div>
      <nav className="flex-1 p-2">
        <ul className="menu menu-lg">
          <li>
            <Link href="/">
              <span>ホーム</span>
            </Link>
          </li>
          <li>
            <Link href="/calendar">
              <span>カレンダー</span>
            </Link>
          </li>
          <li>
            <Link href="/chat">
              <span>チャット</span>
            </Link>
          </li>
          {/* 必要に応じてメニュー追加 */}
        </ul>
      </nav>
    </aside>
  );
}