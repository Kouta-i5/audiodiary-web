import axios from "axios";
import {
    ChatMessageRequest,
    ChatMessageResponse,
    Message,
    SummarizeRequest,
    SummarizeResponse,
} from "./schemas";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";

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

export async function transcribeAudio(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${baseURL}/api/v1/stt/transcribe`, {
        method: 'POST',
        body: form,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`文字起こしAPIエラー: ${text}`);
    }
    const data = await res.json();
    return data.text as string;
}

export async function streamTranscription(
    file: File,
    onPartial: (partialText: string) => void
): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${baseURL}/api/v1/stt/transcribe/stream`, {
        method: 'POST',
        body: form,
    });
    if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        throw new Error(`文字起こしストリーム開始に失敗しました: ${text}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulated = '';
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            // SSEのイベント区切りは \n\n
            const parts = buffer.split('\n\n');
            buffer = parts.pop() ?? '';
            for (const chunk of parts) {
                const line = chunk.split('\n').find(l => l.startsWith('data: '));
                if (!line) continue;
                const payload = line.slice(6);
                try {
                    const data = JSON.parse(payload);
                    if (typeof data.delta === 'string') {
                        accumulated += data.delta;
                        onPartial(accumulated);
                    } else if (data.done && typeof data.text === 'string') {
                        accumulated = data.text;
                        onPartial(accumulated);
                    }
                } catch {
                    // JSONでないデータは無視
                }
            }
        }
        return accumulated.trimEnd();
    } finally {
        reader.releaseLock();
    }
}

export async function synthesizeTTS(text: string, voice: string = 'alloy', format: string = 'mp3'): Promise<Blob> {
    const res = await fetch(`${baseURL}/api/v1/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, format }),
    });
    if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`TTSAPIエラー: ${t}`);
    }
    const blob = await res.blob();
    return blob;
}

