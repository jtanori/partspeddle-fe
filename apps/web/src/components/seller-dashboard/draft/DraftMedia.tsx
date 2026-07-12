import React, { useState, useRef } from 'react';
import { ImageIcon, ScanLine, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DraftMedia as DraftMediaType, DraftMediaImage } from '@/domain/types/listing-draft';
import { analyzeListingImage } from '@/backend/modules/ai';

interface DraftMediaProps {
  value: DraftMediaType;
  onChange: (value: Partial<DraftMediaType>) => void;
  onAIResult: (result: Record<string, unknown>) => void;
}

export function DraftMedia({ value, onChange, onAIResult }: DraftMediaProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch('/api/seller/assets/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const result = (await response.json()) as { fileName: string; publicUrl: string };

      const image: DraftMediaImage = {
        id: result.fileName,
        fileName: result.fileName,
        publicUrl: result.publicUrl,
        isPrimary: value.images.length === 0,
      };

      onChange({ images: [...value.images, image] });
    } catch (err) {
      console.error('Draft media upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleScan = async () => {
    const primary = value.images.find((img) => img.isPrimary) ?? value.images[0];
    if (!primary) return;

    setIsScanning(true);
    try {
      const response = await fetch(primary.publicUrl);
      const blob = await response.blob();
      const file = new File([blob], primary.fileName, { type: blob.type || 'image/jpeg' });
      const result = await analyzeListingImage(file, value.mode);
      onAIResult(result as Record<string, unknown>);
    } catch (err) {
      console.error('AI scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const removeImage = (id: string) => {
    const next = value.images.filter((img) => img.id !== id);
    if (next.length > 0 && !next.some((img) => img.isPrimary)) {
      next[0].isPrimary = true;
    }
    onChange({ images: next });
  };

  const setPrimary = (id: string) => {
    onChange({
      images: value.images.map((img) => ({ ...img, isPrimary: img.id === id })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-stroke-subtle pb-3">
        <ImageIcon className="h-4 w-4 text-brand-primary" />
        <h2 className="font-display text-meta font-black uppercase tracking-[0.2em] text-foreground-primary">
          Media
        </h2>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant={value.mode === 'component' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange({ mode: 'component' })}
        >
          Component
        </Button>
        <Button
          type="button"
          variant={value.mode === 'vehicle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange({ mode: 'vehicle' })}
        >
          Vehicle
        </Button>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stroke-subtle bg-surface-secondary p-6 transition-colors hover:border-brand-primary/50',
          uploading && 'opacity-50',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <ImageIcon className="mb-2 h-8 w-8 text-foreground-muted" />
        <p className="text-caption font-medium text-foreground-secondary">
          {uploading ? 'Uploading…' : 'Drag and drop or click to upload images'}
        </p>
        <p className="text-meta text-foreground-muted">PNG, JPG, WEBP up to 50MB</p>
      </div>

      {value.images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
              Staged Images
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleScan}
              disabled={isScanning || value.images.length === 0}
            >
              {isScanning ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <ScanLine className="mr-1.5 h-3.5 w-3.5" />}
              AI Scan
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {value.images.map((image) => (
              <div
                key={image.id}
                className={cn(
                  'group relative aspect-square overflow-hidden rounded-lg border bg-surface-secondary',
                  image.isPrimary ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-stroke-subtle',
                )}
              >
                <img src={image.publicUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute right-1 top-1 rounded bg-surface-primary/90 p-1 text-foreground-secondary opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(image.id);
                    }}
                    className="absolute bottom-1 left-1 rounded bg-surface-primary/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground-secondary opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Set Primary
                  </button>
                )}
                {image.isPrimary && (
                  <span className="absolute bottom-1 left-1 rounded bg-brand-primary px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
