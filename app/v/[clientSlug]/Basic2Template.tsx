"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, Music2, VolumeX } from "lucide-react";
import type { EventData } from "@/types/admin";

/* ════════════════════════════════════════════════════
   Color Palette — Classic Navy & Gold Luxury (Basic-2)
   Tidak ada cokelat, tidak ada pembatas gambar Basic-1.
════════════════════════════════════════════════════ */
const N = {
  navy:       "#0A1128",   // background root
  navyMid:    "#0F1D3D",   // surface / card bg
  navyDeep:   "#050B18",   // ATM card midnight navy
  gold:       "#D4AF37",   // aksen emas klasik dominan
  goldDim:    "rgba(212,175,55,0.60)",
  goldFaint:  "rgba(212,175,55,0.30)",
  goldOutline:"rgba(212,175,55,0.30)",
  cream:      "#EADCA6",   // teks judul — emas pucat
  creamText:  "rgba(253,251,247,0.90)",  // teks paragraf
  creamDim:   "rgba(253,251,247,0.60)",  // teks subdued
} as const;

/* ── Asset paths Basic-2 ── */
const BG2    = "/templates/basic/basic-2/background-basic-2.png";
const MUSIC2 = "/templates/basic/basic-2/basic-1-music.mp3";
/* TIDAK ADA pembatas gambar — separator pakai CSS murni */

/* ── Gold Ghost Button (shared class string) ── */
const GOLD_BTN =
  "inline-flex items-center justify-center gap-2 " +
  "bg-transparent border-2 border-[#D4AF37] " +
  "text-[#EADCA6] hover:bg-[#D4AF37] hover:text-[#0A1128] " +
  "rounded-none px-6 py-2.5 shadow-lg " +
  "transition-all duration-300 " +
  "font-serif text-xs tracking-[0.2em] uppercase font-bold";

