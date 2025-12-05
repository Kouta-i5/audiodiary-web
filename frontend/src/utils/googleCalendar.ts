import { google } from 'googleapis';

// Google OAuth 2.0設定を取得
function getOAuth2Client() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID が設定されていません');
  }
  if (!clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET が設定されていません');
  }
  if (!redirectUri) {
    throw new Error('NEXT_PUBLIC_GOOGLE_REDIRECT_URI が設定されていません');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// 認証URLを生成
export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  const scopes = process.env.NEXT_PUBLIC_GOOGLE_SCOPES || process.env.GOOGLE_SCOPES;
  const scopeArray = scopes
    ? scopes.split(',').map((s) => s.trim())
    : ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar'];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopeArray,
    prompt: 'consent',
  });
}

// トークンを交換
export async function getTokenFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('トークン交換エラー:', error);
    throw new Error(`トークンの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Google Calendar APIクライアントを取得
export function getCalendarClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
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
  const calendar = getCalendarClient(accessToken, refreshToken);
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
  const calendar = getCalendarClient(accessToken, refreshToken);
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
  const calendar = getCalendarClient(accessToken, refreshToken);
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
  const calendar = getCalendarClient(accessToken, refreshToken);
  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });
}

