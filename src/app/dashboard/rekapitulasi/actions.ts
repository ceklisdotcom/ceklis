"use server"

import { createClient } from "@/lib/supabase/server"
import { INITIAL_REKAPITULASI_WILAYAH, type RekapitulasiWilayahItem } from "./types"

export async function getRekapitulasiWilayahAction(): Promise<RekapitulasiWilayahItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("v_rekapitulasi_wilayah")
      .select("*")

    if (error || !data || data.length === 0) {
      return INITIAL_REKAPITULASI_WILAYAH
    }

    return data as RekapitulasiWilayahItem[]
  } catch {
    return INITIAL_REKAPITULASI_WILAYAH
  }
}
