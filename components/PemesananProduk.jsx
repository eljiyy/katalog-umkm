"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import TombolWhatsApp from "@/components/TombolWhatsApp";

export function ambilDaftarVarian(produk) {
  if (!produk) return [];
  const raw = produk.varian || produk.variants || produk.pilihan_varian;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return raw.split(",").map((v) => v.trim()).filter(Boolean);
    }
  }
  return [];
}

export default function PemesananProduk({ produk }) {
  const daftarVarian = ambilDaftarVarian(produk);
  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState(daftarVarian[0] || "");

  const handleKurang = () => {
    setJumlah((prev) => Math.max(1, prev - 1));
  };

  const handleTambah = () => {
    setJumlah((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Pilihan Varian (jika tersedia di database) */}
      {daftarVarian.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-teks">
            Pilih Varian
          </label>
          <div className="flex flex-wrap gap-2">
            {daftarVarian.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setVarian(item)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  varian === item
                    ? "bg-utama text-white shadow-xs"
                    : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pilih Jumlah */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-teks">
          Jumlah
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={handleKurang}
              disabled={jumlah <= 1}
              aria-label="Kurangi jumlah"
              className="flex h-10 w-10 items-center justify-center rounded-l-lg text-lg font-bold text-teks-lembut hover:bg-permukaan hover:text-teks disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={jumlah}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setJumlah(isNaN(val) || val < 1 ? 1 : val);
              }}
              className="h-10 w-14 border-x border-garis text-center text-sm font-semibold text-teks focus:outline-none"
            />
            <button
              type="button"
              onClick={handleTambah}
              aria-label="Tambah jumlah"
              className="flex h-10 w-10 items-center justify-center rounded-r-lg text-lg font-bold text-teks-lembut hover:bg-permukaan hover:text-teks"
            >
              +
            </button>
          </div>

          <div className="text-sm text-teks-lembut">
            Subtotal:{" "}
            <span className="font-bold text-harga">
              {formatRupiah(produk.harga * jumlah)}
            </span>
          </div>
        </div>
      </div>

      {/* Tombol Pesan via WhatsApp */}
      <div className="pt-2">
        <TombolWhatsApp produk={produk} jumlah={jumlah} varian={varian} />
      </div>
    </div>
  );
}

