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

export interface Invitation {
  id: string;
  title: string;
  slug: string;
  template: Template;
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
