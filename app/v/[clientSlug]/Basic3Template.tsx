"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, Music2, VolumeX } from "lucide-react";
import type { EventData } from "@/types/admin";

/* ════════════════════════════════════════════════════
   Color Palette — Victorian Sage & Ivory (Basic-3)
   Tidak ada cokelat, tidak ada gold lama.
════════════════════════════════════════════════════ */
const S = {
  // ── Hijau Sage ───────────────────────────────────
  deep:       "#1C3A35",   // Judul & aksen paling gelap
  dark:       "#2D4A43",   // Tombol utama / teks heading
  mid:        "#3D665D",   // Border medium, ikon
  pale:       "#82A39B",   // Border kartu, divider
  light:      "#A8C5BD",   // Border tombol, hover tint
  faint:      "#D4E8E3",   // Background section ringan
  // ── Ivory ────────────────────────────────────────
  ivory:      "#FAF8F3",   // Bg root & bg section
  ivoryCard:  "rgba(250,248,243,0.90)",  // Card semi-transparan
  ivoryText:  "#E8DFCE",   // Teks terang di atas sage gelap
  // ── Teks ─────────────────────────────────────────
  textBody:   "#2D4A43",   // Paragraf body
  textSub:    "#4D7269",   // Teks subdued
  // ── ATM Card gelap ───────────────────────────────
  atmBg:      "#132A26",   // BG kartu rekening
  atmBorder:  "#3D665D",   // Border kartu rekening
} as const;

/* ── Asset paths Basic-3 ── */
const BG3    = "/templates/basic/basic-3/background-basic-3.png";
const MUSIC3 = "/templates/basic/basic-3/basic-1-music.mp3";
/* TIDAK ADA pembatas gambar di Basic-3 */

/* ── Sage pill button class ── */
const SAGE_BTN =
  "inline-flex items-center justify-center gap-2 " +
  "bg-[#2D4A43] hover:bg-[#1C3A35] text-[#F5F2EA] " +
  "rounded-full border border-[#A8C5BD] " +
  "px-6 py-2.5 shadow-md transition-all " +
  "font-sans text-xs tracking-widest uppercase";

/* ── Soft sage divider ── */
function SageDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px ${className}`}
      style={{ background: `linear-gradient(to right, transparent, ${S.pale}, transparent)` }}
    />
  );
}
function SageDividerShort({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px w-16 mx-auto ${className}`}
      style={{ background: `linear-gradient(to right, transparent, ${S.pale}, transparent)` }}
    />
  );
}
function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[9px] uppercase tracking-[0.50em] font-medium"
      style={{ color: S.mid }}>
      {children}
    </p>
  );
}

/* ════════════════════════════════════════════════════
   Types
════════════════════════════════════════════════════ */
interface InvitationRow {
  id: string; title: string; slug: string;
  template: string; event_data: EventData;
}
interface GuestRow { id: string; name: string; status: string; }

/* ════════════════════════════════════════════════════
   Helpers
════════════════════════════════════════════════════ */
function formatTanggal(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(new Date(iso));
  } catch { return iso; }
}
function fj(jam: string): string { return jam ? `${jam} WIB` : ""; }
function formatHari(iso: string): string {
  if (!iso) return "";
  try { return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date(iso)).toUpperCase(); }
  catch { return ""; }
}
function formatTanggalPanjang(iso: string): string {
  if (!iso) return "";
  try {
    const d     = new Date(iso);
    const day   = d.getDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(d).toUpperCase();
    return `${day} ${month} ${d.getFullYear()}`;
  } catch { return iso; }
}

