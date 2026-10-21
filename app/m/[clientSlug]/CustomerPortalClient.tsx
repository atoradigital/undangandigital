"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { DEFAULT_BROADCAST_TEMPLATE } from "@/types/admin";

/* ════════════════════════════════════════════════════
   Types
════════════════════════════════════════════════════ */
interface InvitationData {
  id: string;
  title: string;
  slug: string;
  broadcast_template: string | null;
  event_data: {
    mempelai_pria?: { nama: string };
    mempelai_wanita?: { nama: string };
  } | null;
}

interface Props {
  invitation: InvitationData;
}

/* ════════════════════════════════════════════════════
   Helpers
════════════════════════════════════════════════════ */
function getNamaPengantin(eventData: InvitationData["event_data"]): string {
  if (!eventData) return "-";
  const pria = eventData.mempelai_pria?.nama || "";
  const wanita = eventData.mempelai_wanita?.nama || "";
  if (pria && wanita) return `${pria} & ${wanita}`;
  return pria || wanita || "-";
}

function buildInvitationLink(slug: string, guestName: string): string {
  const encodedName = encodeURIComponent(guestName);
  return `https://atoradigital.com/r/${slug}?to=${encodedName}`;
}

function processTemplate(
  template: string,
  guestName: string,
  namaPengantin: string,
  slug: string
): string {
  const link = buildInvitationLink(slug, guestName);
  return template
    .replace(/\[nama tamu undangan\]/gi, guestName || "[nama tamu undangan]")
    .replace(/\[nama pengantin\]/gi, namaPengantin)
    .replace(/\[link_undangan\]/gi, link);
}

