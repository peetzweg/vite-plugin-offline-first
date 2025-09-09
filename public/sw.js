const CACHE_NAME = "my-app-cache-v1";

// On install, cache the app shell (index.html at least)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/"]); // cache index.html
    })
  );
});

// On fetch, serve from cache if available, otherwise fetch & cache it
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // return cached file
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Skip opaque responses (like cross-origin requests)
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === "opaque"
          ) {
            return networkResponse;
          }

          // Cache the new response for next time
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          // Optionally, return a fallback page or asset when offline
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});
