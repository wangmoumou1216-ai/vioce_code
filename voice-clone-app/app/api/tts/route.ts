import { NextRequest, NextResponse } from 'next/server';
import { getVoice, getSetting, createGeneration } from '@/lib/db';
import { generateTTS, audioToBase64 } from '@/lib/fish-audio';
import { readFile, saveGeneratedAudio } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice_id, model = 's1' } = body;

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const apiKey = getSetting('fish_api_key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Fish Audio API key not configured' }, { status: 400 });
    }

    let referenceAudio: string | undefined;
    let referenceText: string | undefined;
    let voiceName: string | undefined;

    if (voice_id) {
      const voice = getVoice(voice_id);
      if (!voice) {
        return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
      }
      voiceName = voice.name;
      if (voice.audio_path) {
        const audioBuffer = readFile(voice.audio_path);
        referenceAudio = audioToBase64(audioBuffer);
        referenceText = voice.transcript ?? undefined;
      }
    }

    const audioBuffer = await generateTTS(apiKey, {
      text,
      model: model as 's1' | 'speech-1.6' | 'speech-1.5',
      referenceAudio,
      referenceText,
    });

    const audioPath = await saveGeneratedAudio(audioBuffer);

    const generation = createGeneration({
      voice_id: voice_id ?? undefined,
      voice_name: voiceName,
      text,
      audio_path: audioPath,
      model,
    });

    return NextResponse.json({
      id: generation.id,
      audio_url: `/${audioPath}`,
      created_at: generation.created_at,
    });
  } catch (error) {
    console.error('POST /api/tts error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate speech';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
