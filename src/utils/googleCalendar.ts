import { google } from 'googleapis';

// Google OAuth 2.0設定
const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
);

// 認証URLを生成
export function getAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

// トークンを交換
export async function getTokenFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// トークンでOAuthクライアントを設定
export function setCredentials(tokens: { access_token?: string; refresh_token?: string }) {
  oauth2Client.setCredentials(tokens);
}

// Google Calendar APIクライアントを取得
export function getCalendarClient() {
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// 予定を作成
export async function createEvent(
  accessToken: string,
  refreshToken: string,
  eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: string;
  }
) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = getCalendarClient();
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: eventData,
  });

  return response.data;
}

// 予定を取得
export async function getEvents(
  accessToken: string,
  refreshToken: string,
  timeMin?: string,
  timeMax?: string
) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = getCalendarClient();
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax,
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}

// 予定を更新
export async function updateEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string,
  eventData: {
    summary?: string;
    description?: string;
    start?: { dateTime: string; timeZone: string };
    end?: { dateTime: string; timeZone: string };
    location?: string;
  }
) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = getCalendarClient();
  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    requestBody: eventData,
  });

  return response.data;
}

// 予定を削除
export async function deleteEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string
) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = getCalendarClient();
  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });
}

