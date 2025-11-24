import axios from "axios";
import {
    ChatContext,
    ChatMessageRequest,
    ChatMessageResponse,
    DiaryRequest,
    DiaryResponse,
    Message,
    SummarizeRequest,
    SummarizeResponse,
} from "./schemas";

const baseURL = "http://localhost:8001";

const api = axios.create({
    baseURL,
});

export async function fetchSummary(conversation: string): Promise<string> {
    const request: SummarizeRequest = {
        conversation,
    };
    const res = await api.post<SummarizeResponse>('/api/v1/chat/summarize', request);

    if (!res.data) {
        throw new Error('要約APIの呼び出しに失敗しました');
    }

    return res.data.summary;
}

export async function fetchMessage(
    content: string,
    messages?: Message[],
    context?: Array<Record<string, unknown>>
): Promise<string> {
    try {
        const request: ChatMessageRequest = {
            content,
            messages,
            context,
        };
        console.log('APIリクエスト:', request);
        const res = await api.post<ChatMessageResponse>('/api/v1/chat/message', request);

        console.log('APIレスポンス:', res.data);
        if (!res.data) {
            throw new Error('チャットAPIの呼び出しに失敗しました: レスポンスデータが空です');
        }

        return res.data.content;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('APIエラー詳細:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(`チャットAPIの呼び出しに失敗しました: ${error.message}`);
        }
        throw error;
    }
}

export async function setChatContext(context: ChatContext) {
    const res = await api.post('/api/v1/chat/context', context);
    if (!res.data) throw new Error('コンテキストAPIの呼び出しに失敗しました');
    return {
        message: res.data.message,
        initial_message: res.data.initial_message,
        context: res.data.context,
    };
}

export async function saveDiary(payload: DiaryRequest): Promise<DiaryResponse> {
    const { data } = await api.post<DiaryResponse>('/api/v1/chat/save', payload);
    return data;
}

export async function fetchDiaries(): Promise<DiaryResponse[]> {
    try {
        const { data } = await api.get<DiaryResponse[]>('/api/v1/diary/');
        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('日記一覧の取得に失敗しました:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(`日記一覧の取得に失敗しました: ${error.message}`);
        }
        throw error;
    }
}
