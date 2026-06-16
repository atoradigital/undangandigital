"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import type { EventData } from "@/types/admin";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Heart,
  ChevronDown,
  Music2,
  VolumeX,
} from "lucide-react";


/* ════════════════════════════════════════════════════
   Types
════════════════════════════════════════════════════ */
interface InvitationRow {
  id: string;
  title: string;
  slug: string;
  template: string;
  event_data: EventData;
}
interface GuestRow {
  id: string;
  name: string;
  status: string;
}

/* ════════════════════════════════════════════════════
   Color Palette — Dark Brown × Cream × Gold (Basic-1)
════════════════════════════════════════════════════ */
const C = {
  // ── Primary palette ─────────────────────────────────
  maroon:       "#3D2B1F",   // now: dark espresso brown (aksen & bg card)
  maroonDeep:   "#1A0F07",   // deepest dark brown
  maroonMid:    "#4E3829",   // mid brown
  cream:        "#F5EDD8",   // teks utama & elemen terang
  creamDim:     "#C8B99A",   // teks subdued
  creamBorder:  "rgba(245,237,216,0.30)",
  gold:         "#C9A04A",   // aksen emas premium
  goldDim:      "rgba(201,160,74,0.22)",
  white:        "#FFFFFF",
  // ── Card / Section ─────────────────────────────────
  cardBg:       "rgba(26,15,7,0.88)",    // dark brown card
  cardBorder:   "rgba(201,160,74,0.30)", // gold border
  sectionBg:    "rgba(26,15,7,0.85)",
  // ── Backward-compat aliases (kode lama tetap compile) ─
  navy:         "#1A0F07",
  navyMid:      "#3D2B1F",
  navyLight:    "#4E3829",
  lime:         "#C9A04A",   // alias → gold
  limeLight:    "#D4B060",
  purple:       "#3D2B1F",
  purpleLight:  "#4E3829",
  creamDark:    "#1A0F07",
  textDark:     "#F5EDD8",
  textMid:      "#C8B99A",
} as const;


const FIXED_BG = "/templates/basic/basic-1/background-basic-1.jpg";

