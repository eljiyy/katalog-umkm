import { notFound, redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormUbahProduk from "@/components/FormUbahProduk";
import { periksaAdminLogin } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  let supabase;
  try {
    const res = await periksaAdminLogin();
    supabase = res.supabase;
  } catch {
    redirect("/admin/login");
  }

  let produk = null;
  try {
    let { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
      const fallback = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      data = fallback.data;
    }

    produk = data;
  } catch {
    produk = null;
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormUbahProduk produk={produk} />
    </div>
  );
}
