const CACHE_NAME = 'gardenfood-admin-cache-v2'; // تحديث الإصدار

// تفعيل السيرفس وركر الجديد فوراً دون انتظار
self.addEventListener('install', e => {
  self.skipWaiting();
});

// مسح أي كاش قديم بمجرد التفعيل
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(() => self.clients.claim())
  );
});

// استراتيجية (Network First): جلب أحدث نسخة من النت دائماً، والرجوع للكاش فقط عند انقطاع النت
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // إذا نجح الاتصال، احفظ النسخة الجديدة في الكاش
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // إذا انقطع الإنترنت، اجلب من الكاش
        return caches.match(e.request);
      })
  );
});
