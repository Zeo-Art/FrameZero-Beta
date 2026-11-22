/* FRAME//ZERO v42: consistent offline-first shell; no mixed-version stale files. */
const CACHE='frame-zero-v45-session-clock';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./icon-1024.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('frame-zero-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
 const u=new URL(r.url),isShell=r.mode==='navigate'||/\.(?:js|css|html)$/.test(u.pathname);
 if(isShell){e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(r,copy)))}return res}).catch(()=>caches.match(r).then(x=>x||caches.match('./index.html'))));return}
 e.respondWith(caches.match(r).then(x=>x||fetch(r)));
});
