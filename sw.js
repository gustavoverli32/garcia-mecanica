const CACHE='garcia-v3';
const ASSETS=['./manifest.json'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))),
    self.clients.claim(),
  ]));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.url.includes('supabase.co'))return;
  // navegação (HTML principal): nunca intercepta — sempre busca versão mais nova direto da rede
  if(e.request.mode==='navigate'||e.request.destination==='document')return;
  // demais assets: network-first com fallback a cache (uso offline)
  e.respondWith(
    fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
