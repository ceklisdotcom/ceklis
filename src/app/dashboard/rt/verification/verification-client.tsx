"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import {
  type WargaVerificationItem,
  type StatusVerifikasiRT,
  type KategoriMBR,
} from "@/app/dashboard/rt/types"
import { updateVerificationAction } from "@/app/dashboard/rt/actions"
import { type WilayahTegalItem } from "@/lib/constants/wilayah"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building,
  CheckCircle2,
  Clock,
  Filter,
  HeartHandshake,
  Home,
  IdCard,
  Layers,
  Loader2,
  MapPin,
  School,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  Utensils,
  X,
  XCircle,
} from "lucide-react"

interface VerificationClientProps {
  initialItems: WargaVerificationItem[]
  wilayahList: WilayahTegalItem[]
  userEmail?: string
}

export function getStatusBadge(status: StatusVerifikasiRT) {
  switch (status) {
    case "VERIFIED":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 font-semibold gap-1">
          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
          <span>Verified RT</span>
        </Badge>
      )
    case "PENDING":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 font-semibold gap-1 animate-pulse">
          <Clock className="size-3 text-amber-600 dark:text-amber-400" />
          <span>Pending Verifikasi</span>
        </Badge>
      )
    case "REJECTED":
    case "MOVED":
      return (
        <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 font-semibold gap-1">
          <UserX className="size-3 text-rose-600 dark:text-rose-400" />
          <span>{status === "MOVED" ? "Pindah Domisili" : "Ditolak / Bukan Warga"}</span>
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function VerificationClient({
  initialItems,
  wilayahList,
  userEmail,
}: VerificationClientProps) {
  const [items, setItems] = useState<WargaVerificationItem[]>(initialItems)

  // Filters
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("PENDING")
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("ALL")
  const [selectedRt, setSelectedRt] = useState<string>("ALL")
  const [filterMbr, setFilterMbr] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Modal State
  const [modalItem, setModalItem] = useState<WargaVerificationItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Form Fields in Modal
  const [modalStatus, setModalStatus] = useState<StatusVerifikasiRT>("VERIFIED")
  const [modalIsMbr, setModalIsMbr] = useState<boolean>(false)
  const [modalKategoriMbr, setModalKategoriMbr] = useState<KategoriMBR>("MBR")
  const [modalPkh, setModalPkh] = useState<boolean>(false)
  const [modalBpnt, setModalBpnt] = useState<boolean>(false)
  const [modalKip, setModalKip] = useState<boolean>(false)
  const [modalBlt, setModalBlt] = useState<boolean>(false)
  const [modalCatatan, setModalCatatan] = useState<string>("")

  // Server Action
  const [state, formAction, isPending] = useActionState(updateVerificationAction, null)

  // Extract unique Kelurahan
  const kelurahanOptions = useMemo(() => {
    const set = new Set(wilayahList.map((item) => item.kelurahan))
    return Array.from(set).sort()
  }, [wilayahList])

  // Open modal with item details
  const openModal = (item: WargaVerificationItem) => {
    setModalItem(item)
    setModalStatus(item.status_verifikasi === "PENDING" ? "VERIFIED" : item.status_verifikasi)
    setModalIsMbr(item.is_mbr)
    setModalKategoriMbr(item.kategori_mbr || "MBR")
    setModalPkh(item.jenis_bansos?.includes("PKH") || false)
    setModalBpnt(item.jenis_bansos?.includes("BPNT") || false)
    setModalKip(item.jenis_bansos?.includes("KIP") || false)
    setModalBlt(item.jenis_bansos?.includes("BLT") || false)
    setModalCatatan(item.catatan_rt || "")
    setIsModalOpen(true)
  }

  // Quick Approve function
  const handleQuickApprove = (item: WargaVerificationItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status_verifikasi: "VERIFIED",
              verified_by: "Ketua RT Setempat",
              verified_at: new Date().toISOString(),
              catatan_rt: "Disetujui langsung oleh Pengurus RT",
            }
          : i
      )
    )
  }

  // Update local state when modal form succeeds
  React.useEffect(() => {
    if (state?.success && state.updatedItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === state.updatedItem.id ? { ...i, ...state.updatedItem } : i))
      )
      setIsModalOpen(false)
    }
  }, [state])

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchTab =
        activeTab === "ALL" ||
        (activeTab === "PENDING" && item.status_verifikasi === "PENDING") ||
        (activeTab === "VERIFIED" && item.status_verifikasi === "VERIFIED") ||
        (activeTab === "REJECTED" &&
          (item.status_verifikasi === "REJECTED" || item.status_verifikasi === "MOVED"))

      const matchKelurahan =
        selectedKelurahan === "ALL" || item.kelurahan === selectedKelurahan

      const matchRt = selectedRt === "ALL" || item.rt === selectedRt

      const matchMbr =
        filterMbr === "ALL" ||
        (filterMbr === "MBR" && item.is_mbr) ||
        (filterMbr === "NON_MBR" && !item.is_mbr)

      const matchQuery =
        searchQuery === "" ||
        item.nama_warga.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nik.includes(searchQuery) ||
        item.nama_kepala_keluarga.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nama_lembaga_asal.toLowerCase().includes(searchQuery.toLowerCase())

      return matchTab && matchKelurahan && matchRt && matchMbr && matchQuery
    })
  }, [items, activeTab, selectedKelurahan, selectedRt, filterMbr, searchQuery])

  // Metrics
  const pendingCount = items.filter((i) => i.status_verifikasi === "PENDING").length
  const verifiedCount = items.filter((i) => i.status_verifikasi === "VERIFIED").length
  const mbrCount = items.filter((i) => i.is_mbr).length
  const rejectedCount = items.filter(
    (i) => i.status_verifikasi === "REJECTED" || i.status_verifikasi === "MOVED"
  ).length

  return (
    <div className="space-y-6">
      {/* Modal Verifikasi & Modul MBR */}
      {isModalOpen && modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-muted/40">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Verifikasi Domisili & Modul MBR / Bansos RT
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Validasi keberadaan warga di lingkungan RT dan penetapan kategori MBR
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="size-8 rounded-lg"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form action={formAction} className="flex-1 overflow-y-auto p-6 space-y-6">
              <input type="hidden" name="id" value={modalItem.id} />

              {/* Data Warga Overview */}
              <div className="p-4 rounded-xl border bg-muted/30 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base font-bold text-foreground">{modalItem.nama_warga}</span>
                  <span className="px-2 py-0.5 rounded border bg-background text-muted-foreground font-mono">
                    NIK: {modalItem.nik}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                  <p>
                    Kepala Keluarga: <strong className="text-foreground">{modalItem.nama_kepala_keluarga}</strong>
                  </p>
                  <p>
                    Sumber Data: <strong className="text-foreground">{modalItem.nama_lembaga_asal}</strong>
                  </p>
                  <p>
                    Alamat: RT {modalItem.rt} / RW {modalItem.rw}, Kel. {modalItem.kelurahan}, Kec. {modalItem.kecamatan}
                  </p>
                  <p>
                    Status Saat Ini: {getStatusBadge(modalItem.status_verifikasi)}
                  </p>
                </div>
              </div>

              {/* Pilihan Status Verifikasi */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Keputusan Status Domisili RT <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalStatus("VERIFIED")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      modalStatus === "VERIFIED"
                        ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <CheckCircle2 className="size-5 mb-1 text-emerald-600" />
                    <span className="text-sm">Setujui Domisili</span>
                    <span className="text-[10px] opacity-80">Warga Sah & Aktif</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalStatus("MOVED")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      modalStatus === "MOVED"
                        ? "border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/30 font-bold"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Home className="size-5 mb-1 text-amber-600" />
                    <span className="text-sm">Sudah Pindah</span>
                    <span className="text-[10px] opacity-80">Tidak tinggal lagi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalStatus("REJECTED")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      modalStatus === "REJECTED"
                        ? "border-rose-600 bg-rose-50/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/30 font-bold"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <UserX className="size-5 mb-1 text-rose-600" />
                    <span className="text-sm">Tolak / Bukan Warga</span>
                    <span className="text-[10px] opacity-80">Data Tidak Ditemukan</span>
                  </button>
                </div>
                <input type="hidden" name="status_verifikasi" value={modalStatus} />
              </div>

              {/* Modul MBR & Bansos */}
              <div className="space-y-4 p-4 rounded-xl border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="size-4 text-primary" />
                    <Label htmlFor="is_mbr" className="text-sm font-bold cursor-pointer">
                      Tandai Sebagai Kategori MBR (Masyarakat Berpenghasilan Rendah)
                    </Label>
                  </div>
                  <input
                    type="checkbox"
                    id="is_mbr"
                    name="is_mbr"
                    checked={modalIsMbr}
                    onChange={(e) => setModalIsMbr(e.target.checked)}
                    className="size-4.5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                </div>

                {modalIsMbr && (
                  <div className="space-y-3 pt-2 border-t border-border/60 animate-in fade-in-50">
                    <div className="space-y-1.5">
                      <Label htmlFor="kategori_mbr" className="text-xs font-semibold">
                        Tingkat Desil / Kategori Kemiskinan
                      </Label>
                      <select
                        id="kategori_mbr"
                        name="kategori_mbr"
                        value={modalKategoriMbr}
                        onChange={(e) => setModalKategoriMbr(e.target.value as KategoriMBR)}
                        className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:border-ring outline-none"
                      >
                        <option value="MBR">MBR (Masyarakat Berpenghasilan Rendah Umum)</option>
                        <option value="DESIL_1_EXTREME">Desil 1 (Kemiskinan Ekstrem)</option>
                        <option value="DESIL_2_SANGAT_MISKIN">Desil 2 (Sangat Miskin / Rentan)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Program Bantuan Sosial Aktif (Bansos)
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <label className="flex items-center gap-2 p-2 rounded-lg border bg-background cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            name="bansos_pkh"
                            checked={modalPkh}
                            onChange={(e) => setModalPkh(e.target.checked)}
                            className="size-4 accent-primary"
                          />
                          <span className="font-semibold">PKH</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-lg border bg-background cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            name="bansos_bpnt"
                            checked={modalBpnt}
                            onChange={(e) => setModalBpnt(e.target.checked)}
                            className="size-4 accent-primary"
                          />
                          <span className="font-semibold">BPNT / Sembako</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-lg border bg-background cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            name="bansos_kip"
                            checked={modalKip}
                            onChange={(e) => setModalKip(e.target.checked)}
                            className="size-4 accent-primary"
                          />
                          <span className="font-semibold">KIP (Sekolah)</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-lg border bg-background cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            name="bansos_blt"
                            checked={modalBlt}
                            onChange={(e) => setModalBlt(e.target.checked)}
                            className="size-4 accent-primary"
                          />
                          <span className="font-semibold">BLT Dana Desa</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Catatan RT */}
              <div className="space-y-1.5">
                <Label htmlFor="catatan_rt" className="text-xs font-semibold">
                  Catatan Verifikasi Pengurus RT
                </Label>
                <Input
                  id="catatan_rt"
                  name="catatan_rt"
                  value={modalCatatan}
                  onChange={(e) => setModalCatatan(e.target.value)}
                  placeholder="Contoh: Sudah dikonfirmasi langsung ke rumah, KK valid..."
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="verified_by" className="text-xs font-semibold">
                  Petugas Verifikator RT
                </Label>
                <Input
                  id="verified_by"
                  name="verified_by"
                  defaultValue="Ketua RT / Sekretaris"
                  className="h-9 text-sm"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2 font-semibold">
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Simpan Keputusan Verifikasi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-card border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3" /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Pengurus RT</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verifikasi Domisili & MBR</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Home className="size-7 text-emerald-600 dark:text-emerald-400" />
            Verifikasi Domisili & Status MBR Warga
          </h1>
          <p className="text-sm text-muted-foreground">
            Validasi data anak/siswa dari Sekolah PAUD dan Posyandu di lingkungan Rukun Tetangga (RT) Kota Tegal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/posyandu/health-records">
            <Button variant="outline" size="sm" className="gap-1.5">
              <HeartHandshake className="size-4 text-rose-600" />
              <span>Layanan Posyandu</span>
            </Button>
          </Link>
          <Link href="/dashboard/school/students">
            <Button variant="outline" size="sm" className="gap-1.5">
              <School className="size-4 text-indigo-600" />
              <span>Data Siswa PAUD</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-2xs border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Antrean Pending</p>
              <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{pendingCount}</p>
              <span className="text-[11px] text-muted-foreground">Menunggu Verifikasi</span>
            </div>
            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Verified RT</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{verifiedCount}</p>
              <span className="text-[11px] text-muted-foreground">Domisili Sah</span>
            </div>
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kategori MBR / Bansos</p>
              <p className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{mbrCount}</p>
              <span className="text-[11px] text-muted-foreground">Penerima Bantuan</span>
            </div>
            <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HeartHandshake className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-l-4 border-l-rose-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ditolak / Pindah</p>
              <p className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">{rejectedCount}</p>
              <span className="text-[11px] text-muted-foreground">Bukan Warga Aktif</span>
            </div>
            <div className="size-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="size-3.5 text-amber-500" />
            <span>Antrean Pending ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("VERIFIED")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "VERIFIED"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Verified RT ({verifiedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("REJECTED")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "REJECTED"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserX className="size-3.5 text-rose-500" />
            <span>Ditolak ({rejectedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Semua Data ({items.length})</span>
          </button>
        </div>

        {/* Search & Location Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama, NIK, KK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={selectedKelurahan}
            onChange={(e) => setSelectedKelurahan(e.target.value)}
            aria-label="Filter Kelurahan"
            className="h-9 px-2.5 rounded-lg border border-input bg-background text-xs font-medium focus:border-ring outline-none"
          >
            <option value="ALL">Semua Kelurahan</option>
            {kelurahanOptions.map((k) => (
              <option key={k} value={k}>
                Kel. {k}
              </option>
            ))}
          </select>

          <select
            value={filterMbr}
            onChange={(e) => setFilterMbr(e.target.value)}
            aria-label="Filter Kategori MBR"
            className="h-9 px-2.5 rounded-lg border border-input bg-background text-xs font-medium focus:border-ring outline-none hidden md:block"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="MBR">Hanya MBR / Bansos</option>
            <option value="NON_MBR">Bukan MBR</option>
          </select>
        </div>
      </div>

      {/* Tabel Antrean & Verifikasi RT */}
      <Card className="shadow-xs border overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span>Daftar Warga & Siswa Masuk Antrean Verifikasi RT</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                  {filteredItems.length} Data
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Verifikasi kesesuaian domisili tempat tinggal dan penetapan status MBR (Masyarakat Berpenghasilan Rendah)
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" /> Verified RT
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500" /> Pending
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-500" /> Rejected
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
                  <th className="py-3 px-4">Nama Warga / Siswa</th>
                  <th className="py-3 px-4">Kepala Keluarga & NIK</th>
                  <th className="py-3 px-4">Sumber Input</th>
                  <th className="py-3 px-4">Wilayah RT / RW</th>
                  <th className="py-3 px-4 text-center">Status Verifikasi</th>
                  <th className="py-3 px-4 text-center">Status MBR</th>
                  <th className="py-3 px-4 text-right">Aksi Pengurus RT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <UserCheck className="size-8 opacity-40 text-emerald-600" />
                        <p className="font-semibold text-foreground text-sm">Tidak ada antrean data ditemukan</p>
                        <p className="text-xs">
                          Semua data warga di kategori ini telah diproses atau sesuaikan filter pencarian.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                        {idx + 1}
                      </td>

                      {/* Nama Warga */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            {item.nama_warga}
                            {item.usia_tahun && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded border bg-muted text-muted-foreground font-mono">
                                {item.usia_tahun} Th
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            NIK: {item.nik}
                          </p>
                        </div>
                      </td>

                      {/* KK & NIK */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{item.nama_kepala_keluarga}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            KK: {item.no_kk || "-"}
                          </p>
                        </div>
                      </td>

                      {/* Sumber Input */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {item.sumber_data === "SEKOLAH_PAUD" ? (
                            <School className="size-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <HeartHandshake className="size-3.5 text-rose-600 shrink-0" />
                          )}
                          <span className="text-[11px] font-medium text-foreground truncate max-w-[160px]">
                            {item.nama_lembaga_asal}
                          </span>
                        </div>
                      </td>

                      {/* RT/RW & Kelurahan */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">
                            RT {item.rt} / RW {item.rw}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Kel. {item.kelurahan}, Kec. {item.kecamatan}
                          </p>
                        </div>
                      </td>

                      {/* Status Verifikasi Badge */}
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(item.status_verifikasi)}
                      </td>

                      {/* Status MBR Badge */}
                      <td className="py-3 px-4 text-center">
                        {item.is_mbr ? (
                          <span className="inline-flex flex-col items-center gap-0.5">
                            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 text-[10px] font-bold">
                              MBR ({item.kategori_mbr || "Ya"})
                            </Badge>
                            {item.jenis_bansos && item.jenis_bansos.length > 0 && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {item.jenis_bansos.join(", ")}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-medium">Non-MBR</span>
                        )}
                      </td>

                      {/* Aksi RT */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status_verifikasi === "PENDING" && (
                            <Button
                              size="xs"
                              onClick={() => handleQuickApprove(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[11px] shadow-2xs font-semibold"
                            >
                              <CheckCircle2 className="size-3" />
                              <span>Setujui</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => openModal(item)}
                            className="gap-1 shadow-2xs text-[11px]"
                          >
                            <ShieldCheck className="size-3" />
                            <span>Verifikasi & MBR</span>
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
