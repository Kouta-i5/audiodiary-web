import axios from "axios";

// ローカル環境のURL
const baseURL = "http://localhost:8000";

const api = axios.create({
    baseURL,
  });
  


export async function fetchSummary(conversation: string) {
    const res = await api.post('/chat/summarize', {
        conversation,
    });
  
    if (!res.data) {
      throw new Error('要約APIの呼び出しに失敗しました');
    }
  
    return res.data.summary;
  }

export async function fetchMessage(content: string) {
    const res = await api.post('/chat/message', {
        content,
    });
  
    if (!res.data) {
      throw new Error('チャットAPIの呼び出しに失敗しました');
    }
  
    return res.data.response;
  }

export async function setChatContext(context: {
  date: string;
  time_of_day: string;
  location: string;
  companion: string;
  mood: string;
}) {
  const res = await api.post('chat/context', {
    context,
  });
  if (!res.data) throw new Error('コンテキストAPIの呼び出しに失敗しました');
  return {
    message: res.data.message,
    initial_message: res.data.initial_message,
    context: res.data.context,
  };
}