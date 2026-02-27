import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/db';

export async function GET() {
  const apiKey = getSetting('fish_api_key');
  return NextResponse.json({
    fish_api_key: apiKey ? '***' + apiKey.slice(-4) : null,
    has_api_key: !!apiKey,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { fish_api_key } = body;

    if (!fish_api_key || typeof fish_api_key !== 'string') {
      return NextResponse.json({ error: '请输入 API Key' }, { status: 400 });
    }

    setSetting('fish_api_key', fish_api_key.trim());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ error: '保存设置失败' }, { status: 500 });
  }
}
