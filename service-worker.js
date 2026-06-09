const CACHE_NAME = `${location.hostname}_260608_1838`,
    urlsToCache = [
        './'
        , './register-pwa.js'
        , './assets/favicon.png'
        , './assets/icon.png'
        , 'https://d3js.org/d3.v5.min.js'
        , 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
        , 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
    ]

self.addEventListener('message', event => {
    if (event.data === 'GET_CACHE_NAME') {
        event.source.postMessage({ cacheName: CACHE_NAME });
    } else if (event.data?.type === 'SKIP_WAITING') {
        console.log('[SW] Skipping waiting...');
        self.skipWaiting().then(() => {
            console.log('[SW] skipWaiting resolved');
        });
    }
});

self.addEventListener('install', e => {
    console.log(`Installing... ${CACHE_NAME}`);

    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                urlsToCache.map(url =>
                    fetch(url, { mode: 'no-cors' }) // Fetch first to avoid CORS issues
                        .then(response => {
                            if (!response.ok && response.type !== 'opaque') {
                                throw new Error(`Failed to fetch ${url}: ${response.status}`);
                            }
                            return cache.put(url, response.clone()); // Store in cache
                        })
                        .catch(err => console.warn(`Skipping cache for ${url}:`, err))
                )
            );
        })
            .then(() => self.skipWaiting())
            .catch(err => console.error('Cache installation failed:', err))
    );
});

//una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexión
self.addEventListener('activate', e => {
    console.log(`Activating... ${CACHE_NAME}`);

    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log(`Deleting old cache: ${name}`);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log(`Cache cleanup complete, claiming clients...`);
            return self.clients.claim(); // Take control immediately
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
            .then(response => {
                let from_cache = (!navigator.onLine || ['force-cache', 'only-if-cached'].includes(e.request.headers.get("Cache-Control")) || !["reload"].includes(e.request.cache) && (['image', 'style', 'script'].includes(e.request.destination) || e.request.url.indexOf('.xsl') != -1));
                return from_cache && response || fetch(e.request).then(response => {
                    if (!(e.request.method == 'GET' && response && response.status == 200 && !['no-store', 'no-cache', 'reload'].includes(e.request.cache) /*&& ['basic','cors'].includes(response.type)*/)) {
                        return response;
                    }
                    return caches.open(CACHE_NAME).then(cache => {
                        try {
                            if (e.request && new URL(e.request.url).origin === location.origin) {
                                cache.put(e.request, response.clone());
                                console.log('[SW] Almacena el nuevo recurso: ' + e.request.url);
                            } else {
                                console.log('[SW] No se pudo almacenar el nuevo recurso: ' + e.request.url);
                            }
                        } catch (e) {
                            console.log('[SW] No se pudo almacenar el nuevo recurso: ' + e.request.url);
                        }
                        return response;
                    });
                });
            })
    )
})
