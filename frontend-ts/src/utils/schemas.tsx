export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatMessageRequest {
    content: string;
    messages?: Message[];
    context?: Array<Record<string, unknown>>;
}

export interface ChatMessageResponse {
    content: string;
}

export interface SummarizeRequest {
    conversation: string;
}

export interface SummarizeResponse {
    summary: string;
}

export interface ChatContext {
    date: string;
    time_of_day: string;
    location: string;
    companion: string;
    mood: string;
}

export interface DiaryRequest {
    date: string;
    content: string;
    time_of_day?: string;
    location?: string;
    companion?: string;
    mood?: string;
}

export interface DiaryResponse {
    diary_id: number;
    user_id: number;
    date: string;
    content: string;
    time_of_day?: string;
    location?: string;
    companion?: string;
    mood?: string;
    created_at: string;
    updated_at?: string;
}
