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
    
    // access_token, refresh_tokenなどが返ってくる
    console.log(tokens);
    
    // トークンを保存した上でアプリに戻す（ホームページへ）
    // 実際の実装では、セッションやデータベースに保存
    return NextResponse.redirect(
      new URL('/', request.url)
    );
  } catch (error) {
    console.error('トークン取得エラー:', error);
    return NextResponse.redirect(
      new URL('/?error=トークンの取得に失敗しました', request.url)
    );
  }
}

