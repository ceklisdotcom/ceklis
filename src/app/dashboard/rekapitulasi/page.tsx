import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getRekapitulasiWilayahAction } from "@/app/dashboard/rekapitulasi/actions"
import { RekapitulasiClient } from "./rekapitulasi-client"

export const metadata = {
  title: "Rekapitulasi Data Berjenjang Kota Tegal - Ceklis",
  description: "Rekapitulasi agregat per kelurahan dan kecamatan Kota Tegal: Siswa PAUD, Verifikasi RT, MBR, dan Stunting Posyandu",
}

export default async function RekapitulasiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const rekapitulasiData = await getRekapitulasiWilayahAction()

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <RekapitulasiClient
          initialData={rekapitulasiData}
          userEmail={user.email}
        />
      </main>
    </div>
  )
}
