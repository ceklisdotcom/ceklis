"use client"

import * as React from "react"
import { type PaudStudent } from "@/app/dashboard/school/types"
import { type PosyanduHealthRecord } from "@/app/dashboard/posyandu/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  AlertTriangle,
  Apple,
  Calendar,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  HeartPulse,
  IdCard,
  MapPin,
  Ruler,
  Scale,
  School,
  ShieldAlert,
  User,
  Utensils,
  X,
} from "lucide-react"

interface StudentHealthHistoryProps {
  student: PaudStudent | null
  healthRecords?: PosyanduHealthRecord[]
  isOpen: boolean
  onClose: () => void
}

export function getGiziBadge(status: string) {
  switch (status) {
    case "Normal":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 font-semibold gap-1">
          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
          <span>Gizi Baik (Normal)</span>
        </Badge>
      )
    case "Stunting":
      return (
        <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 font-bold gap-1 animate-pulse">
          <ShieldAlert className="size-3 text-rose-600 dark:text-rose-400" />
          <span>Terindikasi Stunting</span>
        </Badge>
      )
    case "Gizi Kurang":
    case "Wasting":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 font-semibold gap-1">
          <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
          <span>{status} (Perlu Perhatian)</span>
        </Badge>
      )
    case "Risiko Gizi Lebih":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-100 font-semibold gap-1">
          <Activity className="size-3 text-blue-600 dark:text-blue-400" />
          <span>Risiko Gizi Lebih</span>
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function getDdtkBadge(status: string) {
  switch (status) {
    case "Sesuai (Normal)":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="size-3 text-emerald-500" /> Sesuai Usia
        </span>
      )
    case "Meragukan":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200">
          <AlertTriangle className="size-3 text-amber-500" /> Meragukan (Stimulasi)
        </span>
      )
    case "Penyimpangan":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200">
          <ShieldAlert className="size-3 text-rose-500" /> Rujuk Puskesmas
        </span>
      )
    default:
      return <span className="text-xs text-muted-foreground">{status}</span>
  }
}

