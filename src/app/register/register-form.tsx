"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import { registerAction, type AuthState } from "@/app/auth/actions"
import { COMMUNITIES, type CommunityType, type WilayahTegalItem } from "@/lib/constants/wilayah"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  HeartHandshake,
  GraduationCap,
  Home,
  IdCard,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react"

interface RegisterFormProps {
  wilayahList: WilayahTegalItem[]
}

export function RegisterForm({ wilayahList }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerAction, null as AuthState | null)

  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType>("RT")
  const [selectedRole, setSelectedRole] = useState<string>("Penduduk")
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("Margadana")
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("")

  // Available communities definition
  const currentCommunity = useMemo(() => {
    return COMMUNITIES.find((c) => c.value === selectedCommunity) || COMMUNITIES[0]
  }, [selectedCommunity])

  // Extract unique kecamatans
  const kecamatanOptions = useMemo(() => {
    const set = new Set(wilayahList.map((item) => item.kecamatan))
    return Array.from(set).sort()
  }, [wilayahList])

  // Filter kelurahans based on selected kecamatan
  const kelurahanOptions = useMemo(() => {
    return wilayahList
      .filter((item) => item.kecamatan === selectedKecamatan)
      .map((item) => item.kelurahan)
      .sort()
  }, [wilayahList, selectedKecamatan])

  // Set default kelurahan when kecamatan changes
  React.useEffect(() => {
    if (kelurahanOptions.length > 0 && !kelurahanOptions.includes(selectedKelurahan)) {
      setSelectedKelurahan(kelurahanOptions[0])
    }
  }, [kelurahanOptions, selectedKelurahan])

  // When community changes, reset role to the first one in community
  const handleCommunityChange = (val: CommunityType) => {
    setSelectedCommunity(val)
    const comm = COMMUNITIES.find((c) => c.value === val)
    if (comm && comm.roles.length > 0) {
      setSelectedRole(comm.roles[0].value)
    }
  }

  return (
    <Card className="w-full max-w-2xl border-border/60 shadow-xl backdrop-blur-xs">
      <CardHeader className="text-center pb-6 border-b border-border/40">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-xs">
          <CheckCircle2 className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Pendaftaran Pengguna Baru</CardTitle>
        <CardDescription className="text-muted-foreground text-sm max-w-md mx-auto">
          Lengkapi data identitas, komunitas, dan wilayah domisili Anda di Kota Tegal
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-6 pt-6">
          {state?.error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-destructive text-sm animate-in fade-in-50">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {state?.message && state.success && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300 text-sm animate-in fade-in-50">
              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{state.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Silakan menuju ke halaman{" "}
                  <Link href="/login" className="underline font-bold text-primary">
                    Login
                  </Link>{" "}
                  untuk masuk.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Akun & Login */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-1.5">
              <Mail className="size-4 text-primary" />
              <span>1. Informasi Akun</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Alamat Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Kata Sandi <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm font-medium">
                  Konfirmasi Kata Sandi <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="Ulangi kata sandi"
                    required
                    minLength={6}
                    className="pl-9 h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Identitas Diri */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-1.5">
              <User className="size-4 text-primary" />
              <span>2. Identitas Pengguna</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Nama lengkap sesuai KTP"
                    required
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nik" className="text-sm font-medium">
                  NIK (16 Digit) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="nik"
                    name="nik"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{16}"
                    maxLength={16}
                    placeholder="3328xxxxxxxxxxxx"
                    required
                    className="pl-9 h-10 tracking-wider font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  No. HP / WhatsApp <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    required
                    className="pl-9 h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Komunitas & Role */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-1.5">
              <Building2 className="size-4 text-primary" />
              <span>3. Komunitas & Peran</span>
            </div>

            {/* Community Selector Cards */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Pilih Komunitas <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleCommunityChange("RT")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedCommunity === "RT"
                      ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-medium"
                      : "border-border/70 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Home className="size-5 mb-1.5" />
                  <span className="text-sm font-semibold">Rukun Tetangga (RT)</span>
                  <span className="text-[11px] opacity-80 mt-0.5">Warga & Lingkungan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCommunityChange("POSYANDU")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedCommunity === "POSYANDU"
                      ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30 font-medium"
                      : "border-border/70 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <HeartHandshake className="size-5 mb-1.5" />
                  <span className="text-sm font-semibold">POSYANDU</span>
                  <span className="text-[11px] opacity-80 mt-0.5">Kesehatan & Balita</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCommunityChange("SEKOLAH")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedCommunity === "SEKOLAH"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30 font-medium"
                      : "border-border/70 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <GraduationCap className="size-5 mb-1.5" />
                  <span className="text-sm font-semibold">SEKOLAH</span>
                  <span className="text-[11px] opacity-80 mt-0.5">Pendidikan & Siswa</span>
                </button>
              </div>

              {/* Hidden input to pass selected community to server action */}
              <input type="hidden" name="community" value={selectedCommunity} />
            </div>

            {/* Dynamic Role Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Peran / Jabatan di Komunitas <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <select
                  id="role"
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                  className="w-full h-10 pl-9 pr-8 rounded-lg border border-input bg-background text-sm font-medium transition-colors outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  {currentCommunity.roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Peran menyesuaikan dengan pilihan komunitas: <strong>{currentCommunity.label}</strong>
              </p>
            </div>
          </div>

          {/* Section 4: Wilayah Domisili (Kota Tegal) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-1.5">
              <MapPin className="size-4 text-primary" />
              <span>4. Wilayah Domisili (Kota Tegal)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kecamatan" className="text-sm font-medium">
                  Kecamatan <span className="text-destructive">*</span>
                </Label>
                <select
                  id="kecamatan"
                  name="kecamatan"
                  value={selectedKecamatan}
                  onChange={(e) => setSelectedKecamatan(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium transition-colors outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  {kecamatanOptions.map((kec) => (
                    <option key={kec} value={kec}>
                      Kec. {kec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kelurahan" className="text-sm font-medium">
                  Kelurahan <span className="text-destructive">*</span>
                </Label>
                <select
                  id="kelurahan"
                  name="kelurahan"
                  value={selectedKelurahan}
                  onChange={(e) => setSelectedKelurahan(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium transition-colors outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  {kelurahanOptions.map((kel) => (
                    <option key={kel} value={kel}>
                      Kel. {kel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rw" className="text-sm font-medium">
                  No. RW <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rw"
                  name="rw"
                  type="text"
                  placeholder="Contoh: 03 atau RW 03"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rt" className="text-sm font-medium">
                  No. RT <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rt"
                  name="rt"
                  type="text"
                  placeholder="Contoh: 05 atau RT 05"
                  required
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 text-base font-semibold transition-all shadow-md mt-4 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Mendaftarkan Akun...
              </>
            ) : (
              <>
                Daftar Akun Ceklis
                <ArrowRight className="size-5" />
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center gap-2 border-t border-border/40 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
