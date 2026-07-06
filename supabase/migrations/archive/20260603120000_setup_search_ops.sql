-- Create Outbox and Analytics tables for search
CREATE TABLE IF NOT EXISTS public.search_outbox (
    id BIGSERIAL PRIMARY KEY,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.search_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    query TEXT NOT NULL,
    filters JSONB,
    result_count INTEGER,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.search_click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_event_id UUID REFERENCES public.search_events(id),
    part_id UUID REFERENCES public.parts(id),
    position INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
