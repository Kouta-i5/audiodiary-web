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

