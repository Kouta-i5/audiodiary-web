import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;
  const scopes = process.env.NEXT_PUBLIC_GOOGLE_SCOPES || process.env.GOOGLE_SCOPES || 'openid email profile https://www.googleapis.com/auth/calendar';

  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID が設定されていません' },
      { status: 500 }
    );
  }
  if (!redirectUri) {
    return NextResponse.json(
      { error: 'GOOGLE_REDIRECT_URI が設定されていません' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  return NextResponse.redirect(googleAuthUrl);
}

