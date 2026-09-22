import * as XLSX from "xlsx"
import { type PaudStudent } from "@/app/dashboard/school/types"
import { KOTA_TEGAL_WILAYAH } from "@/lib/constants/wilayah"

export interface ParsedDapodikStudent {
  nik: string
  nisn: string
  nama_lengkap: string
  nama_ibu_kandung: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  rombel: "Kelompok A" | "Kelompok B" | "KB" | "TPA" | "SPS"
  jenis_kelamin: "L" | "P"
  tanggal_lahir?: string
  status_ddtk: boolean
  status_pmtas: boolean
  catatan_kesehatan?: string
  npsn?: string
  nama_sekolah?: string
  isValid: boolean
  validationErrors: string[]
}

export interface DapodikParseResult {
  sheetName: string
  totalRows: number
  validCount: number
  invalidCount: number
  students: ParsedDapodikStudent[]
  errors?: string[]
}

/**
 * Normalizes header keys for flexible matching
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

/**
 * Cleans string value from Excel cell (removes quotes, converts scientific notation if stringified)
 */
function cleanString(val: any): string {
  if (val === null || val === undefined) return ""
  let str = String(val).trim()
  if (str.startsWith("'")) {
    str = str.substring(1).trim()
  }
  return str
}

/**
 * Normalizes NIK into clean 16 digit string
 */
function cleanNik(val: any): string {
  const str = cleanString(val).replace(/\D/g, "")
  return str
}

/**
 * Normalizes NISN into clean 10 digit string
 */
function cleanNisn(val: any): string {
  const str = cleanString(val).replace(/\D/g, "")
  return str
}

/**
 * Resolves Kecamatan from Kelurahan in Kota Tegal master data
 */
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

/**
 * Parses RT/RW string or separate values
 */
function parseRtRw(rtVal: any, rwVal: any, rtrwVal?: any): { rt: string; rw: string } {
  let rt = cleanString(rtVal).replace(/\D/g, "")
  let rw = cleanString(rwVal).replace(/\D/g, "")

  if ((!rt || !rw) && rtrwVal) {
    const raw = cleanString(rtrwVal)
    const match = raw.match(/(\d+)\s*[/\\-]\s*(\d+)/)
    if (match) {
      if (!rt) rt = match[1]
      if (!rw) rw = match[2]
    }
  }

  // Format with leading zeros if 1 digit (e.g. "3" -> "03")
  if (rt.length === 1) rt = `0${rt}`
  if (rw.length === 1) rw = `0${rw}`

  return {
    rt: rt || "01",
    rw: rw || "01",
  }
}

/**
 * Parse uploaded Excel file from Dapodik
 */
export async function parseDapodikExcel(file: File): Promise<DapodikParseResult> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true })

  // Find sheet: look for 'Peserta Didik' (case-insensitive) or default to first sheet
  const sheetNames = workbook.SheetNames
  let targetSheetName = sheetNames.find((name) =>
    /peserta\s*didik/i.test(name.trim())
  )

  if (!targetSheetName) {
    // If not found, look for sheets containing 'peserta', 'siswa', or take sheet 0
    targetSheetName =
      sheetNames.find((name) => /siswa|peserta/i.test(name)) || sheetNames[0]
  }

  if (!targetSheetName) {
    throw new Error("File Excel tidak memiliki lembar kerja (worksheet) yang valid.")
  }

  const worksheet = workbook.Sheets[targetSheetName]
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
  })

  if (!rawRows || rawRows.length === 0) {
    throw new Error(`Lembar kerja '${targetSheetName}' kosong.`)
  }

  // Auto-detect header row index (some Dapodik files have title rows on lines 1-3)
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

  // Convert to JSON objects based on the detected header row
  const headerRow = rawRows[headerRowIndex] || []
  const dataRows = rawRows.slice(headerRowIndex + 1)

  // Map header column indexes
  const colMap: { [standardKey: string]: number } = {}
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

  const parsedStudents: ParsedDapodikStudent[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    if (!row || row.every((c) => c === "" || c === null || c === undefined)) {
      continue // Skip empty rows
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
    const rawTglLahir = colMap.tgllahir !== undefined ? row[colMap.tgllahir] : ""
    const rawNpsn = colMap.npsn !== undefined ? row[colMap.npsn] : ""
    const rawSekolah = colMap.sekolah !== undefined ? row[colMap.sekolah] : ""

    const nik = cleanNik(rawNik)
    const nisn = cleanNisn(rawNisn)
    const nama_lengkap = cleanString(rawNama)
    const nama_ibu_kandung = cleanString(rawIbu)
    const { rt, rw } = parseRtRw(rawRt, rawRw, rawRtRw)
    const kelurahan = cleanString(rawKelurahan) || "Kraton"
    const kecamatan = resolveKecamatan(kelurahan, cleanString(rawKecamatan))

    // Determine Rombel
    let rombel: "Kelompok A" | "Kelompok B" | "KB" | "TPA" | "SPS" = "Kelompok A"
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

    // Determine Gender (L / P)
    let jenis_kelamin: "L" | "P" = "L"
    const cleanJkStr = cleanString(rawJk).toUpperCase()
    if (cleanJkStr.startsWith("P") || cleanJkStr.includes("PEREMPUAN") || cleanJkStr.includes("WANITA")) {
      jenis_kelamin = "P"
    }

    // Format Tanggal Lahir
    let tanggal_lahir: string | undefined = undefined
    if (rawTglLahir) {
      if (rawTglLahir instanceof Date && !isNaN(rawTglLahir.getTime())) {
        tanggal_lahir = rawTglLahir.toISOString().split("T")[0]
      } else {
        const cleanTgl = cleanString(rawTglLahir)
        if (cleanTgl) {
          tanggal_lahir = cleanTgl
        }
      }
    }

    // Validation
    const validationErrors: string[] = []
    if (!nama_lengkap) validationErrors.push("Nama siswa wajib diisi")
    if (!nik) {
      validationErrors.push("NIK wajib diisi")
    } else if (nik.length !== 16) {
      validationErrors.push(`NIK harus 16 digit (saat ini ${nik.length} digit)`)
    }

    if (!nisn) {
      validationErrors.push("NISN wajib diisi")
    } else if (nisn.length !== 10) {
      validationErrors.push(`NISN harus 10 digit (saat ini ${nisn.length} digit)`)
    }

    if (!nama_ibu_kandung) validationErrors.push("Nama Ibu Kandung wajib diisi")
    if (!kelurahan) validationErrors.push("Kelurahan wajib diisi")

    parsedStudents.push({
      nik,
      nisn,
      nama_lengkap,
      nama_ibu_kandung,
      rt,
      rw,
      kelurahan,
      kecamatan,
      rombel,
      jenis_kelamin,
      tanggal_lahir,
      status_ddtk: true,
      status_pmtas: true,
      catatan_kesehatan: "Impor dari Dapodik",
      npsn: cleanString(rawNpsn) || "20329811",
      nama_sekolah: cleanString(rawSekolah) || "TK Negeri Pembina Tegal Barat",
      isValid: validationErrors.length === 0,
      validationErrors,
    })
  }

  const validCount = parsedStudents.filter((s) => s.isValid).length
  const invalidCount = parsedStudents.length - validCount

  return {
    sheetName: targetSheetName,
    totalRows: parsedStudents.length,
    validCount,
    invalidCount,
    students: parsedStudents,
  }
}

