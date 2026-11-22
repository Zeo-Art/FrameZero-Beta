/* FRAME//ZERO v41 — versioned, consistent offline shell. */
const CACHE='frame-zero-v41-stable';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./icon-1024.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 // Always attempt fresh HTML/CSS/JS first; offline fallback is still available.
 const isShell=req.mode==='navigate'||/\.(?:js|css|html)$/.test(new URL(req.url).pathname);
 if(isShell){event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)))}return response}).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html'))));return}
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)))}return response})));
});
