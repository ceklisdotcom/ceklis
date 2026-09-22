"use client"

import * as React from "react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { type RekapitulasiWilayahItem } from "./types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Home,
  Layers,
  MapPin,
  PieChart,
  School,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  X,
} from "lucide-react"

interface RekapitulasiClientProps {
  initialData: RekapitulasiWilayahItem[]
  userEmail?: string
}

const KECAMATAN_OPTIONS = [
  "Semua Kecamatan",
  "Margadana",
  "Tegal Barat",
  "Tegal Selatan",
  "Tegal Timur",
  "Luar Kota Tegal",
]

export function RekapitulasiClient({
  initialData,
  userEmail,
}: RekapitulasiClientProps) {
  const [data] = useState<RekapitulasiWilayahItem[]>(initialData)

  // Filters
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("Semua Kecamatan")
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Semua Kelurahan")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Kelurahan options based on selected kecamatan
  const kelurahanList = useMemo(() => {
    if (selectedKecamatan === "Semua Kecamatan") {
      const all = Array.from(new Set(data.map((d) => d.kelurahan))).sort()
      return ["Semua Kelurahan", ...all]
    }
    const filtered = data
      .filter((d) => d.kecamatan === selectedKecamatan)
      .map((d) => d.kelurahan)
      .sort()
    return ["Semua Kelurahan", ...filtered]
  }, [data, selectedKecamatan])

  // Reset kelurahan when kecamatan changes
  const handleKecamatanChange = (kec: string) => {
    setSelectedKecamatan(kec)
    setSelectedKelurahan("Semua Kelurahan")
  }

  // Filtered Table Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchKec =
        selectedKecamatan === "Semua Kecamatan" || item.kecamatan === selectedKecamatan

      const matchKel =
        selectedKelurahan === "Semua Kelurahan" || item.kelurahan === selectedKelurahan

      const matchQuery =
        searchQuery === "" ||
        item.kelurahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())

      return matchKec && matchKel && matchQuery
    })
  }, [data, selectedKecamatan, selectedKelurahan, searchQuery])

  // Aggregate Totals for Summary Cards
  const summaryTotals = useMemo(() => {
    return data.reduce(
      (acc, curr) => ({
        totalSiswa: acc.totalSiswa + curr.total_siswa,
        totalVerified: acc.totalVerified + curr.total_verified_rt,
        totalMbr: acc.totalMbr + curr.total_mbr,
        totalStunting: acc.totalStunting + curr.total_stunting,
        totalPmtas: acc.totalPmtas + curr.total_pmtas,
        totalDdtk: acc.totalDdtk + curr.total_ddtk_selesai,
      }),
      {
        totalSiswa: 0,
        totalVerified: 0,
        totalMbr: 0,
        totalStunting: 0,
        totalPmtas: 0,
        totalDdtk: 0,
      }
    )
  }, [data])

  // Current Filtered Totals for Table Footer
  const tableTotals = useMemo(() => {
    return filteredData.reduce(
      (acc, curr) => ({
        totalSiswa: acc.totalSiswa + curr.total_siswa,
        totalVerified: acc.totalVerified + curr.total_verified_rt,
        totalMbr: acc.totalMbr + curr.total_mbr,
        totalStunting: acc.totalStunting + curr.total_stunting,
        totalPmtas: acc.totalPmtas + curr.total_pmtas,
        totalDdtk: acc.totalDdtk + curr.total_ddtk_selesai,
      }),
      {
        totalSiswa: 0,
        totalVerified: 0,
        totalMbr: 0,
        totalStunting: 0,
        totalPmtas: 0,
        totalDdtk: 0,
      }
    )
  }, [filteredData])

  // Chart Data: Aggregated per Kecamatan
  const chartDataByKecamatan = useMemo(() => {
    const map = new Map<
      string,
      {
        kecamatan: string
        "Total Siswa PAUD": number
        "Verified RT": number
        "Keluarga MBR": number
        "Kasus Stunting": number
      }
    >()

    const targetKecamatans = ["Margadana", "Tegal Barat", "Tegal Selatan", "Tegal Timur", "Luar Kota Tegal"]

    targetKecamatans.forEach((k) => {
      map.set(k, {
        kecamatan: k === "Luar Kota Tegal" ? "Luar Tegal" : k,
        "Total Siswa PAUD": 0,
        "Verified RT": 0,
        "Keluarga MBR": 0,
        "Kasus Stunting": 0,
      })
    })

    data.forEach((item) => {
      const key = item.kecamatan
      if (map.has(key)) {
        const obj = map.get(key)!
        obj["Total Siswa PAUD"] += item.total_siswa
        obj["Verified RT"] += item.total_verified_rt
        obj["Keluarga MBR"] += item.total_mbr
        obj["Kasus Stunting"] += item.total_stunting
      }
    })

    return Array.from(map.values())
  }, [data])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-card border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3" /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Rekapitulasi Agregat</span>
            <span>/</span>
            <span className="text-primary font-medium">Kota Tegal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <BarChart3 className="size-7 text-primary" />
            Rekapitulasi Berjenjang Data Kota Tegal
          </h1>
          <p className="text-sm text-muted-foreground">
            Konsolidasi terpadu data Peserta Didik PAUD (Dapodik), Verifikasi RT/RW, dan Deteksi Stunting Posyandu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/school/students">
            <Button variant="outline" size="sm" className="gap-1.5">
              <School className="size-4 text-indigo-600" />
              <span className="hidden sm:inline">Sekolah PAUD</span>
            </Button>
          </Link>
          <Link href="/dashboard/posyandu/health-records">
            <Button variant="outline" size="sm" className="gap-1.5">
              <HeartHandshake className="size-4 text-rose-600" />
              <span className="hidden sm:inline">KMS Posyandu</span>
            </Button>
          </Link>
          <Link href="/dashboard/rt/verification">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Home className="size-4 text-emerald-600" />
              <span className="hidden sm:inline">Verifikasi RT</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards (Kartu Ringkasan Metrik) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa */}
        <Card className="shadow-2xs border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Siswa PAUD</p>
              <p className="text-2xl font-extrabold mt-1 text-foreground">
                {summaryTotals.totalSiswa.toLocaleString("id-ID")}
              </p>
              <span className="text-[11px] text-muted-foreground">Se-Kota Tegal (27 Kel.)</span>
            </div>
            <div className="size-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Verified RT */}
        <Card className="shadow-2xs border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Terverifikasi RT</p>
              <p className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
                {summaryTotals.totalVerified.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({Math.round((summaryTotals.totalVerified / summaryTotals.totalSiswa) * 100)}%)
                </span>
              </p>
              <span className="text-[11px] text-muted-foreground">Domisili Validasi RT</span>
            </div>
            <div className="size-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total MBR */}
        <Card className="shadow-2xs border-l-4 border-l-purple-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total MBR / Bansos</p>
              <p className="text-2xl font-extrabold mt-1 text-purple-600 dark:text-purple-400">
                {summaryTotals.totalMbr.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({Math.round((summaryTotals.totalMbr / summaryTotals.totalSiswa) * 100)}%)
                </span>
              </p>
              <span className="text-[11px] text-muted-foreground">Penerima Bantuan</span>
            </div>
            <div className="size-11 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <HeartHandshake className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total Stunting */}
        <Card className="shadow-2xs border-l-4 border-l-rose-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kasus Stunting</p>
              <p className="text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">
                {summaryTotals.totalStunting}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({((summaryTotals.totalStunting / summaryTotals.totalSiswa) * 100).toFixed(1)}%)
                </span>
              </p>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                Prioritas Intervensi PMT
              </span>
            </div>
            <div className="size-11 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafik Batang (Bar Chart Recharts) */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                <span>Perbandingan Jumlah Siswa, Verifikasi RT, & Kasus Stunting per Kecamatan</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Visualisasi agregat data 4 Kecamatan di Kota Tegal dan Wilayah Perbatasan
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="size-2.5 rounded-sm bg-indigo-500" /> Siswa PAUD
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="size-2.5 rounded-sm bg-emerald-500" /> Verified RT
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="size-2.5 rounded-sm bg-purple-500" /> MBR
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="size-2.5 rounded-sm bg-rose-500" /> Stunting
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-6">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartDataByKecamatan}
                margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="kecamatan"
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  interval={0}
                  tickMargin={8}
                />
                <YAxis tick={{ fontSize: 11, fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar
                  dataKey="Total Siswa PAUD"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="Verified RT"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="Keluarga MBR"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="Kasus Stunting"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filter Wilayah Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border shadow-2xs">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Dropdown Kecamatan */}
          <div className="space-y-1">
            <Label htmlFor="filter-kecamatan" className="text-xs font-semibold text-muted-foreground">
              Filter Kecamatan
            </Label>
            <select
              id="filter-kecamatan"
              value={selectedKecamatan}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-input bg-background text-xs font-semibold focus:border-ring outline-none min-w-[160px]"
            >
              {KECAMATAN_OPTIONS.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Kelurahan */}
          <div className="space-y-1">
            <Label htmlFor="filter-kelurahan" className="text-xs font-semibold text-muted-foreground">
              Filter Kelurahan
            </Label>
            <select
              id="filter-kelurahan"
              value={selectedKelurahan}
              onChange={(e) => setSelectedKelurahan(e.target.value)}
              className="h-9 px-3 rounded-lg border border-input bg-background text-xs font-semibold focus:border-ring outline-none min-w-[160px]"
            >
              {kelurahanList.map((kel) => (
                <option key={kel} value={kel}>
                  {kel}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="space-y-1 flex-1 min-w-[200px]">
            <Label htmlFor="filter-search" className="text-xs font-semibold text-muted-foreground">
              Cari Wilayah
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                id="filter-search"
                type="text"
                placeholder="Cari kelurahan / kecamatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 h-9 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedKecamatan("Semua Kecamatan")
            setSelectedKelurahan("Semua Kelurahan")
            setSearchQuery("")
          }}
          className="self-end sm:self-auto gap-1 text-xs"
        >
          Reset Filter
        </Button>
      </div>

      {/* Tabel Rekapitulasi Berjenjang (shadcn/ui Table) */}
      <Card className="shadow-xs border overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span>Tabel Agregat Wilayah Kelurahan (v_rekapitulasi_wilayah)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {filteredData.length} Kelurahan
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Data agregat terintegrasi per Kelurahan & Kecamatan di Kota Tegal
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">Sumber: SQL View v_rekapitulasi_wilayah</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Kecamatan</TableHead>
                <TableHead>Kelurahan</TableHead>
                <TableHead className="text-right">Siswa PAUD</TableHead>
                <TableHead className="text-center">Verified RT (%)</TableHead>
                <TableHead className="text-right">Keluarga MBR</TableHead>
                <TableHead className="text-center">Stunting</TableHead>
                <TableHead className="text-right">PMT-AS</TableHead>
                <TableHead className="text-center">DDTK Selesai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <MapPin className="size-8 opacity-40 text-primary" />
                      <p className="font-semibold text-foreground text-sm">Tidak ada wilayah sesuai filter</p>
                      <p className="text-xs">
                        Silakan atur kembali filter kecamatan atau kata kunci pencarian.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow key={`${item.kecamatan}-${item.kelurahan}`} className="hover:bg-muted/30">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-muted-foreground">
                      {item.kecamatan}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-foreground">
                      Kel. {item.kelurahan}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                      {item.total_siswa}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.total_verified_rt} ({item.persentase_verified}%)
                        </span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${item.persentase_verified}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-purple-600 dark:text-purple-400 font-semibold">
                      {item.total_mbr}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.total_stunting > 0 ? (
                        <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 font-bold text-[11px]">
                          {item.total_stunting} Kasus
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">0 Kasus</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-foreground">
                      {item.total_pmtas}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-foreground">
                      {item.total_ddtk_selesai} ({item.persentase_ddtk}%)
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter className="bg-muted/60 font-bold text-xs">
              <TableRow>
                <TableCell colSpan={3} className="text-foreground">
                  TOTAL AKUMULASI ({filteredData.length} Kelurahan Terpilih)
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-foreground">
                  {tableTotals.totalSiswa.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-center font-mono text-emerald-600 dark:text-emerald-400">
                  {tableTotals.totalVerified.toLocaleString("id-ID")}{" "}
                  ({Math.round((tableTotals.totalVerified / (tableTotals.totalSiswa || 1)) * 100)}%)
                </TableCell>
                <TableCell className="text-right font-mono text-purple-600 dark:text-purple-400">
                  {tableTotals.totalMbr.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-center text-rose-600 dark:text-rose-400">
                  {tableTotals.totalStunting} Kasus
                </TableCell>
                <TableCell className="text-right font-mono text-foreground">
                  {tableTotals.totalPmtas.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-center font-mono text-foreground">
                  {tableTotals.totalDdtk.toLocaleString("id-ID")}{" "}
                  ({Math.round((tableTotals.totalDdtk / (tableTotals.totalSiswa || 1)) * 100)}%)
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
