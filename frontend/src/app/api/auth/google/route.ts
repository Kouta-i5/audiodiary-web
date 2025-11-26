import { NextResponse } from 'next/server';
import { getAuthUrl } from '../../../../utils/googleCalendar';

export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Google認証URL生成エラー:', error);
    return NextResponse.json(
      { error: '認証URLの生成に失敗しました' },
      { status: 500 }
    );
  }
}

