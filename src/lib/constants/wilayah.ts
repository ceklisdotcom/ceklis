export interface WilayahTegalItem {
  id?: string | number
  kecamatan: string
  kelurahan: string
  kode_pos?: string
}

export const KOTA_TEGAL_WILAYAH: WilayahTegalItem[] = [
  // Margadana
  { kecamatan: "Margadana", kelurahan: "Cabawan" },
  { kecamatan: "Margadana", kelurahan: "Kaligangsa" },
  { kecamatan: "Margadana", kelurahan: "Kalinyamat Kulon" },
  { kecamatan: "Margadana", kelurahan: "Krandon" },
  { kecamatan: "Margadana", kelurahan: "Margadana" },
  { kecamatan: "Margadana", kelurahan: "Pesurungan Lor" },
  { kecamatan: "Margadana", kelurahan: "Sumurpanggang" },

  // Tegal Barat
  { kecamatan: "Tegal Barat", kelurahan: "Debong Lor" },
  { kecamatan: "Tegal Barat", kelurahan: "Kemandungan" },
  { kecamatan: "Tegal Barat", kelurahan: "Kraton" },
  { kecamatan: "Tegal Barat", kelurahan: "Muarareja" },
  { kecamatan: "Tegal Barat", kelurahan: "Pekauman" },
  { kecamatan: "Tegal Barat", kelurahan: "Pesurungan Kidul" },
  { kecamatan: "Tegal Barat", kelurahan: "Tegalsari" },

  // Tegal Selatan
  { kecamatan: "Tegal Selatan", kelurahan: "Bandung" },
  { kecamatan: "Tegal Selatan", kelurahan: "Debong Kidul" },
  { kecamatan: "Tegal Selatan", kelurahan: "Debong Kulon" },
  { kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah" },
  { kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Wetan" },
  { kecamatan: "Tegal Selatan", kelurahan: "Randugunting" },
  { kecamatan: "Tegal Selatan", kelurahan: "Tunon" },

  // Tegal Timur
  { kecamatan: "Tegal Timur", kelurahan: "Kejambon" },
  { kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman" },
  { kecamatan: "Tegal Timur", kelurahan: "Mintaragen" },
  { kecamatan: "Tegal Timur", kelurahan: "Panggung" },
  { kecamatan: "Tegal Timur", kelurahan: "Slerok" },
]

export const KECAMATAN_LIST = Array.from(
  new Set(KOTA_TEGAL_WILAYAH.map((item) => item.kecamatan))
).sort()

export type CommunityType = "RT" | "POSYANDU" | "SEKOLAH"

export interface CommunityOption {
  value: CommunityType
  label: string
  description: string
  roles: { value: string; label: string }[]
}

export const COMMUNITIES: CommunityOption[] = [
  {
    value: "RT",
    label: "Rukun Tetangga (RT)",
    description: "Komunitas kependudukan tingkat rukun tetangga / warga",
    roles: [
      { value: "Ketua RT", label: "Ketua RT" },
      { value: "Admin RT", label: "Admin RT / Sekretaris" },
      { value: "Penduduk", label: "Penduduk Tetap" },
      { value: "Pendatang", label: "Pendatang / Domisili Sementara" },
    ],
  },
  {
    value: "POSYANDU",
    label: "Pos Pelayanan Terpadu (POSYANDU)",
    description: "Layanan kesehatan ibu, balita, dan lansia",
    roles: [
      { value: "Ketua Posyandu", label: "Ketua Posyandu" },
      { value: "Kader Posyandu", label: "Kader Posyandu" },
      { value: "Bidan Desa", label: "Bidan Desa / Tenaga Medis" },
      { value: "Warga / Sasaran", label: "Warga / Peserta Posyandu" },
    ],
  },
  {
    value: "SEKOLAH",
    label: "Institusi Pendidikan (SEKOLAH)",
    description: "Komunitas guru, staf, siswa, dan orang tua",
    roles: [
      { value: "Kepala Sekolah", label: "Kepala Sekolah" },
      { value: "Guru", label: "Guru / Tenaga Pendidik" },
      { value: "Staf", label: "Staf / Tata Usaha" },
      { value: "Siswa / Wali Murid", label: "Siswa / Wali Murid" },
    ],
  },
]
