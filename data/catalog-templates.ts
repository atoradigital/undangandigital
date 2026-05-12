import { waOrderWithTemplate, waSeeMoreTemplates } from "./contact";

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

/** CTA “Lihat semua template” */
export const WHATSAPP_SEE_ALL_TEMPLATES = waSeeMoreTemplates();

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
  return waOrderWithTemplate(template.name);
}
