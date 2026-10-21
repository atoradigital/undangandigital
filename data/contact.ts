/**
 * Atora — kontak & tautan WhatsApp terpusat (format wa.me + encodeURIComponent).
 */
export const ATORA = {
  brand: "Atora",
  waDigits: "6281818863392",
  phoneDisplay: "++62 818 1886 3392",
  phoneTel: "+62 818-1886-3392",
  email: "atoradigital@gmail.com",
  instagram: "https://www.instagram.com",
  facebook: "https://www.facebook.com",
} as const;

function buildWa(text: string): string {
  return `https://wa.me/${ATORA.waDigits}?text=${encodeURIComponent(text)}`;
}

/** Hero, Navbar — “Pesan Sekarang” umum */
export function waOrderDigital(): string {
  return buildWa(
    "Halo Atora, saya tertarik untuk memesan undangan digital."
  );
}

/** Katalog / modal — pesan menyebut nama template */
export function waOrderWithTemplate(templateName: string): string {
  return buildWa(
    `Halo Atora, saya tertarik untuk memesan undangan digital dengan template ${templateName}.`
  );
}

/** CTA lihat katalog lainnya */
export function waSeeMoreTemplates(): string {
  return buildWa(
    "Halo Atora, saya tertarik untuk memesan undangan digital dan ingin melihat katalog template lainnya."
  );
}

/** Paket harga — menyebut nama paket */
export function waAskPackage(planName: string): string {
  return buildWa(
    `Halo Atora, saya tertarik untuk memesan undangan digital dan ingin bertanya tentang paket ${planName}.`
  );
}

/** Paket khusus / hubungi kami */
export function waCustomPackage(): string {
  return buildWa(
    "Halo Atora, saya tertarik untuk memesan undangan digital dan ingin bertanya tentang paket khusus."
  );
}
