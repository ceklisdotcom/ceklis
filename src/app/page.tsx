import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Home as HomeIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export const metadata = {
  title: "Ceklis - Platform Kolaborasi Komunitas Kota Tegal",
  description: "Platform terpadu untuk koordinasi komunitas RT, Posyandu, dan Sekolah di Kota Tegal",
}

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col bg-radial from-muted/50 via-background to-background">
      {/* Header */}
      <header className="w-full border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-xs">
              C
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">Ceklis</span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">
                Kota Tegal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="gap-2">
                  <span>Buka Dashboard</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="gap-1.5 shadow-xs">
                    <span>Daftar</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center max-w-4xl space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-muted/60 text-foreground shadow-2xs">
          <Sparkles className="size-3.5 text-primary" />
          <span>Platform Kolaborasi Komunitas Terpadu</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Kelola Ceklis & Komunitas Anda di{" "}
          <span className="bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Kota Tegal
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Satu platform terintegrasi untuk pendataan, verifikasi, dan koordinasi rukun tetangga, pos pelayanan terpadu, serta institusi pendidikan.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
          {user ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 h-12 shadow-md">
                Ke Dashboard Utama
                <ArrowRight className="size-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 h-12 shadow-md">
                  Mulai Pendaftaran
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                  Sudah Punya Akun? Masuk
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 3 Pillars of Communities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16 text-left">
          <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur-xs shadow-xs space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="size-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <HomeIcon className="size-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Rukun Tetangga (RT)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manajemen kependudukan warga, ronda malam, iuran, dan pendataan domisili di Kota Tegal.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur-xs shadow-xs space-y-3 hover:border-rose-500/40 transition-colors">
            <div className="size-11 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <HeartHandshake className="size-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">POSYANDU</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ceklis penimbangan balita, pemantauan imunisasi, vitamin A, dan layanan kesehatan lansia.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur-xs shadow-xs space-y-3 hover:border-blue-500/40 transition-colors">
            <div className="size-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="size-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Institusi Sekolah</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Koordinasi tenaga pendidik, pemantauan kehadiran, dan keterlibatan wali murid sekolah.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-background">
        <div className="container mx-auto px-4">
          <p>© 2026 Ceklis Kota Tegal. Platform Komunitas Terpadu.</p>
        </div>
      </footer>
    </div>
  )
}
