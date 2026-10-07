/* Service Worker：离线缓存 app shell，手机没网也能打开已缓存页面 */
const CACHE = "workbench-v1";
const ASSETS = [
  "./",
  "./个人工作台.html",
  "./manifest.json",
  "./assets/seed.js",
  "./assets/xlsx.full.min.js",
  "./assets/echarts.min.js",
  "./assets/pptxgen.bundle.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (e.request.method !== "GET" || !url.startsWith(self.location.origin)) return;
  // 云同步 API 请求不缓存
  if (url.indexOf("api.github.com") >= 0) return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        const ok = res && res.status === 200 && (res.type === "basic" || res.type === "default");
        if (ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match("./个人工作台.html"));
    })
  );
});
