"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Gagal mendaftarkan SW (mungkin di dev mode), abaikan
      });
    }
  }, []);

  return null;
}

