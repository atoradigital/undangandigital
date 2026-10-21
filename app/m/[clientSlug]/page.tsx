import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CustomerPortalClient from "./CustomerPortalClient";

/* ── Supabase (server-side) ── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

/* ── Types ── */
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

/* ── Metadata ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}): Promise<Metadata> {
  const { clientSlug } = await params;
  const { data } = await supabase
    .from("invitations")
    .select("title")
    .eq("slug", clientSlug)
    .single();

  return {
    title: data ? `Kirim Undangan — ${data.title}` : "Portal Undangan",
    description:
      "Portal mandiri untuk mengirim undangan digital via WhatsApp. Buat link tamu dan kirim langsung.",
  };
}

/* ── Page ── */
export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;

  const { data, error } = await supabase
    .from("invitations")
    .select("id, title, slug, broadcast_template, event_data")
    .eq("slug", clientSlug)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C9A961"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
          <h1 className="font-serif text-xl font-bold text-[#3A3429] mb-2">
            Undangan Tidak Ditemukan
          </h1>
          <p className="font-sans text-sm text-[#5C4A37]/60 font-light leading-relaxed">
            Link ini tidak valid atau undangan yang Anda cari belum tersedia. Silakan hubungi penyelenggara acara.
          </p>
        </div>
      </div>
    );
  }

  const invitation = data as InvitationData;

  return <CustomerPortalClient invitation={invitation} />;
}
