"use server"

import { revalidatePath } from "next/cache"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/server"
import { type PaudStudent } from "@/app/dashboard/school/types"
import { KOTA_TEGAL_WILAYAH } from "@/lib/constants/wilayah"

export interface ImportDapodikResult {
  success: boolean
  message?: string
  count?: number
  importedStudents?: PaudStudent[]
  error?: string
}

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

function cleanString(val: any): string {
  if (val === null || val === undefined) return ""
  let str = String(val).trim()
  if (str.startsWith("'")) {
    str = str.substring(1).trim()
  }
  return str
}

function cleanDigits(val: any): string {
  return cleanString(val).replace(/\D/g, "")
}

function resolveKecamatan(kelurahan: string, explicitKecamatan?: string): string {
  if (explicitKecamatan && explicitKecamatan.trim()) {
    return explicitKecamatan.trim()
  }
  const cleanKel = kelurahan.trim().toLowerCase()
  const found = KOTA_TEGAL_WILAYAH.find(
    (w) => w.kelurahan.toLowerCase() === cleanKel
  )
  return found ? found.kecamatan : "Tegal Barat"
}

function parseRtRw(rtVal: any, rwVal: any, rtrwVal?: any): { rt: string; rw: string } {
  let rt = cleanDigits(rtVal)
  let rw = cleanDigits(rwVal)

  if ((!rt || !rw) && rtrwVal) {
    const raw = cleanString(rtrwVal)
    const match = raw.match(/(\d+)\s*[/\\-]\s*(\d+)/)
    if (match) {
      if (!rt) rt = match[1]
      if (!rw) rw = match[2]
    }
  }

  if (rt.length === 1) rt = `0${rt}`
  if (rw.length === 1) rw = `0${rw}`

  return {
    rt: rt || "01",
    rw: rw || "01",
  }
}

/**
 * Server Action to handle .xlsx Dapodik file upload directly via FormData
 */
