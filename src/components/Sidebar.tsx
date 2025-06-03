'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const linkNames: { [key: string]: string } = {
  Profile: 'プロフィール',
  Home: 'ホーム',
  Information: '情報',
  Setting: '設定'
};

const navItems = [
  { href: '/Profile', icon: '👤', label: linkNames.Profile },
  { href: '/Home', icon: '🏠', label: linkNames.Home },
  { href: '/Information', icon: '📢', label: linkNames.Information },
  { href: '/Setting', icon: '⚙️', label: linkNames.Setting },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-base-200 via-base-100 to-base-200 shadow-xl flex flex-col z-40">
      {/* ロゴ・アプリ名 */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-base-300">
        <span className="text-3xl">📝</span>
        <span className="font-bold text-lg tracking-wide text-gray-700">AudioDiary</span>
      </div>
      {/* メニュー */}
      <nav className="flex-1 flex flex-col py-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-5 py-3 rounded-lg font-medium transition
                  duration-200
                  ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow-md scale-[1.03]'
                      : 'hover:bg-base-300 hover:shadow hover:scale-105 text-gray-700'
                  }
                  group
                `}
              >
                <span
                  className={`
                    text-2xl transition duration-200
                    ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}
                  `}
                >
                  {item.icon}
                </span>
                <span
                  className={`
                    transition duration-200
                    ${pathname === item.href ? 'font-bold' : ''}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* フッター（任意） */}
      <div className="px-6 py-4 border-t border-base-300 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} AudioDiary
      </div>
    </aside>
  );
}