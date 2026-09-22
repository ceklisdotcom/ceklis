import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getHealthRecordsAction } from "@/app/dashboard/posyandu/actions"
import { getPaudStudentsAction } from "@/app/dashboard/school/actions"
import { fetchWilayahTegalAction } from "@/app/auth/actions"
import { HealthRecordsClient } from "./health-records-client"

export const metadata = {
  title: "Layanan Posyandu & Tumbuh Kembang (KMS) - Ceklis",
  description: "Pencatatan antropometri penimbangan balita & siswa PAUD, deteksi stunting, dan DDTK Kota Tegal",
}

export default async function PosyanduHealthRecordsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [initialRecords, studentsList, wilayahList] = await Promise.all([
    getHealthRecordsAction(),
    getPaudStudentsAction(),
    fetchWilayahTegalAction(),
  ])

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <HealthRecordsClient
          initialRecords={initialRecords}
          studentsList={studentsList}
          wilayahList={wilayahList}
          userEmail={user.email}
        />
      </main>
    </div>
  )
}
