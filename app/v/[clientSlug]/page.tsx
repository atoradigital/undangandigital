"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import type { EventData } from "@/types/admin";
import {
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Heart,
  ChevronDown,
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
   Color Palette — Navy · Lime · Purple (batik palette)
════════════════════════════════════════════════════ */
const C = {
  navy: "#1A1640",   // dominant background color
  navyMid: "#211C52",   // slightly lighter navy
  navyLight: "#2D2870",   // card/section bg
  purple: "#7B4FA6",   // motif accent
  purpleLight: "#9B6EC4",
  lime: "#A8C23A",   // bright accent from batik
  limeLight: "#C3DC52",
  cream: "#F5F0E8",   // text on dark bg
  creamDim: "#C8C0A8",   // subdued cream
  white: "#FFFFFF",
  // keep maroon for cover section (couple's photo has maroon tones)
  maroon: "#4A1522",
  maroonDeep: "#3A1018",
  gold: "#C99B41",
  goldDim: "rgba(201,155,65,0.22)",
  // Aliases untuk backward-compat dengan kode section lama
  creamDark: "#211C52",
  creamBorder: "rgba(168,194,58,0.30)",
  textDark: "#F5F0E8",
  textMid: "#C8C0A8",
  // Section backgrounds
  sectionBg: "rgba(26,22,64,0.88)",
  cardBg: "rgba(33,28,82,0.92)",
  cardBorder: "rgba(168,194,58,0.30)",
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
          priority
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
            priority
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
        {ed?.foto_cover && (
          <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
            <Image
              src={ed.foto_cover}
              alt="Foto Mempelai"
              fill
              className="object-cover object-top"
              sizes="320px"
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
   SECTION 3 — Biodata Mempelai
════════════════════════════════════════════════════ */
function BiodataSection({ ed }: { ed: EventData }) {
  const mempelai = [
    { role: "Mempelai Pria", nama: ed.mempelai_pria?.nama ?? "—", foto: ed.mempelai_pria?.foto_url },
    { role: "Mempelai Wanita", nama: ed.mempelai_wanita?.nama ?? "—", foto: ed.mempelai_wanita?.foto_url },
  ];

  return (
    <section
      className="px-5 pt-12 pb-14"
      style={{ background: C.sectionBg }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <SectionLabel>Bersama Keluarga</SectionLabel>
        <GoldLineShort className="my-3" />
        <SectionTitle>Kami Mengundang</SectionTitle>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-md mx-auto">
        {mempelai.map((m) => (
          <div
            key={m.role}
            className="rounded-2xl overflow-hidden text-center"
            style={{
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              boxShadow: "0 4px 24px rgba(10,8,40,0.25)",
            }}
          >
            {/* Photo — circle with gold ring */}
            <div className="flex justify-center pt-8 pb-4">
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden"
                style={{
                  border: `3px solid ${C.gold}`,
                  boxShadow: `0 0 0 6px ${C.creamDark}, 0 0 0 7px ${C.creamBorder}`,
                }}
              >
                {m.foto ? (
                  <Image
                    src={m.foto}
                    alt={m.nama}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: C.creamDark }}
                  >
                    <Heart size={28} style={{ color: C.gold }} strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="px-5 pb-7">
              <p
                className="font-sans text-[8px] uppercase tracking-[0.4em] mb-2 font-medium"
                style={{ color: C.lime }}
              >
                {m.role}
              </p>
              <GoldLineShort className="mb-3" />
              <h3
                className="font-serif text-lg font-bold leading-snug"
                style={{ color: C.navy }}
              >
                {m.nama}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 4 — Tanggal & Lokasi
════════════════════════════════════════════════════ */
function JadwalSection({ ed }: { ed: EventData }) {
  const events = [
    {
      id: "akad",
      label: "Akad Nikah",
      tanggal: formatTanggal(ed.jadwal_akad?.tanggal ?? ""),
      tanggalShort: formatTanggalShort(ed.jadwal_akad?.tanggal ?? ""),
      jamMulai: fj(ed.jadwal_akad?.jam_mulai ?? ""),
      jamSelesai: fj(ed.jadwal_akad?.jam_selesai ?? ""),
      alamat: ed.lokasi?.alamat ?? "",
      maps: ed.lokasi?.maps_url ?? "",
    },
    {
      id: "resepsi",
      label: "Resepsi Pernikahan",
      tanggal: formatTanggal(ed.jadwal_resepsi?.tanggal ?? ""),
      tanggalShort: formatTanggalShort(ed.jadwal_resepsi?.tanggal ?? ""),
      jamMulai: fj(ed.jadwal_resepsi?.jam_mulai ?? ""),
      jamSelesai: fj(ed.jadwal_resepsi?.jam_selesai ?? ""),
      alamat: ed.lokasi?.alamat ?? "",
      maps: ed.lokasi?.maps_url ?? "",
    },
  ];

  return (
    <section
      className="px-5 py-14"
      style={{ background: "rgba(26,22,64,0.82)" }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <SectionLabel>Waktu &amp; Tempat</SectionLabel>
        <GoldLineShort className="my-3" />
        <SectionTitle>Jadwal Acara</SectionTitle>
      </div>

      {/* Event cards */}
      <div className="space-y-5 max-w-md mx-auto">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="rounded-2xl px-7 py-7"
            style={{
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              boxShadow: "0 4px 20px rgba(10,8,40,0.3)",
            }}
          >
            {/* Event label */}
            <div className="text-center mb-5">
              <p
                className="font-sans text-[9px] uppercase tracking-[0.4em] font-semibold mb-1"
                style={{ color: C.lime }}
              >
                {ev.label}
              </p>
              <GoldLineShort />
            </div>

            {/* Date highlight */}
            {ev.tanggalShort && (
              <div
                className="text-center py-3 px-4 rounded-xl mb-4"
                style={{ background: `rgba(168,194,58,0.10)`, border: `1px solid rgba(168,194,58,0.25)` }}
              >
                <p
                  className="font-serif text-xl font-bold tracking-wide"
                  style={{ color: C.cream }}
                >
                  {ev.tanggalShort}
                </p>
                {ev.tanggal && (
                  <p
                    className="font-sans text-[10px] font-light mt-1"
                    style={{ color: C.creamDim }}
                  >
                    {ev.tanggal}
                  </p>
                )}
              </div>
            )}

            {/* Time */}
            {(ev.jamMulai || ev.jamSelesai) && (
              <div className="flex items-center gap-2.5 mb-3">
                <Clock size={13} strokeWidth={1.5} style={{ color: C.lime, flexShrink: 0 }} />
                <p className="font-sans text-sm font-light" style={{ color: C.cream }}>
                  {ev.jamMulai}
                  {ev.jamMulai && ev.jamSelesai && " — "}
                  {ev.jamSelesai}
                </p>
              </div>
            )}

            {/* Alamat */}
            {ev.alamat && (
              <div className="flex items-start gap-2.5 mb-4">
                <MapPin size={13} strokeWidth={1.5} className="mt-0.5" style={{ color: C.lime, flexShrink: 0 }} />
                <p className="font-sans text-sm font-light leading-relaxed" style={{ color: C.cream }}>
                  {ev.alamat}
                </p>
              </div>
            )}

            {/* Maps button */}
            {ev.maps && (
              <a
                href={ev.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-sans font-light tracking-wider transition-all hover:opacity-80"
                style={{
                  background: C.navy,
                  color: C.cream,
                }}
              >
                <ExternalLink size={11} strokeWidth={2} />
                Google Maps
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 5 — Galeri
════════════════════════════════════════════════════ */
function GaleriSection({ galeri }: { galeri: string[] }) {
  if (!galeri?.length) return null;

  return (
    <section className="px-5 py-14" style={{ background: C.sectionBg }}>
      {/* Header */}
      <div className="text-center mb-8">
        <SectionLabel>Momen Bersama</SectionLabel>
        <GoldLineShort className="my-3" />
        <SectionTitle>Galeri</SectionTitle>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto">
        {galeri.slice(0, 8).map((url, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl ${idx === 0 ? "row-span-2" : ""}`}
            style={{
              aspectRatio: "1/1",
              border: `1px solid ${C.creamBorder}`,
            }}
          >
            <Image
              src={url}
              alt={`Galeri ${idx + 1}`}
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SECTION 6 — Penutup
════════════════════════════════════════════════════ */
function PenutupSection({ pria, wanita }: { pria: string; wanita: string }) {
  return (
    <section
      className="px-6 py-20 text-center"
      style={{ background: C.creamDark }}
    >
      {/* Ornament */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-8"
        style={{
          background: `rgba(201,155,65,0.12)`,
          border: `1px solid ${C.gold}`,
        }}
      >
        <Heart size={18} strokeWidth={1.5} style={{ color: C.gold }} />
      </div>

      <SectionLabel>Dengan Hormat</SectionLabel>
      <GoldLineShort className="my-4" />

      <h2
        className="font-serif text-3xl font-bold mb-8"
        style={{ color: C.cream }}
      >
        {pria} &amp; {wanita}
      </h2>

      <p
        className="font-sans text-sm font-light leading-[2] max-w-xs mx-auto mb-4"
        style={{ color: C.textMid }}
      >
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
        Bapak / Ibu / Saudara/i berkenan hadir dan memberikan doa restu.
        Atas kehadiran dan doa restunya kami ucapkan terima kasih.
      </p>

      <p
        className="font-serif text-base font-semibold mb-1"
        style={{ color: C.maroon }}
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

  const rightPanelRef = useRef<HTMLDivElement>(null);

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

  /* ── Open handler ── */
  const handleOpen = () => {
    setOpened(true);
    setTimeout(() => {
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById("sec-quote")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 80);
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
      <BiodataSection ed={ed} />
      <JadwalSection ed={ed} />
      <GaleriSection galeri={ed?.galeri ?? []} />
      <PenutupSection pria={pria} wanita={wanita} />
    </>
  );

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div style={{ background: C.cream }}>

      {/* ═══════════ DESKTOP SPLIT-SCREEN ═══════════ */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden">

        {/* LEFT — foto cover + teks overlay (65%) */}
        <div className="template-left-panel w-[65%] shrink-0 relative">
          <CoverWithText ed={ed} />
        </div>

        {/* RIGHT — scrollable content (35%) — batik bg fixed to this column */}
        <div
          ref={rightPanelRef}
          className="template-right-panel w-[35%] scrollbar-hide"
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
      <div className="lg:hidden">
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
