"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { MapPin, Heart, ChevronDown, Send, Users, CheckCircle2, Calendar } from "lucide-react";
import { supabase } from "@/utils/supabase";
import type { EventData } from "@/types/admin";

/* ════════════════════════════════════════════════════
   Color Palette — Royal Maroon & Gold (Premium-1)
════════════════════════════════════════════════════ */
const P = {
  maroon:     "#4A121A",
  maroonDeep: "#320C12",
  maroonMid:  "#6B1E28",
  gold:       "#C5A059",
  goldBright: "#D4AF37",
  cream:      "#FDFBF7",
  creamCard:  "rgba(253,251,247,0.95)",
  textDark:   "#2C1010",
  textMid:    "#5C3333",
  textSub:    "#8C6060",
} as const;

/* ── Assets ── */
const BG_P1    = "/templates/premium/premium-1/background-premium-1.jpg";
const MUSIC_P1 = "/templates/premium/premium-1/premium-1-music.mp3";
const MUSIC_FB = "/templates/basic/basic-1/basic-1-music.mp3";

/* ── Button classes ── */
const MAROON_BTN =
  "inline-flex items-center justify-center gap-2 " +
  "bg-[#4A121A] hover:bg-[#320C12] text-[#F9F6EE] " +
  "border border-[#D4AF37]/60 rounded-full " +
  "px-6 py-2.5 shadow-lg tracking-wider uppercase text-xs " +
  "transition-all duration-200 font-sans font-medium";

const OUTLINE_BTN =
  "inline-flex items-center justify-center gap-2 " +
  "bg-transparent border border-[#4A121A]/40 text-[#4A121A] " +
  "hover:bg-[#4A121A]/8 rounded-full " +
  "px-5 py-2 text-xs tracking-wider uppercase " +
  "transition-all duration-200 font-sans font-medium";

/* ════════════════════════════════════════════════════
   Types
════════════════════════════════════════════════════ */
interface InvitationRow {
  id: string;
  title: string;
  slug: string;
  template: string;
  whatsapp_number?: string | null;
  event_data: EventData;
}
interface GuestRow { id: string; name: string; status: string; }
interface Greeting {
  id: string;
  invitation_id: string;
  guest_name: string;
  attendance: "hadir" | "tidak_hadir" | "mungkin";
  party_count: number;
  message: string;
  created_at: string;
}

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
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(d).toUpperCase();
    return `${day} ${month} ${d.getFullYear()}`;
  } catch { return iso; }
}
function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Baru saja";
    if (mins < 60) return `${mins} mnt lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
  } catch { return ""; }
}
function buildGCalUrl(ed: EventData, pria: string, wanita: string): string {
  const title    = encodeURIComponent(`Wedding of ${pria} & ${wanita}`);
  const details  = encodeURIComponent(`Pernikahan ${pria} & ${wanita}`);
  const location = encodeURIComponent(ed.akad_alamat ?? ed.lokasi?.alamat ?? "");
  const iso      = ed.jadwal_akad?.tanggal ?? "";
  const start    = iso ? iso.replace(/-/g, "") + "T000000Z" : "";
  const end      = iso ? iso.replace(/-/g, "") + "T235959Z" : "";
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}
function downloadICS(ed: EventData, pria: string, wanita: string) {
  const title = `Wedding of ${pria} & ${wanita}`;
  const iso   = ed.jadwal_akad?.tanggal ?? "";
  const start = iso ? iso.replace(/-/g, "") + "T000000Z" : "";
  const end   = iso ? iso.replace(/-/g, "") + "T235959Z" : "";
  const ics   = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Atora Digital//EN",
    "BEGIN:VEVENT",
    `UID:wedding-${Date.now()}@atora`,
    `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:Pernikahan ${pria} & ${wanita}`,
    `LOCATION:${ed.akad_alamat ?? ed.lokasi?.alamat ?? ""}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "wedding.ics"; a.click();
  URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════════════════
   Shared UI Atoms
════════════════════════════════════════════════════ */
function GoldLine({ className = "" }: { className?: string }) {
  return (
    <div className={`h-px ${className}`}
      style={{ background: `linear-gradient(to right, transparent, ${P.goldBright}, transparent)` }} />
  );
}
function GoldLineShort({ className = "" }: { className?: string }) {
  return (
    <div className={`h-px w-20 mx-auto ${className}`}
      style={{ background: `linear-gradient(to right, transparent, ${P.goldBright}, transparent)` }} />
  );
}
function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[9px] uppercase tracking-[0.50em] font-semibold" style={{ color: P.gold }}>
      {children}
    </p>
  );
}

