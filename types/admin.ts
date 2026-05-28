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
  { value: "basic-1",          label: "Basic 1",          desc: "Split-screen elegan" },
  { value: "elegant-rose",     label: "Elegant Rose",     desc: "Floral & romantis" },
  { value: "classic-gold",     label: "Classic Gold",     desc: "Elegan & timeless" },
  { value: "modern-minimalist",label: "Modern Minimalist",desc: "Bersih & kontemporer" },
  { value: "romantic-blush",   label: "Romantic Blush",   desc: "Lembut & intim" },
  { value: "luxury-marble",    label: "Luxury Marble",    desc: "Mewah & premium" },
] as const;

export type BasicTemplateValue = (typeof BASIC_TEMPLATES)[number]["value"];

/* ── EventData JSONB structure ── */
export interface EventData {
  mempelai_pria: {
    nama: string;
    foto_url: string;
  };
  mempelai_wanita: {
    nama: string;
    foto_url: string;
  };
  foto_cover: string;
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
  lokasi: {
    alamat: string;
    maps_url: string;
  };
  galeri: string[];
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
