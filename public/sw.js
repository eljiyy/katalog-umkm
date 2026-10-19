// Service Worker minimal untuk PWA — membuat aplikasi installable.
// Strategi: network-first dengan fallback ke cache untuk pengalaman offline dasar.

const CACHE_NAME = "katalog-umkm-v1";
const OFFLINE_URLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Hanya handle GET requests
  if (event.request.method !== "GET") return;

  // Lewati request ke Supabase atau API eksternal
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan salinan respons ke cache
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Jika jaringan gagal, coba dari cache
        return caches.match(event.request);
      })
  );
});

