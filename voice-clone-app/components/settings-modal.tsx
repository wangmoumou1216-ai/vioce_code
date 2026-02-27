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
    if (!apiKey.trim()) { toast.error('Please enter an API key'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fish_api_key: apiKey.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('API key saved!');
      setHasKey(true);
      setApiKey('');
      onClose();
    } catch {
      toast.error('Failed to save API key');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Settings</h2>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {hasKey && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <p className="text-sm text-green-400">API key is configured</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Fish Audio API Key
              </label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={hasKey ? 'Enter new API key to update' : 'sk-...'}
                  className="bg-background border-border pr-10"
                  onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1.5">
                Get your API key from{' '}
                <a href="https://fish.audio" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  fish.audio
                </a>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save API Key'}
              </Button>
              <Button variant="outline" onClick={onClose} className="border-border">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
