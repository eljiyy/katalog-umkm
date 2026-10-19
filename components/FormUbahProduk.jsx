"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";

export default function FormUbahProduk({ produk }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(ubahProduk, null);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/admin");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <FormProduk
      produk={produk}
      labelTombol="Simpan perubahan"
      action={formAction}
      state={state}
      isPending={isPending}
    />
  );
}

