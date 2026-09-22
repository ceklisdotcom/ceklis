import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { signOutAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  HeartHandshake,
  Home,
  IdCard,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react"

export const metadata = {
  title: "Dashboard - Ceklis",
  description: "Dashboard Utama Komunitas Ceklis",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch profile if table exists, fallback to user_metadata
  let profileData: Record<string, any> | null = null
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profileData = data
  } catch {
    profileData = null
  }

  const meta = user.user_metadata || {}
  const fullName = profileData?.full_name || meta.full_name || user.email?.split("@")[0] || "Pengguna"
  const community = (profileData?.community || meta.community || "RT").toUpperCase()
  const role = profileData?.role || meta.role || "Anggota"
  const nik = profileData?.nik || meta.nik || "-"
  const phone = profileData?.phone || meta.phone || "-"
  const kecamatan = profileData?.kecamatan || meta.kecamatan || "-"
  const kelurahan = profileData?.kelurahan || meta.kelurahan || "-"
  const rw = profileData?.rw || meta.rw || "-"
  const rt = profileData?.rt || meta.rt || "-"

  const getCommunityBadge = (type: string) => {
    switch (type) {
      case "POSYANDU":
        return {
          icon: <HeartHandshake className="size-4 text-rose-600 dark:text-rose-400" />,
          label: "POSYANDU",
          sub: "Pos Pelayanan Terpadu",
          badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900",
          cardAccent: "border-l-4 border-l-rose-500",
        }
      case "SEKOLAH":
        return {
          icon: <GraduationCap className="size-4 text-blue-600 dark:text-blue-400" />,
          label: "SEKOLAH",
          sub: "Institusi Pendidikan",
          badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900",
          cardAccent: "border-l-4 border-l-blue-500",
        }
      case "RT":
      default:
        return {
          icon: <Home className="size-4 text-emerald-600 dark:text-emerald-400" />,
          label: "RUKUN TETANGGA (RT)",
          sub: "Komunitas Lingkungan & Warga",
          badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
          cardAccent: "border-l-4 border-l-emerald-500",
        }
    }
  }

  const commConfig = getCommunityBadge(community)

  // Checklist activity samples based on community
  const getActivities = (type: string) => {
    switch (type) {
      case "POSYANDU":
        return [
          { title: "Penimbangan & Pengukuran Balita", status: "Selesai", date: "Bulan Ini" },
          { title: "Pemberian Vitamin A & Imunisasi", status: "Terjadwal", date: "Minggu Depan" },
          { title: "Pemeriksaan Kesehatan Ibu Hamil", status: "Terjadwal", date: "Tgl 25" },
        ]
      case "SEKOLAH":
        return [
          { title: "Presensi & Kehadiran Kelas PAUD", status: "Aktif", date: "Hari Ini" },
          { title: "Deteksi Dini Tumbuh Kembang (DDTK)", status: "Terjadwal", date: "Bulan Ini" },
          { title: "Distribusi PMT-AS (Makanan Tambahan)", status: "Selesai", date: "Minggu Lalu" },
        ]
      case "RT":
      default:
        return [
          { title: "Pencatatan Tamu / Pendatang Baru", status: "Aktif", date: "Hari Ini" },
          { title: "Jadwal Ronda Malam & Keamanan", status: "Aktif", date: "Malam Ini" },
          { title: "Kerja Bakti Kebersihan Lingkungan", status: "Terjadwal", date: "Hari Minggu" },
        ]
    }
  }

  const activities = getActivities(community)

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs font-bold text-lg">
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
            <div className="hidden md:flex items-center gap-2 text-xs bg-muted px-3 py-1.5 rounded-lg border">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">{user.email}</span>
            </div>

            <form action={signOutAction}>
              <Button variant="outline" size="sm" type="submit" className="gap-1.5">
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6 max-w-6xl">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-radial from-primary/10 via-primary/5 to-background border p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs bg-background">
                {commConfig.icon}
                <span>Komunitas {commConfig.label}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Selamat Datang, <span className="text-primary">{fullName}</span>!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Anda terdaftar sebagai <strong>{role}</strong> di lingkungan{" "}
                <strong>
                  RT {rt} / RW {rw}, Kel. {kelurahan}, Kec. {kecamatan}, Kota Tegal
                </strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold border ${commConfig.badgeBg}`}>
                Peran: {role}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border bg-background text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Akun Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* Featured App Modules Banner */}
        <div className="p-4 sm:p-5 rounded-2xl border bg-card/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="size-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>Modul Sekolah PAUD & Siswa (Dapodik)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  Baru
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Kelola data peserta didik PAUD, rombel (Kelompok A/B), NIK, NISN, status DDTK & PMT-AS dengan fitur Switch Role (Kepala Sekolah, Operator, Guru).
              </p>
            </div>
          </div>

          <Link href="/dashboard/school/students" className="shrink-0">
            <Button className="gap-2 shadow-xs w-full sm:w-auto">
              <span>Buka Data Siswa PAUD</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        {/* 3-Column Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Identitas Profil */}
          <Card className="shadow-xs border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <User className="size-4" />
                <span>Identitas Pengguna</span>
              </div>
              <CardTitle className="text-lg">Profil Utama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs">Nama Lengkap</span>
                <span className="font-semibold text-right">{fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <IdCard className="size-3.5" /> NIK
                </span>
                <span className="font-mono text-xs font-semibold">{nik}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <Phone className="size-3.5" /> No. HP
                </span>
                <span className="font-medium">{phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <Mail className="size-3.5" /> Email
                </span>
                <span className="font-medium text-xs truncate max-w-[150px]">{user.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Komunitas & Peran */}
          <Card className={`shadow-xs border ${commConfig.cardAccent}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Building2 className="size-4" />
                <span>Komunitas & Peran</span>
              </div>
              <CardTitle className="text-lg">{commConfig.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs">Jenis Komunitas</span>
                <span className="font-semibold">{community}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <ShieldCheck className="size-3.5" /> Jabatan / Role
                </span>
                <span className="font-bold text-primary">{role}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs">Lingkup</span>
                <span className="font-medium text-xs">{commConfig.sub}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <Users className="size-3.5" /> Status Keanggotaan
                </span>
                <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Aktif
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Wilayah & Lokasi */}
          <Card className="shadow-xs border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <MapPin className="size-4" />
                <span>Wilayah Domisili</span>
              </div>
              <CardTitle className="text-lg">Kota Tegal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs">Kecamatan</span>
                <span className="font-semibold">Kec. {kecamatan}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs">Kelurahan</span>
                <span className="font-semibold">Kel. {kelurahan}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground text-xs">Rukun Warga (RW)</span>
                <span className="font-medium">RW {rw}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Rukun Tetangga (RT)</span>
                <span className="font-medium">RT {rt}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ceklis & Kegiatan Komunitas Section */}
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <FileCheck className="size-4" />
                <span>Ceklis & Aktivitas</span>
              </div>
              <CardTitle className="text-xl mt-1">Daftar Ceklis Komunitas {community}</CardTitle>
              <CardDescription>
                Aktivitas dan verifikasi rutin di lingkungan kerja Anda
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1.5 shadow-2xs">
              <CheckCircle2 className="size-4" />
              <span>Buat Ceklis Baru</span>
            </Button>
          </CardHeader>

          <CardContent>
            <div className="divide-y divide-border/60 rounded-xl border bg-card">
              {activities.map((act, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{act.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span>{act.date}</span>
                        <span>•</span>
                        <span>Komunitas {community}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        act.status === "Selesai"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                      }`}
                    >
                      {act.status}
                    </span>
                    <Button variant="outline" size="xs">
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
