"use server";

import { redirect } from "next/navigation";
import { buatKoneksiAdmin } from "@/lib/supabase/server";

export async function loginAdmin(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const email = data?.get?.("email")?.toString()?.trim();
  const password = data?.get?.("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let isSuccess = false;

  try {
    const supabase = await buatKoneksiAdmin();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message?.includes("Invalid login credentials") ||
        error.status === 400
      ) {
        return { error: "Email atau password salah. Silakan coba lagi." };
      }
      return { error: error.message || "Gagal masuk. Silakan coba lagi." };
    }

    isSuccess = true;
  } catch (err) {
    return {
      error: "Terjadi kesalahan: " + (err.message || "Gagal masuk ke sistem."),
    };
  }

  if (isSuccess) {
    redirect("/admin");
  }
}

export async function keluarAdmin() {
  try {
    const supabase = await buatKoneksiAdmin();
    await supabase.auth.signOut();
  } catch (err) {
    // Tetap lanjut redirect jika proses sign out selesai/ada kendala
  }

  redirect("/admin/login");
}

