/* Service worker minimal : permet l'installation sur Android (Chrome) et garde la coquille de l'appli pour
   quand le réseau manque. Les horaires et l'historique (autres domaines) ne passent jamais par ici : ils restent
   toujours lus en direct. Réseau d'abord, donc une mise à jour du site est visible tout de suite. */
var CACHE = 'vols-lesquin-v1';
var COQUILLE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(COQUILLE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (noms) {
    return Promise.all(noms.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return; // autres domaines : réseau normal
  e.respondWith(fetch(r).then(function (rep) {
    if (rep && rep.ok) { var copie = rep.clone(); caches.open(CACHE).then(function (c) { c.put(r, copie); }); }
    return rep;
  }).catch(function () {
    return caches.match(r).then(function (x) { return x || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()); });
  }));
});
