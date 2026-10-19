"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";

export default function HalamanTambahProduk() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(tambahProduk, null);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/admin");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk
        labelTombol="Simpan produk"
        action={formAction}
        state={state}
        isPending={isPending}
      />
    </div>
  );
}
