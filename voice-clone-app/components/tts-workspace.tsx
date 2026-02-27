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

  const EMOTION_TAGS = ['(开心)', '(悲伤)', '(兴奋)', '(大笑)', '(犹豫)', '(期待)', '(坚定)', '(友好)'];

  function insertTag(tag: string) {
    setText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + tag + ' ');
  }

  async function handleGenerate() {
    if (!text.trim()) { toast.error('请输入要合成的文本'); return; }

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
        throw new Error(err.error || '生成失败');
      }

      const data = await res.json();
      setAudioUrl(data.audio_url);
      toast.success('语音生成成功！');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '语音生成失败');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <Volume2 className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">文字转语音</h2>
          <p className="text-sm text-muted-foreground">将文字转换为自然流畅的语音</p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-5 space-y-4">
          {/* Controls row */}
          <div className="flex flex-wrap gap-4">
            {/* Voice selector */}
            <div className="flex-1 min-w-40">
              <label className="text-xs font-medium text-muted-foreground tracking-wide mb-1.5 block">
                声音
              </label>
              <Select value={activeVoiceId} onValueChange={setActiveVoiceId}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="选择声音..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">默认声音</SelectItem>
                  {voices.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model selector */}
            <div className="w-40">
              <label className="text-xs font-medium text-muted-foreground tracking-wide mb-1.5 block">
                模型
              </label>
              <Select value={model} onValueChange={(v) => setModel(v as 's1' | 'speech-1.6')}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="s1">S1（最新）</SelectItem>
                  <SelectItem value="speech-1.6">Speech 1.6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emotion tags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground tracking-wide mb-2 block">
              情感标签
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOTION_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => insertTag(tag)}
                  className="text-xs px-3 py-1.5 rounded-md bg-secondary hover:bg-primary/20 hover:text-primary text-muted-foreground transition-all border border-border active:scale-95 select-none"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div>
            <label className="text-xs font-medium text-muted-foreground tracking-wide mb-1.5 block">
              合成文本
            </label>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="在此输入文本... 使用情感标签如 (开心)、(兴奋) 来生成富有表现力的语音。"
              className="bg-background border-border resize-none h-32 text-sm"
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-muted-foreground/60">
                {selectedVoice && activeVoiceId !== 'none'
                  ? `当前声音：${selectedVoice.name}`
                  : '使用默认声音'
                }
              </p>
              <p className="text-xs text-muted-foreground/60">{text.length} 字符</p>
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={generating || !text.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-medium active:scale-[0.98] transition-all"
            size="lg"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> 生成语音</>
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
