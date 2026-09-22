"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import { type PaudStudent } from "@/app/dashboard/school/types"
import {
  type PosyanduHealthRecord,
  type StatusGizi,
  type StatusDdtk,
} from "@/app/dashboard/posyandu/types"
import { createHealthRecordAction } from "@/app/dashboard/posyandu/actions"
import { type WilayahTegalItem } from "@/lib/constants/wilayah"
import {
  StudentHealthHistory,
  getGiziBadge,
  getDdtkBadge,
} from "@/components/student-health-history"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  AlertCircle,
  Apple,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Filter,
  HeartHandshake,
  HeartPulse,
  History,
  IdCard,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Ruler,
  Scale,
  School,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
  Users,
  Utensils,
  X,
} from "lucide-react"

interface HealthRecordsClientProps {
  initialRecords: PosyanduHealthRecord[]
  studentsList: PaudStudent[]
  wilayahList: WilayahTegalItem[]
  userEmail?: string
}

export function HealthRecordsClient({
  initialRecords,
  studentsList,
  wilayahList,
  userEmail,
}: HealthRecordsClientProps) {
  const [records, setRecords] = useState<PosyanduHealthRecord[]>(initialRecords)
  const [showAddForm, setShowAddForm] = useState<boolean>(false)

  // Filters
  const [selectedKelurahanFilter, setSelectedKelurahanFilter] = useState<string>("ALL")
  const [selectedGiziFilter, setSelectedGiziFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Form selections
  const [formKelurahan, setFormKelurahan] = useState<string>("Kraton")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [formStatusGizi, setFormStatusGizi] = useState<StatusGizi>("Normal")
  const [formStatusDdtk, setFormStatusDdtk] = useState<StatusDdtk>("Sesuai (Normal)")

  // History Modal State
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<PaudStudent | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false)

  // Server Action state
  const [state, formAction, isPending] = useActionState(createHealthRecordAction, null)

  // Extract unique Kelurahan list
  const kelurahanOptions = useMemo(() => {
    const set = new Set(wilayahList.map((item) => item.kelurahan))
    return Array.from(set).sort()
  }, [wilayahList])

  // Filter students by chosen kelurahan in the form
  const targetStudentsInKelurahan = useMemo(() => {
    return studentsList.filter(
      (std) => std.kelurahan.toLowerCase() === formKelurahan.toLowerCase()
    )
  }, [studentsList, formKelurahan])

  // Selected student details in form
  const selectedStudentObj = useMemo(() => {
    return studentsList.find((std) => std.id === selectedStudentId) || targetStudentsInKelurahan[0] || null
  }, [studentsList, selectedStudentId, targetStudentsInKelurahan])

  // Update selected student when target students list changes
  React.useEffect(() => {
    if (targetStudentsInKelurahan.length > 0) {
      if (!targetStudentsInKelurahan.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(targetStudentsInKelurahan[0].id)
      }
    } else {
      setSelectedStudentId("")
    }
  }, [targetStudentsInKelurahan, selectedStudentId])

  // Add newly created record to local state
  React.useEffect(() => {
    if (state?.success && state.newRecord) {
      setRecords((prev) => [state.newRecord as PosyanduHealthRecord, ...prev])
      setShowAddForm(false)
    }
  }, [state])

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchQuery =
        searchQuery === "" ||
        rec.nama_anak.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.nama_posyandu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.nik && rec.nik.includes(searchQuery)) ||
        (rec.nisn && rec.nisn.includes(searchQuery))

      const matchKelurahan =
        selectedKelurahanFilter === "ALL" || rec.kelurahan === selectedKelurahanFilter

      const matchGizi =
        selectedGiziFilter === "ALL" || rec.status_gizi === selectedGiziFilter

      return matchQuery && matchKelurahan && matchGizi
    })
  }, [records, searchQuery, selectedKelurahanFilter, selectedGiziFilter])

  // Metrics
  const totalChecks = records.length
  const normalGiziCount = records.filter((r) => r.status_gizi === "Normal").length
  const stuntingCount = records.filter((r) => r.status_gizi === "Stunting").length
  const giziKurangCount = records.filter((r) => r.status_gizi === "Gizi Kurang" || r.status_gizi === "Wasting").length

  // Open History modal
  const openHistoryForStudent = (studentId: string, studentName: string) => {
    const student = studentsList.find((s) => s.id === studentId) || {
      id: studentId,
      npsn: "20329811",
      nama_sekolah: "Satuan PAUD Kota Tegal",
      nisn: "318xxxxxxx",
      nik: "3328xxxxxxxxxxxx",
      nama_lengkap: studentName,
      nama_ibu_kandung: "Orang Tua Siswa",
      rombel: "Kelompok A" as const,
      jenis_kelamin: "L" as const,
      rt: "01",
      rw: "01",
      kelurahan: formKelurahan,
      kecamatan: "Tegal Barat",
      status_ddtk: true,
      status_pmtas: true,
    }

    setSelectedStudentForHistory(student)
    setIsHistoryModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Shared Health History Modal */}
      <StudentHealthHistory
        student={selectedStudentForHistory}
        healthRecords={records}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-card border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3" /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Layanan POSYANDU</span>
            <span>/</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">Penimbangan & KMS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <HeartHandshake className="size-7 text-rose-600 dark:text-rose-400" />
            Penimbangan & Pencatatan Tumbuh Kembang (KMS)
          </h1>
          <p className="text-sm text-muted-foreground">
            Pencatatan gizi balita/siswa PAUD, deteksi stunting dini, dan integrasi lintas sektor PAUD-Posyandu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/school/students">
            <Button variant="outline" size="sm" className="gap-1.5">
              <School className="size-4 text-primary" />
              <span>Lihat Data PAUD</span>
            </Button>
          </Link>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-2 shadow-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            {showAddForm ? (
              <>
                <X className="size-4" />
                <span>Tutup Form</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>Entri Penimbangan Baru</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-2xs border-l-4 border-l-rose-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Pemeriksaan</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{totalChecks}</p>
              <span className="text-[11px] text-muted-foreground">Catatan KMS Terkini</span>
            </div>
            <div className="size-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <HeartPulse className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Gizi Normal</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {normalGiziCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({Math.round((normalGiziCount / (totalChecks || 1)) * 100)}%)
                </span>
              </p>
              <span className="text-[11px] text-muted-foreground">Tumbuh Kembang Baik</span>
            </div>
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-l-4 border-l-destructive">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Terindikasi Stunting</p>
              <p className="text-2xl font-bold mt-1 text-destructive">
                {stuntingCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({Math.round((stuntingCount / (totalChecks || 1)) * 100)}%)
                </span>
              </p>
              <span className="text-[11px] text-destructive font-medium">Perlu Intervensi PMT</span>
            </div>
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <ShieldAlert className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Gizi Kurang / Wasting</p>
              <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {giziKurangCount}
              </p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Perlu Pemantauan
              </span>
            </div>
            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Activity className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Input Penimbangan & Pencatatan KMS */}
      {showAddForm && (
        <Card className="border-rose-500/40 shadow-xl animate-in fade-in-50 slide-in-from-top-3">
          <CardHeader className="bg-rose-50/50 dark:bg-rose-950/20 border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Stethoscope className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Form Input Penimbangan KMS & DDTK Posyandu</CardTitle>
                  <CardDescription className="text-xs">
                    Catat hasil pengukuran berat badan, tinggi badan, lingkar kepala, dan status gizi anak
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

              {/* Step 1: Pemilihan Kelurahan & Sasaran Anak */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  <Users className="size-3.5 text-rose-600" />
                  <span>1. Pilih Kelurahan & Sasaran Anak (Terintegrasi Dapodik PAUD)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Kelurahan Posyandu */}
                  <div className="space-y-1.5">
                    <Label htmlFor="formKelurahan" className="text-xs font-semibold">
                      Kelurahan Posyandu <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="formKelurahan"
                      value={formKelurahan}
                      onChange={(e) => setFormKelurahan(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:border-ring outline-none"
                    >
                      {kelurahanOptions.map((kel) => (
                        <option key={kel} value={kel}>
                          Kel. {kel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Sasaran Anak */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="student_id" className="text-xs font-semibold">
                      Pilih Anak / Siswa PAUD Sasaran <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="student_id"
                      name="student_id"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      required
                      className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:border-ring outline-none"
                    >
                      {targetStudentsInKelurahan.length === 0 ? (
                        <option value="">-- Tidak ada siswa terdaftar di Kel. {formKelurahan} --</option>
                      ) : (
                        targetStudentsInKelurahan.map((std) => (
                          <option key={std.id} value={std.id}>
                            {std.nama_lengkap} ({std.rombel}) • Ibu: {std.nama_ibu_kandung} • RT {std.rt}/RW {std.rw}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Preview Selected Child */}
                {selectedStudentObj && (
                  <div className="p-3 rounded-xl border bg-muted/40 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{selectedStudentObj.nama_lengkap}</span>
                      <span className="px-2 py-0.5 rounded border bg-background text-muted-foreground font-mono">
                        NISN: {selectedStudentObj.nisn}
                      </span>
                      <span className="px-2 py-0.5 rounded border bg-background text-muted-foreground">
                        {selectedStudentObj.nama_sekolah}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      Domisili: RT {selectedStudentObj.rt} / RW {selectedStudentObj.rw}, Kel. {selectedStudentObj.kelurahan}
                    </span>
                  </div>
                )}

                {/* Hidden fields to pass selected student metadata */}
                <input type="hidden" name="nama_anak" value={selectedStudentObj?.nama_lengkap || ""} />
                <input type="hidden" name="nisn" value={selectedStudentObj?.nisn || ""} />
                <input type="hidden" name="nik" value={selectedStudentObj?.nik || ""} />
                <input type="hidden" name="nama_sekolah" value={selectedStudentObj?.nama_sekolah || ""} />
                <input type="hidden" name="kelurahan" value={selectedStudentObj?.kelurahan || formKelurahan} />
                <input type="hidden" name="kecamatan" value={selectedStudentObj?.kecamatan || "Tegal Barat"} />
              </div>

              {/* Step 2: Layanan Posyandu & Waktu Periksa */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  <HeartHandshake className="size-3.5 text-rose-600" />
                  <span>2. Informasi Posyandu & Petugas</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nama_posyandu" className="text-xs font-semibold">
                      Nama Posyandu <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nama_posyandu"
                      name="nama_posyandu"
                      defaultValue={`Posyandu Melati (${formKelurahan})`}
                      placeholder="Contoh: Posyandu Dahlia 01"
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tanggal_periksa" className="text-xs font-semibold">
                      Tanggal Periksa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tanggal_periksa"
                      name="tanggal_periksa"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="kader_pemeriksa" className="text-xs font-semibold">
                      Nama Kader / Bidan <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="kader_pemeriksa"
                      name="kader_pemeriksa"
                      defaultValue="Kader Posyandu"
                      placeholder="Nama kader pemeriksa"
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Hasil Pengukuran Fisik (BB, TB, LK) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  <Scale className="size-3.5 text-rose-600" />
                  <span>3. Hasil Pengukuran Antropometri (KMS)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="usia_bulan" className="text-xs font-semibold">
                      Usia Anak (Bulan) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="usia_bulan"
                      name="usia_bulan"
                      type="number"
                      defaultValue={54}
                      min={0}
                      max={120}
                      required
                      className="h-9 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="berat_badan" className="text-xs font-semibold">
                      Berat Badan (kg) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="berat_badan"
                      name="berat_badan"
                      type="number"
                      step="0.1"
                      defaultValue={15.5}
                      placeholder="Contoh: 15.5"
                      required
                      className="h-9 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tinggi_badan" className="text-xs font-semibold">
                      Tinggi Badan (cm) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tinggi_badan"
                      name="tinggi_badan"
                      type="number"
                      step="0.1"
                      defaultValue={102.0}
                      placeholder="Contoh: 102.0"
                      required
                      className="h-9 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lingkar_kepala" className="text-xs font-semibold">
                      Lingkar Kepala (cm) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lingkar_kepala"
                      name="lingkar_kepala"
                      type="number"
                      step="0.1"
                      defaultValue={49.0}
                      placeholder="Contoh: 49.0"
                      required
                      className="h-9 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Analisis Status Gizi & DDTK */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  <Activity className="size-3.5 text-rose-600" />
                  <span>4. Status Gizi (KMS) & Deteksi DDTK</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="status_gizi" className="text-xs font-semibold">
                      Status Gizi (Standar WHO / Kemenkes) <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="status_gizi"
                      name="status_gizi"
                      value={formStatusGizi}
                      onChange={(e) => setFormStatusGizi(e.target.value as StatusGizi)}
                      required
                      className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:border-ring outline-none"
                    >
                      <option value="Normal">🟢 Normal (Gizi Baik)</option>
                      <option value="Stunting">🔴 Stunting (TB/U &lt; -2 SD)</option>
                      <option value="Gizi Kurang">🟡 Gizi Kurang (BB/U Rendah)</option>
                      <option value="Wasting">🟡 Wasting (Kurus / BB/TB Rendah)</option>
                      <option value="Risiko Gizi Lebih">🔵 Risiko Gizi Lebih</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status_ddtk" className="text-xs font-semibold">
                      Hasil Deteksi Dini Tumbuh Kembang (DDTK) <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="status_ddtk"
                      name="status_ddtk"
                      value={formStatusDdtk}
                      onChange={(e) => setFormStatusDdtk(e.target.value as StatusDdtk)}
                      required
                      className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:border-ring outline-none"
                    >
                      <option value="Sesuai (Normal)">🟢 Sesuai (Normal sesuai kelompok usia)</option>
                      <option value="Meragukan">🟡 Meragukan (Perlu stimulasi lanjutan)</option>
                      <option value="Penyimpangan">🔴 Penyimpangan (Rujuk ke Puskesmas)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="catatan_ddtk" className="text-xs font-semibold">
                    Catatan DDTK / Saran Makanan Tambahan (PMT)
                  </Label>
                  <Input
                    id="catatan_ddtk"
                    name="catatan_ddtk"
                    placeholder="Contoh: Rekomendasi telur & susu, stimulasi motorik kasar melompat..."
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
                <Button
                  type="submit"
                  disabled={isPending || !selectedStudentId}
                  className="gap-2 font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan Data...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Simpan Catatan KMS
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama anak, Posyandu, NISN, NIK..."
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

          {/* Filter Kelurahan */}
          <select
            value={selectedKelurahanFilter}
            onChange={(e) => setSelectedKelurahanFilter(e.target.value)}
            aria-label="Filter Kelurahan"
            className="h-10 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:border-ring outline-none"
          >
            <option value="ALL">Semua Kelurahan</option>
            {kelurahanOptions.map((k) => (
              <option key={k} value={k}>
                Kel. {k}
              </option>
            ))}
          </select>

          {/* Filter Status Gizi */}
          <select
            value={selectedGiziFilter}
            onChange={(e) => setSelectedGiziFilter(e.target.value)}
            aria-label="Filter Status Gizi"
            className="h-10 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:border-ring outline-none hidden md:block"
          >
            <option value="ALL">Semua Status Gizi</option>
            <option value="Normal">Normal</option>
            <option value="Stunting">Stunting</option>
            <option value="Gizi Kurang">Gizi Kurang / Wasting</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Penimbangan & KMS Posyandu */}
      <Card className="shadow-xs border overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span>Daftar Pemeriksaan & Penimbangan Posyandu</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-semibold">
                  {filteredRecords.length} Data
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Hasil pencatatan antropometri dan deteksi dini tumbuh kembang balita / siswa PAUD Kota Tegal
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" /> Normal
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-500" /> Stunting
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500" /> Perhatian
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3 px-4 w-10 text-center">No</th>
                  <th className="py-3 px-4">Nama Anak & Lembaga PAUD</th>
                  <th className="py-3 px-4">Tgl & Posyandu</th>
                  <th className="py-3 px-4">BB / TB / LK</th>
                  <th className="py-3 px-4">Indikator Status Gizi</th>
                  <th className="py-3 px-4">Hasil DDTK</th>
                  <th className="py-3 px-4">Kader Pemeriksa</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <HeartPulse className="size-8 opacity-40 text-rose-500" />
                        <p className="font-semibold text-foreground text-sm">Tidak ada catatan KMS ditemukan</p>
                        <p className="text-xs">
                          Coba ubah kata kunci pencarian atau gunakan tombol entri untuk menambah pemeriksaan baru.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec, idx) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                        {idx + 1}
                      </td>

                      {/* Nama & PAUD */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            {rec.nama_anak}
                            <span className="text-[10px] px-1.5 py-0.2 rounded border bg-muted text-muted-foreground font-mono">
                              {rec.usia_bulan} Bln
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <School className="size-3 text-primary" />
                            <span>{rec.nama_sekolah || "PAUD Kota Tegal"}</span>
                          </p>
                        </div>
                      </td>

                      {/* Posyandu & Tgl */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{rec.nama_posyandu}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>{rec.tanggal_periksa}</span>
                            <span>• Kel. {rec.kelurahan}</span>
                          </p>
                        </div>
                      </td>

                      {/* Antropometri */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <p>
                            BB: <strong className="text-foreground">{rec.berat_badan} kg</strong>
                          </p>
                          <p>
                            TB: <strong className="text-foreground">{rec.tinggi_badan} cm</strong> (LK: {rec.lingkar_kepala} cm)
                          </p>
                        </div>
                      </td>

                      {/* Status Gizi Badge */}
                      <td className="py-3 px-4">
                        {getGiziBadge(rec.status_gizi)}
                      </td>

                      {/* DDTK */}
                      <td className="py-3 px-4">
                        {getDdtkBadge(rec.status_ddtk)}
                      </td>

                      {/* Kader */}
                      <td className="py-3 px-4 text-muted-foreground">
                        <span className="font-medium text-foreground">{rec.kader_pemeriksa}</span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openHistoryForStudent(rec.student_id, rec.nama_anak)}
                          className="gap-1 shadow-2xs hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                        >
                          <History className="size-3" />
                          <span>Riwayat KMS</span>
                        </Button>
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