/* ════════════════════════════════════════════════════
   KIRI — Foto cover + teks overlay (Desktop only)
════════════════════════════════════════════════════ */
function CoverWithText({ ed }: { ed: EventData }) {
  const pria    = ed?.mempelai_pria?.nama?.split(" ")[0]   ?? "—";
  const wanita  = ed?.mempelai_wanita?.nama?.split(" ")[0] ?? "—";
  const tanggal = formatTanggal(ed?.jadwal_akad?.tanggal ?? "").toUpperCase();

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {ed?.foto_cover ? (
        <Image src={ed.foto_cover} alt="Foto Cover" fill
          className="object-cover object-center" sizes="65vw" priority quality={100} unoptimized />
      ) : (
        <div className="absolute inset-0" style={{ background: S.dark }} />
      )}
      {/* Sage gradient overlay bawah */}
      <div className="absolute inset-0" style={{
        background:
          "linear-gradient(to bottom, rgba(28,58,53,0) 30%, rgba(28,58,53,0.40) 60%, rgba(18,40,36,0.85) 90%, rgba(18,40,36,0.95) 100%)",
      }} />
      <div className="absolute bottom-0 left-0 right-0 px-12 pb-14 text-center">
        <p className="font-sans text-[9px] uppercase tracking-[0.55em] font-light mb-3"
          style={{ color: "rgba(255,255,255,0.65)" }}>
          The Wedding of
        </p>
        <h1 className="font-serif italic font-normal tracking-wider leading-tight mb-0.5"
          style={{ color: "#fff", fontSize: "clamp(2.4rem, 3.8vw, 3.6rem)", textShadow: "0 2px 20px rgba(0,0,0,0.45)" }}>
          {pria}
        </h1>
        <p className="font-sans text-xl my-1" style={{ color: S.light }}>&amp;</p>
        <h1 className="font-serif italic font-normal tracking-wider leading-tight mb-5"
          style={{ color: "#fff", fontSize: "clamp(2.4rem, 3.8vw, 3.6rem)", textShadow: "0 2px 20px rgba(0,0,0,0.45)" }}>
          {wanita}
        </h1>
        {tanggal && (
          <p className="font-sans text-[9px] tracking-[0.45em] font-light" style={{ color: S.faint }}>
            {tanggal}
          </p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   Opening Section
════════════════════════════════════════════════════ */
function OpeningSection({
  invitation, guestName, onOpen, opened,
}: {
  invitation: InvitationRow; guestName: string;
  onOpen: () => void; opened: boolean;
}) {
  const ed     = invitation.event_data;
  const pria   = ed?.mempelai_pria?.nama?.split(" ")[0]   ?? "—";
  const wanita = ed?.mempelai_wanita?.nama?.split(" ")[0] ?? "—";

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[100dvh] overflow-hidden">
      {ed?.foto_cover ? (
        <div className="absolute inset-0">
          <Image src={ed.foto_cover} alt="Background" fill
            className="object-cover object-center" sizes="35vw" priority quality={100} unoptimized />
          <div className="absolute inset-0"
            style={{ background: "rgba(28,58,53,0.65)" }} />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ background: S.dark }} />
      )}

      {/* TOP — Names */}
      <div className="relative z-10 text-center px-8 pt-14">
        <p className="font-sans text-[9px] uppercase tracking-[0.55em] font-light mb-5"
          style={{ color: "rgba(255,255,255,0.65)" }}>
          The Wedding of
        </p>
        <SageDividerShort className="mb-6" />
        <h1 className="font-serif italic font-normal tracking-wider leading-none"
          style={{ color: "#fff", fontSize: "clamp(1.9rem, 3.2vw, 2.9rem)", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
          {pria}
        </h1>
        <p className="font-sans text-base my-2" style={{ color: S.light }}>&amp;</p>
        <h1 className="font-serif italic font-normal tracking-wider leading-none"
          style={{ color: "#fff", fontSize: "clamp(1.9rem, 3.2vw, 2.9rem)", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
          {wanita}
        </h1>
        <SageDividerShort className="mt-6" />
      </div>

      {/* BOTTOM — Guest + CTA */}
      <div className="relative z-10 text-center px-8 pb-16 w-full">
        <p className="font-sans text-[9px] uppercase tracking-[0.45em] font-light mb-1.5"
          style={{ color: "rgba(255,255,255,0.60)" }}>
          Kepada Yth:
        </p>
        <p className="font-serif italic text-xl font-normal mb-8"
          style={{ color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>
          {guestName || "Tamu Undangan"}
        </p>
        {!opened && (
          <button onClick={onOpen} className={SAGE_BTN} aria-label="Buka undangan">
            ✉️ Buka Undangan
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 2 — Quote Card (Arch top, ivory glass)
════════════════════════════════════════════════════ */
function QuoteSection({ ed }: { ed: EventData }) {
  const pria   = ed?.mempelai_pria?.nama   ?? "";
  const wanita = ed?.mempelai_wanita?.nama ?? "";

  return (
    <section className="relative z-10 flex justify-center px-5 pt-10 pb-10">
      {/* ARCH card — rounded-t-[50px] rounded-b-2xl */}
      <div
        className="w-full max-w-xs overflow-hidden text-center backdrop-blur-sm shadow-xl"
        style={{
          background: S.ivoryCard,
          border: `2px solid rgba(130,163,155,0.40)`,
          borderRadius: "50px 50px 16px 16px",
          boxShadow: `0 16px 60px rgba(28,58,53,0.14)`,
        }}
      >
        {(ed?.foto_quote || ed?.foto_cover) && (
          <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
            <Image src={ed.foto_quote ?? ed.foto_cover} alt="Foto Mempelai" fill
              className="object-cover object-center" sizes="320px" quality={100} unoptimized />
            <div className="absolute bottom-0 left-0 right-0 h-28"
              style={{ background: `linear-gradient(to top, ${S.ivory}, transparent)` }} />
          </div>
        )}
        <div className="px-6 pt-4 pb-4">
          <h2 className="font-serif italic font-normal tracking-wider leading-tight"
            style={{ color: S.deep, fontSize: "1.6rem" }}>
            {pria.split(" ")[0]}
          </h2>
          <p className="font-sans text-base my-1" style={{ color: S.mid }}>&amp;</p>
          <h2 className="font-serif italic font-normal tracking-wider leading-tight"
            style={{ color: S.deep, fontSize: "1.6rem" }}>
            {wanita.split(" ")[0]}
          </h2>
        </div>
        <SageDividerShort className="mb-5" />
        <div className="px-6 pb-8">
          <p className="font-sans text-xs leading-[1.9] font-light italic"
            style={{ color: S.textBody }}>
            Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan
            pasangan-pasangan untukmu dari (jenis) dirimu sendiri agar kamu merasa
            tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih
            sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat
            tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] mt-4 font-medium"
            style={{ color: S.mid }}>
            -QS. Ar-Rum : 21-
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 3 — Biodata Mempelai
════════════════════════════════════════════════════ */
function BiodataSection({ ed }: { ed: EventData }) {
  const mempelai = [
    { role: "Pria",   nama: ed.mempelai_pria?.nama   ?? "—", foto: ed.mempelai_pria?.foto_url,  ortu: ed.mempelai_pria?.ortu   ?? "" },
    { role: "Wanita", nama: ed.mempelai_wanita?.nama ?? "—", foto: ed.mempelai_wanita?.foto_url, ortu: ed.mempelai_wanita?.ortu ?? "" },
  ];

  return (
    <>
      {/* Ayat pembuka */}
      <p className="font-sans text-[11px] italic text-center leading-relaxed max-w-xs mx-auto mb-10"
        style={{ color: S.textBody }}>
        Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
        Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:
      </p>

      <div className="space-y-14 max-w-[280px] mx-auto">
        {mempelai.map((m) => (
          <div key={m.role} className="text-center">
            {/* Foto — arch top + sage border */}
            <div className="relative mx-auto overflow-hidden" style={{
              width: "280px", height: "370px",
              borderRadius: "140px 140px 0 0",   /* dome/arch penuh */
              border: `2px solid rgba(130,163,155,0.55)`,
              background: S.faint,
            }}>
              {m.foto ? (
                <Image src={m.foto} alt={m.nama} fill className="object-cover object-top" sizes="280px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: S.faint }}>
                  <Heart size={32} style={{ color: S.mid }} strokeWidth={1.5} />
                </div>
              )}
              {/* Sage gradient fade bawah */}
              <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                style={{ background: `linear-gradient(to top, ${S.ivory} 0%, transparent 100%)` }} />
              <span className="absolute bottom-2 left-3 text-xl select-none" style={{ opacity: 0.70 }}>🍃</span>
              <span className="absolute bottom-2 right-3 text-xl select-none"
                style={{ opacity: 0.70, display: "inline-block", transform: "scaleX(-1)" }}>🍃</span>
            </div>

            {/* Name + ortu */}
            <div style={{ maxWidth: "280px", margin: "16px auto 0" }}>
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="flex-1 h-px"
                  style={{ background: `linear-gradient(to right, transparent, ${S.pale})` }} />
                <p className="font-serif italic font-normal tracking-wider text-xl whitespace-nowrap"
                  style={{ color: S.deep }}>
                  {m.nama}
                </p>
                <div className="flex-1 h-px"
                  style={{ background: `linear-gradient(to left, transparent, ${S.pale})` }} />
              </div>
              {m.ortu && (
                <p className="font-sans text-[11px] font-light leading-relaxed mt-1.5 text-center"
                  style={{ color: S.textSub }}>
                  {m.ortu}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 4 — Save The Date + Countdown + Jadwal
════════════════════════════════════════════════════ */
function JadwalSection({ ed }: { ed: EventData }) {
  const [countdown, setCountdown] = useState({ hari: 0, jam: 0, menit: 0, detik: 0 });

  useEffect(() => {
    const iso = ed.jadwal_akad?.tanggal;
    if (!iso) return;
    const target = new Date(iso);
    target.setHours(0, 0, 0, 0);
    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCountdown({ hari: 0, jam: 0, menit: 0, detik: 0 }); return; }
      setCountdown({
        hari:  Math.floor(diff / 86400000),
        jam:   Math.floor((diff % 86400000) / 3600000),
        menit: Math.floor((diff % 3600000)  / 60000),
        detik: Math.floor((diff % 60000)    / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [ed.jadwal_akad?.tanggal]);

  const events = [
    {
      id: "akad", label: "Akad Nikah", labelSub: "",
      hari:       formatHari(ed.jadwal_akad?.tanggal ?? ""),
      tanggal:    formatTanggalPanjang(ed.jadwal_akad?.tanggal ?? ""),
      jamMulai:   fj(ed.jadwal_akad?.jam_mulai  ?? ""),
      jamSelesai: fj(ed.jadwal_akad?.jam_selesai ?? ""),
      namaLokasi: ed.akad_lokasi   ?? "",
      alamat:     ed.akad_alamat   ?? ed.lokasi?.alamat   ?? "",
      maps:       ed.akad_maps_url ?? ed.lokasi?.maps_url ?? "",
    },
    {
      id: "resepsi", label: "Resepsi", labelSub: "",
      hari:       formatHari(ed.jadwal_resepsi?.tanggal ?? ""),
      tanggal:    formatTanggalPanjang(ed.jadwal_resepsi?.tanggal ?? ""),
      jamMulai:   fj(ed.jadwal_resepsi?.jam_mulai  ?? ""),
      jamSelesai: fj(ed.jadwal_resepsi?.jam_selesai ?? ""),
      namaLokasi: ed.resepsi_lokasi   ?? "",
      alamat:     ed.resepsi_alamat   ?? ed.lokasi?.alamat   ?? "",
      maps:       ed.resepsi_maps_url ?? ed.lokasi?.maps_url ?? "",
    },
  ];

  return (
    <>
      {/* Save The Date header */}
      <div className="text-center mb-7">
        <h2 className="font-serif italic font-normal tracking-wider"
          style={{ color: S.deep, fontSize: "clamp(2rem, 7vw, 2.5rem)" }}>
          Save The Date
        </h2>
        <SageDividerShort className="mt-3" />
      </div>

      {/* Countdown — ivory glass boxes */}
      <div className="grid grid-cols-4 gap-2.5 max-w-[280px] mx-auto mb-8">
        {([
          { value: countdown.hari,  label: "Hari"  },
          { value: countdown.jam,   label: "Jam"   },
          { value: countdown.menit, label: "Menit" },
          { value: countdown.detik, label: "Detik" },
        ] as { value: number; label: string }[]).map((item) => (
          <div key={item.label}
            className="text-center py-3 backdrop-blur-sm"
            style={{
              background: "rgba(250,248,243,0.85)",
              border: `1px solid rgba(130,163,155,0.45)`,
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(28,58,53,0.08)",
            }}>
            <p className="font-serif italic text-xl font-normal leading-none"
              style={{ color: S.deep }}>
              {String(item.value).padStart(2, "0")}
            </p>
            <p className="font-sans text-[8px] uppercase tracking-wider mt-1.5 font-medium"
              style={{ color: S.textSub }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Deskripsi */}
      <p className="font-sans text-[11px] italic text-center leading-relaxed max-w-xs mx-auto mb-10"
        style={{ color: S.textBody }}>
        Dengan memohon rahmat dan ridho Allah SWT, kami mengundang
        Bapak/Ibu/Saudara/i, untuk menghadiri acara pernikahan kami:
      </p>

      {/* Event cards — ARCH top, ivory glass */}
      <div className="space-y-8 max-w-[300px] mx-auto">
        {events.map((ev) => (
          <div key={ev.id}
            className="overflow-hidden backdrop-blur-sm shadow-xl"
            style={{
              background: S.ivoryCard,
              border: `2px solid rgba(130,163,155,0.40)`,
              borderRadius: "50px 50px 16px 16px",
              boxShadow: `0 8px 32px rgba(28,58,53,0.12)`,
            }}>
            {/* Arch header strip */}
            <div className="px-6 pt-8 pb-4 text-center"
              style={{ background: `linear-gradient(to bottom, rgba(212,232,227,0.60) 0%, transparent 100%)` }}>
              <h3 className="font-serif italic font-normal tracking-wider"
                style={{ color: S.deep, fontSize: "1.9rem" }}>
                {ev.label}
              </h3>
              <SageDividerShort className="mt-3 mb-4" />
            </div>

            <div className="px-6 pb-7 text-center">
              {ev.hari && (
                <p className="font-sans text-[10px] uppercase tracking-[0.40em] font-medium mb-0.5"
                  style={{ color: S.mid }}>{ev.hari}</p>
              )}
              {ev.tanggal && (
                <p className="font-serif italic text-base font-normal mb-0.5"
                  style={{ color: S.dark }}>{ev.tanggal}</p>
              )}
              {(ev.jamMulai || ev.jamSelesai) && (
                <p className="font-sans text-sm font-light mb-5" style={{ color: S.textSub }}>
                  {ev.jamMulai}{ev.jamMulai && ev.jamSelesai && " – "}{ev.jamSelesai}
                </p>
              )}
              {(ev.namaLokasi || ev.alamat) && (
                <div className="mb-5">
                  <div className="flex justify-center mb-2">
                    <MapPin size={14} strokeWidth={1.5} style={{ color: S.mid }} />
                  </div>
                  {ev.namaLokasi && (
                    <p className="font-sans text-sm font-semibold uppercase tracking-wide"
                      style={{ color: S.dark }}>{ev.namaLokasi}</p>
                  )}
                  {ev.alamat && (
                    <p className="font-sans text-xs font-light leading-relaxed mt-1"
                      style={{ color: S.textBody }}>{ev.alamat}</p>
                  )}
                </div>
              )}
              {ev.maps && (
                <a href={ev.maps} target="_blank" rel="noopener noreferrer"
                  className={SAGE_BTN}>
                  <MapPin size={11} strokeWidth={2} />
                  Google Map
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 5 — Galeri (landscape 16/9, sage-faint bg)
════════════════════════════════════════════════════ */
function GaleriSection({ galeri }: { galeri: string[] }) {
  if (!galeri?.length) return null;

  return (
    <section className="px-5 py-14" style={{ background: S.faint }}>
      {/* Header — arch card */}
      <div
        className="text-center mb-8 mx-auto max-w-xs px-6 py-6 backdrop-blur-sm shadow-xl"
        style={{
          background: S.ivoryCard,
          border: `2px solid rgba(130,163,155,0.40)`,
          borderRadius: "40px 40px 16px 16px",
          boxShadow: `0 4px 24px rgba(28,58,53,0.10)`,
        }}
      >
        <EyebrowLabel>Momen Bersama</EyebrowLabel>
        <SageDividerShort className="my-3" />
        <h2 className="font-serif italic font-normal tracking-wider text-2xl"
          style={{ color: S.deep }}>Galeri</h2>
      </div>

      {/* Image grid — arch top */}
      <div className="space-y-4 max-w-md mx-auto">
        {galeri.slice(0, 8).map((url, idx) => (
          <div key={idx}
            className="relative w-full overflow-hidden shadow-lg"
            style={{
              aspectRatio: "16/9",
              border: `1px solid rgba(130,163,155,0.40)`,
              borderRadius: "16px",
            }}>
            <Image src={url} alt={`Galeri ${idx + 1}`} fill className="object-cover"
              sizes="(max-width: 768px) 100vw, 414px" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   Wedding Gift Section
════════════════════════════════════════════════════ */
function WeddingGiftSection({
  ed, isGiftOpen, setIsGiftOpen, handleCopy,
}: {
  ed: EventData; isGiftOpen: boolean;
  setIsGiftOpen: (v: boolean) => void;
  handleCopy: (text: string) => void;
}) {
  const hasRek1 = ed?.rek_1_bank || ed?.rek_1_no || ed?.rek_1_nama;
  const hasRek2 = ed?.rek_2_bank || ed?.rek_2_no || ed?.rek_2_nama;
  const hasGift = ed?.gift_penerima || ed?.gift_alamat;
  if (!hasRek1 && !hasRek2 && !hasGift) return null;

  /** ATM card — dark sage #132A26, cream text */
  const renderAtmCard = (bank: string, no: string, nama: string) => (
    <div className="p-6 relative overflow-hidden rounded-2xl" style={{
      background: S.atmBg,
      border: `1px solid ${S.atmBorder}`,
      boxShadow: `0 12px 36px rgba(19,42,38,0.35)`,
    }}>
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div className="w-11 h-8 rounded-md flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${S.pale} 0%, ${S.mid} 100%)` }}>
          <div className="w-7 h-4 rounded-sm" style={{ border: "1px solid rgba(255,255,255,0.25)" }} />
        </div>
        <span className="font-serif italic font-normal text-2xl"
          style={{ color: S.ivoryText, letterSpacing: "0.05em" }}>{bank}</span>
      </div>
      <div className="font-mono text-lg tracking-[0.2em] mb-2 z-10 relative"
        style={{ color: S.ivoryText }}>{no}</div>
      <div className="text-[11px] uppercase tracking-[0.25em] font-light z-10 relative"
        style={{ color: "rgba(232,223,206,0.70)" }}>{nama}</div>
      {no && (
        <button onClick={() => handleCopy(no)}
          className="absolute bottom-4 right-4 text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all font-medium z-10"
          style={{ background: "#0C1E1B", border: `1px solid ${S.atmBorder}`, color: S.ivoryText }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
          </svg>
          Salin
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1 opacity-35"
        style={{ background: `linear-gradient(to right, transparent 10%, ${S.pale} 50%, transparent 90%)` }} />
    </div>
  );

  return (
    <div className="w-full px-4 py-12 flex justify-center" style={{ background: S.faint }}>
      {/* Outer card — arch top, ivory glass */}
      <div
        className="w-full max-w-md p-8 flex flex-col items-center backdrop-blur-sm shadow-xl"
        style={{
          background: S.ivoryCard,
          border: `2px solid rgba(130,163,155,0.40)`,
          borderRadius: "50px 50px 20px 20px",
          boxShadow: `0 8px 40px rgba(28,58,53,0.12)`,
        }}
      >
        <div className="text-center mb-7">
          <h2 className="font-serif italic font-normal tracking-wider"
            style={{ color: S.deep, fontSize: "clamp(2rem, 7vw, 2.5rem)" }}>
            Wedding Gift
          </h2>
          <SageDividerShort className="mt-3" />
        </div>
        <p className="font-sans text-sm font-light leading-[2] text-center max-w-xs mx-auto mb-6"
          style={{ color: S.textBody }}>
          Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan hadiah pernikahan dapat melalui
          virtual account atau e-wallet di bawah ini:
        </p>

        {/* Sage pill toggle */}
        <button onClick={() => setIsGiftOpen(!isGiftOpen)} className={SAGE_BTN}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {isGiftOpen ? "TUTUP" : "KLIK DISINI"}
        </button>

        <AnimatePresence initial={false}>
          {isGiftOpen && (
            <motion.div key="gift" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden w-full">
              <div className="mt-8 flex flex-col gap-4 w-full">
                {hasRek1 && renderAtmCard(ed.rek_1_bank ?? "", ed.rek_1_no ?? "", ed.rek_1_nama ?? "")}
                {hasRek2 && renderAtmCard(ed.rek_2_bank ?? "", ed.rek_2_no ?? "", ed.rek_2_nama ?? "")}
                {hasGift && (
                  <div className="p-6 text-center rounded-2xl" style={{
                    background: S.atmBg,
                    border: `1px solid ${S.atmBorder}`,
                  }}>
                    <div className="flex justify-center mb-3">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"
                        style={{ color: S.pale }}>
                        <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                        <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                      </svg>
                    </div>
                    <h4 className="font-serif italic font-normal text-lg mb-3"
                      style={{ color: S.ivoryText }}>Kirim Hadiah</h4>
                    {ed?.gift_penerima && (
                      <p className="text-sm mb-1 font-sans" style={{ color: "rgba(232,223,206,0.80)" }}>
                        Nama Penerima : <strong style={{ color: S.ivoryText }}>{ed.gift_penerima}</strong>
                      </p>
                    )}
                    {ed?.gift_alamat && (
                      <p className="text-sm leading-relaxed font-sans mt-2"
                        style={{ color: "rgba(232,223,206,0.70)" }}>
                        Alamat Kirim : {ed.gift_alamat}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 6 — Penutup
════════════════════════════════════════════════════ */
function PenutupSection({ pria, wanita, ed }: { pria: string; wanita: string; ed: EventData }) {
  return (
    <section className="relative overflow-hidden text-center min-h-screen flex flex-col justify-center">
      {ed?.foto_cover && (
        <div className="absolute inset-0">
          <Image src={ed.foto_cover} alt="Background Penutup" fill
            className="object-cover object-center" sizes="35vw" />
        </div>
      )}
      <div className="absolute inset-0" style={{
        background:
          "linear-gradient(to bottom, rgba(28,58,53,0.60) 0%, rgba(18,40,36,0.78) 50%, rgba(12,30,27,0.92) 100%)",
      }} />
      <div className="relative z-10 px-6 py-20">
        {/* Circular sage ornament */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(130,163,155,0.18)", border: `1px solid ${S.light}` }}>
          <Heart size={20} strokeWidth={1.5} style={{ color: S.light }} />
        </div>

        <EyebrowLabel>Dengan Hormat</EyebrowLabel>
        <SageDividerShort className="my-4" />

        <h2 className="font-serif italic font-normal tracking-wider text-3xl mb-8"
          style={{ color: "#fff" }}>
          {pria} &amp; {wanita}
        </h2>
        <p className="font-sans text-sm font-light leading-[2] max-w-xs mx-auto mb-4"
          style={{ color: "rgba(255,255,255,0.80)" }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
          Bapak / Ibu / Saudara/i berkenan hadir dan memberikan doa restu.
          Atas kehadiran dan doa restunya kami ucapkan terima kasih.
        </p>
        <p className="font-serif italic text-base font-normal mb-1" style={{ color: "#fff" }}>
          Wassalamualaikum Wr. Wb.
        </p>
        <SageDivider className="max-w-[80px] mx-auto mt-12 mb-8" />
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: S.light }}>
          Original Design By: Atora
        </p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT — Basic3Template
════════════════════════════════════════════════════ */
export default function Basic3Template({
  invitation, guest, guestName,
}: {
  invitation: InvitationRow; guest: GuestRow | null; guestName: string;
}) {
  const [opened,     setOpened]     = useState(false);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const audioRef      = useRef<HTMLAudioElement>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Nomor rekening disalin!");
  };

  const handleOpen = () => {
    setOpened(true);
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    setTimeout(() => {
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById("sec-quote-b3")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 80);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  const ed      = invitation.event_data;
  const pria    = ed?.mempelai_pria?.nama   ?? "—";
  const wanita  = ed?.mempelai_wanita?.nama ?? "—";
  const display = guest?.name ?? guestName;

  /* ── Content stack — NO pembatas gambar sama sekali ── */
  const ContentSections = (
    <>
      <div id="sec-quote-b3">
        <QuoteSection ed={ed} />
      </div>

      {/* ═══════════════════════════════════════════
          UNIFIED SECTION — ivory bg, no divider images
          Biodata + Save The Date
      ═══════════════════════════════════════════ */}
      <div className="w-full" style={{ background: S.ivory }}>

        {/* Top leaf ornament */}
        <div className="flex justify-center pt-8 pb-2">
          <span className="text-2xl" style={{ color: S.pale, opacity: 0.60 }}>🍃 ✦ 🍃</span>
        </div>

        {/* Biodata */}
        <div className="w-full px-6 py-10">
          <BiodataSection ed={ed} />
        </div>

        {/* Sage separator — pure CSS, no image */}
        <div className="flex items-center gap-3 px-8 py-4">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${S.pale})` }} />
          <span className="text-base" style={{ color: S.pale }}>✦</span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${S.pale})` }} />
        </div>

        {/* Jadwal */}
        <div className="w-full px-6 py-10">
          <JadwalSection ed={ed} />
        </div>

        {/* Bottom leaf ornament */}
        <div className="flex justify-center pt-2 pb-8">
          <span className="text-2xl" style={{ color: S.pale, opacity: 0.60 }}>🍃 ✦ 🍃</span>
        </div>
      </div>

      <GaleriSection galeri={ed?.galeri ?? []} />

      <WeddingGiftSection
        ed={ed}
        isGiftOpen={isGiftOpen}
        setIsGiftOpen={setIsGiftOpen}
        handleCopy={handleCopy}
      />

      <PenutupSection pria={pria} wanita={wanita} ed={ed} />
    </>
  );

  return (
    <div style={{ background: S.ivory }}>
      <audio ref={audioRef} src={MUSIC3} loop preload="auto" />

      {/* FAB Music — sage */}
      {opened && (
        <button id="fab-music-b3" onClick={toggleMusic}
          aria-label={isPlaying ? "Pause musik" : "Play musik"}
          className="fixed bottom-6 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{ background: S.dark, boxShadow: "0 4px 18px rgba(28,58,53,0.40)" }}>
          {isPlaying
            ? <Music2 size={20} strokeWidth={2} className="text-white" />
            : <VolumeX size={20} strokeWidth={2} className="text-white" />}
        </button>
      )}

      {/* ═══════════ DESKTOP SPLIT-SCREEN ═══════════ */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden">
        {/* LEFT — foto cover */}
        <div className="template-left-panel flex-1 relative">
          <CoverWithText ed={ed} />
        </div>

        {/* RIGHT — 414px, bg damask victorian */}
        <div ref={rightPanelRef}
          className="template-right-panel w-[414px] shrink-0 scrollbar-hide relative"
          style={{
            backgroundImage: `url('${BG3}')`,
            backgroundAttachment: "scroll",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}>
          {/* Ivory-sage tint overlay — biarkan damask subtle terlihat */}
          <div className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: "rgba(250,248,243,0.50)" }} />
          <div className="relative z-10">
            <OpeningSection invitation={invitation} guestName={display} onOpen={handleOpen} opened={opened} />
            {opened && ContentSections}
          </div>
        </div>
      </div>

      {/* ═══════════ MOBILE ═══════════ */}
      <div className="lg:hidden relative">
        <div className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${BG3}')`,
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "rgba(250,248,243,0.50)" }} />
        <div className="relative z-10">
          <OpeningSection invitation={invitation} guestName={display} onOpen={handleOpen} opened={opened} />
          {opened && ContentSections}
        </div>
      </div>
    </div>
  );
}
