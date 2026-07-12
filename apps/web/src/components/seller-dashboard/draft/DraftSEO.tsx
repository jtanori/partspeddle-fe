import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { DraftSEO as DraftSEOType } from '@/domain/types/listing-draft';

interface DraftSEOProps {
  value: DraftSEOType;
  onChange: (value: Partial<DraftSEOType>) => void;
}

export function DraftSEO({ value, onChange }: DraftSEOProps) {
  const [tag, setTag] = useState('');

  const addTag = () => {
    if (!tag.trim()) return;
    onChange({ tags: [...value.tags, tag.trim()] });
    setTag('');
  };

  const removeTag = (index: number) => {
    const next = [...value.tags];
    next.splice(index, 1);
    onChange({ tags: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-stroke-subtle pb-3">
        <Search className="h-4 w-4 text-brand-primary" />
        <h2 className="font-display text-meta font-black uppercase tracking-[0.2em] text-foreground-primary">
          SEO
        </h2>
      </div>

      <div className="space-y-2">
        <Label htmlFor="searchableText" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
          Searchable Text
        </Label>
        <Textarea
          id="searchableText"
          rows={4}
          value={value.searchableText}
          onChange={(e) => onChange({ searchableText: e.target.value })}
          placeholder="Comma-separated keywords, alternate names, and fitment terms..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
          Tags
        </Label>
        <div className="flex gap-2">
          <Input
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Add a tag"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" size="sm" onClick={addTag} disabled={!tag.trim()}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {value.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {value.tags.map((t, index) => (
              <span
                key={`${t}-${index}`}
                className="inline-flex items-center gap-1 rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-medium text-foreground-secondary"
              >
                {t}
                <button type="button" onClick={() => removeTag(index)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
