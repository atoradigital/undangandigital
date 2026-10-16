"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { MapPin, Heart, ChevronDown, Send, Users, CheckCircle2, Calendar } from "lucide-react";
import { supabase } from "@/utils/supabase";
import type { EventData } from "@/types/admin";

/* ════════════════════════════════════════════════════
   Color Palette — Midnight Black & Luxurious Gold (Premium-3)
════════════════════════════════════════════════════ */
const P = {
  bgDark:      "#0B0B0C", // Pure Obsidian Black
  bgCard:      "rgba(18, 18, 20, 0.93)", // Dark Translucent Glass Card
  bgCardLight: "rgba(30, 30, 35, 0.70)", // Secondary Glass Card
  gold:        "#D4AF37", // Warm Royal Gold
  goldBright:  "#F3E5AB", // Pale Gold Highlight
  goldGlow:    "rgba(212, 175, 55, 0.25)", // Glow Shadow
  textLight:   "#FDFBF7", // Bright Warm White Text
  textGold:    "#E2D6B5", // Muted Gold Text
  textSub:     "#A19B8C", // Secondary Subtext
} as const;

/* ── Assets ── */
const BG_P3    = "/templates/premium/premium-3/background-premium-3.jpg";
const MUSIC_P3 = "/templates/premium/premium-3/premium-3-music.mp3";
const MUSIC_FB = "/templates/basic/basic-1/basic-1-music.mp3";

/* ── Button classes khusus Premium 3 ── */
const GOLD_BTN =
  "inline-flex items-center justify-center gap-2 " +
  "bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C59B27] text-[#0B0B0C] " +
  "border border-[#F3E5AB] rounded-xl " +
  "px-7 py-3 shadow-[0_4px_20px_rgba(212,175,55,0.3)] tracking-[0.2em] uppercase text-[11px] " +
  "transition-all duration-300 font-sans font-bold hover:brightness-110";

const OUTLINE_GOLD_BTN =
  "inline-flex items-center justify-center gap-2 " +
  "bg-transparent border border-[#D4AF37]/60 text-[#F3E5AB] " +
  "hover:bg-[#D4AF37]/10 rounded-xl " +
  "px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase " +
  "transition-all duration-300 font-sans font-medium";

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
   Shared UI Elements (Gold Mandala & Living Animations)
