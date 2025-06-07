export interface ChatContext {
    date: string
    time_of_day: string
    location: string
    companion: string
    mood: string
}
export interface DiaryRequest {
    summary: string
    context?: ChatContext
}
export interface DiaryResponse {
    diary_id: number
    data: string
    summary: string
    context?: ChatContext[]
}