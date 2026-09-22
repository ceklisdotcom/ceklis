import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { fetchWilayahTegalAction } from "@/app/auth/actions"
import { RegisterForm } from "./register-form"

export const metadata = {
  title: "Pendaftaran Akun - Ceklis",
  description: "Daftar akun baru Ceklis untuk komunitas RT, Posyandu, atau Sekolah di Kota Tegal",
}

export default async function RegisterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  const wilayahList = await fetchWilayahTegalAction()

  return (
    <main className="min-h-screen py-10 px-4 flex items-center justify-center bg-radial from-muted/60 via-background to-background">
      <div className="w-full max-w-2xl">
        <RegisterForm wilayahList={wilayahList} />
      </div>
    </main>
  )
}
