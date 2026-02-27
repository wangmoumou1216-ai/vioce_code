import { NextRequest, NextResponse } from 'next/server';
import { listVoices, createVoice } from '@/lib/db';
import { saveUploadedAudio } from '@/lib/storage';

export async function GET() {
  try {
    const voices = listVoices();
    return NextResponse.json(voices);
  } catch (error) {
    console.error('GET /api/voices error:', error);
    return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const transcript = formData.get('transcript') as string | null;
    const file = formData.get('audio') as File | null;

    if (!name || !file) {
      return NextResponse.json({ error: 'name and audio are required' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to create voice' }, { status: 500 });
  }
}
