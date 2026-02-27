'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileAudio, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClonePanelProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ClonePanel({ onSuccess, onCancel }: ClonePanelProps) {
  const [name, setName] = useState('');
  const [transcript, setTranscript] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('audio/')) {
      setFile(dropped);
    } else {
      toast.error('Please upload an audio file (MP3, WAV, M4A)');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Please enter a voice name'); return; }
    if (!file) { toast.error('Please upload an audio file'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('audio', file);
      if (transcript.trim()) formData.append('transcript', transcript.trim());

      const res = await fetch('/api/voices', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create voice');
    } finally {
      setUploading(false);
    }
  };

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Add New Voice</h3>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileAudio className="w-8 h-8 text-primary" />
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-1 text-xs"
                >
                  Change file
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-foreground">Drop audio file here</p>
                <p className="text-xs text-muted-foreground">MP3, WAV, M4A · 15+ seconds</p>
                <Button variant="outline" size="sm" className="mt-1 text-xs">
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Voice Name *
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. My Voice, Alex"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Transcript (Optional)
              </label>
              <Textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="What is said in the audio file? (improves quality)"
                className="bg-background border-border text-sm resize-none h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                ) : (
                  'Clone Voice'
                )}
              </Button>
              <Button variant="outline" onClick={onCancel} className="border-border">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
