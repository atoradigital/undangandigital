import { waOrderWithTemplate, waSeeMoreTemplates } from "./contact";

export type CatalogTemplate = {
  id: string;
  name: string;
  /** Thumbnail kartu katalog */
  cardImage: string;
  /** Link langsung untuk melihat demo interaktif (buka di tab baru) */
  demoUrl: string;
  /** Kategori Paket */
  category: "basic" | "premium";
  description: string;
  previewMode?: "image" | "live";
  previewImageSrc?: string;
};

/** CTA "Lihat semua template" */
export const WHATSAPP_SEE_ALL_TEMPLATES = waSeeMoreTemplates();

export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: "basic-1",
    name: "Basic 1 — Soft Floral",
    cardImage: "/templates/basic/basic-1/thumbnail-basic-1.png",
    demoUrl: "/v/demo-basic-1?to=Tamu+Undangan",
    category: "basic",
    description: "Desain lembut berornamen bunga dengan nuansa hangat & ramah.",
  },
  {
    id: "basic-2",
    name: "Basic 2 — Minimalist Earthy",
    cardImage: "/templates/basic/basic-2/thumbnail-basic-2.png",
    demoUrl: "/v/demo-basic-2?to=Tamu+Undangan",
    category: "basic",
    description: "Gaya minimalis modern dengan warna bumi yang menenangkan.",
  },
  {
    id: "basic-3",
    name: "Basic 3 — Botanical Garden",
    cardImage: "/templates/basic/basic-3/thumbnail-basic-3.png",
    demoUrl: "/v/demo-basic-3?to=Tamu+Undangan",
    category: "basic",
    description: "Nuansa dedaunan hijau segar dengan sentuhan modern.",
  },
  {
    id: "premium-1",
    name: "Premium 1 — Royal Emerald",
    cardImage: "/templates/premium/premium-1/thumbnail-premium-1.png",
    demoUrl: "/v/demo-premium-1?to=Tamu+Undangan",
    category: "premium",
    description: "Gaya megah bernuansa hijau zamrud & sentuhan aksen emas.",
  },
  {
    id: "premium-2",
    name: "Premium 2 — Golden Elegant",
    cardImage: "/templates/premium/premium-2/thumbnail-premium-2.png",
    demoUrl: "/v/demo-premium-2?to=Tamu+Undangan",
    category: "premium",
    description: "Kemewahan klasik dengan dominasi emas & tata letak anggun.",
  },
  {
    id: "premium-3",
    name: "Premium 3 — Midnight Obsidian",
    cardImage: "/templates/premium/premium-3/thumbnail-premium-3.png",
    demoUrl: "/v/demo-premium-3?to=Tamu+Undangan",
    category: "premium",
    description: "Tema gelap eksklusif dengan ornamen berkilau nan mewah.",
  },
];

export function getTemplateOrderHref(template: CatalogTemplate): string {
  return waOrderWithTemplate(template.name);
}