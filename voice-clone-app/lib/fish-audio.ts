const FISH_API_BASE = 'https://api.fish.audio';

interface TTSOptions {
  text: string;
  model?: 's1' | 'speech-1.6' | 'speech-1.5';
  format?: 'mp3' | 'wav';
  referenceAudio?: string; // base64 encoded
  referenceText?: string;
  referenceId?: string; // saved model id on Fish Audio
}

export async function generateTTS(apiKey: string, options: TTSOptions): Promise<Buffer> {
  const body: Record<string, unknown> = {
    text: options.text,
    format: options.format ?? 'mp3',
  };

  if (options.referenceId) {
    body.reference_id = options.referenceId;
  } else if (options.referenceAudio) {
    body.references = [
      {
        audio: options.referenceAudio,
        text: options.referenceText ?? '',
      },
    ];
  }

  const response = await fetch(`${FISH_API_BASE}/v1/tts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      model: options.model ?? 's1',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fish Audio API error ${response.status}: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function audioToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
