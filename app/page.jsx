import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { buatKoneksiServer } from "@/lib/supabase/server";

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

function buatUrl({ q, kategori }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (kategori) params.set("kategori", kategori);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function HalamanKatalog({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q?.trim() || "";
  const kategori = sp?.kategori?.trim() || "";
  const sedangFilter = Boolean(q || kategori);

  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = buatKoneksiServer();

    // Ambil daftar kategori unik dari database
    try {
      let { data: kategoriData, error: katError } = await supabase
        .from("produk")
        .select("kategori");

      if (katError && (katError.code === "42P01" || katError.message?.includes("does not exist"))) {
        const fallbackKat = await supabase.from("products").select("kategori");
        kategoriData = fallbackKat.data;
      }

      if (kategoriData) {
        daftarKategori = [
          ...new Set(kategoriData.map((item) => item.kategori).filter(Boolean)),
        ];
      }
    } catch {
      // Abaikan jika gagal mengambil kategori unik
    }

    // Bangun query produk dengan filter kategori dan pencarian nama
    let query = supabase.from("produk").select("*");

    if (kategori) {
      query = query.eq("kategori", kategori);
    }

    if (q) {
      query = query.ilike("nama", `%${q}%`);
    }

    query = query.order("id", { ascending: true });

    let { data, error } = await query;

    // Fallback jika nama tabel di database menggunakan 'products'
    if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
      let fallbackQuery = supabase.from("products").select("*");
      if (kategori) fallbackQuery = fallbackQuery.eq("kategori", kategori);
      if (q) fallbackQuery = fallbackQuery.ilike("nama", `%${q}%`);
      fallbackQuery = fallbackQuery.order("id", { ascending: true });
      const res = await fallbackQuery;
      if (!res.error) {
        data = res.data;
        error = null;
      } else {
        error = res.error;
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
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>
        </div>

        {/* Form Pencarian & Filter Kategori */}
        <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4">
          <form method="GET" action="/" className="flex gap-2">
            {kategori && <input type="hidden" name="kategori" value={kategori} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3.5 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
            >
              Cari
            </button>
            {sedangFilter && (
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks-lembut hover:border-utama hover:text-utama"
              >
                Reset
              </Link>
            )}
          </form>

          {daftarKategori.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-teks-lembut">Kategori:</span>
              <Link
                href={buatUrl({ q, kategori: "" })}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  !kategori
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                }`}
              >
                Semua
              </Link>
              {daftarKategori.map((kat) => (
                <Link
                  key={kat}
                  href={buatUrl({ q, kategori: kat })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    kategori === kat
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                  }`}
                >
                  {kat}
                </Link>
              ))}
            </div>
          )}
        </div>

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
            <p className="font-semibold">Gagal memuat produk</p>
            <p className="mt-1 text-sm">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <div className="rounded-xl border border-dashed border-garis bg-permukaan p-8 text-center text-teks-lembut">
            <p className="text-base font-medium">
              {sedangFilter ? "Produk tidak ditemukan" : "Belum ada produk"}
            </p>
            {sedangFilter && (
              <p className="mt-1 text-xs">
                Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
