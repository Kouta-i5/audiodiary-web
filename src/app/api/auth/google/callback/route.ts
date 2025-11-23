import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCode } from '../../../../../utils/googleCalendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/calendar?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/calendar?error=認証コードが取得できませんでした', request.url)
    );
  }

  try {
    const tokens = await getTokenFromCode(code);
    
    // トークンをクライアントに返す（実際の実装では、セッションやデータベースに保存）
    return NextResponse.redirect(
      new URL(
        `/calendar?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
        request.url
      )
    );
  } catch (error) {
    console.error('トークン取得エラー:', error);
    return NextResponse.redirect(
      new URL('/calendar?error=トークンの取得に失敗しました', request.url)
    );
  }
}

