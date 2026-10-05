const CACHE='set-defteri-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/manifest.webmanifest','/icon-192.png','/icon-512.png'])))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('message',e=>{if(e.data?.type==='CACHE_SHELL')e.waitUntil(caches.open(CACHE).then(async c=>{for(const url of ['/',...e.data.urls]){try{const r=await fetch(url);if(r.ok&&!r.redirected)await c.put(url,r)}catch{}}}))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||/signin|signout|callback/.test(u.pathname))return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(async r=>{if(r.ok&&!r.redirected){const c=await caches.open(CACHE);c.put('/',r.clone())}return r}).catch(async()=>await caches.match('/')||Response.error()));return;}
if(/\.(js|css|png|jpg|jpeg|webp|svg|woff2|webmanifest)$/.test(u.pathname)){e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE);c.put(e.request,r.clone())}return r})));}});
