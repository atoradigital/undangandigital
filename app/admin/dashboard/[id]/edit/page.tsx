"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { type Invitation } from "@/types/admin";
import BasicPackageForm from "@/components/admin/BasicPackageForm";

export default function EditInvitationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Undangan tidak ditemukan.");
      } else {
        setInvitation(data as Invitation);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} strokeWidth={1.5} className="animate-spin text-[#C9A961]" />
          <p className="font-sans text-sm text-[#5C4A37]/60 font-light">Memuat data undangan...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <p className="font-serif text-lg text-[#3A3429] mb-2">{error || "Data tidak ditemukan."}</p>
          <a href="/admin/dashboard" className="font-sans text-sm text-[#C9A961] hover:underline">
            ← Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <BasicPackageForm initialData={invitation} />;
}
