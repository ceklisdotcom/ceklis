"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { KOTA_TEGAL_WILAYAH, type WilayahTegalItem } from "@/lib/constants/wilayah"

export interface AuthState {
  error?: string | null
  success?: boolean
  message?: string | null
}

export async function fetchWilayahTegalAction(): Promise<WilayahTegalItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("wilayah_tegal")
      .select("*")
      .order("kecamatan", { ascending: true })

    if (error || !data || data.length === 0) {
      return KOTA_TEGAL_WILAYAH
    }

    return data as WilayahTegalItem[]
  } catch {
    return KOTA_TEGAL_WILAYAH
  }
}

export async function loginAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let message = error.message
    if (error.message.includes("Invalid login credentials")) {
      message = "Email atau kata sandi tidak valid. Silakan periksa kembali."
    } else if (error.message.includes("Email not confirmed")) {
      message = "Email belum dikonfirmasi. Silakan periksa kotak masuk email Anda."
    }
    return { error: message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function registerAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm_password") as string

  // Identity fields
  const full_name = (formData.get("full_name") as string)?.trim()
  const nik = (formData.get("nik") as string)?.trim()
  const phone = (formData.get("phone") as string)?.trim()

  // Community & Role
  const community = (formData.get("community") as string)?.trim()
  const role = (formData.get("role") as string)?.trim()

  // Wilayah
  const kecamatan = (formData.get("kecamatan") as string)?.trim()
  const kelurahan = (formData.get("kelurahan") as string)?.trim()
  const rw = (formData.get("rw") as string)?.trim()
  const rt = (formData.get("rt") as string)?.trim()

  // Basic validation
  if (!email || !password || !full_name || !nik || !phone || !community || !role || !kecamatan || !kelurahan || !rw || !rt) {
    return { error: "Semua kolom formulir wajib diisi." }
  }

  if (password.length < 6) {
    return { error: "Kata sandi minimal harus 6 karakter." }
  }

  if (password !== confirmPassword) {
    return { error: "Konfirmasi kata sandi tidak cocok." }
  }

  if (!/^\d{16}$/.test(nik)) {
    return { error: "NIK harus berupa 16 digit angka." }
  }

  const supabase = await createClient()

  const metadata = {
    full_name,
    nik,
    phone,
    community,
    role,
    kecamatan,
    kelurahan,
    rw,
    rt,
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  if (signUpError) {
    let message = signUpError.message
    if (signUpError.message.includes("User already registered")) {
      message = "Email ini sudah terdaftar. Silakan login."
    }
    return { error: message }
  }

  // Attempt saving to profiles table if available
  if (authData.user) {
    try {
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        email,
        full_name,
        nik,
        phone,
        community,
        role,
        kecamatan,
        kelurahan,
        rw,
        rt,
        updated_at: new Date().toISOString(),
      })
    } catch {
      // Ignored if table or permissions are restricted; user_metadata will serve as primary backup
    }
  }

  // If auto-logged in with session
  if (authData.session) {
    revalidatePath("/", "layout")
    redirect("/dashboard")
  }

  return {
    success: true,
    message: "Pendaftaran berhasil! Akun Anda telah dibuat. Silakan login untuk melanjutkan.",
  }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
