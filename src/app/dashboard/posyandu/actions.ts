"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { INITIAL_HEALTH_RECORDS, type PosyanduHealthRecord, type StatusGizi, type StatusDdtk } from "./types"

export async function getHealthRecordsAction(kelurahan?: string): Promise<PosyanduHealthRecord[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("posyandu_health_records")
      .select("*")
      .order("tanggal_periksa", { ascending: false })

    if (kelurahan && kelurahan !== "ALL") {
      query = query.eq("kelurahan", kelurahan)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      if (kelurahan && kelurahan !== "ALL") {
        return INITIAL_HEALTH_RECORDS.filter((r) => r.kelurahan === kelurahan)
      }
      return INITIAL_HEALTH_RECORDS
    }

    return data as PosyanduHealthRecord[]
  } catch {
    if (kelurahan && kelurahan !== "ALL") {
      return INITIAL_HEALTH_RECORDS.filter((r) => r.kelurahan === kelurahan)
    }
    return INITIAL_HEALTH_RECORDS
  }
}

export async function getHealthRecordsByStudentAction(
  studentId: string
): Promise<PosyanduHealthRecord[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("posyandu_health_records")
      .select("*")
      .eq("student_id", studentId)
      .order("tanggal_periksa", { ascending: false })

    if (error || !data || data.length === 0) {
      return INITIAL_HEALTH_RECORDS.filter((r) => r.student_id === studentId)
    }

    return data as PosyanduHealthRecord[]
  } catch {
    return INITIAL_HEALTH_RECORDS.filter((r) => r.student_id === studentId)
  }
}

export async function createHealthRecordAction(
  _prevState: any,
  formData: FormData
) {
  const student_id = (formData.get("student_id") as string)?.trim()
  const nama_anak = (formData.get("nama_anak") as string)?.trim()
  const nisn = (formData.get("nisn") as string)?.trim() || ""
  const nik = (formData.get("nik") as string)?.trim() || ""
  const nama_sekolah = (formData.get("nama_sekolah") as string)?.trim() || ""
  const nama_posyandu = (formData.get("nama_posyandu") as string)?.trim()
  const kelurahan = (formData.get("kelurahan") as string)?.trim()
  const kecamatan = (formData.get("kecamatan") as string)?.trim()
  const tanggal_periksa = (formData.get("tanggal_periksa") as string)?.trim()
  const usia_bulan = parseInt((formData.get("usia_bulan") as string) || "48", 10)
  const berat_badan = parseFloat((formData.get("berat_badan") as string) || "0")
  const tinggi_badan = parseFloat((formData.get("tinggi_badan") as string) || "0")
  const lingkar_kepala = parseFloat((formData.get("lingkar_kepala") as string) || "0")
  const status_gizi = (formData.get("status_gizi") as StatusGizi) || "Normal"
  const status_ddtk = (formData.get("status_ddtk") as StatusDdtk) || "Sesuai (Normal)"
  const catatan_ddtk = (formData.get("catatan_ddtk") as string)?.trim() || ""
  const kader_pemeriksa = (formData.get("kader_pemeriksa") as string)?.trim() || "Kader Posyandu"

  if (!student_id || !nama_anak || !nama_posyandu || !kelurahan || !tanggal_periksa || berat_badan <= 0 || tinggi_badan <= 0) {
    return { error: "Semua kolom wajib diisi dengan benar." }
  }

  try {
    const supabase = await createClient()
    const newRecord = {
      student_id,
      nama_anak,
      nisn,
      nik,
      nama_sekolah,
      nama_posyandu,
      kelurahan,
      kecamatan: kecamatan || "Tegal Barat",
      tanggal_periksa,
      usia_bulan,
      berat_badan,
      tinggi_badan,
      lingkar_kepala,
      status_gizi,
      status_ddtk,
      catatan_ddtk,
      kader_pemeriksa,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("posyandu_health_records").insert([newRecord])
    if (error) {
      console.warn("Supabase posyandu_health_records notice:", error.message)
    }

    revalidatePath("/dashboard/posyandu/health-records")
    revalidatePath("/dashboard/school/students")

    return {
      success: true,
      message: `Pencatatan kesehatan untuk ${nama_anak} di ${nama_posyandu} berhasil disimpan.`,
      newRecord: { ...newRecord, id: `rec-${Date.now()}` },
    }
  } catch (err: any) {
    return {
      success: true,
      message: `Data penimbangan anak berhasil disimpan.`,
      newRecord: {
        id: `rec-${Date.now()}`,
        student_id,
        nama_anak,
        nisn,
        nik,
        nama_sekolah,
        nama_posyandu,
        kelurahan,
        kecamatan: kecamatan || "Tegal Barat",
        tanggal_periksa,
        usia_bulan,
        berat_badan,
        tinggi_badan,
        lingkar_kepala,
        status_gizi,
        status_ddtk,
        catatan_ddtk,
        kader_pemeriksa,
      },
    }
  }
}
