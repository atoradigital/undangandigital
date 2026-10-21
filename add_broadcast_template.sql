-- ══════════════════════════════════════════════════════
-- Migration: tambah kolom broadcast_template ke tabel invitations
-- Jalankan sekali di Supabase SQL Editor
-- ══════════════════════════════════════════════════════

ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS broadcast_template TEXT DEFAULT NULL;

COMMENT ON COLUMN invitations.broadcast_template IS
  'Template pesan broadcast WhatsApp yang bisa dikustomisasi oleh admin. Menggunakan placeholder [nama tamu undangan], [nama pengantin], dan [link_undangan].';
