'use client';

import { useState } from 'react';
import { fetchMessage,fetchSummary, setChatContext } from '../../utils/api';

// 今日の日付をYYYY-MM-DD形式で取得
const getToday = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // 新規：コンテキスト入力用state
  const [context, setContext] = useState({
    date: getToday(),
    time_of_day: '',
    location: '',
    companion: '',
    mood: '',
  });
  const [contextMsg, setContextMsg] = useState('');
  const [contextLoading, setContextLoading] = useState(false);

  // その他入力用state
  const [other, setOther] = useState({
    time_of_day: '',
    location: '',
    companion: '',
    mood: '',
  });

  // 選択肢
  const timeOfDayOptions = ['朝', '昼', '夕方', '夜', 'その他'];
  const locationOptions = ['自宅', '学校', '職場', '外出先', 'その他'];
  const companionOptions = ['一人', '家族', '友人', '同僚', 'その他'];
  const moodOptions = ['良い', '普通', '悪い', 'その他'];

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages((prev) => [...prev, `🧑‍💬: ${input}`]);

    // まず空のAIメッセージを追加
    setMessages((prev) => [...prev, `🤖: `]);
    try {
      console.log('送信するメッセージ:', input);
      const response = await fetchMessage(input);
      console.log('APIレスポンス:', response);

      if (!response) {
        throw new Error('APIからのレスポンスが空です');
      }

      // 1文字ずつストリーミング風に表示
      for (let i = 0; i < response.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 18)); // 速さは調整可
        setMessages((prev) => {
          // 最後のAIメッセージだけを更新
          const last = prev[prev.length - 1];
          if (last && last.startsWith('🤖: ')) {
            return [
              ...prev.slice(0, -1),
              `🤖: ${response.slice(0, i + 1)}`
            ];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      setMessages((prev) => [...prev, '⚠️: エラーが発生しました']);
    }
    setInput('');
    setLoading(false);
  };

  const handleSummarize = async () => {
    setSummaryLoading(true);
    try {
      const conversation = messages.join('\n');
      const result = await fetchSummary(conversation);
      setSummary(result);
    } catch {
      setSummary('要約に失敗しました');
    }
    setSummaryLoading(false);
  };

  // 新規：コンテキスト送信ハンドラ
  const handleSetContext = async () => {
    setContextLoading(true);
    setContextMsg('');
    try {
      console.log('送信するコンテキスト:', context);
      const result = await setChatContext(context);
      console.log('APIレスポンス:', result);
      setContextMsg(result.message);
      // initial_messageがあればメッセージエリアに追加
      if (result.initial_message) {
        setMessages(prev => [...prev, `🤖: ${result.initial_message}`]);
      }
    } catch (error) {
      console.error('コンテキスト送信エラー:', error);
      setContextMsg('コンテキスト送信に失敗しました');
    }
    setContextLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl p-6">  
      {/* コンテキスト設定フォーム */}
      <div className="card bg-white/80 shadow-lg rounded-xl p-6 mb-6 border border-base-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🗒️</span>
          <span className="font-extrabold text-lg text-gray-700">今日はどんなことがありましたか？</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="input input-bordered input-lg rounded-xl focus:ring-2 focus:ring-accent/60"
            type="date"
            value={context.date}
            onChange={e => setContext(c => ({ ...c, date: e.target.value }))}
          />
          {/* 時間帯 */}
          <div>
            <div className="mb-1 font-semibold">時間帯</div>
            <div className="flex flex-wrap gap-2">
              {timeOfDayOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`
                    btn btn-sm rounded-full shadow-md font-semibold
                    transition duration-150
                    ${context.time_of_day.startsWith(opt)
                      ? 'bg-green-200 text-green-900 border-green-400 scale-105 ring-2 ring-green-200'
                      : 'btn-outline hover:bg-green-100 hover:text-green-800 hover:border-green-300 hover:scale-105'}`}
                  onClick={() => {
                    if (opt === 'その他') {
                      setContext(c => ({ ...c, time_of_day: 'その他:' + other.time_of_day }));
                    } else {
                      setContext(c => ({ ...c, time_of_day: opt }));
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {context.time_of_day.startsWith('その他') && (
              <input
                className="input input-bordered mt-2"
                placeholder="その他の時間帯を入力"
                value={other.time_of_day}
                onChange={e => {
                  setOther(o => ({ ...o, time_of_day: e.target.value }));
                  setContext(c => ({ ...c, time_of_day: 'その他:' + e.target.value }));
                }}
              />
            )}
          </div>
          {/* 場所 */}
          <div>
            <div className="mb-1 font-semibold">場所</div>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`
                    btn btn-sm rounded-full shadow-md font-semibold
                    transition duration-150
                    ${context.location.startsWith(opt)
                      ? 'bg-green-200 text-green-900 border-green-400 scale-105 ring-2 ring-green-200'
                      : 'btn-outline hover:bg-green-100 hover:text-green-800 hover:border-green-300 hover:scale-105'}`}
                  onClick={() => {
                    if (opt === 'その他') {
                      setContext(c => ({ ...c, location: 'その他:' + other.location }));
                    } else {
                      setContext(c => ({ ...c, location: opt }));
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {context.location.startsWith('その他') && (
              <input
                className="input input-bordered mt-2"
                placeholder="その他の場所を入力"
                value={other.location}
                onChange={e => {
                  setOther(o => ({ ...o, location: e.target.value }));
                  setContext(c => ({ ...c, location: 'その他:' + e.target.value }));
                }}
              />
            )}
          </div>
          {/* 一緒にいる人 */}
          <div>
            <div className="mb-1 font-semibold">一緒にいる人</div>
            <div className="flex flex-wrap gap-2">
              {companionOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`
                    btn btn-sm rounded-full shadow-md font-semibold
                    transition duration-150
                    ${context.companion.startsWith(opt)
                      ? 'bg-green-200 text-green-900 border-green-400 scale-105 ring-2 ring-green-200'
                      : 'btn-outline hover:bg-green-100 hover:text-green-800 hover:border-green-300 hover:scale-105'}`}
                  onClick={() => {
                    if (opt === 'その他') {
                      setContext(c => ({ ...c, companion: 'その他:' + other.companion }));
                    } else {
                      setContext(c => ({ ...c, companion: opt }));
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {context.companion.startsWith('その他') && (
              <input
                className="input input-bordered mt-2"
                placeholder="その他の人を入力"
                value={other.companion}
                onChange={e => {
                  setOther(o => ({ ...o, companion: e.target.value }));
                  setContext(c => ({ ...c, companion: 'その他:' + e.target.value }));
                }}
              />
            )}
          </div>
          {/* 気分 */}
          <div>
            <div className="mb-1 font-semibold">気分</div>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`
                    btn btn-sm rounded-full shadow-md font-semibold
                    transition duration-150
                    ${context.mood.startsWith(opt)
                      ? 'bg-green-200 text-green-900 border-green-400 scale-105 ring-2 ring-green-200'
                      : 'btn-outline hover:bg-green-100 hover:text-green-800 hover:border-green-300 hover:scale-105'}`}
                  onClick={() => {
                    if (opt === 'その他') {
                      setContext(c => ({ ...c, mood: 'その他:' + other.mood }));
                    } else {
                      setContext(c => ({ ...c, mood: opt }));
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {context.mood.startsWith('その他') && (
              <input
                className="input input-bordered mt-2"
                placeholder="その他の気分を入力"
                value={other.mood}
                onChange={e => {
                  setOther(o => ({ ...o, mood: e.target.value }));
                  setContext(c => ({ ...c, mood: 'その他:' + e.target.value }));
                }}
              />
            )}
          </div>
        </div>
        <button
          className="btn btn-accent btn-lg mt-4 w-full rounded-xl shadow hover:scale-105 transition"
          onClick={handleSetContext}
          disabled={contextLoading}
        >
          {contextLoading ? <span className="loading loading-spinner"></span> : '会話を始めてみよう'}
        </button>
        {contextMsg && <div className="mt-2 text-accent font-semibold">{contextMsg}</div>}
      </div>
      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 bg-white/70 rounded-xl shadow-inner space-y-4 mb-6 border border-base-200">
        {messages.map((msg, i) => {
          const isUser = msg.startsWith('🧑‍💬');
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
              <div
                className={`
                  max-w-xs px-4 py-2 rounded-2xl shadow
                  ${isUser
                    ? 'bg-emerald-200 text-right rounded-br-sm'
                    : 'bg-gray-100 text-left rounded-bl-sm'}
                `}
              >
                {msg}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-row items-center justify-between gap-3 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 rounded-xl shadow-lg p-4 border border-emerald-100/50 hover:shadow-xl hover:border-emerald-200/50 transition-all duration-300">
        <form
          className="flex-1 flex items-center gap-3"
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          autoComplete="off"
        >
          <input
            type="text"
            placeholder="メッセージを入力..."
            aria-label="メッセージ入力"
            className="input input-bordered input-lg w-full rounded-full shadow-sm bg-white/90 focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400/40 hover:bg-white hover:border-emerald-300/50 transition-all duration-200 py-4 px-4"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            maxLength={200}
          />
          <button
            type="button"
            className="btn btn-circle btn-xl shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 min-w-[64px] min-h-[64px] flex items-center justify-center"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="送信"
          >
            {loading ? (
              <span className="loading loading-spinner w-8 h-8"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <button
          type="button"
          className={`btn btn-circle btn-xl shadow-lg bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 text-emerald-700 border-emerald-200 
            hover:from-emerald-200 hover:via-emerald-300 hover:to-emerald-400 
            hover:text-emerald-800 hover:border-emerald-300 
            hover:scale-110 hover:shadow-xl active:scale-95
            focus:ring-2 focus:ring-emerald-200 
            transition-all duration-200 min-w-[64px] min-h-[64px] flex items-center justify-center
            ${summaryLoading || messages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSummarize}
          disabled={summaryLoading || messages.length === 0}
          aria-label="会話を要約"
          title="会話を要約"
        >
          {summaryLoading ? (
            <span className="loading loading-spinner w-8 h-8"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>
      {/* 要約表示エリア */}
      {summary && (
        <div className="alert alert-info shadow-lg rounded-xl mt-6">
          <span className="font-bold">要約：</span>
          <span>{summary}</span>
        </div>
      )}
    </div>
  );
}