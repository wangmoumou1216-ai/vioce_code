import { NextRequest, NextResponse } from 'next/server';
import { listVoices, createVoice } from '@/lib/db';
import { saveUploadedAudio } from '@/lib/storage';

export async function GET() {
  try {
    const voices = listVoices();
    return NextResponse.json(voices);
  } catch (error) {
    console.error('GET /api/voices error:', error);
    return NextResponse.json({ error: '获取声音列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const transcript = formData.get('transcript') as string | null;
    const file = formData.get('audio') as File | null;

    if (!name || !file) {
      return NextResponse.json({ error: '请填写声音名称并上传音频文件' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const audioPath = await saveUploadedAudio(buffer, file.name);

    const voice = createVoice({
      name,
      audio_path: audioPath,
      transcript: transcript ?? undefined,
    });

    return NextResponse.json(voice, { status: 201 });
  } catch (error) {
    console.error('POST /api/voices error:', error);
    return NextResponse.json({ error: '创建声音失败' }, { status: 500 });
  }
}
