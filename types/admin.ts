/* ─────────────────────────────────────────────────
   ATORA — Shared Admin Types
   ─────────────────────────────────────────────────*/

export type Template = "modern" | "klasik" | "floral";

export const TEMPLATE_OPTIONS: {
  value: Template;
  label: string;
  desc: string;
  color: string;
}[] = [
  { value: "modern",  label: "Modern",  desc: "Minimalis & kontemporer", color: "#3A3429" },
  { value: "klasik",  label: "Klasik",  desc: "Elegan & timeless",       color: "#5C4A37" },
  { value: "floral",  label: "Floral",  desc: "Romantis & natural",      color: "#C9A961" },
];

/* ── Paket Basic — template choices ── */
export const BASIC_TEMPLATES = [
  { value: "basic-1", label: "Basic 1", desc: "Split-screen elegan · Maroon & Cream" },
] as const;

export type BasicTemplateValue = (typeof BASIC_TEMPLATES)[number]["value"];

/* ── EventData JSONB structure ── */
export interface EventData {
  mempelai_pria: {
    nama: string;
    foto_url: string;
    ortu?: string;          // "Putra ke-N dari Bapak X & Ibu Y"
  };
  mempelai_wanita: {
    nama: string;
    foto_url: string;
    ortu?: string;          // "Putri ke-N dari Bapak X & Ibu Y"
  };
  foto_cover: string;
  foto_quote?: string;       // foto untuk background card ayat/quote
  jadwal_akad: {
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
  };
  jadwal_resepsi: {
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
  };
  /* ── Lokasi terpisah per acara (new) ── */
  akad_lokasi?:    string;   // nama gedung / tempat akad
  akad_alamat?:    string;   // alamat lengkap akad
  akad_maps_url?:  string;   // Google Maps URL akad
  resepsi_lokasi?: string;   // nama gedung / tempat resepsi
  resepsi_alamat?: string;   // alamat lengkap resepsi
  resepsi_maps_url?: string; // Google Maps URL resepsi
  /* ── Backward compat (data lama) ── */
  lokasi?: {
    alamat: string;
    maps_url: string;
  };
  galeri: string[];

  /* ── Wedding Gift ── */
  rek_1_bank?: string;    // Jenis Bank/E-Wallet 1
  rek_1_no?: string;      // Nomor Rekening 1
  rek_1_nama?: string;    // Nama Pemilik Rekening 1
  rek_2_bank?: string;    // Jenis Bank/E-Wallet 2
  rek_2_no?: string;      // Nomor Rekening 2
  rek_2_nama?: string;    // Nama Pemilik Rekening 2
  gift_penerima?: string; // Nama Penerima Hadiah Fisik
  gift_alamat?: string;   // Alamat Lengkap Pengiriman Hadiah

}

export interface Invitation {
  id: string;
  title: string;
  slug: string;
  template: string;
  event_data?: EventData | null;
  created_at: string;
}

export type GuestStatus = "belum" | "terkirim" | "dibuka";

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  link: string | null;
  status: GuestStatus;
  created_at: string;
}
