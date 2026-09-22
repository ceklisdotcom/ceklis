import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getRtVerificationsAction } from "@/app/dashboard/rt/actions"
import { fetchWilayahTegalAction } from "@/app/auth/actions"
import { VerificationClient } from "./verification-client"

export const metadata = {
  title: "Verifikasi Domisili & Status MBR - Pengurus RT",
  description: "Verifikasi domisili tempat tinggal warga, siswa PAUD, dan penetapan kategori MBR oleh Pengurus RT Kota Tegal",
}

export default async function RtVerificationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [initialItems, wilayahList] = await Promise.all([
    getRtVerificationsAction(),
    fetchWilayahTegalAction(),
  ])

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <VerificationClient
          initialItems={initialItems}
          wilayahList={wilayahList}
          userEmail={user.email}
        />
      </main>
    </div>
  )
}