════════════════════════════════════════════════════ */
function GoldDivider() {
  return (
    <motion.div 
      className="flex items-center justify-center gap-3 my-4"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    >
      <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${P.gold})` }} />
      <motion.span 
        className="text-xs select-none" 
        style={{ color: P.goldBright }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        ✦ ✧ ✦
      </motion.span>
      <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${P.gold})` }} />
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div 
      className="text-center mx-auto max-w-[310px] mb-8 rounded-2xl px-6 py-6 backdrop-blur-md"
      style={{
        background: P.bgCard,
        border: `1.5px solid rgba(212,175,55,0.35)`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.8), 0 0 20px ${P.goldGlow}`,
      }}
      whileInView={{ y: [10, 0] }}
      transition={{ duration: 0.6 }}
    >
      <p className="font-sans text-[10px] uppercase tracking-[0.4em] font-semibold" style={{ color: P.goldBright }}>
        {eyebrow}
      </p>
      <h2 className="font-serif font-bold mt-2" style={{ color: P.textLight, fontSize: "clamp(1.8rem, 6vw, 2.3rem)" }}>
        {title}
      </h2>
      <GoldDivider />
    </motion.div>
  );
}

const revealVariants: Variants = {
  hidden:  { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   LEFT PANEL — Desktop Cover
════════════════════════════════════════════════════ */
function CoverPanel({ ed }: { ed: EventData }) {
  const pria    = ed?.mempelai_pria?.nama?.split(" ")[0]   ?? "—";
  const wanita  = ed?.mempelai_wanita?.nama?.split(" ")[0] ?? "—";
  const tanggal = formatTanggal(ed?.jadwal_akad?.tanggal ?? "").toUpperCase();

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {ed?.foto_cover ? (
        <motion.div 
          className="absolute inset-0"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        >
          <Image src={ed.foto_cover} alt="Cover" fill
            className="object-cover object-center" sizes="65vw" priority quality={100} unoptimized />
        </motion.div>
      ) : (
        <div className="absolute inset-0" style={{ background: P.bgDark }} />
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(11,11,12,0.2) 20%, rgba(11,11,12,0.70) 65%, rgba(11,11,12,0.98) 100%)",
      }} />
      <motion.div 
        className="absolute bottom-0 left-0 right-0 px-12 pb-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <p className="font-sans text-[10px] tracking-[0.5em] uppercase font-semibold" style={{ color: P.goldBright }}>
          The Royal Wedding
        </p>
        <GoldDivider />
        <h1 className="font-serif font-bold leading-tight"
          style={{ color: P.textLight, fontSize: "clamp(2.4rem, 4vw, 3.6rem)", textShadow: "0 4px 24px rgba(0,0,0,0.9)" }}>
          {pria}
        </h1>
        <motion.p 
          className="font-serif text-2xl my-2" 
          style={{ color: P.goldBright }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          &amp;
        </motion.p>
        <h1 className="font-serif font-bold leading-tight"
          style={{ color: P.textLight, fontSize: "clamp(2.4rem, 4vw, 3.6rem)", textShadow: "0 4px 24px rgba(0,0,0,0.9)" }}>
          {wanita}
        </h1>
        {tanggal && (
          <p className="font-sans text-[10px] tracking-[0.4em] font-medium mt-4" style={{ color: P.goldBright }}>
            {tanggal}
          </p>
        )}
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   OPENING GATE — Layar Pembuka Undangan
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
    <div className="relative flex flex-col items-center justify-between min-h-[100dvh] overflow-hidden text-center px-6">
      {ed?.foto_cover && (
        <motion.div 
          className="absolute inset-0"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        >
          <Image src={ed.foto_cover} alt="BG" fill className="object-cover object-center"
            sizes="35vw" priority quality={100} unoptimized />
          <div className="absolute inset-0" style={{ background: "rgba(11,11,12,0.85)" }} />
        </motion.div>
      )}
      {!ed?.foto_cover && <div className="absolute inset-0" style={{ background: P.bgDark }} />}

      <motion.div 
        className="relative z-10 pt-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className="font-sans text-[9px] uppercase tracking-[0.5em] font-semibold" style={{ color: P.goldBright }}>
          The Wedding Celebration
        </p>
        <GoldDivider />
        <h1 className="font-serif font-bold leading-none mt-2"
          style={{ color: P.textLight, fontSize: "clamp(2rem, 3.5vw, 3rem)", textShadow: "0 2px 15px rgba(0,0,0,0.8)" }}>
          {pria}
        </h1>
        <motion.p 
          className="font-serif text-xl my-2" 
          style={{ color: P.goldBright }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          &amp;
        </motion.p>
        <h1 className="font-serif font-bold leading-none"
          style={{ color: P.textLight, fontSize: "clamp(2rem, 3.5vw, 3rem)", textShadow: "0 2px 15px rgba(0,0,0,0.8)" }}>
          {wanita}
        </h1>
      </motion.div>

      <div className="relative z-10 pb-16 w-full max-w-[320px]">
        <motion.div 
          className="p-6 rounded-2xl backdrop-blur-md mb-8 shadow-2xl"
          style={{ background: "rgba(18,18,20,0.75)", border: `1px solid rgba(212,175,55,0.4)` }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <p className="font-sans text-[9px] uppercase tracking-[0.4em] font-light mb-1.5"
            style={{ color: P.textSub }}>
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <p className="font-serif text-xl font-semibold mt-2"
            style={{ color: P.textLight, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
            {guestName || "Tamu Undangan"}
          </p>
        </motion.div>

        {!opened && (
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <button onClick={onOpen} className={GOLD_BTN + " w-full shadow-2xl"} aria-label="Buka undangan">
              ✉️ Buka Undangan Eksklusif
            </button>
          </motion.div>
        )}
      </div>

      {opened && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-60 animate-bounce">
          <ChevronDown size={20} style={{ color: P.goldBright }} />
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   VINYL WIDGET — Musik
════════════════════════════════════════════════════ */
function VinylWidget({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      aria-label={isPlaying ? "Pause musik" : "Play musik"}
      className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full select-none"
      style={{ filter: `drop-shadow(0 6px 20px rgba(212,175,55,0.3))` }}
      animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    >
      <motion.div
        className="relative w-14 h-14 rounded-full flex items-center justify-center border-2 border-[#D4AF37]"
        style={{ background: "#0B0B0C" }}
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { repeat: Infinity, duration: 3, ease: "linear" } : { duration: 0.3 }}
      >
        <div className="w-5 h-5 rounded-full flex items-center justify-center z-10"
          style={{ background: `radial-gradient(circle, ${P.goldBright} 0%, ${P.gold} 100%)` }}>
          <div className="w-1.5 h-1.5 rounded-full bg-black" />
        </div>
      </motion.div>
      {!isPlaying && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60">
          <div className="w-1 h-4 rounded-full bg-white mx-0.5" />
          <div className="w-1 h-4 rounded-full bg-white mx-0.5" />
        </div>
      )}
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Quote Ayat Suci
════════════════════════════════════════════════════ */
function QuoteSection({ ed }: { ed: EventData }) {
  return (
    <Reveal className="flex justify-center px-5 pt-12 pb-10">
      <div className="w-full max-w-xs rounded-3xl overflow-hidden text-center backdrop-blur-md"
        style={{
          background: P.bgCard,
          border: `1.5px solid rgba(212,175,55,0.4)`,
          boxShadow: `0 20px 50px rgba(0,0,0,0.9), 0 0 15px ${P.goldGlow}`,
        }}>
        {(ed?.foto_quote || ed?.foto_cover) && (
          <div className="relative w-full p-4 pb-0">
            <motion.div 
              className="relative w-full overflow-hidden rounded-2xl border border-[#D4AF37]/30 shadow-md" 
              style={{ aspectRatio: "4/5" }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <Image src={ed.foto_quote ?? ed.foto_cover} alt="Mempelai" fill
                className="object-cover object-center" sizes="300px" quality={100} unoptimized />
            </motion.div>
          </div>
        )}
        <div className="px-6 pt-6 pb-8">
          <p className="font-sans text-[11px] leading-[2.2] font-light italic" style={{ color: P.textGold }}>
            &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari dirimu sendiri, agar kamu merasa tenteram kepadanya...&rdquo;
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] mt-5 font-bold" style={{ color: P.goldBright }}>
            QS. Ar-Rum : 21
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Biodata Mempelai (Lotus Mandala Frame)
════════════════════════════════════════════════════ */
function BiodataSection({ ed }: { ed: EventData }) {
  const mempelai = [
    { role: "Pria",   nama: ed.mempelai_pria?.nama   ?? "—", foto: ed.mempelai_pria?.foto_url,  ortu: ed.mempelai_pria?.ortu   ?? "" },
    { role: "Wanita", nama: ed.mempelai_wanita?.nama ?? "—", foto: ed.mempelai_wanita?.foto_url, ortu: ed.mempelai_wanita?.ortu ?? "" },
  ];

  return (
    <section className="px-6 py-14">
      <Reveal>
        <div className="text-center max-w-xs mx-auto mb-10">
          <p className="font-sans text-xs italic leading-relaxed" style={{ color: P.textGold }}>
            Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
            Merupakan suatu kehormatan bagi kami memperkenalkan kedua mempelai:
          </p>
        </div>
      </Reveal>

      <div className="space-y-16 max-w-[290px] mx-auto">
        {mempelai.map((m, i) => (
          <Reveal key={m.role} delay={i * 0.15}>
            <div className="text-center">
              {/* Bingkai foto melayang dengan border emas */}
              <motion.div 
                className="relative mx-auto overflow-hidden p-1.5 rounded-t-[140px] rounded-b-3xl"
                style={{
                  width: 270, height: 350,
                  background: `linear-gradient(135deg, ${P.goldBright}, ${P.gold}, #8B6B18)`,
                  boxShadow: `0 12px 35px rgba(0,0,0,0.9), 0 0 25px ${P.goldGlow}`,
                }}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: i * 0.7 }}
              >
                <div className="relative w-full h-full rounded-t-[132px] rounded-b-2xl overflow-hidden bg-[#0B0B0C]">
                  {m.foto ? (
                    <Image src={m.foto} alt={m.nama} fill className="object-cover object-top" sizes="270px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#121214]">
                      <Heart size={36} style={{ color: P.goldBright }} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Card Nama & Ortu */}
              <div className="mt-4 px-6 py-5 rounded-2xl backdrop-blur-md"
                style={{
                  background: P.bgCard,
                  border: `1px solid rgba(212,175,55,0.35)`,
                }}>
                <h3 className="font-serif font-bold text-xl uppercase tracking-wider" style={{ color: P.goldBright }}>
                  {m.nama}
                </h3>
                {m.ortu && (
                  <p className="font-sans text-[11px] font-light leading-relaxed mt-2" style={{ color: P.textSub }}>
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
   SECTION — Save The Date & Countdown
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
    <section className="px-6 py-14" style={{ background: "rgba(0,0,0,0.3)" }}>
      <Reveal>
        <div className="text-center mx-auto max-w-[310px] mb-8 rounded-2xl px-6 py-6 backdrop-blur-md"
          style={{ background: P.bgCard, border: `1px solid rgba(212,175,55,0.35)` }}>
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] font-semibold" style={{ color: P.goldBright }}>Save The Date</p>
          <h2 className="font-serif font-bold text-3xl mt-1" style={{ color: P.textLight }}>Menuju Hari Bahagia</h2>
          <GoldDivider />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid grid-cols-4 gap-2 max-w-[310px] mx-auto mb-8">
          {([
            { value: countdown.hari,  label: "Hari"  },
            { value: countdown.jam,   label: "Jam"   },
            { value: countdown.menit, label: "Menit" },
            { value: countdown.detik, label: "Detik" },
          ] as { value: number; label: string }[]).map((item, idx) => (
            <motion.div 
              key={item.label} 
              className="text-center py-3.5 rounded-2xl backdrop-blur-md"
              style={{ background: P.bgCard, border: `1px solid rgba(212,175,55,0.35)` }}
              animate={{ y: [0, idx % 2 === 0 ? -3 : 3, 0] }}
              transition={{ repeat: Infinity, duration: 3 + idx, ease: "easeInOut" }}
            >
              <p className="font-serif text-xl font-bold" style={{ color: P.goldBright }}>
                {String(item.value).padStart(2, "0")}
              </p>
              <p className="font-sans text-[8px] uppercase tracking-wider mt-1 font-semibold" style={{ color: P.textSub }}>
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="flex flex-col gap-3 items-center max-w-[280px] mx-auto">
          <a href={gCalUrl} target="_blank" rel="noopener noreferrer" className={GOLD_BTN + " w-full justify-center text-[10px]"}>
            <Calendar size={13} strokeWidth={2} /> Simpan ke Google Calendar
          </a>
          <button onClick={() => downloadICS(ed, pria, wanita)} className={OUTLINE_GOLD_BTN + " w-full justify-center text-[10px]"}>
            <Calendar size={13} strokeWidth={1.5} /> Download .ics (iCal / Apple)
          </button>
        </div>
      </Reveal>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — Akad & Resepsi
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
      id: "resepsi", label: "Resepsi Pernikahan",
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
    <section className="px-6 py-14">
      <SectionHeading eyebrow="Rangkaian Acara" title="Waktu &amp; Tempat" />

      <div className="space-y-6 max-w-[310px] mx-auto">
        {events.map((ev, i) => (
          <Reveal key={ev.id} delay={i * 0.15}>
            <div className="rounded-3xl overflow-hidden backdrop-blur-md"
              style={{
                background: P.bgCard,
                border: `1.5px solid rgba(212,175,55,0.4)`,
              }}>
              <div className="h-1.5" style={{ background: `linear-gradient(to right, ${P.gold}, ${P.goldBright}, ${P.gold})` }} />
              <div className="px-6 py-8 text-center">
                <h3 className="font-serif font-bold text-2xl mb-1" style={{ color: P.textLight }}>{ev.label}</h3>
                <GoldDivider />
                {ev.hari && <p className="font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-1" style={{ color: P.goldBright }}>{ev.hari}</p>}
                {ev.tanggal && <p className="font-serif text-base font-bold mb-1" style={{ color: P.textLight }}>{ev.tanggal}</p>}
                {(ev.jamMulai || ev.jamSelesai) && (
                  <p className="font-sans text-sm font-light mb-6" style={{ color: P.textGold }}>
                    Pukul {ev.jamMulai}{ev.jamMulai && ev.jamSelesai && " – "}{ev.jamSelesai}
                  </p>
                )}
                {(ev.namaLokasi || ev.alamat) && (
                  <div className="mb-6 bg-[#0B0B0C]/60 p-4 rounded-2xl border border-[#D4AF37]/20">
                    <div className="flex justify-center mb-1.5"><MapPin size={16} strokeWidth={1.5} style={{ color: P.goldBright }} /></div>
                    {ev.namaLokasi && <p className="font-sans text-sm font-bold uppercase tracking-wide" style={{ color: P.goldBright }}>{ev.namaLokasi}</p>}
                    {ev.alamat && <p className="font-sans text-xs font-light leading-relaxed mt-1" style={{ color: P.textSub }}>{ev.alamat}</p>}
                  </div>
                )}
                {ev.maps && (
                  <a href={ev.maps} target="_blank" rel="noopener noreferrer" className={GOLD_BTN + " w-full justify-center text-[10px]"}>
                    <MapPin size={12} strokeWidth={2} /> Buka Google Maps
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
   SECTION — Galeri Foto
════════════════════════════════════════════════════ */
function GaleriSection({ galeri }: { galeri: string[] }) {
  if (!galeri?.length) return null;
  return (
    <section className="px-5 py-14" style={{ background: "rgba(0,0,0,0.3)" }}>
      <SectionHeading eyebrow="Album Kenangan" title="Galeri Foto" />
      <div className="space-y-4 max-w-md mx-auto">
        {galeri.slice(0, 8).map((url, idx) => (
          <Reveal key={idx} delay={(idx % 3) * 0.08}>
            <motion.div 
              className="relative w-full overflow-hidden rounded-2xl shadow-md"
              style={{ aspectRatio: "16/9", border: `1.5px solid rgba(212,175,55,0.4)` }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image src={url} alt={`Galeri ${idx + 1}`} fill className="object-cover" sizes="414px" />
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION — RSVP + Realtime Feed (Order Callback .on Ditulis Terlebih Dahulu)
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

  useEffect(() => {
    fetchGreetings();
    const channelName = `greetings-${invitation.id}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    /* Urutan .on() sebelum .subscribe() untuk mencegah Next.js runtime error */
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "greetings", filter: `invitation_id=eq.${invitation.id}` },
      (payload) => {
        const newG = payload.new as Greeting;
        setGreetings((prev) => (prev.some((g) => g.id === newG.id) ? prev : [newG, ...prev]));
      }
    );
    channel.subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [invitation.id, fetchGreetings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);

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

    if (inserted) {
      setGreetings((prev) => (prev.some((g) => g.id === (inserted as Greeting).id) ? prev : [inserted as Greeting, ...prev]));
    }

    const waNumber = invitation.whatsapp_number?.replace(/\D/g, "");
    if (waNumber) {
      const attLabel = attendance === "hadir" ? "✅ Hadir" : attendance === "tidak_hadir" ? "❌ Tidak Hadir" : "🤔 Mungkin Hadir";
      const waText = encodeURIComponent(
        `Halo, saya ${name.trim()} mengonfirmasi kehadiran:\n\n` +
        `📋 Status: ${attLabel}\n` +
        `👥 Jumlah Tamu: ${partyCount} orang\n\n` +
        `💌 Ucapan:\n"${message.trim()}"\n\n` +
        `— Dikirim via Atora Digital`
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
    <section className="px-5 py-14">
      <SectionHeading eyebrow="Konfirmasi Kehadiran" title="Buku Tamu &amp; RSVP" />

      <Reveal delay={0.1}>
        <div className="max-w-md mx-auto rounded-3xl overflow-hidden backdrop-blur-md mb-10 shadow-lg"
          style={{
            background: P.bgCard,
            border: `1.5px solid rgba(212,175,55,0.4)`,
          }}>
          <div className="h-1.5" style={{ background: `linear-gradient(to right, ${P.gold}, ${P.goldBright}, ${P.gold})` }} />

          {submitted ? (
            <div className="px-8 py-12 text-center">
              <CheckCircle2 size={45} className="mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
              <p className="font-serif text-2xl font-bold mb-2" style={{ color: P.textLight }}>Terima Kasih!</p>
              <p className="font-sans text-sm font-light" style={{ color: P.textSub }}>
                RSVP dan doa restu Anda berhasil disimpan. 💌
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-7 py-8 space-y-5">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-1.5" style={{ color: P.goldBright }}>
                  Nama Lengkap *
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" required
                  className="w-full px-4 py-3 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  style={{ background: "#0B0B0C", border: `1px solid rgba(212,175,55,0.3)`, color: P.textLight }} />
              </div>

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-2" style={{ color: P.goldBright }}>
                  Konfirmasi Kehadiran
                </label>
                <div className="flex gap-2">
                  {attendanceOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setAttendance(opt.value)}
                      className="flex-1 py-2.5 rounded-full text-[11px] font-medium transition-all font-sans"
                      style={{
                        background: attendance === opt.value ? P.goldBright : "transparent",
                        color:      attendance === opt.value ? "#0B0B0C" : P.textGold,
                        border:     `1px solid ${attendance === opt.value ? P.goldBright : "rgba(212,175,55,0.4)"}`,
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {attendance === "hadir" && (
                <div>
                  <label className="block font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-1.5" style={{ color: P.goldBright }}>
                    Jumlah Tamu Hadir
                  </label>
                  <div className="flex items-center gap-3">
  <button type="button" onClick={() => setPartyCount((p) => Math.max(1, p - 1))}
    className="w-9 h-9 rounded-full text-lg font-bold flex items-center justify-center border border-[#D4AF37]/40 text-[#F3E5AB]">
    −
  </button>
  <span className="font-serif text-xl font-bold w-8 text-center" style={{ color: P.goldBright }}>{partyCount}</span>
  <button type="button" onClick={() => setPartyCount((p) => Math.min(10, p + 1))}
    className="w-9 h-9 rounded-full text-lg font-bold flex items-center justify-center border border-[#D4AF37]/40 text-[#F3E5AB]">
    +
  </button>
  <span className="font-sans text-xs" style={{ color: P.textSub }}>orang</span>
</div>
                </div>
              )}

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.3em] font-semibold mb-1.5" style={{ color: P.goldBright }}>
                  Ucapan &amp; Doa Restu *
                </label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan doa terbaik untuk mempelai..." required rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 resize-none leading-relaxed"
                  style={{ background: "#0B0B0C", border: `1px solid rgba(212,175,55,0.3)`, color: P.textLight }} />
              </div>

              <button type="submit" disabled={submitting}
                className={GOLD_BTN + " w-full justify-center"} style={{ opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Mengirim..." : <><Send size={13} strokeWidth={2} /> Kirim RSVP &amp; WhatsApp</>}
              </button>
            </form>
          )}
        </div>
      </Reveal>

      {/* Greeting Feed */}
      <Reveal delay={0.2}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} strokeWidth={1.5} style={{ color: P.goldBright }} />
            <p className="font-sans text-[10px] uppercase tracking-[0.35em] font-semibold" style={{ color: P.goldBright }}>
              Ucapan Tamu ({greetings.length})
            </p>
          </div>

          {loadingG ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                style={{ borderColor: P.goldBright, borderTopColor: "transparent" }} />
            </div>
          ) : greetings.length === 0 ? (
            <p className="text-center font-sans text-sm font-light py-6" style={{ color: P.textSub }}>
              Belum ada ucapan. Jadilah yang pertama! 🌹
            </p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {greetings.map((g, index) => (
                <motion.div 
                  key={g.id} 
                  className="rounded-2xl px-5 py-4 backdrop-blur-sm"
                  style={{ background: P.bgCard, border: `1px solid rgba(212,175,55,0.3)` }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                        style={{
                          background: g.attendance === "hadir" ? "rgba(34,139,34,0.2)" : g.attendance === "tidak_hadir" ? "rgba(220,50,50,0.2)" : "rgba(180,160,60,0.2)",
                          color: g.attendance === "hadir" ? "#4ADE80" : g.attendance === "tidak_hadir" ? "#F87171" : "#FACC15",
                        }}>
                        {g.guest_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-sans text-xs font-semibold" style={{ color: P.textLight }}>{g.guest_name}</p>
                        <p className="font-sans text-[10px] font-medium" style={{
                          color: g.attendance === "hadir" ? "#4ADE80" : g.attendance === "tidak_hadir" ? "#F87171" : "#FACC15",
                        }}>
                          {g.attendance === "hadir" ? "✅ Hadir" : g.attendance === "tidak_hadir" ? "❌ Tidak Hadir" : "🤔 Mungkin"}
                        </p>
                      </div>
                    </div>
                    <span className="font-sans text-[9px]" style={{ color: P.textSub }}>{timeAgo(g.created_at)}</span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed italic pl-10" style={{ color: P.textGold }}>
                    &ldquo;{g.message}&rdquo;
                  </p>
                </motion.div>
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
    <div className="p-6 relative overflow-hidden rounded-2xl shadow-md" style={{
      background: `linear-gradient(135deg, #1A1A1E 0%, #0B0B0C 100%)`,
      border: `1px solid rgba(212,175,55,0.4)`,
    }}>
      <div className="flex justify-between items-start mb-6 z-10 relative">
        <div className="w-10 h-7 rounded bg-[#D4AF37]/80" />
        <span className="font-serif font-bold text-xl" style={{ color: P.goldBright }}>{bank}</span>
      </div>
      <div className="font-mono text-base tracking-[0.2em] mb-2 z-10 relative" style={{ color: P.textLight }}>{no}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-medium z-10 relative" style={{ color: P.textSub }}>{nama}</div>
      {no && (
        <button onClick={() => handleCopy(no)}
          className="absolute bottom-4 right-4 text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 z-10 border border-[#D4AF37]/40 text-[#F3E5AB] bg-[#0B0B0C]">
          Salin No. Rek
        </button>
      )}
    </div>
  );

  return (
    <section className="px-4 py-14" style={{ background: "rgba(0,0,0,0.3)" }}>
      <Reveal className="max-w-md mx-auto">
        <div className="rounded-3xl p-8 flex flex-col items-center backdrop-blur-md shadow-lg"
          style={{
            background: P.bgCard,
            border: `1.5px solid rgba(212,175,55,0.4)`,
          }}>
          <SectionHeading eyebrow="Tanda Kasih" title="Wedding Gift" />
          <p className="font-sans text-xs font-light leading-[2] text-center max-w-xs mx-auto mb-6 -mt-3" style={{ color: P.textGold }}>
            Doa restu Anda adalah karunia terindah. Namun jika ingin mengirimkan tanda kasih, silakan melalui:
          </p>
          <button onClick={() => setOpen(!open)} className={GOLD_BTN}>
            {open ? "Tutup Info Rekening" : "Klik untuk Lihat Gift"}
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
                    <div className="p-6 text-center rounded-2xl border border-[#D4AF37]/30 bg-[#0B0B0C]">
                      <Heart size={22} className="mx-auto mb-2 text-[#D4AF37]" strokeWidth={1.5} />
                      <h4 className="font-serif font-bold text-base mb-2" style={{ color: P.goldBright }}>Kado Fisik</h4>
                      {ed?.gift_penerima && <p className="text-xs font-sans mb-1" style={{ color: P.textGold }}>Penerima: <strong style={{ color: P.textLight }}>{ed.gift_penerima}</strong></p>}
                      {ed?.gift_alamat && <p className="text-xs leading-relaxed font-sans mt-2" style={{ color: P.textSub }}>{ed.gift_alamat}</p>}
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
    <section className="relative overflow-hidden text-center min-h-screen flex flex-col justify-center px-6">
      {ed?.foto_cover && (
        <div className="absolute inset-0">
          <Image src={ed.foto_cover} alt="Penutup" fill className="object-cover object-center" sizes="100vw" />
        </div>
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(11,11,12,0.8) 0%, rgba(11,11,12,0.95) 60%, rgba(5,5,6,1) 100%)",
      }} />
      <div className="relative z-10 py-20 max-w-sm mx-auto">
        <motion.div 
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]"
          style={{ background: "rgba(212,175,55,0.15)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Heart size={22} strokeWidth={1.5} style={{ color: P.goldBright }} />
        </motion.div>
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase font-semibold" style={{ color: P.goldBright }}>Terima Kasih</p>
        <GoldDivider />
        <h2 className="font-serif text-3xl font-bold mb-6 mt-2" style={{ color: P.textLight }}>{pria} &amp; {wanita}</h2>
        <p className="font-sans text-xs font-light leading-[2.2] mb-6" style={{ color: P.textGold }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
        </p>
        <p className="font-serif text-base font-semibold italic" style={{ color: P.goldBright }}>Wassalamualaikum Wr. Wb.</p>
        <div className="mt-16 pt-6 border-t border-white/10">
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/50">Crafted Exclusively By Atora</p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT — Premium3Template
════════════════════════════════════════════════════ */
export default function Premium3Template({
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

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); alert("Nomor rekening berhasil disalin!"); };

  const handleOpen = () => {
    setOpened(true);
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    setTimeout(() => {
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById("sec-p3-quote")?.scrollIntoView({ behavior: "smooth" });
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
      <div id="sec-p3-quote">
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
    <div style={{ background: P.bgDark }}>
      <audio ref={audioRef} loop preload="auto">
        <source src={MUSIC_P3} type="audio/mpeg" />
        <source src={MUSIC_FB}  type="audio/mpeg" />
      </audio>

      {opened && <VinylWidget isPlaying={isPlaying} onToggle={toggleMusic} />}

      {/* DESKTOP — Split-Screen */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden">
        <div className="template-left-panel flex-1 relative">
          <CoverPanel ed={ed} />
        </div>
        <div
          ref={rightPanelRef}
          className="template-right-panel w-[414px] shrink-0 scrollbar-hide relative overflow-y-auto"
          style={{
            backgroundImage: `url('${BG_P3}')`,
            backgroundAttachment: "scroll",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: "rgba(11, 11, 12, 0.82)" }} />
          <div className="relative z-10">
            <OpeningGate invitation={invitation} guestName={display} onOpen={handleOpen} opened={opened} />
            {opened && ContentSections}
          </div>
        </div>
      </div>

      {/* MOBILE — Single Scroll */}
      <div className="lg:hidden relative">
        <div className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url('${BG_P3}')`,
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="fixed inset-0 z-0 pointer-events-none"
          style={{ background: "rgba(11, 11, 12, 0.82)" }} />
        <div className="relative z-10">
          <OpeningGate invitation={invitation} guestName={display} onOpen={handleOpen} opened={opened} />
          {opened && ContentSections}
        </div>
      </div>
    </div>
  );
}