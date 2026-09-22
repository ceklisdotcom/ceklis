export type StatusGizi =
  | "Normal"
  | "Stunting"
  | "Wasting"
  | "Gizi Kurang"
  | "Risiko Gizi Lebih"

export type StatusDdtk =
  | "Sesuai (Normal)"
  | "Meragukan"
  | "Penyimpangan"

export interface PosyanduHealthRecord {
  id: string
  student_id: string
  nama_anak: string
  nisn?: string
  nik?: string
  nama_sekolah?: string
  nama_posyandu: string
  kelurahan: string
  kecamatan: string
  tanggal_periksa: string
  usia_bulan: number
  berat_badan: number // kg
  tinggi_badan: number // cm
  lingkar_kepala: number // cm
  status_gizi: StatusGizi
  status_ddtk: StatusDdtk
  catatan_ddtk?: string
  kader_pemeriksa: string
  created_at?: string
}

// Initial realistic Posyandu Health Records for Kota Tegal children
export const INITIAL_HEALTH_RECORDS: PosyanduHealthRecord[] = [
  {
    id: "rec-001",
    student_id: "std-001",
    nama_anak: "Ahmad Rizky Pratama",
    nisn: "3184920192",
    nik: "3328014503180001",
    nama_sekolah: "TK Negeri Pembina Tegal Barat",
    nama_posyandu: "Posyandu Melati 01",
    kelurahan: "Kraton",
    kecamatan: "Tegal Barat",
    tanggal_periksa: "2026-09-15",
    usia_bulan: 58,
    berat_badan: 16.8,
    tinggi_badan: 104.5,
    lingkar_kepala: 50.2,
    status_gizi: "Normal",
    status_ddtk: "Sesuai (Normal)",
    catatan_ddtk: "Motorik kasar & halus berkembang sangat baik. Responsif saat diajak interaksi.",
    kader_pemeriksa: "Ibu Siti Aminah (Kader)",
    created_at: "2026-09-15T09:00:00Z",
  },
  {
    id: "rec-002",
    student_id: "std-002",
    nama_anak: "Nayla Zahra Salsabila",
    nisn: "3185019283",
    nik: "3328015206180002",
    nama_sekolah: "TK Negeri Pembina Tegal Barat",
    nama_posyandu: "Posyandu Dahlia 04",
    kelurahan: "Tegalsari",
    kecamatan: "Tegal Barat",
    tanggal_periksa: "2026-09-14",
    usia_bulan: 62,
    berat_badan: 17.5,
    tinggi_badan: 108.0,
    lingkar_kepala: 51.0,
    status_gizi: "Normal",
    status_ddtk: "Sesuai (Normal)",
    catatan_ddtk: "Tumbuh kembang optimal, sudah bisa berhitung dan mengenal warna primer.",
    kader_pemeriksa: "Bidan Sri Wahyuni, A.Md.Keb",
    created_at: "2026-09-14T08:30:00Z",
  },
  {
    id: "rec-003",
    student_id: "std-003",
    nama_anak: "Muhammad Farhan Al-Fatih",
    nisn: "3191029384",
    nik: "3328021102190003",
    nama_sekolah: "PAUD Terpadu Melati Margadana",
    nama_posyandu: "Posyandu Cempaka 02",
    kelurahan: "Sumurpanggang",
    kecamatan: "Margadana",
    tanggal_periksa: "2026-09-10",
    usia_bulan: 52,
    berat_badan: 12.1,
    tinggi_badan: 91.5,
    lingkar_kepala: 47.0,
    status_gizi: "Stunting",
    status_ddtk: "Meragukan",
    catatan_ddtk: "Tinggi badan berada di bawah kurva -2 SD WHO. Direkomendasikan intervensi PMT protein hewani & rujukan Puskesmas.",
    kader_pemeriksa: "Ibu Nurhayati (Kader Gizi)",
    created_at: "2026-09-10T10:15:00Z",
  },
  {
    id: "rec-004",
    student_id: "std-004",
    nama_anak: "Aisyah Putri Azzahra",
    nisn: "3187261524",
    nik: "3328026708180004",
    nama_sekolah: "PAUD Terpadu Melati Margadana",
    nama_posyandu: "Posyandu Anggrek 03",
    kelurahan: "Kalinyamat Kulon",
    kecamatan: "Margadana",
    tanggal_periksa: "2026-09-12",
    usia_bulan: 59,
    berat_badan: 13.0,
    tinggi_badan: 99.0,
    lingkar_kepala: 48.8,
    status_gizi: "Gizi Kurang",
    status_ddtk: "Meragukan",
    catatan_ddtk: "Berat badan perlu dinaikkan. Anak ada riwayat alergi telur, perlu menu PMT modifikasi ikan/tahu.",
    kader_pemeriksa: "Ibu Kusminah (Kader Posyandu)",
    created_at: "2026-09-12T09:45:00Z",
  },
  {
    id: "rec-005",
    student_id: "std-005",
    nama_anak: "Bagas Satria Wibowo",
    nisn: "3198827162",
    nik: "3328042504190005",
    nama_sekolah: "TK Pertiwi Tegal Timur",
    nama_posyandu: "Posyandu Mawar 05",
    kelurahan: "Slerok",
    kecamatan: "Tegal Timur",
    tanggal_periksa: "2026-09-08",
    usia_bulan: 50,
    berat_badan: 15.4,
    tinggi_badan: 101.2,
    lingkar_kepala: 49.5,
    status_gizi: "Normal",
    status_ddtk: "Sesuai (Normal)",
    catatan_ddtk: "Pertumbuhan sangat baik, lingkar lengan atas (LiLA) normal.",
    kader_pemeriksa: "Bidan Tri Lestari",
    created_at: "2026-09-08T08:00:00Z",
  },
]
