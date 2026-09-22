export interface PaudStudent {
  id: string
  npsn: string
  nama_sekolah: string
  nisn: string
  nik: string
  nama_lengkap: string
  nama_ibu_kandung: string
  rombel: "Kelompok A" | "Kelompok B" | "KB" | "TPA" | "SPS"
  jenis_kelamin: "L" | "P"
  tanggal_lahir?: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  status_ddtk: boolean
  status_pmtas: boolean
  catatan_kesehatan?: string
  created_at?: string
}

// Initial realistic Dapodik data for Kota Tegal PAUD-PNF
export const INITIAL_PAUD_STUDENTS: PaudStudent[] = [
  {
    id: "std-001",
    npsn: "20329811",
    nama_sekolah: "TK Negeri Pembina Tegal Barat",
    nisn: "3184920192",
    nik: "3328014503180001",
    nama_lengkap: "Ahmad Rizky Pratama",
    nama_ibu_kandung: "Siti Rahayu",
    rombel: "Kelompok A",
    jenis_kelamin: "L",
    rt: "03",
    rw: "02",
    kelurahan: "Kraton",
    kecamatan: "Tegal Barat",
    status_ddtk: true,
    status_pmtas: true,
    catatan_kesehatan: "Tinggi & berat badan normal, imunisasi lengkap",
    created_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "std-002",
    npsn: "20329811",
    nama_sekolah: "TK Negeri Pembina Tegal Barat",
    nisn: "3185019283",
    nik: "3328015206180002",
    nama_lengkap: "Nayla Zahra Salsabila",
    nama_ibu_kandung: "Dewi Lestari",
    rombel: "Kelompok B",
    jenis_kelamin: "P",
    rt: "01",
    rw: "04",
    kelurahan: "Tegalsari",
    kecamatan: "Tegal Barat",
    status_ddtk: true,
    status_pmtas: true,
    catatan_kesehatan: "Tumbuh kembang optimal, tes daya dengar normal",
    created_at: "2026-09-01T08:15:00Z",
  },
  {
    id: "std-003",
    npsn: "20329812",
    nama_sekolah: "PAUD Terpadu Melati Margadana",
    nisn: "3191029384",
    nik: "3328021102190003",
    nama_lengkap: "Muhammad Farhan Al-Fatih",
    nama_ibu_kandung: "Nurul Hidayah",
    rombel: "Kelompok A",
    jenis_kelamin: "L",
    rt: "05",
    rw: "01",
    kelurahan: "Sumurpanggang",
    kecamatan: "Margadana",
    status_ddtk: false,
    status_pmtas: true,
    catatan_kesehatan: "Perlu jadwal ulang pemeriksaan lingkar kepala DDTK",
    created_at: "2026-09-02T09:30:00Z",
  },
  {
    id: "std-004",
    npsn: "20329812",
    nama_sekolah: "PAUD Terpadu Melati Margadana",
    nisn: "3187261524",
    nik: "3328026708180004",
    nama_lengkap: "Aisyah Putri Azzahra",
    nama_ibu_kandung: "Ratna Sari",
    rombel: "Kelompok B",
    jenis_kelamin: "P",
    rt: "02",
    rw: "03",
    kelurahan: "Kalinyamat Kulon",
    kecamatan: "Margadana",
    status_ddtk: true,
    status_pmtas: false,
    catatan_kesehatan: "Sedang evaluasi menu PMT-AS alergi telur",
    created_at: "2026-09-03T10:00:00Z",
  },
  {
    id: "std-005",
    npsn: "20329815",
    nama_sekolah: "TK Pertiwi Tegal Timur",
    nisn: "3198827162",
    nik: "3328042504190005",
    nama_lengkap: "Bagas Satria Wibowo",
    nama_ibu_kandung: "Endang Suprihatin",
    rombel: "Kelompok A",
    jenis_kelamin: "L",
    rt: "04",
    rw: "05",
    kelurahan: "Slerok",
    kecamatan: "Tegal Timur",
    status_ddtk: true,
    status_pmtas: true,
    catatan_kesehatan: "Tumbuh kembang sangat baik",
    created_at: "2026-09-04T11:20:00Z",
  },
]
