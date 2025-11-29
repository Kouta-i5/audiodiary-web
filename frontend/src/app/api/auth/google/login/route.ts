import { NextResponse } from 'next/server';

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: process.env.NEXT_PUBLIC_GOOGLE_SCOPES || 'https://www.googleapis.com/auth/calendar',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  return NextResponse.redirect(googleAuthUrl);
}

