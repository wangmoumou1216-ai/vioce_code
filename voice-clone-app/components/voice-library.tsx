'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Mic, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ClonePanel from './clone-panel';

interface Voice {
  id: string;
  name: string;
  audio_path: string | null;
  transcript: string | null;
  created_at: string;
}

interface VoiceLibraryProps {
  onVoiceSelect: (voice: Voice | null) => void;
  selectedVoiceId: string | null;
  refreshTrigger: number;
  onVoicesChange: () => void;
}

export default function VoiceLibrary({ onVoiceSelect, selectedVoiceId, refreshTrigger, onVoicesChange }: VoiceLibraryProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClonePanel, setShowClonePanel] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchVoices() {
    try {
      const res = await fetch('/api/voices');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setVoices(data);
    } catch {
      toast.error('加载声音列表失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVoices();
  }, [refreshTrigger]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const res = await fetch(`/api/voices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('声音已删除');
      if (selectedVoiceId === id) onVoiceSelect(null);
      await fetchVoices();
      onVoicesChange();
    } catch {
      toast.error('删除声音失败');
    } finally {
      setDeletingId(null);
    }
  }

  function handleCloneSuccess() {
    setShowClonePanel(false);
    fetchVoices();
    onVoicesChange();
    toast.success('声音创建成功！');
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Mic className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">声音库</h2>
            <p className="text-sm text-muted-foreground">共 {voices.length} 个声音可用</p>
          </div>
        </div>
        <Button
          onClick={() => setShowClonePanel(!showClonePanel)}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.97] transition-all"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          添加声音
        </Button>
      </div>

      {/* Clone Panel */}
      {showClonePanel && (
        <ClonePanel
          onSuccess={handleCloneSuccess}
          onCancel={() => setShowClonePanel(false)}
        />
      )}

      {/* Voice cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl bg-card animate-pulse border border-border" />
          ))}
        </div>
      ) : voices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl">
          <Mic className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">暂无声音</p>
          <p className="text-sm text-muted-foreground/60 mt-1">点击「添加声音」克隆你的第一个声音</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {voices.map(voice => (
            <Card
              key={voice.id}
              className={`cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                selectedVoiceId === voice.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border hover:border-primary/40 hover:bg-card/80 bg-card'
              }`}
              onClick={() => onVoiceSelect(selectedVoiceId === voice.id ? null : voice)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {voice.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm leading-tight truncate">{voice.name}</p>
                      <Badge
                        variant="outline"
                        className="text-[10px] mt-1 border-green-500/40 text-green-400 bg-green-500/10 px-1.5 py-0"
                      >
                        就绪
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 -mr-1 -mt-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90 transition-all shrink-0"
                    onClick={(e) => handleDelete(voice.id, e)}
                    disabled={deletingId === voice.id}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {voice.transcript && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">&quot;{voice.transcript}&quot;</p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <Clock className="w-3 h-3" />
                  {formatDate(voice.created_at)}
                </div>
                {selectedVoiceId === voice.id && (
                  <div className="mt-2.5 pt-2 border-t border-primary/20">
                    <p className="text-xs text-primary font-medium">✓ 已选用于语音合成</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
