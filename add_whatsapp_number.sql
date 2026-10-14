-- ══════════════════════════════════════════════════════
-- Migration: tambah kolom whatsapp_number ke tabel invitations
-- Jalankan sekali di Supabase SQL Editor
-- ══════════════════════════════════════════════════════

ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT NULL;

COMMENT ON COLUMN invitations.whatsapp_number IS
  'Nomor WhatsApp pengantin dalam format internasional tanpa +, misal: 6281234567890. Digunakan untuk notifikasi RSVP otomatis.';