function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/* ════════════════════════════════════════════════════
   WhatsApp Icon SVG
════════════════════════════════════════════════════ */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.544 4.076 1.497 5.785L0 24l6.335-1.467A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.87 9.87 0 01-5.017-1.362l-.361-.214-3.741.867.928-3.635-.236-.374A9.847 9.847 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118S21.882 6.533 21.882 12 17.467 21.882 12 21.882z" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   Decorative Elements
════════════════════════════════════════════════════ */
function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#C9A961]/40 to-transparent" />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" className="opacity-60">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#C9A961]/40 to-transparent" />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   Main Component
════════════════════════════════════════════════════ */
export default function CustomerPortalClient({ invitation }: Props) {
  const [guestName, setGuestName] = useState("");
  const [copied, setCopied] = useState(false);

  const namaPengantin = useMemo(
    () => getNamaPengantin(invitation.event_data),
    [invitation.event_data]
  );

  const template =
    invitation.broadcast_template || DEFAULT_BROADCAST_TEMPLATE;

  const previewText = useMemo(
    () =>
      processTemplate(
        template,
        guestName,
        namaPengantin,
        invitation.slug
      ),
    [template, guestName, namaPengantin, invitation.slug]
  );

  const whatsappUrl = useMemo(
    () => (guestName.trim() ? buildWhatsAppUrl(previewText) : ""),
    [guestName, previewText]
  );

  const invitationLink = useMemo(
    () =>
      guestName.trim()
        ? buildInvitationLink(invitation.slug, guestName)
        : `https://atoradigital.com/r/${invitation.slug}?to=...`,
    [invitation.slug, guestName]
  );

  const handleCopyLink = async () => {
    if (!guestName.trim()) return;
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = invitationLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] relative overflow-hidden">
      {/* ── Subtle background pattern ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, #C9A961, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, #C9A961, transparent 70%)",
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-[#E8D5A3]/30 bg-white/60 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/logo-atora-lanscape.png"
              alt="Atora Digital"
              width={120}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-sans text-[10px] font-medium tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Portal Aktif
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-2xl mx-auto px-5 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <p className="font-sans text-[10px] text-[#C9A961] uppercase tracking-[0.3em] font-medium mb-2">
            Portal Kirim Undangan
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3A3429] leading-tight mb-2">
            {invitation.title}
          </h1>
          <p className="font-sans text-sm text-[#5C4A37]/60 font-light">
            {namaPengantin}
          </p>
        </div>

        <GoldDivider />

        {/* ── Input Section ── */}
        <div className="bg-white rounded-2xl border border-[#E8D5A3]/40 shadow-[0_4px_24px_rgba(58,52,41,0.04)] overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-[#F5F1E8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-base font-semibold text-[#3A3429] leading-tight">
                  Nama Tamu Undangan
                </h2>
                <p className="font-sans text-xs text-[#5C4A37]/55 font-light mt-0.5">
                  Ketik nama tamu yang ingin diundang
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="relative">
              <input
                id="guest-name-input"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                autoComplete="off"
                className="w-full px-4 py-3.5 bg-[#F9F7F2] border border-[#E8D5A3]/60 rounded-xl font-sans text-sm text-[#3A3429] placeholder-[#5C4A37]/30 focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 transition-all"
              />
              {guestName && (
                <button
                  type="button"
                  onClick={() => setGuestName("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#3A3429]/10 hover:bg-[#3A3429]/20 flex items-center justify-center transition-colors"
                  aria-label="Clear"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5C4A37]">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Link preview */}
            {guestName.trim() && (
              <div className="mt-3 flex items-center gap-2">
                <span className="font-sans text-[10px] text-[#5C4A37]/45 font-light shrink-0">
                  Link:
                </span>
                <span className="font-mono text-[10px] text-[#C9A961] truncate flex-1">
                  {invitationLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F9F7F2] border border-[#E8D5A3]/50 hover:border-[#C9A961]/60 text-[#5C4A37] hover:text-[#C9A961] font-sans text-[10px] font-medium transition-all"
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      Salin
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Preview Section ── */}
        <div className="bg-white rounded-2xl border border-[#E8D5A3]/40 shadow-[0_4px_24px_rgba(58,52,41,0.04)] overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-[#F5F1E8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-base font-semibold text-[#3A3429] leading-tight">
                  Preview Pesan
                </h2>
                <p className="font-sans text-xs text-[#5C4A37]/55 font-light mt-0.5">
                  Teks yang akan dikirim via WhatsApp
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            {/* WhatsApp-style bubble */}
            <div className="relative bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-4 py-3.5 shadow-sm max-w-full">
              <pre className="font-sans text-[13px] text-[#111B21] whitespace-pre-wrap leading-relaxed break-words">
                {previewText}
              </pre>
              <div className="flex items-center justify-end gap-1 mt-1.5">
                <span className="font-sans text-[10px] text-[#667781]">
                  {new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <svg width="16" height="11" viewBox="0 0 16 11" fill="#53bdeb">
                  <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.136.476.476 0 0 0-.372.162.544.544 0 0 0 .006.74l2.598 2.59c.088.087.194.142.306.162a.47.47 0 0 0 .259-.024.5.5 0 0 0 .22-.152l6.82-8.146a.478.478 0 0 0-.221-.636z" />
                  <path d="M14.757.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.143-1.08a.145.145 0 0 0-.089.162l.877.876a.47.47 0 0 0 .259-.024.5.5 0 0 0 .22-.152l6.82-8.146a.478.478 0 0 0-.069-.348z" />
                </svg>
              </div>
              {/* Bubble tail */}
              <div className="absolute top-0 right-[-6px] w-3 h-3 overflow-hidden">
                <div className="w-3 h-3 bg-[#DCF8C6] rotate-45 transform origin-bottom-left" />
              </div>
            </div>

            {/* Placeholder hints */}
            {!guestName.trim() && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200/60 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="font-sans text-xs text-amber-700 font-light">
                  Ketik nama tamu di atas untuk melihat preview pesan lengkap.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="space-y-3">
          {/* Send to WhatsApp */}
          <a
            id="send-whatsapp-btn"
            href={whatsappUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!guestName.trim()) e.preventDefault();
            }}
            className={`flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl font-sans text-base font-medium tracking-wide transition-all duration-300 shadow-lg ${
              guestName.trim()
                ? "bg-[#25D366] hover:bg-[#1EBE5D] text-white cursor-pointer hover:shadow-emerald-200/50 hover:shadow-xl active:scale-[0.98]"
                : "bg-[#25D366]/30 text-white/60 cursor-not-allowed"
            }`}
          >
            <WhatsAppIcon className={guestName.trim() ? "text-white" : "text-white/60"} />
            Kirim ke WhatsApp
          </a>

          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            disabled={!guestName.trim()}
            className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-2xl border border-[#E8D5A3]/60 hover:border-[#C9A961] bg-white hover:bg-[#FDFCF9] text-[#3A3429] font-sans text-sm font-light tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-emerald-600 font-medium">Link Tersalin!</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C9A961]">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Salin Link Undangan
              </>
            )}
          </button>
        </div>

        {/* ── How it works ── */}
        <GoldDivider />

        <div className="bg-white/70 rounded-2xl border border-[#E8D5A3]/30 p-6">
          <h3 className="font-serif text-sm font-semibold text-[#3A3429] mb-4">
            Cara Menggunakan
          </h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "Ketik nama tamu undangan di kolom input di atas" },
              { step: "2", text: "Preview pesan WhatsApp akan terisi otomatis" },
              { step: "3", text: 'Klik "Kirim ke WhatsApp" untuk mengirim undangan' },
              { step: "4", text: "Pilih kontak tamu di WhatsApp, lalu kirim" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/20 flex items-center justify-center shrink-0">
                  <span className="font-mono text-[10px] font-bold text-[#C9A961]">
                    {item.step}
                  </span>
                </span>
                <p className="font-sans text-sm text-[#5C4A37]/70 font-light leading-relaxed pt-0.5">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[#E8D5A3]/30 bg-white/40">
        <div className="max-w-2xl mx-auto px-5 py-6 text-center">
          <p className="font-sans text-[10px] text-[#5C4A37]/40 tracking-wider uppercase">
            Powered by{" "}
            <span className="text-[#C9A961] font-medium">Atora Digital</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
