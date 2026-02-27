import { NextRequest, NextResponse } from 'next/server';
import { getVoice, deleteVoice } from '@/lib/db';
import { deleteStoredFile } from '@/lib/storage';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const voice = getVoice(id);
    if (!voice) {
      return NextResponse.json({ error: '声音不存在' }, { status: 404 });
    }

    if (voice.audio_path) {
      deleteStoredFile(voice.audio_path);
    }
    deleteVoice(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/voices/[id] error:', error);
    return NextResponse.json({ error: '删除声音失败' }, { status: 500 });
  }
}