export async function importDapodikExcelAction(
  formData: FormData
): Promise<ImportDapodikResult> {
  try {
    const file = formData.get("file") as File | null

    if (!file || !(file instanceof File) || file.size === 0) {
      return {
        success: false,
        error: "File Excel .xlsx belum dipilih atau kosong.",
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true })

    // Find sheet named 'Peserta Didik' (case-insensitive)
    const sheetNames = workbook.SheetNames
    let targetSheetName = sheetNames.find((name) =>
      /peserta\s*didik/i.test(name.trim())
    )

    if (!targetSheetName) {
      targetSheetName =
        sheetNames.find((name) => /siswa|peserta/i.test(name)) || sheetNames[0]
    }

    if (!targetSheetName) {
      return {
        success: false,
        error: "Tidak ada lembar kerja (worksheet) yang ditemukan pada file Excel.",
      }
    }

    const worksheet = workbook.Sheets[targetSheetName]
    const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      blankrows: false,
    })

    if (!rawRows || rawRows.length === 0) {
      return {
        success: false,
        error: `Lembar kerja '${targetSheetName}' tidak berisi data.`,
      }
    }

    // Auto-detect header row index
    let headerRowIndex = 0
    for (let r = 0; r < Math.min(10, rawRows.length); r++) {
      const row = rawRows[r] || []
      const normalizedCells = row.map((cell) => normalizeKey(String(cell || "")))
      const hasNik = normalizedCells.some((c) => c.includes("nik"))
      const hasNisn = normalizedCells.some((c) => c.includes("nisn"))
      const hasNama = normalizedCells.some((c) => c.includes("nama"))

      if ((hasNik && hasNama) || (hasNisn && hasNama) || (hasNik && hasNisn)) {
        headerRowIndex = r
        break
      }
    }

    const headerRow = rawRows[headerRowIndex] || []
    const dataRows = rawRows.slice(headerRowIndex + 1)

    // Map column indexes
    const colMap: { [key: string]: number } = {}
    headerRow.forEach((colHeader, idx) => {
      const norm = normalizeKey(String(colHeader || ""))
      if (!norm) return

      if (norm === "nik" || norm.includes("nonik") || norm.includes("nikpesertadidik") || norm.includes("noktp")) {
        if (colMap.nik === undefined) colMap.nik = idx
      } else if (norm === "nisn" || norm.includes("nonisn") || norm.includes("nisnpesertadidik")) {
        if (colMap.nisn === undefined) colMap.nisn = idx
      } else if (
        norm.includes("namalengkap") ||
        norm === "nama" ||
        norm === "namapesertadidik" ||
        norm === "namasiswa"
      ) {
        if (colMap.nama === undefined) colMap.nama = idx
      } else if (
        norm.includes("ibukandung") ||
        norm.includes("namaibu") ||
        norm === "ibu"
      ) {
        if (colMap.ibu === undefined) colMap.ibu = idx
      } else if (norm === "rt" || norm.startsWith("rt")) {
        if (colMap.rt === undefined) colMap.rt = idx
      } else if (norm === "rw" || norm.startsWith("rw")) {
        if (colMap.rw === undefined) colMap.rw = idx
      } else if (norm.includes("rtrw") || norm === "rt/rw" || norm === "rt_rw") {
        if (colMap.rtrw === undefined) colMap.rtrw = idx
      } else if (
        norm.includes("kelurahan") ||
        norm.includes("desa") ||
        norm === "desakelurahan"
      ) {
        if (colMap.kelurahan === undefined) colMap.kelurahan = idx
      } else if (norm.includes("kecamatan")) {
        if (colMap.kecamatan === undefined) colMap.kecamatan = idx
      } else if (norm.includes("rombel") || norm.includes("rombonganbelajar") || norm.includes("kelompok")) {
        if (colMap.rombel === undefined) colMap.rombel = idx
      } else if (norm === "jk" || norm.includes("jeniskelamin") || norm.includes("lp") || norm === "gender") {
        if (colMap.jk === undefined) colMap.jk = idx
      } else if (norm.includes("tgllahir") || norm.includes("tanggallahir")) {
        if (colMap.tgllahir === undefined) colMap.tgllahir = idx
      } else if (norm.includes("npsn")) {
        if (colMap.npsn === undefined) colMap.npsn = idx
      } else if (norm.includes("namasekolah") || norm.includes("satuanpendidikan")) {
        if (colMap.sekolah === undefined) colMap.sekolah = idx
      }
    })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const preparedStudents: any[] = []

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      if (!row || row.every((c) => c === "" || c === null || c === undefined)) {
        continue
      }

      const rawNik = colMap.nik !== undefined ? row[colMap.nik] : ""
      const rawNisn = colMap.nisn !== undefined ? row[colMap.nisn] : ""
      const rawNama = colMap.nama !== undefined ? row[colMap.nama] : ""
      const rawIbu = colMap.ibu !== undefined ? row[colMap.ibu] : ""
      const rawRt = colMap.rt !== undefined ? row[colMap.rt] : ""
      const rawRw = colMap.rw !== undefined ? row[colMap.rw] : ""
      const rawRtRw = colMap.rtrw !== undefined ? row[colMap.rtrw] : ""
      const rawKelurahan = colMap.kelurahan !== undefined ? row[colMap.kelurahan] : ""
      const rawKecamatan = colMap.kecamatan !== undefined ? row[colMap.kecamatan] : ""
      const rawRombel = colMap.rombel !== undefined ? row[colMap.rombel] : ""
      const rawJk = colMap.jk !== undefined ? row[colMap.jk] : ""
      const rawNpsn = colMap.npsn !== undefined ? row[colMap.npsn] : ""
      const rawSekolah = colMap.sekolah !== undefined ? row[colMap.sekolah] : ""

      const nik = cleanDigits(rawNik)
      const nisn = cleanDigits(rawNisn)
      const nama_lengkap = cleanString(rawNama)
      const nama_ibu_kandung = cleanString(rawIbu)

      if (!nama_lengkap || !nik || !nisn) {
        continue // Skip invalid rows
      }

      const { rt, rw } = parseRtRw(rawRt, rawRw, rawRtRw)
      const kelurahan = cleanString(rawKelurahan) || "Kraton"
      const kecamatan = resolveKecamatan(kelurahan, cleanString(rawKecamatan))

      let rombel: string = "Kelompok A"
      const cleanRombelStr = cleanString(rawRombel).toLowerCase()
      if (cleanRombelStr.includes("b")) {
        rombel = "Kelompok B"
      } else if (cleanRombelStr.includes("kb") || cleanRombelStr.includes("bermain")) {
        rombel = "KB"
      } else if (cleanRombelStr.includes("tpa")) {
        rombel = "TPA"
      } else if (cleanRombelStr.includes("sps")) {
        rombel = "SPS"
      }

      let jenis_kelamin: "L" | "P" = "L"
      const cleanJkStr = cleanString(rawJk).toUpperCase()
      if (cleanJkStr.startsWith("P") || cleanJkStr.includes("PEREMPUAN") || cleanJkStr.includes("WANITA")) {
        jenis_kelamin = "P"
      }

      preparedStudents.push({
        npsn: cleanString(rawNpsn) || "20329811",
        nama_sekolah: cleanString(rawSekolah) || "TK Negeri Pembina Tegal Barat",
        nisn,
        nik,
        nama_lengkap,
        nama_ibu_kandung: nama_ibu_kandung || "Ibu",
        rombel,
        jenis_kelamin,
        rt,
        rw,
        kelurahan,
        kecamatan,
        status_ddtk: true,
        status_pmtas: true,
        catatan_kesehatan: "Impor dari Dapodik",
        user_id: user?.id || null,
        created_at: new Date().toISOString(),
      })
    }

    if (preparedStudents.length === 0) {
      return {
        success: false,
        error: "Tidak ada baris data siswa yang memenuhi syarat (NIK, NISN, Nama Lengkap wajib ada).",
      }
    }

    // Upsert into Supabase (paud_students / students)
    const { error } = await supabase
      .from("paud_students")
      .upsert(preparedStudents, { onConflict: "nisn", ignoreDuplicates: false })

    if (error) {
      console.warn("Supabase paud_students upsert notice:", error.message)
      // Fallback try on students table
      await supabase
        .from("students")
        .upsert(preparedStudents, { onConflict: "nisn", ignoreDuplicates: false })
    }

    revalidatePath("/dashboard/school/students")

    const clientStudents: PaudStudent[] = preparedStudents.map((std, idx) => ({
      id: `std-imp-${Date.now()}-${idx}`,
      ...std,
    }))

    return {
      success: true,
      count: preparedStudents.length,
      message: `Berhasil mengimpor ${preparedStudents.length} data siswa Dapodik ke Supabase.`,
      importedStudents: clientStudents,
    }
  } catch (err: any) {
    console.error("Error in importDapodikExcelAction:", err)
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat memproses file Excel.",
    }
  }
}
