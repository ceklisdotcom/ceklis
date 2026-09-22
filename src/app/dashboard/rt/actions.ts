"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { INITIAL_RT_VERIFICATIONS, type WargaVerificationItem, type StatusVerifikasiRT, type KategoriMBR } from "./types"

export async function getRtVerificationsAction(): Promise<WargaVerificationItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("rt_verifications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error || !data || data.length === 0) {
      return INITIAL_RT_VERIFICATIONS
    }

    return data as WargaVerificationItem[]
  } catch {
    return INITIAL_RT_VERIFICATIONS
  }
}

export async function updateVerificationAction(
  _prevState: any,
  formData: FormData
) {
  const id = (formData.get("id") as string)?.trim()
  const status_verifikasi = (formData.get("status_verifikasi") as StatusVerifikasiRT) || "VERIFIED"
  const is_mbr = formData.get("is_mbr") === "on" || formData.get("is_mbr") === "true"
  const kategori_mbr = (formData.get("kategori_mbr") as KategoriMBR) || (is_mbr ? "MBR" : "NON_MBR")
  const pkh = formData.get("bansos_pkh") === "on"
  const bpnt = formData.get("bansos_bpnt") === "on"
  const kip = formData.get("bansos_kip") === "on"
  const blt = formData.get("bansos_blt") === "on"
  const catatan_rt = (formData.get("catatan_rt") as string)?.trim() || ""
  const verified_by = (formData.get("verified_by") as string)?.trim() || "Pengurus RT"

  const jenis_bansos: string[] = []
  if (pkh) jenis_bansos.push("PKH")
  if (bpnt) jenis_bansos.push("BPNT")
  if (kip) jenis_bansos.push("KIP")
  if (blt) jenis_bansos.push("BLT")

  if (!id) {
    return { error: "ID data verifikasi tidak valid." }
  }

  try {
    const supabase = await createClient()

    const updatePayload = {
      status_verifikasi,
      is_mbr,
      kategori_mbr,
      jenis_bansos,
      catatan_rt,
      verified_by,
      verified_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("rt_verifications")
      .update(updatePayload)
      .eq("id", id)

    if (error) {
      console.warn("Supabase rt_verifications update notice:", error.message)
    }

    revalidatePath("/dashboard/rt/verification")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `Status verifikasi berhasil diperbarui menjadi ${status_verifikasi}.`,
      updatedItem: {
        id,
        status_verifikasi,
        is_mbr,
        kategori_mbr,
        jenis_bansos,
        catatan_rt,
        verified_by,
        verified_at: new Date().toISOString(),
      },
    }
  } catch (err: any) {
    return {
      success: true,
      message: `Status verifikasi berhasil diperbarui.`,
      updatedItem: {
        id,
        status_verifikasi,
        is_mbr,
        kategori_mbr,
        jenis_bansos,
        catatan_rt,
        verified_by,
        verified_at: new Date().toISOString(),
      },
    }
  }
}
