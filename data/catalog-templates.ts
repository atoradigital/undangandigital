export type TemplatePreviewMode = "image" | "iframe";

export type CatalogTemplate = {
  id: string;
  name: string;
  /** Card / list thumbnail (optional path under public) */
  cardImage?: string;
  previewMode: TemplatePreviewMode;
  /** Long screenshot for image mode */
  previewImageSrc?: string;
  /** Internal demo URL for iframe mode (same-origin path recommended) */
  iframeSrc?: string;
};

const WA_BASE =
  "https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20memesan%20template%20";

/** CTA “Lihat semua template” — pesan umum ke WhatsApp */
export const WHATSAPP_SEE_ALL_TEMPLATES =
  "https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20melihat%20katalog%20template%20lainnya";

/** Placeholder long-screenshot asset — replace per template when assets exist */
const PLACEHOLDER_LONG = "/templates/template-undangan-1.png";

export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: "elegant-rose",
    name: "Elegant Rose",
    cardImage: PLACEHOLDER_LONG,
    previewMode: "image",
    previewImageSrc: PLACEHOLDER_LONG,
  },
  {
    id: "classic-gold",
    name: "Classic Gold",
    previewMode: "iframe",
    iframeSrc: "/v/demo?to=Tamu+Undangan",
  },
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    previewMode: "image",
    previewImageSrc: PLACEHOLDER_LONG,
  },
  {
    id: "romantic-blush",
    name: "Romantic Blush",
    previewMode: "iframe",
    iframeSrc: "/v/demo?to=Tamu+Undangan",
  },
  {
    id: "luxury-marble",
    name: "Luxury Marble",
    previewMode: "image",
    previewImageSrc: PLACEHOLDER_LONG,
  },
  {
    id: "garden-party",
    name: "Garden Party",
    previewMode: "image",
    previewImageSrc: PLACEHOLDER_LONG,
  },
];

export function getTemplateOrderHref(template: CatalogTemplate): string {
  return `${WA_BASE}${encodeURIComponent(template.name)}`;
}
