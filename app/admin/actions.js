"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatKoneksiAdmin } from "@/lib/supabase/server";

/**
 * Memeriksa apakah admin sudah login di sisi server.
 * Digunakan oleh semua Server Action yang mengubah data.
 */
export async function periksaAdminLogin() {
  const supabase = await buatKoneksiAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Kamu harus login terlebih dahulu.");
  }

  return { supabase, user };
}

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

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const passwordBaru = data?.get?.("password_baru")?.toString() || "";
  const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  try {
    const { supabase } = await periksaAdminLogin();

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: error.message || "Gagal mengganti password. Silakan coba lagi." };
    }

    return { success: "Password berhasil diganti!" };
  } catch (err) {
    return {
      error: err.message || "Gagal mengganti password.",
    };
  }
}

export async function tambahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  let supabase;
  try {
    const res = await periksaAdminLogin();
    supabase = res.supabase;
  } catch {
    redirect("/admin/login");
  }

  const nama = data?.get?.("nama")?.toString()?.trim();
  const hargaStr = data?.get?.("harga")?.toString()?.trim();
  const kategori = data?.get?.("kategori")?.toString()?.trim() || null;
  const fotoUrl = data?.get?.("foto_url")?.toString()?.trim() || null;
  const deskripsi = data?.get?.("deskripsi")?.toString()?.trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (!hargaStr) {
    return { error: "Harga produk wajib diisi." };
  }

  const harga = parseInt(hargaStr, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka dan tidak boleh negatif." };
  }

  try {
    let { error } = await supabase.from("produk").insert({
      nama,
      harga,
      kategori,
      foto_url: fotoUrl,
      deskripsi,
    });

    if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
      const fallback = await supabase.from("products").insert({
        nama,
        harga,
        kategori,
        foto_url: fotoUrl,
        deskripsi,
      });
      error = fallback.error;
    }

    if (error) {
      return { error: "Gagal menyimpan produk: " + error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: "Produk berhasil ditambahkan! Mengalihkan ke halaman admin..." };
  } catch (err) {
    return {
      error: "Terjadi kesalahan saat menyimpan produk: " + (err.message || "Gagal menyimpan"),
    };
  }
}
