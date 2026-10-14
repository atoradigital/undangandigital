-- ══════════════════════════════════════════════════════
-- Migration: buat tabel `greetings` untuk fitur RSVP Premium
-- Jalankan sekali di Supabase SQL Editor
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS greetings (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id  UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_name     TEXT NOT NULL,
  attendance     TEXT NOT NULL DEFAULT 'hadir'
                   CHECK (attendance IN ('hadir', 'tidak_hadir', 'mungkin')),
  party_count    INTEGER NOT NULL DEFAULT 1 CHECK (party_count >= 1 AND party_count <= 20),
  message        TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index untuk query cepat per invitation
CREATE INDEX IF NOT EXISTS idx_greetings_invitation_id
  ON greetings (invitation_id, created_at DESC);

-- RLS: read public (tamu bisa melihat ucapan), insert public (tanpa login)
ALTER TABLE greetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "greetings_select_public" ON greetings
  FOR SELECT USING (true);

CREATE POLICY "greetings_insert_public" ON greetings
  FOR INSERT WITH CHECK (true);

COMMENT ON TABLE greetings IS 'Ucapan & RSVP tamu untuk fitur Premium Template';
