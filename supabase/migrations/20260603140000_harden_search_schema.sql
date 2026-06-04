-- Migration: Harden search schema for production forensics
BEGIN;

-- 1. Evolve search_outbox
ALTER TABLE public.search_outbox 
  ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS worker_id TEXT,
  ADD COLUMN IF NOT EXISTS trace_id TEXT;

-- 2. Evolve search_events
ALTER TABLE public.search_events
  ADD COLUMN IF NOT EXISTS latency_ms INT,
  ADD COLUMN IF NOT EXISTS trace_id TEXT,
  ADD COLUMN IF NOT EXISTS search_provider TEXT,
  ADD COLUMN IF NOT EXISTS page INT,
  ADD COLUMN IF NOT EXISTS results_returned INT,
  ADD COLUMN IF NOT EXISTS zero_results BOOLEAN DEFAULT FALSE;

-- 3. Add Forensic Tables

-- Tracking audit runs (Drift Detection)
CREATE TABLE IF NOT EXISTS public.search_audit_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    missing_documents INT DEFAULT 0,
    stale_documents INT DEFAULT 0,
    duplicates INT DEFAULT 0,
    drift_percent NUMERIC(5, 2)
);

-- Tracking worker performance
CREATE TABLE IF NOT EXISTS public.search_worker_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    documents_processed INT DEFAULT 0,
    documents_failed INT DEFAULT 0,
    retry_count INT DEFAULT 0,
    duration_ms INT
);

-- Tracking API metrics for SLA verification
CREATE TABLE IF NOT EXISTS public.search_request_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT NOT NULL,
    query TEXT,
    latency_ms INT NOT NULL,
    result_count INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
