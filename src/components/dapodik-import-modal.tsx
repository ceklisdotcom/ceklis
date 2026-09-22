"use client"

import * as React from "react"
import { useState, useRef } from "react"
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Loader2,
  X,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  parseDapodikExcel,
  downloadDapodikTemplate,
  type DapodikParseResult,
} from "@/lib/excel/dapodik-excel"
import { importDapodikExcelAction } from "@/app/dashboard/school/students/actions"
import { importDapodikStudentsAction } from "@/app/dashboard/school/actions"
import { type PaudStudent } from "@/app/dashboard/school/types"

interface DapodikImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: (importedStudents: PaudStudent[], count: number) => void
}

export function DapodikImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: DapodikImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [parseResult, setParseResult] = useState<DapodikParseResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const resetState = () => {
    setFile(null)
    setParseResult(null)
    setParseError(null)
    setIsParsing(false)
    setIsSubmitting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile) return
    const isExcel =
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls") ||
      selectedFile.type.includes("spreadsheet") ||
      selectedFile.type.includes("excel")

    if (!isExcel) {
      setParseError("Harap unggah file spreadsheet Excel (.xlsx atau .xls).")
      return
    }

    setFile(selectedFile)
    setParseError(null)
    setIsParsing(true)

    try {
      const result = await parseDapodikExcel(selectedFile)
      setParseResult(result)
      if (result.totalRows === 0) {
        setParseError(`Tidak ada baris data siswa yang ditemukan pada sheet '${result.sheetName}'.`)
      }
    } catch (err: any) {
      console.error("Error parsing Excel:", err)
      setParseError(err.message || "Gagal membaca file Excel. Pastikan file valid.")
      setParseResult(null)
    } finally {
      setIsParsing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleSubmitImport = async () => {
    if (!file && (!parseResult || parseResult.students.length === 0)) return

    setIsSubmitting(true)
    try {
      let res: any = null

      // First attempt using direct FormData Server Action in app/dashboard/school/students/actions.ts
      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        res = await importDapodikExcelAction(formData)
      }

      // If needed fallback to parsed array server action
      if (!res?.success && parseResult && parseResult.students.length > 0) {
        const validStudents = parseResult.students.filter((s) => s.isValid)
        const targetStudents = validStudents.length > 0 ? validStudents : parseResult.students
        res = await importDapodikStudentsAction(targetStudents)
      }

      if (res?.success) {
        toast.add({
          title: "Import Dapodik Berhasil! 🎉",
          description: `Berhasil mengimpor ${res.count} data siswa Dapodik ke database Supabase.`,
          type: "success",
        })

        onImportSuccess(res.importedStudents || [], res.count || 0)
        resetState()
        onClose()
      } else {
        toast.add({
          title: "Gagal Mengimpor Data",
          description: res?.error || "Terjadi kesalahan saat menyimpan data.",
          type: "error",
        })
      }
    } catch (err: any) {
      toast.add({
        title: "Kesalahan Sistem",
        description: err.message || "Terjadi kendala saat impor data.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetState()
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                Import Excel Dapodik Peserta Didik
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300">
                  Kemendikbudristek
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Unggah file Excel .xlsx dari Pusat Unduhan Dapodik untuk sinkronisasi otomatis ke Supabase
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Dialog Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Information & Template Download Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Format File Excel yang Didukung:</p>
                <p className="text-muted-foreground">
                  Membaca sheet <strong>&apos;Peserta Didik&apos;</strong> dan memetakan kolom:{" "}
                  <span className="font-mono text-foreground font-medium">
                    NIK, NISN, Nama Siswa, Ibu Kandung, Rombel, RT/RW, dan Kelurahan
                  </span>
                  .
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadDapodikTemplate}
              className="gap-1.5 shrink-0 bg-background text-xs shadow-2xs hover:border-primary/50"
            >
              <Download className="size-3.5 text-primary" />
              <span>Unduh Template Contoh</span>
            </Button>
          </div>

          {/* Upload Dropzone */}
          {!parseResult && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? "border-primary bg-primary/10 scale-[0.99]"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0])
                  }
                }}
              />
              <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                {isParsing ? (
                  <Loader2 className="size-7 animate-spin" />
                ) : (
                  <UploadCloud className="size-7" />
                )}
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-semibold text-foreground">
                  {isParsing ? "Sedang memproses file Excel..." : "Klik atau seret file .xlsx ke sini"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mendukung file unduhan Dapodik resmi (.xlsx atau .xls). Maksimal 10MB.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {parseError && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive text-xs">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Gagal memproses file</p>
                <p>{parseError}</p>
              </div>
            </div>
          )}

          {/* Parse Result Summary & Preview Table */}
          {parseResult && (
            <div className="space-y-4 animate-in fade-in-50">
              {/* File Info & Stats Card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border bg-muted/30 flex items-center justify-between sm:col-span-1">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Sheet Terdeteksi</span>
                    <p className="text-sm font-bold text-foreground truncate max-w-[150px]">
                      {parseResult.sheetName}
                    </p>
                  </div>
                  <FileCheck className="size-5 text-emerald-600" />
                </div>

                <div className="p-3.5 rounded-xl border bg-muted/30 flex items-center justify-between sm:col-span-1">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Total Siswa Dibaca</span>
                    <p className="text-sm font-bold text-foreground">
                      {parseResult.totalRows} Siswa
                    </p>
                  </div>
                  <Users className="size-5 text-blue-600" />
                </div>

                <div className="p-3.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 flex items-center justify-between sm:col-span-1">
                  <div>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300">Siap Diimpor (Valid)</span>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {parseResult.validCount} Siswa
                    </p>
                  </div>
                  <CheckCircle2 className="size-5 text-emerald-600" />
                </div>

                <div className="p-3.5 rounded-xl border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 flex items-center justify-between sm:col-span-1">
                  <div>
                    <span className="text-[11px] text-amber-700 dark:text-amber-300">Perlu Perhatian</span>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {parseResult.invalidCount} Siswa
                    </p>
                  </div>
                  <AlertTriangle className="size-5 text-amber-600" />
                </div>
              </div>

              {/* Table Preview */}
              <div className="border rounded-xl overflow-hidden">
                <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <span>Pratinjau Data Pemetaan Dapodik</span>
                    <span className="text-muted-foreground font-normal">
                      (Menampilkan {Math.min(parseResult.students.length, 100)} siswa)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setFile(null)
                      setParseResult(null)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Ganti File
                  </Button>
                </div>

                <div className="max-h-72 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-xs text-muted-foreground border-b font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-10">No</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">NIK</th>
                        <th className="py-2.5 px-3">Ibu Kandung</th>
                        <th className="py-2.5 px-3">Rombel</th>
                        <th className="py-2.5 px-3">RT / RW</th>
                        <th className="py-2.5 px-3">Kelurahan</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {parseResult.students.map((std, idx) => (
                        <tr
                          key={idx}
                          className={std.isValid ? "hover:bg-muted/30" : "bg-destructive/5 hover:bg-destructive/10"}
                        >
                          <td className="py-2 px-3 text-center font-mono text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-foreground">{std.nama_lengkap || "-"}</span>
                            <span className="text-[10px] ml-1.5 px-1 rounded bg-muted text-muted-foreground font-mono">
                              {std.jenis_kelamin}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {std.nisn || <span className="text-destructive font-semibold">Kosong</span>}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {std.nik || <span className="text-destructive font-semibold">Kosong</span>}
                          </td>
                          <td className="py-2 px-3 text-foreground">
                            {std.nama_ibu_kandung || <span className="text-destructive font-semibold">Kosong</span>}
                          </td>
                          <td className="py-2 px-3 font-medium text-foreground">
                            {std.rombel}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {std.rt} / {std.rw}
                          </td>
                          <td className="py-2 px-3 text-foreground">
                            {std.kelurahan}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {std.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3" /> Siap
                              </span>
                            ) : (
                              <span
                                title={std.validationErrors.join(", ")}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive cursor-help"
                              >
                                <XCircle className="size-3" /> Peringatan
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0 flex items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetState()
              onClose()
            }}
            disabled={isSubmitting}
          >
            Batal
          </Button>

          <div className="flex items-center gap-2">
            {parseResult && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitImport}
                disabled={isSubmitting || parseResult.totalRows === 0}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Simpan & Impor {parseResult.validCount} Data Siswa</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
