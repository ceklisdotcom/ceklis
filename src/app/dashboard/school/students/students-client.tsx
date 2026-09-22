"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import { createPaudStudentAction } from "@/app/dashboard/school/actions"
import { type PaudStudent } from "@/app/dashboard/school/types"
import { INITIAL_HEALTH_RECORDS } from "@/app/dashboard/posyandu/types"
import { StudentHealthHistory } from "@/components/student-health-history"
import { type WilayahTegalItem } from "@/lib/constants/wilayah"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  AlertCircle,
  Apple,
  ArrowLeft,
  Building,
  CheckCircle2,
  ChevronDown,
  Filter,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  History,
  IdCard,
  Layers,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
  X,
  XCircle,
} from "lucide-react"

export type SchoolRole = "Kepala Sekolah" | "Operator PAUD" | "Guru / Pendidik"

interface StudentsClientProps {
  initialStudents: PaudStudent[]
  wilayahList: WilayahTegalItem[]
  userEmail?: string
}

export function StudentsClient({
  initialStudents,
  wilayahList,
  userEmail,
}: StudentsClientProps) {
  const [students, setStudents] = useState<PaudStudent[]>(initialStudents)
  const [activeRole, setActiveRole] = useState<SchoolRole>("Kepala Sekolah")
  const [showAddForm, setShowAddForm] = useState<boolean>(false)

  // Health History Modal
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<PaudStudent | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterRombel, setFilterRombel] = useState<string>("ALL")
  const [filterDdtk, setFilterDdtk] = useState<string>("ALL")
  const [filterPmtas, setFilterPmtas] = useState<string>("ALL")

  // Form State
  const [state, formAction, isPending] = useActionState(createPaudStudentAction, null)

  // Wilayah selection in form
  const [formKecamatan, setFormKecamatan] = useState<string>("Tegal Barat")
  const [formKelurahan, setFormKelurahan] = useState<string>("Kraton")

  // Extract unique kecamatans
  const kecamatanOptions = useMemo(() => {
    const set = new Set(wilayahList.map((item) => item.kecamatan))
    return Array.from(set).sort()
  }, [wilayahList])

  // Filter kelurahans based on selected kecamatan
  const kelurahanOptions = useMemo(() => {
    return wilayahList
      .filter((item) => item.kecamatan === formKecamatan)
      .map((item) => item.kelurahan)
      .sort()
  }, [wilayahList, formKecamatan])

  // Update kelurahan when kecamatan changes
  React.useEffect(() => {
    if (kelurahanOptions.length > 0 && !kelurahanOptions.includes(formKelurahan)) {
      setFormKelurahan(kelurahanOptions[0])
    }
  }, [kelurahanOptions, formKelurahan])

  // Add new student to local state when form succeeds
  React.useEffect(() => {
    if (state?.success && state.newStudent) {
      setStudents((prev) => [state.newStudent as PaudStudent, ...prev])
      setShowAddForm(false)
    }
  }, [state])

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const matchQuery =
        searchQuery === "" ||
        std.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.nisn.includes(searchQuery) ||
        std.nik.includes(searchQuery) ||
        std.nama_ibu_kandung.toLowerCase().includes(searchQuery.toLowerCase())

      const matchRombel = filterRombel === "ALL" || std.rombel === filterRombel
      const matchDdtk =
        filterDdtk === "ALL" ||
        (filterDdtk === "DONE" && std.status_ddtk) ||
        (filterDdtk === "PENDING" && !std.status_ddtk)
      const matchPmtas =
        filterPmtas === "ALL" ||
        (filterPmtas === "YES" && std.status_pmtas) ||
        (filterPmtas === "NO" && !std.status_pmtas)

      return matchQuery && matchRombel && matchDdtk && matchPmtas
    })
  }, [students, searchQuery, filterRombel, filterDdtk, filterPmtas])

  // Statistics
  const totalStudents = students.length
  const kelompokACount = students.filter((s) => s.rombel === "Kelompok A").length
  const kelompokBCount = students.filter((s) => s.rombel === "Kelompok B").length
  const ddtkDoneCount = students.filter((s) => s.status_ddtk).length
  const pmtasCount = students.filter((s) => s.status_pmtas).length

  // Quick toggle DDTK
  const toggleDdtk = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status_ddtk: !s.status_ddtk } : s))
    )
  }

  // Quick toggle PMT-AS
  const togglePmtas = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status_pmtas: !s.status_pmtas } : s))
    )
  }

  // Role details configuration
  const roleConfig = {
    "Kepala Sekolah": {
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      desc: "Akses Manajerial & Supervisi Kesehatan Anak",
      icon: <GraduationCap className="size-4 text-indigo-600 dark:text-indigo-400" />,
      color: "border-indigo-500",
    },
    "Operator PAUD": {
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      desc: "Manajemen Data Dapodik & Entri NISN",
      icon: <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />,
      color: "border-emerald-500",
    },
    "Guru / Pendidik": {
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      desc: "Pemantauan DDTK, Tumbuh Kembang & PMT-AS",
      icon: <UserCheck className="size-4 text-amber-600 dark:text-amber-400" />,
      color: "border-amber-500",
    },
  }

  return (
    <div className="space-y-6">
      {/* Shared Health History Modal */}
      <StudentHealthHistory
        student={selectedStudentForHistory}
        healthRecords={INITIAL_HEALTH_RECORDS}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Top Header with Breadcrumbs & Role Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-card border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3" /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Sekolah PAUD-PNF</span>
            <span>/</span>
            <span className="text-primary font-medium">Peserta Didik</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <GraduationCap className="size-7 text-primary" />
            Pengelolaan Peserta Didik PAUD
          </h1>
          <p className="text-sm text-muted-foreground">
            Sinkronisasi Data Pokok Pendidikan (Dapodik), Deteksi Dini Tumbuh Kembang (DDTK), & PMT-AS
          </p>
        </div>

        {/* Role Switcher Widget */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-muted/50 p-2.5 rounded-xl border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground">Peran Aktif:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border shadow-2xs">
            {(["Kepala Sekolah", "Operator PAUD", "Guru / Pendidik"] as SchoolRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeRole === role
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role Active Banner */}
      <div className="flex items-center justify-between p-3.5 px-4 rounded-xl bg-primary/5 border border-primary/20 text-xs">
        <div className="flex items-center gap-2.5">
          {roleConfig[activeRole].icon}
          <div>
            <span className="font-bold text-foreground">Mode {activeRole}:</span>{" "}
            <span className="text-muted-foreground">{roleConfig[activeRole].desc}</span>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleConfig[activeRole].badge}`}>
          Aktif
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Peserta Didik</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{totalStudents}</p>
              <span className="text-[11px] text-muted-foreground">Terdaftar Dapodik</span>
            </div>
            <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Rombel A & B</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                {kelompokACount} <span className="text-sm font-normal text-muted-foreground">/ {kelompokBCount}</span>
              </p>
              <span className="text-[11px] text-muted-foreground">Kelompok A / B</span>
            </div>
            <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Status DDTK</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {ddtkDoneCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({Math.round((ddtkDoneCount / (totalStudents || 1)) * 100)}%)
                </span>
              </p>
              <span className="text-[11px] text-muted-foreground">Deteksi Dini Tumbuh Kembang</span>
            </div>
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Penerima PMT-AS</p>
              <p className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                {pmtasCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({Math.round((pmtasCount / (totalStudents || 1)) * 100)}%)
                </span>
              </p>
              <span className="text-[11px] text-muted-foreground">Makanan Tambahan Anak</span>
            </div>
            <div className="size-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Utensils className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions Bar: Search, Filters & Add Student Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari siswa (Nama, NISN, NIK, Ibu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Rombel */}
          <select
            value={filterRombel}
            onChange={(e) => setFilterRombel(e.target.value)}
            aria-label="Filter Rombel"
            className="h-10 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:border-ring outline-none"
          >
            <option value="ALL">Semua Rombel</option>
            <option value="Kelompok A">Kelompok A (4-5 Th)</option>
            <option value="Kelompok B">Kelompok B (5-6 Th)</option>
            <option value="KB">Kelompok Bermain (KB)</option>
          </select>

          {/* Filter DDTK */}
          <select
            value={filterDdtk}
            onChange={(e) => setFilterDdtk(e.target.value)}
            aria-label="Filter DDTK"
            className="h-10 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:border-ring outline-none hidden md:block"
          >
            <option value="ALL">Semua Status DDTK</option>
            <option value="DONE">DDTK Sudah Dilakukan</option>
            <option value="PENDING">DDTK Belum Dilakukan</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-2 shadow-xs font-semibold"
          >
            {showAddForm ? (
              <>
                <X className="size-4" />
                <span>Tutup Form</span>
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                <span>Tambah Siswa Baru</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form Input Siswa Baru (Collapsible Card) */}
      {showAddForm && (
        <Card className="border-primary/40 shadow-lg animate-in fade-in-50 slide-in-from-top-3">
          <CardHeader className="bg-primary/5 border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Form Input Peserta Didik PAUD (Dapodik)</CardTitle>
                  <CardDescription className="text-xs">
                    Entri data identitas, rombel, domisili, dan status kesehatan DDTK & PMT-AS
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddForm(false)}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <form action={formAction}>
            <CardContent className="p-6 space-y-6">
              {state?.error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-destructive text-sm">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* 1. Informasi Satuan PAUD */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  <Building className="size-3.5 text-primary" />
                  <span>1. Data Lembaga / Satuan PAUD</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="npsn" className="text-xs font-semibold">
                      NPSN Sekolah <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="npsn"
                      name="npsn"
                      defaultValue="20329811"
                      placeholder="Contoh: 20329811"
                      required
                      className="h-9 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nama_sekolah" className="text-xs font-semibold">
                      Nama Satuan PAUD <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nama_sekolah"
                      name="nama_sekolah"
                      defaultValue="TK Negeri Pembina Tegal Barat"
                      placeholder="Contoh: TK Pertiwi / PAUD Terpadu..."
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Identitas Peserta Didik */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  <IdCard className="size-3.5 text-primary" />
                  <span>2. Identitas Peserta Didik</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="nisn" className="text-xs font-semibold">
                      NISN (10 Digit) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nisn"
                      name="nisn"
                      placeholder="318xxxxxxx"
                      maxLength={10}
                      required
                      className="h-9 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="nik" className="text-xs font-semibold">
                      NIK Anak (16 Digit) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nik"
                      name="nik"
                      placeholder="3328xxxxxxxxxxxx"
                      maxLength={16}
                      required
                      className="h-9 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="jenis_kelamin" className="text-xs font-semibold">
                      Jenis Kelamin <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="jenis_kelamin"
                      name="jenis_kelamin"
                      required
                      className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:border-ring outline-none"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="nama_lengkap" className="text-xs font-semibold">
                      Nama Lengkap Siswa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nama_lengkap"
                      name="nama_lengkap"
                      placeholder="Nama lengkap sesuai Akta / KK"
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="nama_ibu_kandung" className="text-xs font-semibold">
                      Nama Ibu Kandung <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nama_ibu_kandung"
                      name="nama_ibu_kandung"
                      placeholder="Nama ibu kandung (Dapodik)"
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="rombel" className="text-xs font-semibold">
                      Rombel / Kelompok <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="rombel"
                      name="rombel"
                      required
                      className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:border-ring outline-none"
                    >
                      <option value="Kelompok A">Kelompok A (Usia 4-5 Th)</option>
                      <option value="Kelompok B">Kelompok B (Usia 5-6 Th)</option>
                      <option value="KB">Kelompok Bermain (KB 2-4 Th)</option>
                      <option value="TPA">TPA / Penitipan Anak</option>
                      <option value="SPS">SPS (Satuan PAUD Sejenis)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Domisili Kota Tegal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  <MapPin className="size-3.5 text-primary" />
                  <span>3. Domisili Tempat Tinggal (Kota Tegal)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="form-kecamatan" className="text-xs font-semibold">
                      Kecamatan <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="form-kecamatan"
                      name="kecamatan"
                      value={formKecamatan}
                      onChange={(e) => setFormKecamatan(e.target.value)}
                      required
                      className="w-full h-9 px-2.5 rounded-lg border border-input bg-background text-sm font-medium focus:border-ring outline-none"
                    >
                      {kecamatanOptions.map((k) => (
                        <option key={k} value={k}>
                          Kec. {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="form-kelurahan" className="text-xs font-semibold">
                      Kelurahan <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="form-kelurahan"
                      name="kelurahan"
                      value={formKelurahan}
                      onChange={(e) => setFormKelurahan(e.target.value)}
                      required
                      className="w-full h-9 px-2.5 rounded-lg border border-input bg-background text-sm font-medium focus:border-ring outline-none"
                    >
                      {kelurahanOptions.map((k) => (
                        <option key={k} value={k}>
                          Kel. {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="rt" className="text-xs font-semibold">
                      No. RT <span className="text-destructive">*</span>
                    </Label>
                    <Input id="rt" name="rt" placeholder="Contoh: 03" required className="h-9 text-sm" />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="rw" className="text-xs font-semibold">
                      No. RW <span className="text-destructive">*</span>
                    </Label>
                    <Input id="rw" name="rw" placeholder="Contoh: 02" required className="h-9 text-sm" />
                  </div>
                </div>
              </div>

              {/* 4. Indikator Kesehatan & DDTK / PMT-AS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  <HeartPulse className="size-3.5 text-primary" />
                  <span>4. Status Program Kesehatan Anak PAUD</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border">
                  {/* Status DDTK */}
                  <label className="flex items-start gap-3 p-3 rounded-lg border bg-background cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="checkbox"
                      name="status_ddtk"
                      defaultChecked
                      className="size-4.5 mt-0.5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div>
                      <span className="text-sm font-bold flex items-center gap-1.5">
                        <Activity className="size-4 text-emerald-600" />
                        Status DDTK Terlaksana
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Centang jika siswa sudah mengikuti Deteksi Dini Tumbuh Kembang periode ini.
                      </p>
                    </div>
                  </label>

                  {/* Status PMT-AS */}
                  <label className="flex items-start gap-3 p-3 rounded-lg border bg-background cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="checkbox"
                      name="status_pmtas"
                      defaultChecked
                      className="size-4.5 mt-0.5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div>
                      <span className="text-sm font-bold flex items-center gap-1.5">
                        <Apple className="size-4 text-rose-600" />
                        Penerima PMT-AS
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Centang jika siswa terdaftar dalam Program Pemberian Makanan Tambahan.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="catatan_kesehatan" className="text-xs font-semibold">
                    Catatan Khusus / Kesehatan (Opsional)
                  </Label>
                  <Input
                    id="catatan_kesehatan"
                    name="catatan_kesehatan"
                    placeholder="Contoh: Alergi makanan tertentu, riwayat imunisasi, dll."
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2 font-semibold">
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan Data...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Simpan Data Siswa
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Tabel Daftar Siswa PAUD */}
      <Card className="shadow-xs border overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span>Daftar Peserta Didik PAUD</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {filteredStudents.length} Siswa
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Data terintegrasi Dapodik PAUD-PNF dengan indikator kesehatan tumbuh kembang
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" /> DDTK Selesai
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-500" /> PMT-AS
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Siswa & NISN</th>
                  <th className="py-3 px-4">Rombel</th>
                  <th className="py-3 px-4">Nama Ibu Kandung</th>
                  <th className="py-3 px-4">Domisili (Kota Tegal)</th>
                  <th className="py-3 px-4 text-center">Status DDTK</th>
                  <th className="py-3 px-4 text-center">PMT-AS</th>
                  <th className="py-3 px-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-muted-foreground">
                        <Search className="size-8 opacity-40" />
                        <p className="font-semibold text-foreground text-sm">Tidak ada siswa ditemukan</p>
                        <p className="text-xs">
                          Coba ubah kata kunci pencarian atau filter rombel/status yang dipilih.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("")
                            setFilterRombel("ALL")
                            setFilterDdtk("ALL")
                            setFilterPmtas("ALL")
                          }}
                          className="mt-2"
                        >
                          Reset Filter
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std, idx) => (
                    <tr
                      key={std.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                        {idx + 1}
                      </td>

                      {/* Nama & NISN */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              std.jenis_kelamin === "P"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                            }`}
                          >
                            {std.nama_lengkap.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                              {std.nama_lengkap}
                              <span className="text-[10px] px-1.5 py-0.2 rounded border text-muted-foreground font-mono">
                                {std.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                              </span>
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              NISN: <span className="font-semibold text-foreground">{std.nisn}</span> • NIK: {std.nik}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rombel */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            std.rombel === "Kelompok A"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300"
                              : std.rombel === "Kelompok B"
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {std.rombel}
                        </span>
                      </td>

                      {/* Ibu Kandung */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{std.nama_ibu_kandung}</span>
                      </td>

                      {/* Domisili */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">
                            Kel. {std.kelurahan}, Kec. {std.kecamatan}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            RT {std.rt} / RW {std.rw}
                          </p>
                        </div>
                      </td>

                      {/* Status DDTK */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleDdtk(std.id)}
                          title="Klik untuk mengubah status DDTK"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            std.status_ddtk
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100"
                          }`}
                        >
                          {std.status_ddtk ? (
                            <>
                              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Selesai DDTK</span>
                            </>
                          ) : (
                            <>
                              <Activity className="size-3 text-amber-600 dark:text-amber-400" />
                              <span>Belum DDTK</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Status PMT-AS */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePmtas(std.id)}
                          title="Klik untuk mengubah status PMT-AS"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            std.status_pmtas
                              ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100"
                              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                          }`}
                        >
                          <Utensils className="size-3" />
                          <span>{std.status_pmtas ? "Penerima" : "Bukan"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              setSelectedStudentForHistory(std)
                              setIsHistoryOpen(true)
                            }}
                            className="gap-1 shadow-2xs hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-xs"
                          >
                            <HeartPulse className="size-3 text-rose-600" />
                            <span>Riwayat KMS</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
