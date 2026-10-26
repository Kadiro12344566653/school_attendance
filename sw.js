/* دفتر الغيابات — يفتح فورا حتى مع إنترنت ضعيف. نسخة: 1cb6e11647 */
var CACHE = 'daftar-1cb6e11647';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './fonts/tajawal-arabic-400-normal.woff2', './fonts/tajawal-arabic-700-normal.woff2', './fonts/tajawal-arabic-800-normal.woff2', './fonts/tajawal-latin-400-normal.woff2'];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;                                  // طلبات البيانات (Google) لا تُحفظ أبدا
  if (url.origin === location.origin) {
    // الصفحة: من الشبكة أولا (أحدث نسخة)، ومن الذاكرة إن تأخرت أكثر من 2.5 ث أو انقطع الإنترنت
    e.respondWith(new Promise(function (resolve) {
      var done = false, cached = caches.match(req, { ignoreSearch: true });
      var t = setTimeout(function () { cached.then(function (r) { if (r && !done) { done = true; resolve(r); } }); }, 2500);
      fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        if (!done) { done = true; clearTimeout(t); resolve(res); }
      }).catch(function () {
        cached.then(function (r) { if (!done) { done = true; clearTimeout(t); resolve(r || Response.error()); } });
      });
    }));
  } else if (/(^|\.)(cdnjs\.cloudflare\.com|fonts\.gstatic\.com|fonts\.googleapis\.com)$/.test(url.hostname)) {
    // مكتبات وخطوط بإصدار ثابت: من الذاكرة
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    }));
  }
});
