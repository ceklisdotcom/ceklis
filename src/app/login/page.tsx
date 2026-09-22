import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "./login-form"

export const metadata = {
  title: "Masuk - Ceklis",
  description: "Masuk ke akun Ceklis Komunitas Anda",
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-radial from-muted/60 via-background to-background">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
