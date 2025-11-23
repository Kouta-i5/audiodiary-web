import { NextRequest, NextResponse } from 'next/server';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../../../../utils/googleCalendar';

// 予定を作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken, eventData } = body;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: '認証トークンが必要です' },
        { status: 401 }
      );
    }

    const event = await createEvent(accessToken, refreshToken, eventData);
    return NextResponse.json(event);
  } catch (error) {
    console.error('予定作成エラー:', error);
    return NextResponse.json(
      { error: '予定の作成に失敗しました' },
      { status: 500 }
    );
  }
}

// 予定を取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: '認証トークンが必要です' },
        { status: 401 }
      );
    }

    const events = await getEvents(accessToken, refreshToken, timeMin || undefined, timeMax || undefined);
    return NextResponse.json(events);
  } catch (error) {
    console.error('予定取得エラー:', error);
    return NextResponse.json(
      { error: '予定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 予定を更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken, eventId, eventData } = body;

    if (!accessToken || !refreshToken || !eventId) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      );
    }

    const event = await updateEvent(accessToken, refreshToken, eventId, eventData);
    return NextResponse.json(event);
  } catch (error) {
    console.error('予定更新エラー:', error);
    return NextResponse.json(
      { error: '予定の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 予定を削除
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const eventId = searchParams.get('eventId');

    if (!accessToken || !refreshToken || !eventId) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      );
    }

    await deleteEvent(accessToken, refreshToken, eventId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('予定削除エラー:', error);
    return NextResponse.json(
      { error: '予定の削除に失敗しました' },
      { status: 500 }
    );
  }
}

