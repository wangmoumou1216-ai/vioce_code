'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, X, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => setHasKey(data.has_api_key))
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (!apiKey.trim()) { toast.error('请输入 API Key'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fish_api_key: apiKey.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('API Key 已保存！');
      setHasKey(true);
      setApiKey('');
      onClose();
    } catch {
      toast.error('保存 API Key 失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md border-border bg-card animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">设置</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 active:scale-90 transition-all"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {hasKey && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-sm text-green-400">API Key 已配置</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide mb-1.5 block">
                Fish Audio API Key
              </label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={hasKey ? '输入新的 API Key 以更新' : 'sk-...'}
                  className="bg-background border-border pr-10"
                  onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1.5">
                前往{' '}
                <a href="https://fish.audio" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  fish.audio
                </a>
                {' '}获取 API Key
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 active:scale-[0.97] transition-all"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> 保存中...</> : '保存 API Key'}
              </Button>
              <Button variant="outline" onClick={onClose} className="border-border active:scale-[0.97] transition-all">
                取消
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
