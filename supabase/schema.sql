-- Travel Trends Intelligence — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor

-- Snapshots crudos de pytrends
CREATE TABLE IF NOT EXISTS trend_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destination TEXT NOT NULL,
  origin_country TEXT NOT NULL,   -- código geo: ES, AR, BR, etc.
  interest_score INTEGER CHECK (interest_score BETWEEN 0 AND 100),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT CHECK (source IN ('trending', 'rising_query', 'monitored')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas calculadas por semana
CREATE TABLE IF NOT EXISTS trend_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destination TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  week_start DATE NOT NULL,
  avg_score FLOAT,
  max_score INTEGER,
  velocity_pct FLOAT,       -- % cambio vs semana anterior
  is_spike BOOLEAN DEFAULT FALSE,  -- true si velocity > 30%
  rank_in_country INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (destination, origin_country, week_start)
);

-- Insights generados por Claude
CREATE TABLE IF NOT EXISTS campaign_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destination TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  velocity_pct FLOAT,
  insight_text TEXT,
  campaign_copy TEXT,
  target_audience TEXT,
  timing_recommendation TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (destination, origin_country, DATE_TRUNC('day', generated_at))
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_snapshots_country_date ON trend_snapshots(origin_country, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_destination ON trend_snapshots(destination);
CREATE INDEX IF NOT EXISTS idx_metrics_country_week ON trend_metrics(origin_country, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_velocity ON trend_metrics(velocity_pct DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_spike ON trend_metrics(is_spike) WHERE is_spike = TRUE;

-- RLS: lectura pública para el dashboard (sin autenticación)
ALTER TABLE trend_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read trend_snapshots" ON trend_snapshots FOR SELECT USING (true);
CREATE POLICY "Public read trend_metrics" ON trend_metrics FOR SELECT USING (true);
CREATE POLICY "Public read campaign_insights" ON campaign_insights FOR SELECT USING (true);

-- Escritura solo con service role key (usada por el collector de GitHub Actions)
CREATE POLICY "Service insert trend_snapshots" ON trend_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert trend_metrics" ON trend_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Service upsert trend_metrics" ON trend_metrics FOR UPDATE USING (true);
CREATE POLICY "Service insert campaign_insights" ON campaign_insights FOR INSERT WITH CHECK (true);
