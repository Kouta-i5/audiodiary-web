import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCode } from '../../../../../utils/googleCalendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=認証コードが取得できませんでした', request.url)
    );
  }

  try {
    const tokens = await getTokenFromCode(code);
    
    if (!tokens || (!tokens.access_token && !tokens.refresh_token)) {
      console.error('トークンが空です:', tokens);
      return NextResponse.redirect(
        new URL('/login?error=トークンが取得できませんでした', request.url)
      );
    }
    
    // トークンを保存した上でアプリに戻す（ホームページへ）
    // 実際の実装では、セッションやデータベースに保存
    const redirectUrl = new URL('/', request.url);
    if (tokens.access_token) {
      redirectUrl.searchParams.set('access_token', tokens.access_token);
    }
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('トークン取得エラー詳細:', error);
    const errorMessage = error instanceof Error ? error.message : 'トークンの取得に失敗しました';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}

