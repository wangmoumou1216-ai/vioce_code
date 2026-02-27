'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Download, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
}

function generateBarHeights(count: number) {
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    heights.push(20 + Math.sin(i * 0.5) * 15 + Math.sin(i * 1.3) * 10 + Math.sin(i * 0.3) * 8);
  }
  return heights;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const barHeights = useMemo(() => generateBarHeights(60), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <Volume2 className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-medium text-foreground">生成结果</h3>
        </div>

        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        <div className="flex items-center gap-3">
          <Button
            onClick={togglePlay}
            size="icon"
            className="w-10 h-10 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shrink-0 active:scale-90 transition-all"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>

          <div className="flex-1 space-y-1">
            <div
              className="h-8 bg-secondary rounded-md cursor-pointer relative overflow-hidden group"
              onClick={handleSeek}
            >
              <div className="absolute inset-0 flex items-center gap-[1px] px-1">
                {barHeights.map((height, i) => {
                  const barProgress = (i / barHeights.length) * 100;
                  const isActive = barProgress <= progress;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors duration-150 ${isActive ? 'bg-accent' : 'bg-border group-hover:bg-border/80'}`}
                      style={{ height: `${Math.max(8, height)}%` }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 border-accent/40 text-accent hover:bg-accent/10 shrink-0 active:scale-[0.97] transition-all"
          >
            <a href={audioUrl} download="generated-speech.mp3">
              <Download className="w-3.5 h-3.5" />
              下载
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
