export type StatusVerifikasiRT = "PENDING" | "VERIFIED" | "REJECTED" | "MOVED"

export type KategoriMBR = "MBR" | "NON_MBR" | "DESIL_1_EXTREME" | "DESIL_2_SANGAT_MISKIN"

export interface WargaVerificationItem {
  id: string
  student_id?: string
  nama_warga: string
  nik: string
  no_kk?: string
  nama_kepala_keluarga: string
  jenis_kelamin: "L" | "P"
  usia_tahun?: number
  sumber_data: "SEKOLAH_PAUD" | "POSYANDU" | "MANDIRI"
  nama_lembaga_asal: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  alamat_detail?: string
  status_verifikasi: StatusVerifikasiRT
  is_mbr: boolean
  kategori_mbr?: KategoriMBR
  jenis_bansos?: string[] // e.g. ['PKH', 'BPNT', 'KIP']
  catatan_rt?: string
  verified_by?: string
  verified_at?: string
  created_at?: string
}

// Initial realistic data queue for RT Verification in Kota Tegal
export const INITIAL_RT_VERIFICATIONS: WargaVerificationItem[] = [
  {
    id: "ver-001",
    student_id: "std-001",
    nama_warga: "Ahmad Rizky Pratama",
    nik: "3328014503180001",
    no_kk: "3328012004160005",
    nama_kepala_keluarga: "Bambang Sudarmono",
    jenis_kelamin: "L",
    usia_tahun: 5,
    sumber_data: "SEKOLAH_PAUD",
    nama_lembaga_asal: "TK Negeri Pembina Tegal Barat",
    rt: "03",
    rw: "02",
    kelurahan: "Kraton",
    kecamatan: "Tegal Barat",
    alamat_detail: "Jl. Veteran No. 14, RT 03/RW 02",
    status_verifikasi: "PENDING",
    is_mbr: true,
    kategori_mbr: "MBR",
    jenis_bansos: ["PKH", "KIP"],
    catatan_rt: "Perlu pengecekan KK dan konfirmasi status domisili orang tua",
    created_at: "2026-09-16T08:00:00Z",
  },
  {
    id: "ver-002",
    student_id: "std-002",
    nama_warga: "Nayla Zahra Salsabila",
    nik: "3328015206180002",
    no_kk: "3328011208150008",
    nama_kepala_keluarga: "Agus Setiawan",
    jenis_kelamin: "P",
    usia_tahun: 5,
    sumber_data: "POSYANDU",
    nama_lembaga_asal: "Posyandu Dahlia 04 Tegalsari",
    rt: "01",
    rw: "04",
    kelurahan: "Tegalsari",
    kecamatan: "Tegal Barat",
    alamat_detail: "Gg. Teri No. 8B, RT 01/RW 04",
    status_verifikasi: "VERIFIED",
    is_mbr: false,
    kategori_mbr: "NON_MBR",
    jenis_bansos: [],
    catatan_rt: "Warga tetap, domisili sesuai KTP & KK, rumah pribadi",
    verified_by: "Ketua RT 01 Tegalsari (Bpk. Mulyono)",
    verified_at: "2026-09-17T10:30:00Z",
    created_at: "2026-09-14T09:00:00Z",
  },
  {
    id: "ver-003",
    student_id: "std-003",
    nama_warga: "Muhammad Farhan Al-Fatih",
    nik: "3328021102190003",
    no_kk: "3328020501170011",
    nama_kepala_keluarga: "Hendra Gunawan",
    jenis_kelamin: "L",
    usia_tahun: 4,
    sumber_data: "POSYANDU",
    nama_lembaga_asal: "Posyandu Cempaka 02 Sumurpanggang",
    rt: "05",
    rw: "01",
    kelurahan: "Sumurpanggang",
    kecamatan: "Margadana",
    alamat_detail: "Jl. Cendrawasih RT 05/RW 01",
    status_verifikasi: "PENDING",
    is_mbr: true,
    kategori_mbr: "DESIL_1_EXTREME",
    jenis_bansos: ["PKH", "BPNT", "BLT"],
    catatan_rt: "Keluarga terindikasi stunting dari posyandu, diusulkan prioritas bantuan RT",
    created_at: "2026-09-18T11:00:00Z",
  },
  {
    id: "ver-004",
    student_id: "std-004",
    nama_warga: "Aisyah Putri Azzahra",
    nik: "3328026708180004",
    no_kk: "3328021803160002",
    nama_kepala_keluarga: "Rahmat Santoso",
    jenis_kelamin: "P",
    usia_tahun: 5,
    sumber_data: "SEKOLAH_PAUD",
    nama_lembaga_asal: "PAUD Terpadu Melati Margadana",
    rt: "02",
    rw: "03",
    kelurahan: "Kalinyamat Kulon",
    kecamatan: "Margadana",
    alamat_detail: "Jl. Raya Kalinyamat RT 02/RW 03",
    status_verifikasi: "VERIFIED",
    is_mbr: true,
    kategori_mbr: "MBR",
    jenis_bansos: ["KIP"],
    catatan_rt: "Domisili sah, terdaftar penerima program bantuan anak sekolah",
    verified_by: "Sekretaris RT 02 (Bpk. Joko)",
    verified_at: "2026-09-19T14:15:00Z",
    created_at: "2026-09-15T08:30:00Z",
  },
  {
    id: "ver-005",
    student_id: "std-005",
    nama_warga: "Bagas Satria Wibowo",
    nik: "3328042504190005",
    no_kk: "3328041009180007",
    nama_kepala_keluarga: "Dwi Prasetyo",
    jenis_kelamin: "L",
    usia_tahun: 4,
    sumber_data: "SEKOLAH_PAUD",
    nama_lembaga_asal: "TK Pertiwi Tegal Timur",
    rt: "04",
    rw: "05",
    kelurahan: "Slerok",
    kecamatan: "Tegal Timur",
    alamat_detail: "Jl. Merpati No. 22 RT 04/RW 05",
    status_verifikasi: "PENDING",
    is_mbr: false,
    kategori_mbr: "NON_MBR",
    jenis_bansos: [],
    catatan_rt: "Baru pindah masuk 2 bulan lalu, berkas surat pindah lengkap",
    created_at: "2026-09-20T09:10:00Z",
  },
  {
    id: "ver-006",
    nama_warga: "Dimas Aditya Saputra",
    nik: "3328011904180009",
    no_kk: "3328010802160003",
    nama_kepala_keluarga: "Suranto",
    jenis_kelamin: "L",
    usia_tahun: 6,
    sumber_data: "SEKOLAH_PAUD",
    nama_lembaga_asal: "TK Negeri Pembina Tegal Barat",
    rt: "03",
    rw: "02",
    kelurahan: "Kraton",
    kecamatan: "Tegal Barat",
    alamat_detail: "Jl. Pemuda No. 5",
    status_verifikasi: "REJECTED",
    is_mbr: false,
    catatan_rt: "Keluarga sudah pindah ke Slawi sejak 6 bulan lalu, tidak lagi berdomisili di RT 03",
    verified_by: "Ketua RT 03 Kraton",
    verified_at: "2026-09-18T16:00:00Z",
    created_at: "2026-09-12T10:00:00Z",
  },
]