export function StudentHealthHistory({
  student,
  healthRecords = [],
  isOpen,
  onClose,
}: StudentHealthHistoryProps) {
  if (!isOpen || !student) return null

  // Filter records matching this student
  const studentRecords = healthRecords.filter(
    (r) => r.student_id === student.id || r.nama_anak.toLowerCase() === student.nama_lengkap.toLowerCase()
  )

  const latestRecord = studentRecords[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-card border shadow-2xl rounded-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <HeartPulse className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Buku KMS & Riwayat Kesehatan Anak</h2>
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                  Integrasi PAUD - Posyandu
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Data pemeriksaan tumbuh kembang berkala dari Kader Posyandu Kota Tegal
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-lg">
            <X className="size-4" />
          </Button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Child Identity Card */}
          <div className="p-4 rounded-xl border bg-gradient-to-r from-primary/5 via-background to-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">{student.nama_lengkap}</span>
                <span className="text-xs px-2 py-0.5 rounded-md border font-semibold bg-background">
                  {student.rombel}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md border font-mono text-muted-foreground">
                  {student.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>NISN: <strong className="text-foreground">{student.nisn}</strong></span>
                <span>•</span>
                <span>NIK: <strong className="text-foreground">{student.nik}</strong></span>
                <span>•</span>
                <span>Ibu: <strong className="text-foreground">{student.nama_ibu_kandung}</strong></span>
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <School className="size-3.5 text-primary" />
                <span>{student.nama_sekolah}</span>
                <span>•</span>
                <MapPin className="size-3.5 text-primary" />
                <span>Kel. {student.kelurahan}, Kec. {student.kecamatan} (RT {student.rt}/RW {student.rw})</span>
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
              <span className="text-xs text-muted-foreground">Status Gizi Terkini:</span>
              {latestRecord ? (
                getGiziBadge(latestRecord.status_gizi)
              ) : (
                <Badge variant="outline" className="text-xs">Belum Ada Pemeriksaan</Badge>
              )}
            </div>
          </div>

          {/* Latest Metric Highlights */}
          {latestRecord && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border bg-card shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Scale className="size-3.5 text-primary" /> Berat Badan (BB)
                </div>
                <p className="text-xl font-bold text-foreground">
                  {latestRecord.berat_badan} <span className="text-xs font-normal text-muted-foreground">kg</span>
                </p>
                <p className="text-[10px] text-muted-foreground">Standar KMS</p>
              </div>

              <div className="p-3.5 rounded-xl border bg-card shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Ruler className="size-3.5 text-primary" /> Tinggi Badan (TB)
                </div>
                <p className="text-xl font-bold text-foreground">
                  {latestRecord.tinggi_badan} <span className="text-xs font-normal text-muted-foreground">cm</span>
                </p>
                <p className="text-[10px] text-muted-foreground">Panjang/Tinggi</p>
              </div>

              <div className="p-3.5 rounded-xl border bg-card shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Activity className="size-3.5 text-primary" /> Lingkar Kepala
                </div>
                <p className="text-xl font-bold text-foreground">
                  {latestRecord.lingkar_kepala} <span className="text-xs font-normal text-muted-foreground">cm</span>
                </p>
                <p className="text-[10px] text-muted-foreground">Kurva Nellhaus</p>
              </div>

              <div className="p-3.5 rounded-xl border bg-card shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <HeartHandshake className="size-3.5 text-primary" /> Deteksi DDTK
                </div>
                <div className="mt-1">
                  {getDdtkBadge(latestRecord.status_ddtk)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Tumbuh Kembang</p>
              </div>
            </div>
          )}

          {/* Timeline & History of Posyandu Visits */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <span>Riwayat Penimbangan Posyandu</span>
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {studentRecords.length} kali penimbangan tercatat
              </span>
            </div>

            {studentRecords.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed text-muted-foreground space-y-2">
                <HeartPulse className="size-8 mx-auto opacity-40 text-rose-500" />
                <p className="text-sm font-semibold text-foreground">Belum ada data penimbangan Posyandu</p>
                <p className="text-xs max-w-md mx-auto">
                  Kader Posyandu di Kelurahan {student.kelurahan} dapat melakukan pencatatan KMS pada modul Posyandu.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          {new Date(rec.tanggal_periksa).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-semibold text-primary">{rec.nama_posyandu}</span>
                        <span className="text-[11px] text-muted-foreground">({rec.usia_bulan} Bulan)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getGiziBadge(rec.status_gizi)}
                        {getDdtkBadge(rec.status_ddtk)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-muted/40 p-2 rounded-lg">
                        <span className="text-muted-foreground text-[11px] block">Berat Badan:</span>
                        <span className="font-bold text-foreground text-sm">{rec.berat_badan} kg</span>
                      </div>
                      <div className="bg-muted/40 p-2 rounded-lg">
                        <span className="text-muted-foreground text-[11px] block">Tinggi Badan:</span>
                        <span className="font-bold text-foreground text-sm">{rec.tinggi_badan} cm</span>
                      </div>
                      <div className="bg-muted/40 p-2 rounded-lg">
                        <span className="text-muted-foreground text-[11px] block">Lingkar Kepala:</span>
                        <span className="font-bold text-foreground text-sm">{rec.lingkar_kepala} cm</span>
                      </div>
                    </div>

                    {rec.catatan_ddtk && (
                      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
                        <strong className="text-foreground">Catatan Kader/Bidan ({rec.kader_pemeriksa}):</strong>{" "}
                        {rec.catatan_ddtk}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collaborative Action Box between School & Posyandu */}
          <div className="p-4 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
              <Apple className="size-4" />
              <span>Rekomendasi Tindak Lanjut Terpadu (Sekolah & Posyandu)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Data pengukuran Posyandu ini terhubung langsung ke modul Guru PAUD. Jika status anak terindikasi <strong>Stunting</strong> atau <strong>Gizi Kurang</strong>, Guru di sekolah dapat memprioritaskan pemberian Makanan Tambahan (PMT-AS) serta memberikan stimulasi perkembangan motorik di kelas.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-end">
          <Button onClick={onClose} variant="default" size="sm">
            Tutup Riwayat
          </Button>
        </div>
      </div>
    </div>
  )
}
