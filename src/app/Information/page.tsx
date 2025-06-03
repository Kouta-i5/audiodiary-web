'use client';

import ChatPanel from '../../components/home/ChatPanel';
import CalendarPanel from '../../components/home/CalendarPanel';

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col">
      {/* メイン2分割 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 h-full p-4">
          <ChatPanel />
        </div>
        <div className="w-1/2 h-full p-4 bg-base-200">
          <CalendarPanel />
        </div>
      </div>
    </div>
  );
}
