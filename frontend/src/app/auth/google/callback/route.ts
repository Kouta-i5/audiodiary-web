import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCode } from '../../../../utils/googleCalendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // ベースURLの決定（環境変数優先）
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=認証コードが取得できませんでした', baseUrl)
    );
  }

  try {
    const tokens = await getTokenFromCode(code);
    
    // access_token, refresh_tokenなどが返ってくる
    console.log(tokens);
    
    // トークンをURLパラメータとして / に渡す
    // 実際の実装では、セッションやデータベースに保存
    const redirectUrl = new URL('/', baseUrl);
    if (tokens.access_token) {
      redirectUrl.searchParams.set('access_token', tokens.access_token);
    }
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('トークン取得エラー:', error);
    return NextResponse.redirect(
      new URL('/login?error=トークンの取得に失敗しました', baseUrl)
    );
  }
}
