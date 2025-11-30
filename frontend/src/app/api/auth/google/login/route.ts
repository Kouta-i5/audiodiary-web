import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;
  const scopes = process.env.NEXT_PUBLIC_GOOGLE_SCOPES || process.env.GOOGLE_SCOPES || 'openid email profile https://www.googleapis.com/auth/calendar';

  console.log('Google認証開始:', {
    hasClientId: !!clientId,
    clientIdPrefix: clientId ? `${clientId.substring(0, 10)}...` : '未設定',
    redirectUri: redirectUri,
    scopes: scopes,
  });

  if (!clientId) {
    console.error('GOOGLE_CLIENT_IDが設定されていません');
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID が設定されていません' },
      { status: 500 }
    );
  }
  if (!redirectUri) {
    console.error('GOOGLE_REDIRECT_URIが設定されていません');
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
  
  console.log('Google認証URL生成:', {
    redirectUri: redirectUri,
    authUrl: googleAuthUrl.substring(0, 100) + '...',
  });
  
  return NextResponse.redirect(googleAuthUrl);
}