/* ── Scroll Reveal (dua arah, scale bounce) ── */
const revealVariants: Variants = {
  hidden:  { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.50, ease: "easeOut" } },
};
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   LEFT PANEL — sticky cover foto + teks overlay
════════════════════════════════════════════════════ */
function CoverPanel({ ed }: { ed: EventData }) {
  const pria    = ed?.mempelai_pria?.nama?.split(" ")[0]   ?? "—";
  const wanita  = ed?.mempelai_wanita?.nama?.split(" ")[0] ?? "—";
  const tanggal = formatTanggal(ed?.jadwal_akad?.tanggal ?? "").toUpperCase();

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {ed?.foto_cover ? (
        <Image src={ed.foto_cover} alt="Foto Cover" fill
          className="object-cover object-center" sizes="65vw" priority quality={100} unoptimized />
      ) : (
        <div className="absolute inset-0" style={{ background: P.maroon }} />
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(74,18,26,0) 30%, rgba(74,18,26,0.40) 60%, rgba(50,12,18,0.88) 90%, rgba(30,8,12,0.96) 100%)",
      }} />
      <div className="absolute bottom-0 left-0 right-0 px-12 pb-14 text-center">
        <EyebrowLabel>The Wedding of</EyebrowLabel>
        <GoldLineShort className="my-3" />
        <h1 className="font-serif font-bold leading-tight"
          style={{ color: P.cream, fontSize: "clamp(2.2rem, 3.5vw, 3.4rem)", textShadow: "0 2px 20px rgba(0,0,0,0.60)" }}>
          {pria}
        </h1>
        <p className="font-serif text-xl my-1" style={{ color: P.gold }}>&amp;</p>
        <h1 className="font-serif font-bold leading-tight"
          style={{ color: P.cream, fontSize: "clamp(2.2rem, 3.5vw, 3.4rem)", textShadow: "0 2px 20px rgba(0,0,0,0.60)" }}>
          {wanita}
        </h1>
        {tanggal && (
          <>
            <GoldLineShort className="my-3" />
            <p className="font-sans text-[9px] tracking-[0.45em] font-medium" style={{ color: P.gold }}>
              {tanggal}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   OPENING GATE — hero layar penutup (right/mobile)
════════════════════════════════════════════════════ */
function OpeningGate({
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
      {ed?.foto_cover && (
        <div className="absolute inset-0">
          <Image src={ed.foto_cover} alt="BG" fill className="object-cover object-center"
            sizes="35vw" priority quality={100} unoptimized />
          <div className="absolute inset-0" style={{ background: "rgba(74,18,26,0.72)" }} />
        </div>
      )}
      {!ed?.foto_cover && <div className="absolute inset-0" style={{ background: P.maroon }} />}

      <div className="relative z-10 text-center px-8 pt-14">
        <EyebrowLabel>The Wedding of</EyebrowLabel>
        <GoldLineShort className="my-4" />
        <h1 className="font-serif font-bold leading-none"
          style={{ color: P.cream, fontSize: "clamp(1.9rem, 3.2vw, 2.9rem)", textShadow: "0 2px 20px rgba(0,0,0,0.65)" }}>
          {pria}
        </h1>
        <p className="font-serif text-base my-2" style={{ color: P.gold }}>&amp;</p>
        <h1 className="font-serif font-bold leading-none"
          style={{ color: P.cream, fontSize: "clamp(1.9rem, 3.2vw, 2.9rem)", textShadow: "0 2px 20px rgba(0,0,0,0.65)" }}>
          {wanita}
        </h1>
        <GoldLineShort className="mt-4" />
      </div>

      <div className="relative z-10 text-center px-8 pb-16 w-full">
        <p className="font-sans text-[9px] uppercase tracking-[0.45em] font-light mb-1.5"
          style={{ color: "rgba(255,255,255,0.60)" }}>
          Kepada Yth:
        </p>
        <p className="font-serif text-xl font-semibold mb-8"
          style={{ color: P.cream, textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}>
          {guestName || "Tamu Undangan"}
        </p>
        {!opened && (
          <button onClick={onOpen} className={MAROON_BTN} aria-label="Buka undangan">
            ✉️ Buka Undangan
          </button>
        )}
      </div>

      {opened && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-40 animate-bounce">
          <ChevronDown size={18} style={{ color: P.gold }} />
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   VINYL WIDGET — floating + breathing + spinning
════════════════════════════════════════════════════ */
function VinylWidget({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      aria-label={isPlaying ? "Pause musik" : "Play musik"}
      className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full select-none"
      style={{ filter: "drop-shadow(0 4px 20px rgba(74,18,26,0.60))" }}
      animate={{ y: [0, -8, 0], rotate: [0, 1.5, -1.5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <motion.div
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "#1A0A0E" }}
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying
          ? { repeat: Infinity, duration: 3, ease: "linear" }
          : { duration: 0.3 }
        }
      >
        {[1, 2.5, 4].map((i) => (
          <div key={i} className="absolute rounded-full"
            style={{ inset: `${i * 4}px`, border: `1px solid rgba(197,160,89,${0.28 - i * 0.06})` }} />
        ))}
        <div className="w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: `radial-gradient(circle, ${P.gold} 0%, ${P.maroon} 70%)` }}>
          <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
        </div>
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-3 rounded-full opacity-35"
          style={{ background: P.gold }} />
      </motion.div>
      {!isPlaying && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30">
          <div className="flex gap-0.5">
            <div className="w-1 h-4 rounded-full bg-white/80" />
            <div className="w-1 h-4 rounded-full bg-white/80" />
          </div>
        </div>
      )}
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Quote / Ayat
════════════════════════════════════════════════════ */
function QuoteSection({ ed }: { ed: EventData }) {
  const pria   = ed?.mempelai_pria?.nama?.split(" ")[0]   ?? "";
  const wanita = ed?.mempelai_wanita?.nama?.split(" ")[0] ?? "";

  return (
    <Reveal className="flex justify-center px-5 pt-10 pb-8">
      <div className="w-full max-w-xs rounded-2xl overflow-hidden text-center backdrop-blur-md"
        style={{
          background: P.creamCard,
          border: `1px solid rgba(212,175,55,0.50)`,
          boxShadow: "0 20px 60px rgba(74,18,26,0.14)",
        }}>
        {(ed?.foto_quote || ed?.foto_cover) && (
          <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
            <Image src={ed.foto_quote ?? ed.foto_cover} alt="Foto Mempelai" fill
              className="object-cover object-center" sizes="320px" quality={100} unoptimized />
            <div className="absolute bottom-0 left-0 right-0 h-28"
              style={{ background: `linear-gradient(to top, ${P.cream}, transparent)` }} />
          </div>
        )}
        <div className="px-6 pt-4 pb-3">
          <h2 className="font-serif font-bold leading-tight" style={{ color: P.maroon, fontSize: "1.55rem" }}>{pria}</h2>
          <p className="font-sans text-base my-1" style={{ color: P.gold }}>&amp;</p>
          <h2 className="font-serif font-bold leading-tight" style={{ color: P.maroon, fontSize: "1.55rem" }}>{wanita}</h2>
        </div>
        <GoldLineShort className="mb-5" />
        <div className="px-6 pb-8">
          <p className="font-sans text-xs leading-[2] font-light italic" style={{ color: P.textMid }}>
            Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu
            dari (jenis) dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu
            rasa cinta dan kasih sayang.
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] mt-4 font-semibold" style={{ color: P.gold }}>
            -QS. Ar-Rum : 21-
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Biodata Mempelai
════════════════════════════════════════════════════ */
function BiodataSection({ ed }: { ed: EventData }) {
  const mempelai = [
    { role: "Pria",   nama: ed.mempelai_pria?.nama   ?? "—", foto: ed.mempelai_pria?.foto_url,  ortu: ed.mempelai_pria?.ortu   ?? "" },
    { role: "Wanita", nama: ed.mempelai_wanita?.nama ?? "—", foto: ed.mempelai_wanita?.foto_url, ortu: ed.mempelai_wanita?.ortu ?? "" },
  ];
  return (
    <section className="px-6 py-12">
      <Reveal>
        <p className="font-sans text-[11px] italic text-center leading-relaxed max-w-xs mx-auto mb-10"
          style={{ color: P.textMid }}>
          Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
          Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:
        </p>
      </Reveal>
      <div className="space-y-14 max-w-[280px] mx-auto">
        {mempelai.map((m, i) => (
          <Reveal key={m.role} delay={i * 0.12}>
            <div className="text-center">
              <motion.div
                className="relative mx-auto overflow-hidden"
                style={{
                  width: 280, height: 370,
                  borderRadius: "120px 120px 0 0",
                  border: `2px solid rgba(212,175,55,0.55)`,
                  background: `${P.maroon}10`,
                  boxShadow: "0 8px 32px rgba(74,18,26,0.18)",
                }}
                animate={{ y: [0, -6, 0], rotate: [0, 0.6, -0.6, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: i * 0.8 }}
              >
                {m.foto ? (
                  <Image src={m.foto} alt={m.nama} fill className="object-cover object-top" sizes="280px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart size={32} style={{ color: P.gold }} strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                  style={{ background: `linear-gradient(to top, ${P.cream} 0%, transparent 100%)` }} />
                <span className="absolute bottom-2 left-3 text-xl select-none" style={{ color: P.gold, opacity: 0.60 }}>✦</span>
                <span className="absolute bottom-2 right-3 text-xl select-none" style={{ color: P.gold, opacity: 0.60 }}>✦</span>
              </motion.div>
              <div className="rounded-b-2xl px-5 pt-4 pb-5 backdrop-blur-md"
                style={{
                  maxWidth: 280, margin: "0 auto",
                  background: P.creamCard,
                  border: `1px solid rgba(212,175,55,0.40)`,
                  borderTop: "none",
                  boxShadow: "0 8px 20px rgba(74,18,26,0.10)",
                }}>
                <GoldLine />
                <p className="font-serif font-bold text-xl uppercase tracking-wider mt-3" style={{ color: P.maroon }}>{m.nama}</p>
                {m.ortu && (
                  <p className="font-sans text-[11px] font-medium leading-relaxed mt-1.5 text-center" style={{ color: P.textDark }}>
                    {m.ortu}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Save The Date + Countdown + Calendar
════════════════════════════════════════════════════ */
function SaveTheDateSection({ ed, pria, wanita }: { ed: EventData; pria: string; wanita: string }) {
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

  const gCalUrl = buildGCalUrl(ed, pria, wanita);

  return (
    <section className="px-6 py-12" style={{ background: `${P.maroon}08` }}>
      <Reveal>
        <div className="text-center mx-auto max-w-[300px] mb-7 rounded-2xl px-6 pt-6 pb-5 backdrop-blur-md"
          style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.40)`, boxShadow: "0 8px 28px rgba(74,18,26,0.10)" }}>
          <h2 className="font-serif font-bold" style={{ color: P.maroon, fontSize: "clamp(2rem, 7vw, 2.5rem)" }}>
            Save The Date
          </h2>
          <GoldLineShort className="mt-3" />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid grid-cols-4 gap-2.5 max-w-[288px] mx-auto mb-8">
          {([
            { value: countdown.hari,  label: "Hari"  },
            { value: countdown.jam,   label: "Jam"   },
            { value: countdown.menit, label: "Menit" },
            { value: countdown.detik, label: "Detik" },
          ] as { value: number; label: string }[]).map((item) => (
            <div key={item.label} className="text-center py-3 rounded-xl backdrop-blur-md"
              style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.40)`, boxShadow: "0 4px 16px rgba(74,18,26,0.08)" }}>
              <p className="font-serif text-xl font-bold leading-none" style={{ color: P.maroon }}>
                {String(item.value).padStart(2, "0")}
              </p>
              <p className="font-sans text-[8px] uppercase tracking-wider mt-1.5 font-semibold" style={{ color: P.textSub }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="flex flex-col gap-2.5 items-center max-w-[270px] mx-auto">
          <a href={gCalUrl} target="_blank" rel="noopener noreferrer"
            className={MAROON_BTN + " w-full justify-center text-[10px]"}>
            <Calendar size={12} strokeWidth={2} /> Simpan ke Google Calendar
          </a>
          <button onClick={() => downloadICS(ed, pria, wanita)}
            className={OUTLINE_BTN + " w-full justify-center text-[10px]"}>
            <Calendar size={12} strokeWidth={1.5} /> Download .ics (Apple / iCal)
          </button>
        </div>
      </Reveal>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Jadwal Akad & Resepsi
════════════════════════════════════════════════════ */
function JadwalSection({ ed }: { ed: EventData }) {
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
    <section className="px-6 py-12">
      <Reveal>
        <div className="text-center mx-auto max-w-[300px] mb-8 rounded-2xl px-6 pt-6 pb-5 backdrop-blur-md"
          style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.40)`, boxShadow: "0 8px 28px rgba(74,18,26,0.10)" }}>
          <EyebrowLabel>Acara Pernikahan</EyebrowLabel>
          <h2 className="font-serif font-bold mt-2" style={{ color: P.maroon, fontSize: "clamp(1.9rem, 7vw, 2.4rem)" }}>
            Waktu &amp; Tempat
          </h2>
          <GoldLineShort className="mt-3" />
          <p className="font-sans text-[11px] italic leading-relaxed max-w-xs mx-auto mt-5" style={{ color: P.textDark }}>
            Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di:
          </p>
        </div>
      </Reveal>

      <div className="space-y-6 max-w-[300px] mx-auto">
        {events.map((ev, i) => (
          <Reveal key={ev.id} delay={i * 0.12}>
            <div className="rounded-2xl overflow-hidden backdrop-blur-md"
              style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.50)`, boxShadow: "0 8px 32px rgba(74,18,26,0.10)" }}>
              <div className="h-[2px]" style={{ background: `linear-gradient(to right, ${P.gold}, ${P.goldBright}, ${P.gold})` }} />
              <div className="px-6 py-7 text-center">
                <h3 className="font-serif font-bold mb-1" style={{ color: P.maroon, fontSize: "1.9rem" }}>{ev.label}</h3>
                <GoldLineShort className="mb-5" />
                {ev.hari && <p className="font-sans text-[10px] uppercase tracking-[0.40em] font-semibold mb-0.5" style={{ color: P.gold }}>{ev.hari}</p>}
                {ev.tanggal && <p className="font-serif text-base font-bold mb-0.5" style={{ color: P.maroon }}>{ev.tanggal}</p>}
                {(ev.jamMulai || ev.jamSelesai) && (
                  <p className="font-sans text-sm font-light mb-5" style={{ color: P.textDark }}>
                    {ev.jamMulai}{ev.jamMulai && ev.jamSelesai && " – "}{ev.jamSelesai}
                  </p>
                )}
                {(ev.namaLokasi || ev.alamat) && (
                  <div className="mb-5">
                    <div className="flex justify-center mb-2"><MapPin size={14} strokeWidth={1.5} style={{ color: P.gold }} /></div>
                    {ev.namaLokasi && <p className="font-sans text-sm font-bold uppercase tracking-wide" style={{ color: P.maroon }}>{ev.namaLokasi}</p>}
                    {ev.alamat && <p className="font-sans text-xs font-light leading-relaxed mt-1" style={{ color: P.textDark }}>{ev.alamat}</p>}
                  </div>
                )}
                {ev.maps && (
                  <a href={ev.maps} target="_blank" rel="noopener noreferrer" className={MAROON_BTN}>
                    <MapPin size={11} strokeWidth={2} /> Google Map
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Galeri
════════════════════════════════════════════════════ */
function GaleriSection({ galeri }: { galeri: string[] }) {
  if (!galeri?.length) return null;
  return (
    <section className="px-5 py-14" style={{ background: `${P.maroon}06` }}>
      <Reveal>
        <div className="text-center mb-8 mx-auto max-w-xs px-6 py-5 rounded-2xl backdrop-blur-md"
          style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.50)`, boxShadow: "0 4px 24px rgba(74,18,26,0.08)" }}>
          <EyebrowLabel>Momen Bersama</EyebrowLabel>
          <GoldLineShort className="my-3" />
          <h2 className="font-serif text-2xl font-bold" style={{ color: P.maroon }}>Galeri</h2>
        </div>
      </Reveal>
      <div className="space-y-3 max-w-md mx-auto">
        {galeri.slice(0, 8).map((url, idx) => (
          <Reveal key={idx} delay={(idx % 3) * 0.07}>
            <div className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: "16/9", border: `1px solid rgba(212,175,55,0.40)` }}>
              <Image src={url} alt={`Galeri ${idx + 1}`} fill className="object-cover"
                sizes="(max-width: 768px) 100vw, 414px" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — RSVP + WhatsApp + Realtime Greeting Feed
════════════════════════════════════════════════════ */
function RSVPSection({ invitation }: { invitation: InvitationRow }) {
  const [name,        setName]        = useState("");
  const [attendance,  setAttendance]  = useState<"hadir" | "tidak_hadir" | "mungkin">("hadir");
  const [partyCount,  setPartyCount]  = useState(1);
  const [message,     setMessage]     = useState("");
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [greetings,   setGreetings]   = useState<Greeting[]>([]);
  const [loadingG,    setLoadingG]    = useState(true);

  /* ── 1. Initial fetch ── */
  const fetchGreetings = useCallback(async () => {
    const { data } = await supabase
      .from("greetings")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setGreetings(data as Greeting[]);
    setLoadingG(false);
  }, [invitation.id]);

  /* ── 2. Realtime subscription ── */
  useEffect(() => {
    fetchGreetings();
    
    // Gunakan nama channel yang unik dan konsisten per invitation
    const channelName = `greetings-room-${invitation.id}`;
    
    // Pastikan jika channel dengan nama yang sama sudah ada, dibersihkan dulu
    const existingChannel = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase.channel(channelName);

    // 1. DAFTARKAN .on() TERLEBIH DAHULU SEBELUM .subscribe()
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "greetings", filter: `invitation_id=eq.${invitation.id}` },
      (payload) => {
        const newG = payload.new as Greeting;
        setGreetings((prev) => (prev.some((g) => g.id === newG.id) ? prev : [newG, ...prev]));
      }
    );

    // 2. BARU PANGGIL .subscribe()
    channel.subscribe();

    // 3. CLEANUP FUNCTION YANG AMAN
    return () => {
      supabase.removeChannel(channel);
    };
  }, [invitation.id, fetchGreetings]);

  /* ── 3. Dual-action submit: INSERT to Supabase → then open WhatsApp ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);

    /* Step A — Insert ke Supabase greetings */
    const { data: inserted } = await supabase
      .from("greetings")
      .insert({
        invitation_id: invitation.id,
        guest_name:    name.trim(),
        attendance,
        party_count:   partyCount,
        message:       message.trim(),
      })
      .select()
      .single();

    /* Step B — Update local state langsung (instant feed) */
    if (inserted) {
      setGreetings((prev) => {
        if (prev.some((g) => g.id === (inserted as Greeting).id)) return prev;
        return [inserted as Greeting, ...prev];
      });
    }

    /* Step C — Buka WhatsApp pengantin */
    const waNumber = invitation.whatsapp_number?.replace(/\D/g, "");
    if (waNumber) {
      const attLabel = attendance === "hadir" ? "✅ Hadir" : attendance === "tidak_hadir" ? "❌ Tidak Hadir" : "🤔 Mungkin Hadir";
      const waText = encodeURIComponent(
        `Halo, saya ${name.trim()} ingin mengonfirmasi kehadiran:\n\n` +
        `📋 Status: ${attLabel}\n` +
        `👥 Jumlah Tamu: ${partyCount} orang\n\n` +
        `💌 Ucapan:\n"${message.trim()}"\n\n` +
        `— Dikirim via undangan digital Atora`
      );
      window.open(`https://wa.me/${waNumber}?text=${waText}`, "_blank");
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const attendanceOptions = [
    { value: "hadir",       label: "✅ Hadir"  },
    { value: "mungkin",     label: "🤔 Mungkin" },
    { value: "tidak_hadir", label: "❌ Tidak"   },
  ] as const;

  return (
    <section className="px-5 py-14" style={{ background: `${P.maroon}05` }}>
      {/* Header */}
      <Reveal>
        <div className="text-center mx-auto max-w-[300px] mb-8 rounded-2xl px-6 pt-6 pb-5 backdrop-blur-md"
          style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.40)`, boxShadow: "0 8px 28px rgba(74,18,26,0.10)" }}>
          <EyebrowLabel>Konfirmasi Kehadiran</EyebrowLabel>
          <h2 className="font-serif font-bold mt-2" style={{ color: P.maroon, fontSize: "clamp(1.9rem, 7vw, 2.4rem)" }}>
            RSVP
          </h2>
          <GoldLineShort className="mt-3" />
        </div>
      </Reveal>

      {/* Form Card */}
      <Reveal delay={0.1}>
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden backdrop-blur-md mb-8"
          style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.50)`, boxShadow: "0 12px 40px rgba(74,18,26,0.12)" }}>
          <div className="h-[2px]" style={{ background: `linear-gradient(to right, ${P.gold}, ${P.goldBright}, ${P.gold})` }} />

          {submitted ? (
            <div className="px-8 py-12 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: P.gold }} strokeWidth={1.5} />
              <p className="font-serif text-xl font-bold mb-2" style={{ color: P.maroon }}>Terima Kasih!</p>
              <p className="font-sans text-sm font-light" style={{ color: P.textMid }}>
                RSVP telah kami terima &amp; pesan sedang dikirim ke pengantin. 💌
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-7 py-8 space-y-5">
              {/* Nama */}
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-1.5" style={{ color: P.maroon }}>
                  Nama Lengkap *
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda" required
                  className="w-full px-4 py-3 rounded-xl text-sm font-sans focus:outline-none"
                  style={{ background: "#F9F6EE", border: `1px solid rgba(212,175,55,0.40)`, color: P.textDark }} />
              </div>

              {/* Kehadiran */}
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-2" style={{ color: P.maroon }}>
                  Konfirmasi Kehadiran
                </label>
                <div className="flex gap-2">
                  {attendanceOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setAttendance(opt.value)}
                      className="flex-1 py-2 rounded-full text-[11px] font-medium transition-all font-sans"
                      style={{
                        background: attendance === opt.value ? P.maroon : "transparent",
                        color:      attendance === opt.value ? P.cream  : P.maroon,
                        border:     `1px solid ${attendance === opt.value ? P.maroon : "rgba(212,175,55,0.45)"}`,
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jumlah tamu */}
              {attendance === "hadir" && (
                <div>
                  <label className="block font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-1.5" style={{ color: P.maroon }}>
                    Jumlah Tamu
                  </label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setPartyCount((p) => Math.max(1, p - 1))}
                      className="w-9 h-9 rounded-full text-lg font-bold flex items-center justify-center"
                      style={{ border: `1px solid rgba(212,175,55,0.50)`, color: P.maroon }}>−</button>
                    <span className="font-serif text-xl font-bold w-8 text-center" style={{ color: P.maroon }}>{partyCount}</span>
                    <button type="button" onClick={() => setPartyCount((p) => Math.min(10, p + 1))}
                      className="w-9 h-9 rounded-full text-lg font-bold flex items-center justify-center"
                      style={{ border: `1px solid rgba(212,175,55,0.50)`, color: P.maroon }}>+</button>
                    <span className="font-sans text-xs" style={{ color: P.textDark }}>orang</span>
                  </div>
                </div>
              )}

              {/* Ucapan */}
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-1.5" style={{ color: P.maroon }}>
                  Ucapan &amp; Doa Restu *
                </label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan doa terbaik Anda untuk pasangan pengantin..." required rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm font-sans focus:outline-none resize-none leading-relaxed"
                  style={{ background: "#F9F6EE", border: `1px solid rgba(212,175,55,0.40)`, color: P.textDark }} />
              </div>

              {/* Submit */}
              <button type="submit" disabled={submitting}
                className={MAROON_BTN + " w-full justify-center"} style={{ opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Mengirim..." : <><Send size={13} strokeWidth={2} /> Kirim RSVP via WhatsApp</>}
              </button>
            </form>
          )}
        </div>
      </Reveal>

      {/* ── Greeting Feed (Live) ── */}
      <Reveal delay={0.2}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <Users size={14} strokeWidth={1.5} style={{ color: P.gold }} />
            <p className="font-sans text-[10px] uppercase tracking-[0.35em] font-semibold" style={{ color: P.maroon }}>
              Ucapan &amp; Doa ({greetings.length})
            </p>
          </div>

          {loadingG ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                style={{ borderColor: P.gold, borderTopColor: "transparent" }} />
            </div>
          ) : greetings.length === 0 ? (
            <p className="text-center font-sans text-sm font-light py-6" style={{ color: P.textSub }}>
              Jadilah yang pertama mengirimkan doa. 🌹
            </p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-hide">
              {greetings.map((g) => (
                <div key={g.id} className="rounded-2xl px-5 py-4 backdrop-blur-sm"
                  style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.35)`, boxShadow: "0 2px 12px rgba(74,18,26,0.06)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {/* Avatar inisial */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: g.attendance === "hadir" ? "rgba(34,139,34,0.12)" : g.attendance === "tidak_hadir" ? "rgba(220,50,50,0.10)" : "rgba(180,160,60,0.12)",
                          color: g.attendance === "hadir" ? "#1D6B1D" : g.attendance === "tidak_hadir" ? "#B03030" : "#8B7B2A",
                        }}>
                        {g.guest_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-sans text-xs font-semibold" style={{ color: P.maroon }}>{g.guest_name}</p>
                        <p className="font-sans text-[10px] font-medium" style={{
                          color: g.attendance === "hadir" ? "#1D6B1D" : g.attendance === "tidak_hadir" ? "#B03030" : "#8B7B2A",
                        }}>
                          {g.attendance === "hadir" ? "✅ Hadir" : g.attendance === "tidak_hadir" ? "❌ Tidak Hadir" : "🤔 Mungkin"}
                          {g.attendance === "hadir" && g.party_count > 1 && ` · ${g.party_count} orang`}
                        </p>
                      </div>
                    </div>
                    <span className="font-sans text-[9px] shrink-0 mt-0.5" style={{ color: P.textSub }}>{timeAgo(g.created_at)}</span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed italic" style={{ color: P.maroon }}>
                    &ldquo;{g.message}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Wedding Gift
════════════════════════════════════════════════════ */
function WeddingGiftSection({ ed, handleCopy }: { ed: EventData; handleCopy: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const hasRek1 = ed?.rek_1_bank || ed?.rek_1_no;
  const hasRek2 = ed?.rek_2_bank || ed?.rek_2_no;
  const hasGift = ed?.gift_penerima || ed?.gift_alamat;
  if (!hasRek1 && !hasRek2 && !hasGift) return null;

  const renderAtm = (bank: string, no: string, nama: string) => (
    <div className="p-6 relative overflow-hidden rounded-2xl" style={{
      background: `linear-gradient(145deg, ${P.maroon} 0%, ${P.maroonDeep} 60%, ${P.maroon} 100%)`,
      border: `1px solid rgba(212,175,55,0.50)`,
      boxShadow: "0 12px 36px rgba(74,18,26,0.30)",
    }}>
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div className="w-11 h-8 rounded-md" style={{ background: `linear-gradient(135deg, ${P.gold} 0%, #8B7214 50%, ${P.gold} 100%)` }} />
        <span className="font-serif font-bold text-2xl" style={{ color: P.gold }}>{bank}</span>
      </div>
      <div className="font-mono text-lg tracking-[0.2em] mb-2 z-10 relative" style={{ color: P.cream }}>{no}</div>
      <div className="text-[11px] uppercase tracking-[0.25em] font-medium z-10 relative" style={{ color: "rgba(253,251,247,0.65)" }}>{nama}</div>
      {no && (
        <button onClick={() => handleCopy(no)}
          className="absolute bottom-4 right-4 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 z-10"
          style={{ background: P.maroonDeep, border: `1px solid rgba(212,175,55,0.50)`, color: P.cream }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
          </svg>
          Salin
        </button>
      )}
    </div>
  );

  return (
    <section className="px-4 py-12" style={{ background: `${P.maroon}05` }}>
      <Reveal className="max-w-md mx-auto">
        <div className="rounded-2xl p-8 flex flex-col items-center backdrop-blur-md"
          style={{ background: P.creamCard, border: `1px solid rgba(212,175,55,0.50)`, boxShadow: "0 12px 40px rgba(74,18,26,0.12)" }}>
          <div className="text-center mb-6">
            <h2 className="font-serif font-bold" style={{ color: P.maroon, fontSize: "clamp(1.9rem, 7vw, 2.4rem)" }}>
              Wedding Gift
            </h2>
            <GoldLineShort className="mt-3" />
          </div>
          <p className="font-sans text-sm font-light leading-[2] text-center max-w-xs mx-auto mb-6" style={{ color: P.textMid }}>
            Doa restu Anda adalah karunia terbesar. Namun jika ingin memberikan hadiah, dapat melalui:
          </p>
          <button onClick={() => setOpen(!open)} className={MAROON_BTN}>
            {open ? "TUTUP" : "KLIK DISINI"}
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div key="gift" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden w-full">
                <div className="mt-8 flex flex-col gap-4 w-full">
                  {hasRek1 && renderAtm(ed.rek_1_bank ?? "", ed.rek_1_no ?? "", ed.rek_1_nama ?? "")}
                  {hasRek2 && renderAtm(ed.rek_2_bank ?? "", ed.rek_2_no ?? "", ed.rek_2_nama ?? "")}
                  {hasGift && (
                    <div className="p-6 text-center rounded-2xl" style={{ background: `${P.maroon}10`, border: `1px solid rgba(212,175,55,0.35)` }}>
                      <Heart size={24} className="mx-auto mb-3" style={{ color: P.gold }} strokeWidth={1.5} />
                      <h4 className="font-serif font-bold text-lg mb-3" style={{ color: P.maroon }}>Kirim Hadiah</h4>
                      {ed?.gift_penerima && <p className="text-sm font-sans mb-1" style={{ color: P.textMid }}>Penerima: <strong style={{ color: P.maroon }}>{ed.gift_penerima}</strong></p>}
                      {ed?.gift_alamat && <p className="text-sm leading-relaxed font-sans mt-2" style={{ color: P.textMid }}>{ed.gift_alamat}</p>}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Penutup
════════════════════════════════════════════════════ */
function PenutupSection({ pria, wanita, ed }: { pria: string; wanita: string; ed: EventData }) {
  return (
    <section className="relative overflow-hidden text-center min-h-screen flex flex-col justify-center">
      {ed?.foto_cover && (
        <div className="absolute inset-0">
          <Image src={ed.foto_cover} alt="Background Penutup" fill className="object-cover object-center" sizes="100vw" />
        </div>
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(74,18,26,0.65) 0%, rgba(50,12,18,0.82) 50%, rgba(30,8,12,0.96) 100%)",
      }} />
      <div className="relative z-10 px-6 py-20">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(197,160,89,0.15)", border: `1px solid ${P.gold}` }}>
          <Heart size={20} strokeWidth={1.5} style={{ color: P.gold }} />
        </div>
        <EyebrowLabel>Dengan Hormat</EyebrowLabel>
        <GoldLineShort className="my-4" />
        <h2 className="font-serif text-3xl font-bold mb-8" style={{ color: P.cream }}>{pria} &amp; {wanita}</h2>
        <p className="font-sans text-sm font-light leading-[2] max-w-xs mx-auto mb-4" style={{ color: "rgba(255,255,255,0.80)" }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak / Ibu / Saudara/i
          berkenan hadir dan memberikan doa restu.
        </p>
        <p className="font-serif text-base font-semibold" style={{ color: P.cream }}>Wassalamualaikum Wr. Wb.</p>
        <GoldLine className="max-w-[80px] mx-auto mt-12 mb-8" />
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: P.gold }}>Original Design By: Atora</p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT — Premium1Template (Split-Screen)
════════════════════════════════════════════════════ */
export default function Premium1Template({
  invitation, guest, guestName,
}: {
  invitation: InvitationRow;
  guest: GuestRow | null;
  guestName: string;
}) {
  const [opened,    setOpened]    = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const audioRef      = useRef<HTMLAudioElement>(null);

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); alert("Nomor disalin!"); };

  const handleOpen = () => {
    setOpened(true);
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    setTimeout(() => {
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById("sec-p1-quote")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 80);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  const ed     = invitation.event_data;
  const pria   = ed?.mempelai_pria?.nama?.split(" ")[0]   ?? "—";
  const wanita = ed?.mempelai_wanita?.nama?.split(" ")[0] ?? "—";
  const display = guest?.name ?? guestName;

  const ContentSections = (
    <>
      <div id="sec-p1-quote">
        <QuoteSection ed={ed} />
      </div>
      <BiodataSection ed={ed} />
      <SaveTheDateSection ed={ed} pria={pria} wanita={wanita} />
      <JadwalSection ed={ed} />
      <GaleriSection galeri={ed?.galeri ?? []} />
      <RSVPSection invitation={invitation} />
      <WeddingGiftSection ed={ed} handleCopy={handleCopy} />
      <PenutupSection pria={pria} wanita={wanita} ed={ed} />
    </>
  );

  return (
    <div style={{ background: P.cream }}>
      {/* Audio — premium music, fallback ke basic */}
      <audio ref={audioRef} loop preload="auto">
        <source src={MUSIC_P1} type="audio/mpeg" />
        <source src={MUSIC_FB}  type="audio/mpeg" />
      </audio>

      {/* Floating Vinyl Widget */}
      {opened && <VinylWidget isPlaying={isPlaying} onToggle={toggleMusic} />}

      {/* ══════════════════════════════════════════
          DESKTOP — Split-Screen (lg+)
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden">
        {/* LEFT — Sticky Cover Foto */}
        <div className="template-left-panel flex-1 relative">
          <CoverPanel ed={ed} />
        </div>

        {/* RIGHT — 414px, mandala bg, scrollable */}
        <div
          ref={rightPanelRef}
          className="template-right-panel w-[414px] shrink-0 scrollbar-hide relative overflow-y-auto"
          style={{
            backgroundImage: `url('${BG_P1}')`,
            backgroundAttachment: "scroll",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Ivory overlay — mandala tetap terlihat artistik */}
          <div className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: "rgba(253,251,247,0.85)" }} />
          <div className="relative z-10">
            <OpeningGate invitation={invitation} guestName={display} onOpen={handleOpen} opened={opened} />
            {opened && ContentSections}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE — Single scroll (< lg)
      ══════════════════════════════════════════ */}
      <div className="lg:hidden relative">
        {/* Background mandala (fixed) */}
        <div className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url('${BG_P1}')`,
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Ivory overlay */}
        <div className="fixed inset-0 z-0 pointer-events-none"
          style={{ background: "rgba(253,251,247,0.85)" }} />
        <div className="relative z-10">
          <OpeningGate invitation={invitation} guestName={display} onOpen={handleOpen} opened={opened} />
          {opened && ContentSections}
        </div>
      </div>
    </div>
  );
}
