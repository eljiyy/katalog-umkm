import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk, jumlah = 1, varian = "" }) {
  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const totalHarga = formatRupiah(produk.harga * jumlah);
  const teksVarian = varian ? ` (Varian: ${varian})` : "";
  const teksJumlah = jumlah > 1 ? ` sebanyak ${jumlah} pcs` : "";
  const pesan = `Halo, saya ingin memesan ${produk.nama}${teksVarian}${teksJumlah} dengan total ${totalHarga}. Apakah masih tersedia?`;
  const linkWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={linkWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
