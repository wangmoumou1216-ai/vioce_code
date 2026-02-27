'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Mic2, Zap } from 'lucide-react';
import VoiceLibrary from '@/components/voice-library';
import TTSWorkspace from '@/components/tts-workspace';
import SettingsModal from '@/components/settings-modal';

interface Voice {
  id: string;
  name: string;
  audio_path: string | null;
  transcript: string | null;
  created_at: string;
}

export default function Home() {
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleVoicesChange = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground text-lg tracking-tight">VoiceClone</span>
              <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">Fish Audio Studio</span>
            </div>
          </div>

          {/* Status + Settings */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>Powered by Fish Audio</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-muted-foreground hover:text-foreground"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Key</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Voice Library */}
        <VoiceLibrary
          onVoiceSelect={setSelectedVoice}
          selectedVoiceId={selectedVoice?.id ?? null}
          refreshTrigger={refreshTrigger}
          onVoicesChange={handleVoicesChange}
        />

        <Separator className="bg-border" />

        {/* TTS Workspace */}
        <TTSWorkspace
          selectedVoice={selectedVoice}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