/* ════════════════════════════════════════════════════
   Helpers
════════════════════════════════════════════════════ */
function formatTanggal(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch { return iso; }
}
function formatTanggalShort(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day} · ${month} · ${year}`;
  } catch { return iso; }
}
function fj(jam: string): string {
  return jam ? `${jam} WIB` : "";
}
function formatHari(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date(iso)).toUpperCase();
  } catch { return ""; }
}
function formatTanggalPanjang(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const day   = d.getDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(d).toUpperCase();
    return `${day} ${month} ${d.getFullYear()}`;
  } catch { return iso; }
}

/* ════════════════════════════════════════════════════
   Shared UI atoms
════════════════════════════════════════════════════ */
function GoldLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px ${className}`}
      style={{ background: `linear-gradient(to right, transparent, ${C.lime}, transparent)` }}
    />
  );
}
function GoldLineShort({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px w-20 mx-auto ${className}`}
      style={{ background: `linear-gradient(to right, transparent, ${C.lime}, transparent)` }}
    />
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-sans text-[9px] uppercase tracking-[0.45em] font-semibold"
      style={{ color: C.lime }}
    >
      {children}
    </p>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif text-2xl font-bold leading-tight"
      style={{ color: C.cream }}
    >
      {children}
    </h2>
  );
}

/* ════════════════════════════════════════════════════
   KIRI — Foto cover + teks overlay (Desktop only)
════════════════════════════════════════════════════ */
function CoverWithText({ ed }: { ed: EventData }) {
  const pria = ed?.mempelai_pria?.nama?.split(" ")[0] ?? "—";
  const wanita = ed?.mempelai_wanita?.nama?.split(" ")[0] ?? "—";
  const tanggal = formatTanggal(ed?.jadwal_akad?.tanggal ?? "").toUpperCase();

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Photo */}
      {ed?.foto_cover ? (
        <Image
          src={ed.foto_cover}
          alt="Foto Cover"
          fill
          className="object-cover object-center"
          sizes="65vw"
          priority={true}
          quality={100}
          unoptimized={true}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: C.maroonDeep }} />
      )}

      {/* Gradient overlay: transparent top → dark bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.72) 85%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Text overlay — pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-12 pb-14 text-center">
        <p
          className="font-sans text-[10px] uppercase tracking-[0.5em] font-light mb-3"
          style={{ color: "rgba(255,255,255,0.70)" }}
        >
          The Wedding of
        </p>
        <h1
          className="font-serif font-bold leading-tight mb-0.5"
          style={{ color: "#fff", fontSize: "clamp(2.2rem, 3.5vw, 3.4rem)", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
        >
          {pria}
        </h1>
        <p className="font-sans text-xl my-0.5" style={{ color: C.gold }}>&amp;</p>
        <h1
          className="font-serif font-bold leading-tight mb-5"
          style={{ color: "#fff", fontSize: "clamp(2.2rem, 3.5vw, 3.4rem)", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
        >
          {wanita}
        </h1>
        {tanggal && (
          <p
            className="font-sans text-[9px] tracking-[0.45em] font-semibold"
            style={{ color: C.gold }}
          >
            {tanggal}
          </p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   KANAN / MOBILE — Foto bg + nama + Kepada Yth + Buka
════════════════════════════════════════════════════ */
function OpeningSection({
  invitation,
  guestName,
  onOpen,
  opened,
}: {
  invitation: InvitationRow;
  guestName: string;
  onOpen: () => void;
  opened: boolean;
}) {
  const ed = invitation.event_data;
  const pria = ed?.mempelai_pria?.nama?.split(" ")[0] ?? "—";
  const wanita = ed?.mempelai_wanita?.nama?.split(" ")[0] ?? "—";

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[100dvh] overflow-hidden">
      {/* Background: cover photo with dark overlay */}
      {ed?.foto_cover ? (
        <div className="absolute inset-0">
          <Image
            src={ed.foto_cover}
            alt="Background"
            fill
            className="object-cover object-center"
            sizes="35vw"
            priority={true}
            quality={100}
            unoptimized={true}
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.52)" }}
          />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ background: C.maroonDeep }} />
      )}

      {/* TOP — The Wedding of + Names */}
      <div className="relative z-10 text-center px-8 pt-12">
        <p
          className="font-sans text-[9px] uppercase tracking-[0.45em] font-light mb-3"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          The Wedding of
        </p>
        <h1
          className="font-serif font-bold leading-none mb-0"
          style={{ color: "#fff", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
        >
          {pria}
        </h1>
        <p className="font-sans text-base my-1" style={{ color: C.gold }}>&amp;</p>
        <h1
          className="font-serif font-bold leading-none"
          style={{ color: "#fff", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
        >
          {wanita}
        </h1>
      </div>

      {/* BOTTOM — Kepada Yth + Button */}
      <div className="relative z-10 text-center px-8 pb-16 w-full">
        <p
          className="font-sans text-[9px] uppercase tracking-[0.35em] font-light mb-1.5"
          style={{ color: "rgba(255,255,255,0.60)" }}
        >
          Kepada Yth:
        </p>
        <p
          className="font-serif text-xl font-semibold mb-8"
          style={{ color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
        >
          {guestName || "Tamu Undangan"}
        </p>

        {!opened && (
          <button
            onClick={onOpen}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border font-sans text-xs tracking-[0.3em] uppercase font-light hover:opacity-80 transition-opacity"
            style={{ borderColor: C.gold, color: "#fff", background: "rgba(201,155,65,0.15)" }}
            aria-label="Buka undangan"
          >
            ✉️ Buka Undangan
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 2 — Card Portrait: Foto Mempelai + Nama + Ayat
════════════════════════════════════════════════════ */
function QuoteSection({ ed }: { ed: EventData }) {
  const pria = ed?.mempelai_pria?.nama ?? "";
  const wanita = ed?.mempelai_wanita?.nama ?? "";

  return (
    <section className="relative z-10 flex justify-center px-5 pt-10 pb-10">
      {/* Portrait card */}
      <div
        className="w-full max-w-xs rounded-2xl overflow-hidden text-center"
        style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          boxShadow: "0 16px 60px rgba(10,8,40,0.55)",
        }}
      >
        {/* Foto mempelai — portrait aspect ratio */}
        {(ed?.foto_quote || ed?.foto_cover) && (
          <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
            <Image
              src={ed.foto_quote ?? ed.foto_cover}
              alt="Foto Mempelai"
              fill
              className="object-cover object-center"
              sizes="320px"
              quality={100}
              unoptimized
            />
            {/* Bottom gradient for smooth transition into card body */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24"
              style={{
                background: `linear-gradient(to top, ${C.cardBg}, transparent)`,
              }}
            />
          </div>
        )}

        {/* Nama mempelai */}
        <div className="px-6 pt-2 pb-4">
          <h2
            className="font-serif font-bold leading-tight"
            style={{ color: C.cream, fontSize: "1.5rem" }}
          >
            {pria.split(" ")[0]}
          </h2>
          <p className="font-sans text-base my-0.5" style={{ color: C.lime }}>&amp;</p>
          <h2
            className="font-serif font-bold leading-tight"
            style={{ color: C.cream, fontSize: "1.5rem" }}
          >
            {wanita.split(" ")[0]}
          </h2>
        </div>

        {/* Divider */}
        <GoldLineShort className="mb-5" />

        {/* Ayat */}
        <div className="px-6 pb-8">
          <p
            className="font-sans text-xs leading-[1.9] font-light italic"
            style={{ color: C.creamDim }}
          >
            Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan
            pasangan-pasangan untukmu dari (jenis) dirimu sendiri agar kamu merasa
            tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih
            sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat
            tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.
          </p>
          <p
            className="font-sans text-[10px] uppercase tracking-[0.25em] mt-4 font-semibold"
            style={{ color: C.lime }}
          >
            -QS. Ar-Rum : 21-
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 3 — Biodata Mempelai (Arch Photo + Info Ortu)
════════════════════════════════════════════════════ */
function BiodataSection({ ed }: { ed: EventData }) {
  const mempelai = [
    {
      role:  "Mempelai Pria",
      nama:  ed.mempelai_pria?.nama   ?? "—",
      foto:  ed.mempelai_pria?.foto_url,
      ortu:  ed.mempelai_pria?.ortu   ?? "",
    },
    {
      role:  "Mempelai Wanita",
      nama:  ed.mempelai_wanita?.nama  ?? "—",
      foto:  ed.mempelai_wanita?.foto_url,
      ortu:  ed.mempelai_wanita?.ortu  ?? "",
    },
  ];

   return (
    <div className="w-full px-6 py-8 flex flex-col items-center text-center">
        {/* Ayat pembuka */}
        <p
          className="font-sans text-[11px] italic leading-relaxed max-w-xs mx-auto mb-10"
          style={{ color: "#5C4A37" }}
        >
          Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
          Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:
        </p>

        {/* Mempelai — stacked, locked width w-[260px] */}
        <div className="space-y-14 w-[260px] mx-auto">
          {mempelai.map((m) => (
            <div key={m.role} className="flex flex-col items-center">

              {/* Wrapper Foto & Nama — width locked at w-[260px] from parent */}
              <div className="flex flex-col items-center w-full">
                {/* Kontainer Foto */}
                <div
                  className="w-[260px] h-[380px] relative overflow-hidden"
                  style={{
                    borderRadius: "24px 24px 0 0",
                    border: `2px solid ${C.gold}`,
                    background: "#2D1A0A",
                  }}
                >
                  {m.foto ? (
                    <Image
                      src={m.foto}
                      alt={m.nama}
                      fill
                      className="w-full h-full object-cover object-top"
                      sizes="(max-width: 768px) 260px, 260px"
                      quality={100}
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "#2D1A0A" }}
                    >
                      <Heart size={32} style={{ color: C.gold }} strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Bottom gradient */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                    }}
                  />

                  {/* Floral ornaments */}
                  <span className="absolute bottom-2 left-3 text-2xl select-none" style={{ opacity: 0.88 }}>
                    🌿
                  </span>
                  <span
                    className="absolute bottom-2 right-3 text-2xl select-none"
                    style={{ opacity: 0.88, display: "inline-block", transform: "scaleX(-1)" }}
                  >
                    🌿
                  </span>
                </div>

                {/* Kontainer Nama — w-full follows parent w-[260px], wraps neatly */}
                <div className="w-full mt-4">
                  <p
                    className="font-serif font-bold uppercase tracking-widest text-xl break-words leading-tight"
                    style={{ color: "#3D2B1F" }}
                  >
                    {m.nama}
                  </p>
                  {m.ortu && (
                    <p
                      className="font-sans text-[11px] font-light leading-relaxed mt-2"
                      style={{ color: "#5C4A37" }}
                    >
                      {m.ortu}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
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
      const hari  = Math.floor(diff / 86400000);
      const jam   = Math.floor((diff % 86400000) / 3600000);
      const menit = Math.floor((diff % 3600000)  / 60000);
      const detik = Math.floor((diff % 60000)    / 1000);
      setCountdown({ hari, jam, menit, detik });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [ed.jadwal_akad?.tanggal]);

  const events = [
    {
      id:           "akad",
      label:        "Akad Nikah ",
      labelSub:     "",
      hari:         formatHari(ed.jadwal_akad?.tanggal ?? ""),
      tanggal:      formatTanggalPanjang(ed.jadwal_akad?.tanggal ?? ""),
      jamMulai:     fj(ed.jadwal_akad?.jam_mulai ?? ""),
      jamSelesai:   fj(ed.jadwal_akad?.jam_selesai ?? ""),
      namaLokasi:   ed.akad_lokasi   ?? "",
      alamat:       ed.akad_alamat   ?? ed.lokasi?.alamat ?? "",
      maps:         ed.akad_maps_url ?? ed.lokasi?.maps_url ?? "",
    },
    {
      id:           "resepsi",
      label:        "Resepsi",
      labelSub:     "",
      hari:         formatHari(ed.jadwal_resepsi?.tanggal ?? ""),
      tanggal:      formatTanggalPanjang(ed.jadwal_resepsi?.tanggal ?? ""),
      jamMulai:     fj(ed.jadwal_resepsi?.jam_mulai ?? ""),
      jamSelesai:   fj(ed.jadwal_resepsi?.jam_selesai ?? ""),
      namaLokasi:   ed.resepsi_lokasi   ?? "",
      alamat:       ed.resepsi_alamat   ?? ed.lokasi?.alamat ?? "",
      maps:         ed.resepsi_maps_url ?? ed.lokasi?.maps_url ?? "",
    },
  ];

  return (
    <div className="w-full px-6 py-8 flex flex-col items-center">

        {/* ── Save The Date header ── */}

        <div className="text-center mb-7">
          <h2
            className="font-serif italic font-bold"
            style={{
              color: "#3D2B1F",
              fontSize: "clamp(2rem, 7vw, 2.5rem)",
            }}
          >
            Save The Date
          </h2>
          <div
            className="h-px mx-auto mt-3 max-w-[140px]"
            style={{ background: `linear-gradient(to right, transparent, ${C.gold}, transparent)` }}
          />
        </div>

        {/* ── Countdown — kotak individual TETAP dipertahankan ── */}
        <div className="flex justify-center items-center gap-4 w-full mb-8">
          {([
            { value: countdown.hari,  label: "Hari"  },
            { value: countdown.jam,   label: "Jam"   },
            { value: countdown.menit, label: "Menit" },
            { value: countdown.detik, label: "Detik" },
          ] as { value: number; label: string }[]).map((item) => (
            <div
              key={item.label}
              className="min-w-[76px] px-4 py-3 flex flex-col items-center justify-center rounded-xl"
              style={{ background: C.cream }}
            >
              <p
                className="font-serif text-xl font-bold leading-none"
                style={{ color: C.maroon }}
              >
                {String(item.value).padStart(2, "0")}
              </p>
              <p
                className="font-sans text-[8px] uppercase tracking-wider mt-1.5 font-semibold"
                style={{ color: C.maroon }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Deskripsi — langsung di dalam unified container, tanpa bg sendiri ── */}
        <p
          className="font-sans text-[11px] italic text-center leading-relaxed max-w-xs mx-auto mb-10"
          style={{ color: "#5C4A37" }}
        >
          Dengan memohon rahmat dan ridho Allah SWT, kami mengundang
          Bapak/Ibu/Saudara/i, untuk menghadiri acara pernikahan kami:
        </p>

        {/* ── Event cards — desain gelap TETAP dipertahankan ── */}
        <div className="space-y-6 max-w-[300px] mx-auto">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl overflow-hidden"
              style={{
                border: `2px solid rgba(201,160,74,0.65)`,
                boxShadow:
                  `0 0 0 5px rgba(74,15,28,1), 0 0 0 7px rgba(201,160,74,0.22), 0 8px 32px rgba(0,0,0,0.40)`,
              }}
            >
              <div
                className="px-6 py-8 text-center"
                style={{
                  background: "linear-gradient(160deg, #2D1A0A 0%, #1A0A03 50%, #2D1A0A 100%)",
                  outline: "1px solid rgba(245,237,216,0.10)",
                  outlineOffset: "-8px",
                }}
              >
                {/* Akad/Resepsi label */}
                <div className="mb-5">
                  <p
                    className="font-serif font-bold italic leading-none"
                    style={{ color: C.cream, fontSize: "2rem" }}
                  >
                    {ev.label}
                  </p>
                  <p
                    className="font-serif italic font-light leading-none -mt-1"
                    style={{ color: C.creamDim, fontSize: "1.35rem" }}
                  >
                    {ev.labelSub}
                  </p>
                </div>

                {/* Gold divider */}
                <div
                  className="h-px mx-auto mb-5 max-w-[80px]"
                  style={{
                    background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
                  }}
                />

                {/* Hari */}
                {ev.hari && (
                  <p
                    className="font-sans text-[10px] uppercase tracking-[0.35em] font-bold mb-0.5"
                    style={{ color: C.cream }}
                  >
                    {ev.hari}
                  </p>
                )}

                {/* Tanggal */}
                {ev.tanggal && (
                  <p
                    className="font-serif text-base font-bold mb-0.5"
                    style={{ color: C.cream }}
                  >
                    {ev.tanggal}
                  </p>
                )}

                {/* Jam */}
                {(ev.jamMulai || ev.jamSelesai) && (
                  <p
                    className="font-sans text-sm font-light mb-6"
                    style={{ color: C.creamDim }}
                  >
                    {ev.jamMulai}
                    {ev.jamMulai && ev.jamSelesai && " - "}
                    {ev.jamSelesai}
                  </p>
                )}

                {/* Lokasi */}
                {(ev.namaLokasi || ev.alamat) && (
                  <div className="mb-5">
                    <div className="flex justify-center mb-2">
                      <MapPin size={14} strokeWidth={1.5} style={{ color: C.gold }} />
                    </div>
                    {ev.namaLokasi && (
                      <p
                        className="font-sans text-sm font-bold uppercase tracking-wide"
                        style={{ color: C.cream }}
                      >
                        {ev.namaLokasi}
                      </p>
                    )}
                    {ev.alamat && (
                      <p
                        className="font-sans text-xs font-light leading-relaxed mt-1"
                        style={{ color: C.creamDim }}
                      >
                        {ev.alamat}
                      </p>
                    )}
                  </div>
                )}

                {/* Google Map button */}
                {ev.maps && (
                  <a
                    href={ev.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-sans text-[11px] font-semibold tracking-wider transition-all hover:opacity-85"
                    style={{ background: C.cream, color: C.maroon }}
                  >
                    <MapPin size={11} strokeWidth={2} />
                    Google Map
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Spacer breathing room di akhir section */}
        <div className="h-12 w-full"></div>
    </div>
  );
}


/* ════════════════════════════════════════════════════
   SECTION 5 — Galeri
════════════════════════════════════════════════════ */
function GaleriSection({ galeri }: { galeri: string[] }) {
  if (!galeri?.length) return null;

  return (
    <section className="px-5 py-14">
      {/* Header — glassmorphism card */}
      <div
        className="text-center mb-8 mx-auto max-w-xs px-6 py-4 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
        }}
      >
        <SectionLabel>Momen Bersama</SectionLabel>
        <GoldLineShort className="my-3" />
        <SectionTitle><span className="text-[#3D2B1F]">Galeri</span></SectionTitle>
      </div>

      {/* Grid — landscape full width */}
      <div className="space-y-3 max-w-md mx-auto">
        {galeri.slice(0, 8).map((url, idx) => (
          <div
            key={idx}
            className="relative w-full overflow-hidden rounded-xl"
            style={{
              aspectRatio: "16/9",
              border: `1px solid ${C.creamBorder}`,
            }}
          >
            <Image
              src={url}
              alt={`Galeri ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 414px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 5B — Wedding Gift  (floating card)
════════════════════════════════════════════════════ */
function WeddingGiftSection({
  ed,
  isGiftOpen,
  setIsGiftOpen,
  handleCopy,
}: {
  ed: EventData;
  isGiftOpen: boolean;
  setIsGiftOpen: (v: boolean) => void;
  handleCopy: (text: string) => void;
}) {
  const hasRek1 = ed?.rek_1_bank || ed?.rek_1_no || ed?.rek_1_nama;
  const hasRek2 = ed?.rek_2_bank || ed?.rek_2_no || ed?.rek_2_nama;
  const hasGift = ed?.gift_penerima || ed?.gift_alamat;

  // Don't render if no gift data at all
  if (!hasRek1 && !hasRek2 && !hasGift) return null;

  /* Ornate corner flourish for premium cards */
  const cornerFlourish = (pos: "tl" | "tr" | "bl" | "br") => {
    const styles: Record<string, React.CSSProperties> = {
      tl: { top: 6, left: 6 },
      tr: { top: 6, right: 6, transform: "scaleX(-1)" },
      bl: { bottom: 6, left: 6, transform: "scaleY(-1)" },
      br: { bottom: 6, right: 6, transform: "scale(-1,-1)" },
    };
    return (
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        style={{ position: "absolute", ...styles[pos], opacity: 0.35 }}
      >
        <path d="M2 22 C2 12 12 2 22 2" stroke={C.gold} strokeWidth="1" />
        <circle cx="22" cy="2" r="1.5" fill={C.gold} />
        <circle cx="2" cy="22" r="1.5" fill={C.gold} />
      </svg>
    );
  };

  /* Premium ATM card renderer */
  const renderAtmCard = (bank: string, no: string, nama: string) => (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #2D1A0A 0%, #1A0A03 40%, #2D1A0A 80%, #1A0A03 100%)",
        border: `1.5px solid ${C.gold}`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,160,74,0.12), inset 0 -1px 0 rgba(201,160,74,0.06)`,
      }}
    >
      {/* Gold filigree corner flourishes */}
      {cornerFlourish("tl")}
      {cornerFlourish("tr")}
      {cornerFlourish("bl")}
      {cornerFlourish("br")}

      {/* Subtle center decorative line */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-14 w-24 h-px opacity-20"
        style={{ background: `linear-gradient(to right, transparent, ${C.gold}, transparent)` }}
      />

      {/* Row: Chip + Bank Name */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        {/* Premium gold chip */}
        <div
          className="w-11 h-8 rounded-md flex items-center justify-center relative"
          style={{
            background: "linear-gradient(135deg, #C9A04A 0%, #8B6914 50%, #C9A04A 100%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="w-7 h-4 rounded-sm"
            style={{ border: "1px solid rgba(255,255,255,0.3)" }}
          />
          {/* Chip circuit lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-px h-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>

        {/* Bank name — elegant serif */}
        <span
          className="font-serif font-bold text-2xl"
          style={{ color: C.gold, letterSpacing: "0.05em" }}
        >
          {bank}
        </span>
      </div>

      {/* Account number — clean monospace */}
      <div
        className="font-mono text-lg tracking-[0.2em] mb-2 relative z-10"
        style={{ color: C.cream }}
      >
        {no}
      </div>

      {/* Account name — uppercase, spaced */}
      <div
        className="text-[11px] uppercase tracking-[0.25em] font-medium relative z-10"
        style={{ color: C.creamDim }}
      >
        {nama}
      </div>

      {/* Copy button — premium dark + gold */}
      {no && (
        <button
          onClick={() => handleCopy(no)}
          className="absolute bottom-5 right-5 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-medium z-10"
          style={{
            background: "#2D1A0A",
            border: `1px solid ${C.gold}`,
            color: C.gold,
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
          </svg>
          Salin
        </button>
      )}

      {/* Bottom decorative line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-40"
        style={{ background: `linear-gradient(to right, transparent 10%, ${C.gold} 50%, transparent 90%)` }}
      />
    </div>
  );

  return (
    <div className="w-full px-4 py-12 flex justify-center relative z-10">

      {/* THE MAIN CARD — Floating Card */}
      <div className="bg-[#FDFBF7] border border-[#C5A880] rounded-3xl shadow-xl w-full max-w-md p-8 flex flex-col items-center relative overflow-hidden">

        <div className="text-center mb-7">
          <h2
            className="font-serif italic font-bold"
            style={{
              color: "#3D2B1F",
              fontSize: "clamp(2rem, 7vw, 2.5rem)",
            }}
          >
            Wedding Gift
          </h2>
          <div
            className="h-px mx-auto mt-3 max-w-[140px]"
            style={{ background: `linear-gradient(to right, transparent, ${C.gold}, transparent)` }}
          />
        </div>

        <p className="font-sans text-sm font-light leading-[2] text-center text-[#3D2B1F] max-w-xs mx-auto mb-6">
          Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan hadiah pernikahan dapat melalui virtual account atau e-wallet di bawah ini:
        </p>

        {/* Toggle Button */}
        <button
          onClick={() => setIsGiftOpen(!isGiftOpen)}
          className="bg-[#3D2B1F] hover:bg-[#2A1D15] text-white px-8 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-all font-medium text-sm tracking-wide mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {isGiftOpen ? "TUTUP" : "KLIK DISINI"}
        </button>

        {/* EXPANDED CONTENT — vertical stack inside card */}
        <AnimatePresence initial={false}>
          {isGiftOpen && (
            <motion.div
              key="gift-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden w-full"
            >
              <div className="mt-8 flex flex-col gap-4 w-full">

                {/* Kartu Rekening 1 */}
                {hasRek1 && renderAtmCard(
                  ed.rek_1_bank ?? "",
                  ed.rek_1_no ?? "",
                  ed.rek_1_nama ?? "",
                )}

                {/* Kartu Rekening 2 */}
                {hasRek2 && renderAtmCard(
                  ed.rek_2_bank ?? "",
                  ed.rek_2_no ?? "",
                  ed.rek_2_nama ?? "",
                )}

                {/* Kotak Kirim Hadiah — always visible */}
                {hasGift && (
                  <div
                    className="rounded-2xl p-6 text-center relative"
                    style={{
                      background: "linear-gradient(145deg, #2D1A0A 0%, #1A0A03 50%, #2D1A0A 100%)",
                      border: `1px solid ${C.gold}`,
                      boxShadow: `0 8px 32px rgba(0,0,0,0.25)`,
                    }}
                  >
                    <div className="flex justify-center mb-3">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" style={{ color: C.gold }}>
                        <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                        <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                      </svg>
                    </div>
                    <h4 className="font-serif font-bold italic text-lg mb-3" style={{ color: C.cream }}>
                      Kirim Hadiah
                    </h4>
                    {ed?.gift_penerima && (
                      <p className="text-sm mb-1 font-sans font-medium break-words w-full max-w-full" style={{ color: C.creamDim }}>
                        Nama Penerima : <strong style={{ color: C.cream }}>{ed.gift_penerima}</strong>
                      </p>
                    )}
                    {ed?.gift_alamat && (
                      <p className="text-sm leading-relaxed font-sans font-normal mt-2 break-words whitespace-normal text-center w-full px-2 max-w-full overflow-hidden" style={{ color: C.creamDim }}>
                        Alamat Kirim Hadiah : {ed.gift_alamat}
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
   SECTION 6 — Penutup (foto_cover sebagai background)
════════════════════════════════════════════════════ */
function PenutupSection({
  pria,
  wanita,
  ed,
}: {
  pria: string;
  wanita: string;
  ed: EventData;
}) {
  return (
    <section className="relative overflow-hidden text-center min-h-screen flex flex-col justify-center">
      {/* Background: foto cover full-bleed */}
      {ed?.foto_cover && (
        <div className="absolute inset-0">
          <Image
            src={ed.foto_cover}
            alt="Background Penutup"
            fill
            className="object-cover object-center"
            sizes="35vw"
          />
        </div>
      )}

      {/* Dark gradient overlay — elegan, teks tetap terbaca */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.70) 50%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Konten — relative di atas overlay */}
      <div className="relative z-10 px-6 py-20">
        {/* Ornament */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{
            background: "rgba(201,155,65,0.18)",
            border: `1px solid ${C.gold}`,
          }}
        >
          <Heart size={18} strokeWidth={1.5} style={{ color: C.gold }} />
        </div>

        <SectionLabel>Dengan Hormat</SectionLabel>
        <GoldLineShort className="my-4" />

        <h2
          className="font-serif text-3xl font-bold mb-8"
          style={{ color: "#fff" }}
        >
          {pria} &amp; {wanita}
        </h2>

        <p
          className="font-sans text-sm font-light leading-[2] max-w-xs mx-auto mb-4"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
          Bapak / Ibu / Saudara/i berkenan hadir dan memberikan doa restu.
          Atas kehadiran dan doa restunya kami ucapkan terima kasih.
        </p>

        <p
          className="font-serif text-base font-semibold mb-1"
          style={{ color: "#fff" }}
        >
          Wassalamualaikum Wr. Wb.
        </p>

        <GoldLine className="max-w-[80px] mx-auto mt-12 mb-8" />

        <p
          className="font-sans text-[9px] tracking-[0.3em] uppercase"
          style={{ color: C.gold }}
        >
          Original Design By: Atora
        </p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   ROOT PAGE
════════════════════════════════════════════════════ */
export default function InvitationPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const clientSlug = params?.clientSlug as string;
  const guestName = decodeURIComponent(searchParams?.get("to") ?? "");

  const [invitation, setInvitation] = useState<InvitationRow | null>(null);
  const [guest, setGuest] = useState<GuestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [opened, setOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const audioRef      = useRef<HTMLAudioElement>(null);

  /* ── Copy to clipboard ── */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Nomor rekening disalin!");
  };

  /* ── Fetch ── */
  useEffect(() => {
    if (!clientSlug) return;
    const run = async () => {
      const { data: inv, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("slug", clientSlug)
        .single();

      if (error || !inv) { setNotFound(true); setLoading(false); return; }
      setInvitation(inv as InvitationRow);

      if (guestName) {
        const { data: g } = await supabase
          .from("guests")
          .select("*")
          .eq("invitation_id", inv.id)
          .ilike("name", guestName)
          .maybeSingle();
        if (g) setGuest(g as GuestRow);
      }
      setLoading(false);
    };
    run();
  }, [clientSlug, guestName]);

  /* ── Open handler: reveal content + trigger music (bypass autoplay) ── */
  const handleOpen = () => {
    setOpened(true);
    /* Play music — must be triggered inside user gesture */
    audioRef.current?.play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
    setTimeout(() => {
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById("sec-quote")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 80);
  };

  /* ── FAB music toggle ── */
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.cream }}
      >
        <div className="text-center space-y-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto animate-spin"
            style={{ borderColor: C.gold, borderTopColor: "transparent" }}
          />
          <p className="font-sans text-sm font-light tracking-wider" style={{ color: C.textMid }}>
            Memuat undangan...
          </p>
        </div>
      </div>
    );
  }

  /* ── 404 ── */
  if (notFound || !invitation) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-center px-6"
        style={{ background: C.cream }}
      >
        <div>
          <p className="font-serif text-2xl mb-2" style={{ color: C.maroon }}>
            Undangan tidak ditemukan
          </p>
          <p className="font-sans text-sm font-light" style={{ color: C.textMid }}>
            URL undangan tidak valid atau sudah tidak aktif.
          </p>
        </div>
      </div>
    );
  }

  const ed = invitation.event_data;
  const pria = ed?.mempelai_pria?.nama ?? "—";
  const wanita = ed?.mempelai_wanita?.nama ?? "—";
  const display = guest?.name ?? guestName;

  /* ── Content stack (Sections 2-6) ── */
  const ContentSections = (
    <>
      <div id="sec-quote">
        <QuoteSection ed={ed} />
      </div>

      {/* ═══════════════════════════════════════════════════
          UNIFIED CONTAINER — Mukaddimah + Save The Date
          Deep Warm Beige (#E9DCC7) — full-width, no margin
      ═══════════════════════════════════════════════════ */}
      <div className="w-full bg-[#E9DCC7]/95 pb-0 overflow-hidden flex flex-col relative">

        {/* 1. PEMBATAS ATAS (mentok karena parent px-0) */}
        <img
          src="/templates/basic/basic-1/basic-1-pembatas.png"
          alt="pembatas"
          aria-hidden="true"
          className="w-full h-6 md:h-8 object-cover"
        />

        {/* Seksi Mukaddimah (Biodata) */}
        <BiodataSection ed={ed} />

        {/* 2. PEMBATAS TENGAH */}
        <img
          src="/templates/basic/basic-1/basic-1-pembatas.png"
          alt="pembatas"
          aria-hidden="true"
          className="w-full h-6 md:h-8 object-cover"
        />

        {/* Seksi Save The Date (Jadwal) */}
        <JadwalSection ed={ed} />

        {/* Spacer agar tombol/kartu di atasnya tidak nabrak pembatas */}
        <div className="h-10 md:h-14 w-full"></div>

        {/* Gambar Pembatas Mentok Bawah */}
        <img src="/templates/basic/basic-1/basic-1-pembatas.png" className="w-full h-6 md:h-8 object-cover block" alt="pembatas bawah" />
      </div>

      <GaleriSection galeri={ed?.galeri ?? []} />

      {/* ═══════════════════════════════════════════════════
          WEDDING GIFT
      ═══════════════════════════════════════════════════ */}
      <WeddingGiftSection
        ed={ed}
        isGiftOpen={isGiftOpen}
        setIsGiftOpen={setIsGiftOpen}
        handleCopy={handleCopy}
      />

      <PenutupSection pria={pria} wanita={wanita} ed={ed} />
    </>
  );

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div style={{ background: C.cream }}>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/templates/basic/basic-1/basic-1-music.mp3"
        loop
        preload="auto"
      />

      {/* Floating Music Button (FAB) */}
      {opened && (
        <button
          id="fab-music"
          onClick={toggleMusic}
          aria-label={isPlaying ? "Pause musik" : "Play musik"}
          className="fixed bottom-6 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{
            background: C.gold,
            boxShadow: "0 4px 18px rgba(0,0,0,0.30)",
          }}
        >
          {isPlaying ? (
            <Music2 size={20} strokeWidth={2} className="text-white" />
          ) : (
            <VolumeX size={20} strokeWidth={2} className="text-white" />
          )}
        </button>
      )}

      {/* ═══════════ DESKTOP SPLIT-SCREEN ═══════════ */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden">

        {/* LEFT — foto cover + teks overlay (flex-1, isi sisa ruang) */}
        <div className="template-left-panel flex-1 relative">
          <CoverWithText ed={ed} />
        </div>

        {/* RIGHT — lebar tetap 414px (ukuran layar HP besar), batik ter-clip otomatis */}
        <div
          ref={rightPanelRef}
          className="template-right-panel w-[414px] shrink-0 scrollbar-hide"
          style={{
            backgroundImage: `url('${FIXED_BG}')`,
            backgroundAttachment: "scroll", // fixed relative to element, bukan viewport
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Opening section always at top */}
          <OpeningSection
            invitation={invitation}
            guestName={display}
            onOpen={handleOpen}
            opened={opened}
          />

          {/* Content sections revealed after open */}
          {opened && ContentSections}
        </div>
      </div>

      {/* ═══════════ MOBILE — hanya kolom kanan ═══════════ */}
      <div
        className="lg:hidden"
        style={{
          backgroundImage: `url('${FIXED_BG}')`,
          backgroundAttachment: "fixed",  /* fixed to viewport = tidak scroll, lebar = layar HP */
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* OpeningSection saja (foto bg + nama + Kepada Yth + button) */}
        <OpeningSection
          invitation={invitation}
          guestName={display}
          onOpen={handleOpen}
          opened={opened}
        />
        {/* Content sections setelah buka */}
        {opened && ContentSections}
      </div>
    </div>
  );
}
