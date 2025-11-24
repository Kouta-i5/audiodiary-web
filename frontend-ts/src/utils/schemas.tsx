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