/**
 * Exports current student data to standard Dapodik Excel format (.xlsx)
 */
export function exportDapodikExcel(
  students: PaudStudent[],
  fileName: string = "Dapodik_Peserta_Didik_Kota_Tegal.xlsx"
) {
  const exportData = students.map((std, idx) => ({
    No: idx + 1,
    NIK: `'${std.nik}`,
    NISN: `'${std.nisn}`,
    "Nama Peserta Didik": std.nama_lengkap,
    "Jenis Kelamin": std.jenis_kelamin === "L" ? "L" : "P",
    "Nama Ibu Kandung": std.nama_ibu_kandung,
    "Rombongan Belajar": std.rombel,
    RT: std.rt,
    RW: std.rw,
    "Desa/Kelurahan": std.kelurahan,
    Kecamatan: std.kecamatan,
    "Status DDTK": std.status_ddtk ? "Sudah" : "Belum",
    "Status PMT-AS": std.status_pmtas ? "Penerima" : "Bukan",
    NPSN: std.npsn,
    "Nama Satuan PAUD": std.nama_sekolah,
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  
  // Set column widths
  worksheet["!cols"] = [
    { wch: 6 },  // No
    { wch: 20 }, // NIK
    { wch: 14 }, // NISN
    { wch: 30 }, // Nama
    { wch: 14 }, // JK
    { wch: 24 }, // Ibu Kandung
    { wch: 18 }, // Rombel
    { wch: 8 },  // RT
    { wch: 8 },  // RW
    { wch: 20 }, // Kelurahan
    { wch: 18 }, // Kecamatan
    { wch: 14 }, // DDTK
    { wch: 14 }, // PMT-AS
    { wch: 12 }, // NPSN
    { wch: 32 }, // Nama Sekolah
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Peserta Didik")

  XLSX.writeFile(workbook, fileName)
}

/**
 * Generates and downloads official template Excel for Dapodik PAUD import
 */
export function downloadDapodikTemplate() {
  const templateData = [
    {
      No: 1,
      NIK: "'3328014503180001",
      NISN: "'3184920192",
      "Nama Peserta Didik": "Ahmad Rizky Pratama",
      "Jenis Kelamin": "L",
      "Nama Ibu Kandung": "Siti Rahayu",
      "Rombongan Belajar": "Kelompok A",
      RT: "03",
      RW: "02",
      "Desa/Kelurahan": "Kraton",
      Kecamatan: "Tegal Barat",
      NPSN: "20329811",
      "Nama Satuan PAUD": "TK Negeri Pembina Tegal Barat",
    },
    {
      No: 2,
      NIK: "'3328015206180002",
      NISN: "'3185019283",
      "Nama Peserta Didik": "Nayla Zahra Salsabila",
      "Jenis Kelamin": "P",
      "Nama Ibu Kandung": "Dewi Lestari",
      "Rombongan Belajar": "Kelompok B",
      RT: "01",
      RW: "04",
      "Desa/Kelurahan": "Tegalsari",
      Kecamatan: "Tegal Barat",
      NPSN: "20329811",
      "Nama Satuan PAUD": "TK Negeri Pembina Tegal Barat",
    },
    {
      No: 3,
      NIK: "'3328021102190003",
      NISN: "'3191029384",
      "Nama Peserta Didik": "Muhammad Farhan Al-Fatih",
      "Jenis Kelamin": "L",
      "Nama Ibu Kandung": "Nurul Hidayah",
      "Rombongan Belajar": "Kelompok A",
      RT: "05",
      RW: "01",
      "Desa/Kelurahan": "Sumurpanggang",
      Kecamatan: "Margadana",
      NPSN: "20329812",
      "Nama Satuan PAUD": "PAUD Terpadu Melati Margadana",
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 14 },
    { wch: 30 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 8 },
    { wch: 8 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 32 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Peserta Didik")

  XLSX.writeFile(workbook, "Template_Dapodik_Peserta_Didik.xlsx")
}
