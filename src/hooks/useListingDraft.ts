import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/hooks';
import {
  DEFAULT_DRAFT_PAYLOAD,
  type DraftModule,
  type DraftPayload,
  type ListingDraft,
} from '@/domain/types/listing-draft';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseListingDraftResult {
  draft: ListingDraft | null;
  loading: boolean;
  saveStatus: SaveStatus;
  updateModule: <T extends DraftModule>(module: T, partial: Partial<DraftPayload[T]>) => void;
  updateMarketSignals: (signals: { marketValueEstimate?: number; suggestedPrice?: number }) => void;
  publish: () => Promise<string | null>;
  discard: () => Promise<void>;
}

export function useListingDraft(): UseListingDraftResult {
  const { user } = useAuthStore();
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const pendingUpdateRef = useRef<Partial<DraftPayload> | null>(null);
  const pendingSignalsRef = useRef<{ marketValueEstimate?: number; suggestedPrice?: number } | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getAccessToken()
      .then((token) =>
        fetch('/api/seller/drafts/active', {
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
          },
        }),
      )
      .then(async (response) => {
        if (cancelled) return;
        if (!response.ok) throw new Error('Failed to fetch draft');
        const data = (await response.json()) as ListingDraft;
        setDraft(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('useListingDraft fetch error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const saveDraft = useCallback(
    async (id: string, payloadPatch: Partial<DraftPayload>, signals?: { marketValueEstimate?: number; suggestedPrice?: number }) => {
      setSaveStatus('saving');
      try {
        const token = await getAccessToken();
        const response = await fetch(`/api/seller/drafts/${id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payload: payloadPatch, ...signals }),
        });

        if (!response.ok) throw new Error('Save failed');
        const updated = (await response.json()) as ListingDraft;
        setDraft(updated);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('useListingDraft save error:', err);
        setSaveStatus('error');
      }
    },
    [],
  );

  const flushPendingUpdate = useCallback(() => {
    if (!draft || (!pendingUpdateRef.current && !pendingSignalsRef.current)) return;

    const payloadPatch = pendingUpdateRef.current;
    const signals = pendingSignalsRef.current;
    pendingUpdateRef.current = null;
    pendingSignalsRef.current = null;

    saveDraft(draft.id, payloadPatch ?? {}, signals ?? undefined);
  }, [draft, saveDraft]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      flushPendingUpdate();
    }, 750);
  }, [flushPendingUpdate]);

  const updateModule = useCallback<UseListingDraftResult['updateModule']>(
    (module, partial) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const nextPayload = {
          ...prev.payload,
          [module]: { ...prev.payload[module], ...partial },
        };
        return { ...prev, payload: nextPayload };
      });

      pendingUpdateRef.current = {
        ...(pendingUpdateRef.current || {}),
        [module]: { ...(draft?.payload[module] || DEFAULT_DRAFT_PAYLOAD[module]), ...partial },
      };
      scheduleSave();
    },
    [draft, scheduleSave],
  );

  const updateMarketSignals = useCallback<UseListingDraftResult['updateMarketSignals']>(
    (signals) => {
      setDraft((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          marketValueEstimate: signals.marketValueEstimate ?? prev.marketValueEstimate,
          suggestedPrice: signals.suggestedPrice ?? prev.suggestedPrice,
        };
      });

      pendingSignalsRef.current = {
        ...(pendingSignalsRef.current || {}),
        ...signals,
      };
      scheduleSave();
    },
    [scheduleSave],
  );

  const publish = useCallback(async (): Promise<string | null> => {
    if (!draft) return null;
    flushPendingUpdate();
    const token = await getAccessToken();
    const response = await fetch(`/api/seller/drafts/${draft.id}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
    });
    if (!response.ok) throw new Error('Publish failed');
    const result = (await response.json()) as { partId: string };
    setDraft((prev) => (prev ? { ...prev, status: 'published', publishedPartId: result.partId } : prev));
    return result.partId;
  }, [draft, flushPendingUpdate]);

  const discard = useCallback(async () => {
    if (!draft) return;
    const token = await getAccessToken();
    const response = await fetch(`/api/seller/drafts/${draft.id}/discard`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
    });
    if (!response.ok) throw new Error('Discard failed');
    setDraft((prev) => (prev ? { ...prev, status: 'discarded' } : prev));
  }, [draft]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      flushPendingUpdate();
    };
  }, [flushPendingUpdate]);

  return {
    draft,
    loading,
    saveStatus,
    updateModule,
    updateMarketSignals,
    publish,
    discard,
  };
}

async function getAccessToken(): Promise<string | null> {
  const { supabase } = await import('@/lib/supabase');
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
