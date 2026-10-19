import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKoneksiAdmin, buatKoneksiServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatPesanError(error) {
  if (!error) return "Terjadi kesalahan saat memuat data.";
  const rawMessage = typeof error === "string" ? error : error.message || "";
  if (
    rawMessage.trim().startsWith("<") ||
    rawMessage.includes("<!DOCTYPE") ||
    rawMessage.includes("<html")
  ) {
    return "Respons dari server tidak valid (berupa HTML). Periksa apakah SUPABASE_URL di .env.local sudah benar mengarah ke URL Supabase (contoh: https://xxxx.supabase.co).";
  }
  return rawMessage;
}

export default async function HalamanAdmin() {
  let daftarProduk = [];
  let pesanError = null;

  try {
    let supabase;
    try {
      supabase = await buatKoneksiAdmin();
    } catch {
      supabase = buatKoneksiServer();
    }

    let { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    // Fallback jika nama tabel menggunakan 'products'
    if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
      const fallback = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }

    if (error) {
      pesanError = formatPesanError(error);
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = formatPesanError(err);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
          <p className="font-semibold">Gagal memuat produk</p>
          <p className="mt-1 text-sm">{pesanError}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="rounded-xl border border-dashed border-garis bg-permukaan p-8 text-center text-teks-lembut">
          Belum ada produk
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
