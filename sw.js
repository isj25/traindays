// ==========================================
// RailBookingDate - Service Worker
// Stale-While-Revalidate Strategy
// ==========================================

const CACHE_NAME = 'railbookingdate-v3';
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './favicon.png',
    './icon-192.png',
    './icon-512.png',
    './manifest.json',
    './pages/ewallet.html',
    './pages/faq.html',
    './pages/helpline.html',
    './pages/news.html',
    './pages/tatkal.html',
    './pages/videos.html',
    './pages/disclaimer.html'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - Stale-While-Revalidate strategy
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests (like Google Fonts)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                // Fetch from network in background
                const fetchPromise = fetch(event.request)
                    .then(networkResponse => {
                        // Only cache successful responses
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        console.log('[SW] Fetch failed:', error);
                        // Return cached response if network fails
                        return cachedResponse;
                    });

                // Return cached response immediately, or wait for network
                return cachedResponse || fetchPromise;
            });
        })
    );
});

// Handle messages from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
