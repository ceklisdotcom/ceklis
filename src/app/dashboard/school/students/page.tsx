import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getPaudStudentsAction } from "@/app/dashboard/school/actions"
import { fetchWilayahTegalAction } from "@/app/auth/actions"
import { StudentsClient } from "./students-client"

export const metadata = {
  title: "Kelola Peserta Didik PAUD - Ceklis",
  description: "Pengelolaan Peserta Didik PAUD berbasis Dapodik Kota Tegal, DDTK, dan PMT-AS",
}

export default async function SchoolStudentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [students, wilayahList] = await Promise.all([
    getPaudStudentsAction(),
    fetchWilayahTegalAction(),
  ])

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <StudentsClient
          initialStudents={students}
          wilayahList={wilayahList}
          userEmail={user.email}
        />
      </main>
    </div>
  )
}
