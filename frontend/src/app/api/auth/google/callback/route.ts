import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCode } from '../../../../../utils/googleCalendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // 環境変数の検証
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

  console.log('コールバック受信 (API):', {
    hasCode: !!code,
    hasError: !!error,
    error: error,
    clientId: clientId ? `${clientId.substring(0, 10)}...` : '未設定',
    hasClientSecret: !!clientSecret,
    redirectUri: redirectUri,
    requestUrl: request.url,
  });

  if (error) {
    console.error('Google認証エラー:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    console.error('認証コードが取得できませんでした');
    return NextResponse.redirect(
      new URL('/login?error=認証コードが取得できませんでした', request.url)
    );
  }

  if (!clientId) {
    console.error('GOOGLE_CLIENT_IDが設定されていません');
    return NextResponse.redirect(
      new URL('/login?error=GOOGLE_CLIENT_IDが設定されていません', request.url)
    );
  }

  if (!clientSecret) {
    console.error('GOOGLE_CLIENT_SECRETが設定されていません');
    return NextResponse.redirect(
      new URL('/login?error=GOOGLE_CLIENT_SECRETが設定されていません', request.url)
    );
  }

  if (!redirectUri) {
    console.error('GOOGLE_REDIRECT_URIが設定されていません');
    return NextResponse.redirect(
      new URL('/login?error=GOOGLE_REDIRECT_URIが設定されていません', request.url)
    );
  }

  // リダイレクトURIの検証
  const currentUrl = new URL(request.url);
  const expectedRedirectUri = redirectUri.trim();
  const actualRedirectUri = `${currentUrl.origin}${currentUrl.pathname}`;

  if (expectedRedirectUri !== actualRedirectUri) {
    console.error('リダイレクトURI不一致:', {
      expected: expectedRedirectUri,
      actual: actualRedirectUri,
    });
    return NextResponse.redirect(
      new URL(`/login?error=リダイレクトURIが一致しません。期待値: ${expectedRedirectUri}, 実際: ${actualRedirectUri}`, request.url)
    );
  }

  try {
    console.log('トークン交換を開始...');
    const tokens = await getTokenFromCode(code);
    
    if (!tokens || (!tokens.access_token && !tokens.refresh_token)) {
      console.error('トークンが空です:', tokens);
      return NextResponse.redirect(
        new URL('/login?error=トークンが取得できませんでした', request.url)
      );
    }
    
    console.log('トークン取得成功:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
    });
    
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
    console.error('トークン取得エラー詳細:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: code ? `${code.substring(0, 10)}...` : 'なし',
    });
    const errorMessage = error instanceof Error ? error.message : 'トークンの取得に失敗しました';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}

