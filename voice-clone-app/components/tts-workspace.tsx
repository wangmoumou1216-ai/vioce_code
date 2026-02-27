'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import AudioPlayer from './audio-player';

interface Voice {
  id: string;
  name: string;
}

interface TTSWorkspaceProps {
  selectedVoice: Voice | null;
  refreshTrigger: number;
}

export default function TTSWorkspace({ selectedVoice, refreshTrigger }: TTSWorkspaceProps) {
  const [text, setText] = useState('');
  const [model, setModel] = useState<'s1' | 'speech-1.6'>('s1');
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [activeVoiceId, setActiveVoiceId] = useState<string>('none');

  useEffect(() => {
    fetch('/api/voices')
      .then(r => r.json())
      .then(setVoices)
      .catch(() => {});
  }, [refreshTrigger]);

  useEffect(() => {
    if (selectedVoice) {
      setActiveVoiceId(selectedVoice.id);
    }
  }, [selectedVoice]);

  const EMOTION_TAGS = ['(happy)', '(sad)', '(excited)', '(laughing)', '(uncertain)', '(hopeful)', '(determined)', '(friendly)'];

  function insertTag(tag: string) {
    setText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + tag + ' ');
  }

  async function handleGenerate() {
    if (!text.trim()) { toast.error('Please enter text to synthesize'); return; }

    setGenerating(true);
    setAudioUrl(null);
    try {
      const body: Record<string, string> = { text: text.trim(), model };
      if (activeVoiceId && activeVoiceId !== 'none') body.voice_id = activeVoiceId;

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      setAudioUrl(data.audio_url);
      toast.success('Speech generated!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate speech');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <Volume2 className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Text to Speech</h2>
          <p className="text-sm text-muted-foreground">Convert text to natural-sounding speech</p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-5 space-y-4">
          {/* Controls row */}
          <div className="flex flex-wrap gap-3">
            {/* Voice selector */}
            <div className="flex-1 min-w-40">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Voice
              </label>
              <Select value={activeVoiceId} onValueChange={setActiveVoiceId}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select a voice..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">Default Voice</SelectItem>
                  {voices.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model selector */}
            <div className="w-36">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Model
              </label>
              <Select value={model} onValueChange={(v) => setModel(v as 's1' | 'speech-1.6')}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="s1">S1 (Latest)</SelectItem>
                  <SelectItem value="speech-1.6">Speech 1.6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emotion tags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Emotion Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOTION_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => insertTag(tag)}
                  className="text-xs px-2 py-1 rounded bg-secondary hover:bg-primary/20 hover:text-primary text-muted-foreground transition-colors border border-border"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Text to Synthesize
            </label>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter text here... Use emotion tags like (happy), (excited) for expressive speech."
              className="bg-background border-border resize-none h-32 text-sm"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground/60">
                {selectedVoice && activeVoiceId !== 'none'
                  ? `Using voice: ${selectedVoice.name}`
                  : 'Using default voice'
                }
              </p>
              <p className="text-xs text-muted-foreground/60">{text.length} chars</p>
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={generating || !text.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-medium"
            size="lg"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Generate Speech</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audio result */}
      {audioUrl && (
        <AudioPlayer audioUrl={audioUrl} />
      )}
    </section>
  );
}