/* ── Gold rule CSS separator (no image) ── */
function GoldRule({ className = "" }: { className?: string }) {
  return (
    <div className={`w-16 h-[1px] mx-auto my-6 ${className}`}
      style={{ background: N.goldDim }} />
  );
}
function GoldRuleFull({ className = "" }: { className?: string }) {
  return (
    <div className={`h-[1px] ${className}`}
      style={{ background: `linear-gradient(to right, transparent, ${N.gold}, transparent)` }} />
  );
}
function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-serif text-[9px] uppercase tracking-[0.45em] font-semibold"
      style={{ color: N.gold }}>
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
        <div className="absolute inset-0" style={{ background: N.navyMid }} />
      )}
      {/* Navy gradient overlay */}
      <div className="absolute inset-0" style={{
        background:
          "linear-gradient(to bottom, rgba(10,17,40,0) 30%, rgba(10,17,40,0.50) 60%, rgba(5,11,24,0.88) 90%, rgba(5,11,24,0.96) 100%)",
      }} />

      <div className="absolute bottom-0 left-0 right-0 px-12 pb-14 text-center">
        <p className="font-serif text-[9px] uppercase tracking-[0.50em] font-light mb-3"
          style={{ color: N.creamDim }}>
          The Wedding of
        </p>
        <GoldRule className="my-3" />
        <h1 className="font-serif uppercase tracking-[0.2em] font-semibold leading-tight mb-0.5"
          style={{ color: N.cream, fontSize: "clamp(2.0rem, 3.2vw, 3.2rem)", textShadow: "0 2px 20px rgba(0,0,0,0.60)" }}>
          {pria}
        </h1>
        <p className="font-serif text-xl my-1" style={{ color: N.gold }}>&amp;</p>
        <h1 className="font-serif uppercase tracking-[0.2em] font-semibold leading-tight mb-4"
          style={{ color: N.cream, fontSize: "clamp(2.0rem, 3.2vw, 3.2rem)", textShadow: "0 2px 20px rgba(0,0,0,0.60)" }}>
          {wanita}
        </h1>
        <GoldRule className="my-3" />
        {tanggal && (
          <p className="font-serif text-[9px] tracking-[0.40em] font-semibold mt-3"
            style={{ color: N.goldDim }}>
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
          <div className="absolute inset-0" style={{ background: "rgba(10,17,40,0.70)" }} />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ background: N.navyMid }} />
      )}

      {/* TOP — Names */}
      <div className="relative z-10 text-center px-8 pt-14">
        <p className="font-serif text-[9px] uppercase tracking-[0.55em] font-light mb-4"
          style={{ color: N.creamDim }}>
          The Wedding of
        </p>
        <GoldRule className="my-3" />
        <h1 className="font-serif uppercase tracking-[0.2em] font-semibold leading-none"
          style={{ color: N.cream, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", textShadow: "0 2px 20px rgba(0,0,0,0.70)" }}>
          {pria}
        </h1>
        <p className="font-serif text-base my-2" style={{ color: N.gold }}>&amp;</p>
        <h1 className="font-serif uppercase tracking-[0.2em] font-semibold leading-none"
          style={{ color: N.cream, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", textShadow: "0 2px 20px rgba(0,0,0,0.70)" }}>
          {wanita}
        </h1>
        <GoldRule className="my-3" />
      </div>

      {/* BOTTOM — Guest + CTA */}
      <div className="relative z-10 text-center px-8 pb-16 w-full">
        <p className="font-serif text-[9px] uppercase tracking-[0.45em] font-light mb-1.5"
          style={{ color: N.creamDim }}>
          Kepada Yth:
        </p>
        <p className="font-serif uppercase tracking-[0.1em] font-semibold text-lg mb-8"
          style={{ color: N.cream, textShadow: "0 2px 12px rgba(0,0,0,0.60)" }}>
          {guestName || "Tamu Undangan"}
        </p>
        {!opened && (
          <button onClick={onOpen} className={GOLD_BTN} aria-label="Buka undangan">
            ✉️&nbsp;Buka Undangan
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 2 — Quote Card (Sharp navy + double gold border)
════════════════════════════════════════════════════ */
function QuoteSection({ ed }: { ed: EventData }) {
  const pria   = ed?.mempelai_pria?.nama   ?? "";
  const wanita = ed?.mempelai_wanita?.nama ?? "";

  return (
    <section className="relative z-10 flex justify-center px-5 pt-10 pb-10">
      {/* Sharp card — rounded-none + double gold frame */}
      <div
        className="w-full max-w-xs overflow-hidden text-center relative shadow-2xl"
        style={{
          background: "rgba(10,17,40,0.90)",
          border: `2px solid rgba(212,175,55,0.80)`,
          outline: `1px solid rgba(212,175,55,0.30)`,
          outlineOffset: "4px",
          borderRadius: 0,
        }}
      >
        {(ed?.foto_quote || ed?.foto_cover) && (
          <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
            <Image src={ed.foto_quote ?? ed.foto_cover} alt="Foto Mempelai" fill
              className="object-cover object-center" sizes="320px" quality={100} unoptimized />
            <div className="absolute bottom-0 left-0 right-0 h-28"
              style={{ background: `linear-gradient(to top, ${N.navyMid}, transparent)` }} />
          </div>
        )}
        <div className="px-6 pt-4 pb-3">
          <h2 className="font-serif uppercase tracking-[0.2em] font-semibold leading-tight"
            style={{ color: N.cream, fontSize: "1.5rem" }}>
            {pria.split(" ")[0]}
          </h2>
          <p className="font-serif text-base my-1" style={{ color: N.gold }}>&amp;</p>
          <h2 className="font-serif uppercase tracking-[0.2em] font-semibold leading-tight"
            style={{ color: N.cream, fontSize: "1.5rem" }}>
            {wanita.split(" ")[0]}
          </h2>
        </div>
        <GoldRule />
        <div className="px-6 pb-8">
          <p className="font-sans text-xs leading-[1.9] font-light italic"
            style={{ color: N.creamText }}>
            Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan
            pasangan-pasangan untukmu dari (jenis) dirimu sendiri agar kamu merasa
            tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih
            sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat
            tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.
          </p>
          <p className="font-serif text-[10px] uppercase tracking-[0.25em] mt-4 font-semibold"
            style={{ color: N.goldDim }}>
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
        style={{ color: N.creamText }}>
        Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
        Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:
      </p>

      <div className="space-y-14 max-w-[280px] mx-auto">
        {mempelai.map((m) => (
          <div key={m.role} className="text-center">
            {/* Foto — sharp + double gold border */}
            <div className="relative mx-auto overflow-hidden" style={{
              width: "280px", height: "370px",
              borderRadius: 0,
              border: `2px solid rgba(212,175,55,0.75)`,
              outline: `1px solid rgba(212,175,55,0.25)`,
              outlineOffset: "4px",
              background: N.navyMid,
            }}>
              {m.foto ? (
                <Image src={m.foto} alt={m.nama} fill className="object-cover object-top" sizes="280px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: N.navyMid }}>
                  <Heart size={32} style={{ color: N.gold }} strokeWidth={1.5} />
                </div>
              )}
              {/* Navy gradient fade bawah */}
              <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                style={{ background: `linear-gradient(to top, ${N.navy} 0%, transparent 100%)` }} />
              {/* Corner flourish */}
              <span className="absolute bottom-2 left-2 text-lg select-none" style={{ color: N.gold, opacity: 0.55 }}>⬦</span>
              <span className="absolute bottom-2 right-2 text-lg select-none" style={{ color: N.gold, opacity: 0.55 }}>⬦</span>
            </div>

            {/* Name + ortu */}
            <div style={{ maxWidth: "280px", margin: "16px auto 0" }}>
              <GoldRuleFull />
              <p className="font-serif uppercase tracking-[0.2em] font-semibold text-xl mt-3"
                style={{ color: N.cream }}>
                {m.nama}
              </p>
              {m.ortu && (
                <p className="font-sans text-[11px] font-light leading-relaxed mt-2 text-center"
                  style={{ color: N.creamDim }}>
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
      id: "akad", label: "Akad Nikah",
      hari:       formatHari(ed.jadwal_akad?.tanggal ?? ""),
      tanggal:    formatTanggalPanjang(ed.jadwal_akad?.tanggal ?? ""),
      jamMulai:   fj(ed.jadwal_akad?.jam_mulai  ?? ""),
      jamSelesai: fj(ed.jadwal_akad?.jam_selesai ?? ""),
      namaLokasi: ed.akad_lokasi   ?? "",
      alamat:     ed.akad_alamat   ?? ed.lokasi?.alamat   ?? "",
      maps:       ed.akad_maps_url ?? ed.lokasi?.maps_url ?? "",
    },
    {
      id: "resepsi", label: "Resepsi",
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
        <h2 className="font-serif uppercase tracking-[0.2em] font-semibold"
          style={{ color: N.cream, fontSize: "clamp(1.8rem, 6vw, 2.3rem)" }}>
          Save The Date
        </h2>
        <GoldRule />
      </div>

      {/* Countdown — sharp boxes, gold border, gold number */}
      <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto mb-8">
        {([
          { value: countdown.hari,  label: "Hari"  },
          { value: countdown.jam,   label: "Jam"   },
          { value: countdown.menit, label: "Menit" },
          { value: countdown.detik, label: "Detik" },
        ] as { value: number; label: string }[]).map((item) => (
          <div key={item.label} className="text-center py-3"
            style={{
              background: "rgba(10,17,40,0.90)",
              border: `1px solid rgba(212,175,55,0.60)`,
              borderRadius: 0,
            }}>
            <p className="font-serif uppercase tracking-[0.1em] font-semibold text-xl leading-none"
              style={{ color: N.gold }}>
              {String(item.value).padStart(2, "0")}
            </p>
            <p className="font-sans text-[8px] uppercase tracking-wider mt-1.5 font-medium"
              style={{ color: N.creamDim }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Deskripsi */}
      <p className="font-sans text-[11px] italic text-center leading-relaxed max-w-xs mx-auto mb-10"
        style={{ color: N.creamText }}>
        Dengan memohon rahmat dan ridho Allah SWT, kami mengundang
        Bapak/Ibu/Saudara/i, untuk menghadiri acara pernikahan kami:
      </p>

      {/* Event cards — sharp + double gold frame */}
      <div className="space-y-8 max-w-[300px] mx-auto">
        {events.map((ev) => (
          <div key={ev.id}
            className="relative overflow-visible shadow-2xl"
            style={{
              background: "rgba(10,17,40,0.90)",
              border: `2px solid rgba(212,175,55,0.80)`,
              outline: `1px solid rgba(212,175,55,0.30)`,
              outlineOffset: "4px",
              borderRadius: 0,
            }}>
            {/* Top gold accent bar */}
            <div className="h-[3px] w-full" style={{ background: N.goldDim }} />

            <div className="px-6 py-7 text-center">
              <h3 className="font-serif uppercase tracking-[0.2em] font-semibold"
                style={{ color: N.cream, fontSize: "1.8rem" }}>
                {ev.label}
              </h3>
              <GoldRule />

              {ev.hari && (
                <p className="font-sans text-[10px] uppercase tracking-[0.40em] font-semibold mb-0.5"
                  style={{ color: N.goldDim }}>{ev.hari}</p>
              )}
              {ev.tanggal && (
                <p className="font-serif uppercase tracking-[0.1em] font-semibold text-base mb-0.5"
                  style={{ color: N.cream }}>{ev.tanggal}</p>
              )}
              {(ev.jamMulai || ev.jamSelesai) && (
                <p className="font-sans text-sm font-light mb-5"
                  style={{ color: N.creamDim }}>
                  {ev.jamMulai}{ev.jamMulai && ev.jamSelesai && " – "}{ev.jamSelesai}
                </p>
              )}
              {(ev.namaLokasi || ev.alamat) && (
                <div className="mb-5">
                  <div className="flex justify-center mb-2">
                    <MapPin size={14} strokeWidth={1.5} style={{ color: N.gold }} />
                  </div>
                  {ev.namaLokasi && (
                    <p className="font-serif uppercase tracking-[0.15em] font-semibold text-sm"
                      style={{ color: N.cream }}>{ev.namaLokasi}</p>
                  )}
                  {ev.alamat && (
                    <p className="font-sans text-xs font-light leading-relaxed mt-1"
                      style={{ color: N.creamDim }}>{ev.alamat}</p>
                  )}
                </div>
              )}
              {ev.maps && (
                <a href={ev.maps} target="_blank" rel="noopener noreferrer"
                  className={GOLD_BTN}>
                  <MapPin size={11} strokeWidth={2} />
                  Google Map
                </a>
              )}
            </div>

            {/* Bottom gold accent bar */}
            <div className="h-[3px] w-full" style={{ background: N.goldDim }} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 5 — Galeri (16/9, sharp frame navy bg)
════════════════════════════════════════════════════ */
function GaleriSection({ galeri }: { galeri: string[] }) {
  if (!galeri?.length) return null;

  return (
    <section className="px-5 py-14" style={{ background: N.navy }}>
      {/* Header — sharp navy card */}
      <div
        className="text-center mb-8 mx-auto max-w-xs px-6 py-6 relative shadow-2xl"
        style={{
          background: "rgba(10,17,40,0.90)",
          border: `2px solid rgba(212,175,55,0.80)`,
          outline: `1px solid rgba(212,175,55,0.30)`,
          outlineOffset: "4px",
          borderRadius: 0,
        }}
      >
        <EyebrowLabel>Momen Bersama</EyebrowLabel>
        <GoldRule />
        <h2 className="font-serif uppercase tracking-[0.2em] font-semibold text-2xl"
          style={{ color: N.cream }}>Galeri</h2>
      </div>

      {/* Image grid — sharp gold border */}
      <div className="space-y-3 max-w-md mx-auto">
        {galeri.slice(0, 8).map((url, idx) => (
          <div key={idx}
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: "16/9",
              border: `1px solid rgba(212,175,55,0.55)`,
              borderRadius: 0,
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
   Wedding Gift Section — Sharp navy, gold frame
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

  /** ATM card — midnight navy #050B18 + gold text */
  const renderAtmCard = (bank: string, no: string, nama: string) => (
    <div className="p-6 relative overflow-hidden" style={{
      background: N.navyDeep,
      border: `1px solid rgba(212,175,55,0.50)`,
      borderRadius: 0,
      boxShadow: `0 12px 40px rgba(5,11,24,0.55)`,
    }}>
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div className="w-11 h-8 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${N.gold} 0%, #8B7214 50%, ${N.gold} 100%)`, borderRadius: 0 }}>
          <div className="w-7 h-4" style={{ border: "1px solid rgba(255,255,255,0.25)" }} />
        </div>
        <span className="font-serif uppercase tracking-[0.15em] font-semibold text-xl"
          style={{ color: N.cream }}>{bank}</span>
      </div>
      <div className="font-mono text-lg tracking-[0.2em] mb-2 z-10 relative"
        style={{ color: N.cream }}>{no}</div>
      <div className="text-[11px] uppercase tracking-[0.25em] font-medium z-10 relative"
        style={{ color: N.creamDim }}>{nama}</div>
      {no && (
        <button onClick={() => handleCopy(no)}
          className="absolute bottom-4 right-4 text-[11px] px-3 py-1.5 flex items-center gap-1.5 transition-all font-medium z-10"
          style={{ background: N.navy, border: `1px solid rgba(212,175,55,0.50)`, color: N.cream, borderRadius: 0 }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
          </svg>
          Salin
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: N.goldDim }} />
    </div>
  );

  return (
    <div className="w-full px-4 py-12 flex justify-center" style={{ background: N.navy }}>
      {/* Outer card — sharp, double gold border */}
      <div
        className="w-full max-w-md p-8 flex flex-col items-center relative shadow-2xl"
        style={{
          background: "rgba(10,17,40,0.90)",
          border: `2px solid rgba(212,175,55,0.80)`,
          outline: `1px solid rgba(212,175,55,0.30)`,
          outlineOffset: "4px",
          borderRadius: 0,
        }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: N.goldDim }} />

        <div className="text-center mb-7">
          <h2 className="font-serif uppercase tracking-[0.2em] font-semibold"
            style={{ color: N.cream, fontSize: "clamp(1.8rem, 6vw, 2.2rem)" }}>
            Wedding Gift
          </h2>
          <GoldRule />
        </div>
        <p className="font-sans text-sm font-light leading-[2] text-center max-w-xs mx-auto mb-6"
          style={{ color: N.creamText }}>
          Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan hadiah pernikahan dapat melalui
          virtual account atau e-wallet di bawah ini:
        </p>

        {/* Gold ghost toggle button */}
        <button onClick={() => setIsGiftOpen(!isGiftOpen)} className={GOLD_BTN}>
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
                  <div className="p-6 text-center" style={{
                    background: N.navyDeep,
                    border: `1px solid rgba(212,175,55,0.50)`,
                    borderRadius: 0,
                  }}>
                    <div className="flex justify-center mb-3">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"
                        style={{ color: N.gold }}>
                        <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                        <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                      </svg>
                    </div>
                    <h4 className="font-serif uppercase tracking-[0.15em] font-semibold text-lg mb-3"
                      style={{ color: N.cream }}>Kirim Hadiah</h4>
                    {ed?.gift_penerima && (
                      <p className="text-sm mb-1 font-sans" style={{ color: N.creamDim }}>
                        Nama Penerima : <strong style={{ color: N.cream }}>{ed.gift_penerima}</strong>
                      </p>
                    )}
                    {ed?.gift_alamat && (
                      <p className="text-sm leading-relaxed font-sans mt-2"
                        style={{ color: N.creamDim }}>
                        Alamat Kirim : {ed.gift_alamat}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: N.goldDim }} />
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
        background: "linear-gradient(to bottom, rgba(10,17,40,0.70) 0%, rgba(5,11,24,0.85) 50%, rgba(5,11,24,0.95) 100%)",
      }} />
      <div className="relative z-10 px-6 py-20">
        {/* Diamond ornament */}
        <div className="w-10 h-10 rotate-45 flex items-center justify-center mx-auto mb-8"
          style={{ border: `2px solid rgba(212,175,55,0.70)`, background: "rgba(212,175,55,0.08)" }}>
          <div className="-rotate-45">
            <Heart size={14} strokeWidth={1.5} style={{ color: N.gold }} />
          </div>
        </div>

        <EyebrowLabel>Dengan Hormat</EyebrowLabel>
        <GoldRule />

        <h2 className="font-serif uppercase tracking-[0.2em] font-semibold text-3xl mb-8"
          style={{ color: N.cream }}>
          {pria} &amp; {wanita}
        </h2>
        <p className="font-sans text-sm font-light leading-[2] max-w-xs mx-auto mb-4"
          style={{ color: N.creamText }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
          Bapak / Ibu / Saudara/i berkenan hadir dan memberikan doa restu.
          Atas kehadiran dan doa restunya kami ucapkan terima kasih.
        </p>
        <p className="font-serif uppercase tracking-[0.15em] font-semibold text-base mb-1"
          style={{ color: N.cream }}>
          Wassalamualaikum Wr. Wb.
        </p>
        <GoldRuleFull className="max-w-[80px] mx-auto mt-12 mb-8" />
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: N.goldDim }}>
          Original Design By: Atora
        </p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT — Basic2Template
════════════════════════════════════════════════════ */
export default function Basic2Template({
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
        document.getElementById("sec-quote-b2")?.scrollIntoView({ behavior: "smooth" });
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

  /* ── Content stack — NO pembatas gambar, CSS separator saja ── */
  const ContentSections = (
    <>
      <div id="sec-quote-b2">
        <QuoteSection ed={ed} />
      </div>

      {/* ═══════════════════════════════════════════
          UNIFIED SECTION — Navy dark background
          Biodata + Save The Date (no pembatas image)
      ═══════════════════════════════════════════ */}
      <div className="w-full" style={{ background: N.navy }}>

        {/* Top CSS gold rule separator */}
        <div className="flex items-center gap-3 px-8 py-6">
          <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${N.goldDim})` }} />
          <span style={{ color: N.gold, fontSize: "1.1rem" }}>◆</span>
          <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${N.goldDim})` }} />
        </div>

        {/* Biodata */}
        <div className="w-full px-6 py-10">
          <BiodataSection ed={ed} />
        </div>

        {/* Mid CSS gold rule separator */}
        <div className="flex items-center gap-3 px-8 py-6">
          <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${N.goldDim})` }} />
          <span style={{ color: N.gold, fontSize: "1.1rem" }}>◆</span>
          <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${N.goldDim})` }} />
        </div>

        {/* Jadwal */}
        <div className="w-full px-6 py-10">
          <JadwalSection ed={ed} />
        </div>

        {/* Bottom CSS gold rule separator */}
        <div className="flex items-center gap-3 px-8 py-8">
          <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${N.goldDim})` }} />
          <span style={{ color: N.gold, fontSize: "1.1rem" }}>◆</span>
          <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${N.goldDim})` }} />
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
    <div style={{ background: N.navy }}>
      <audio ref={audioRef} src={MUSIC2} loop preload="auto" />

      {/* FAB Music — gold circle */}
      {opened && (
        <button id="fab-music-b2" onClick={toggleMusic}
          aria-label={isPlaying ? "Pause musik" : "Play musik"}
          className="fixed bottom-6 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{ background: N.gold, boxShadow: "0 4px 18px rgba(0,0,0,0.45)" }}>
          {isPlaying
            ? <Music2 size={20} strokeWidth={2} className="text-white" />
            : <VolumeX size={20} strokeWidth={2} className="text-white" />}
        </button>
      )}

      {/* ═══════════ DESKTOP SPLIT-SCREEN ═══════════ */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden">
        <div className="template-left-panel flex-1 relative">
          <CoverWithText ed={ed} />
        </div>

        {/* RIGHT — 414px, batik navy bg + dark overlay */}
        <div ref={rightPanelRef}
          className="template-right-panel w-[414px] shrink-0 scrollbar-hide relative"
          style={{
            backgroundImage: `url('${BG2}')`,
            backgroundAttachment: "scroll",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}>
          {/* Heavy navy overlay — batik subtle di balik navy */}
          <div className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: "rgba(10,17,40,0.72)" }} />
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
            backgroundImage: `url('${BG2}')`,
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "rgba(10,17,40,0.72)" }} />
        <div className="relative z-10">
          <OpeningSection invitation={invitation} guestName={display} onOpen={handleOpen} opened={opened} />
          {opened && ContentSections}
        </div>
      </div>
    </div>
  );
}
