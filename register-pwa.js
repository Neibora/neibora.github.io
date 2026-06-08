if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed - reloading...');
//        window.location.reload();
    });

    navigator.serviceWorker.register('./service-worker.js')//, { scope: ' /' }
        .then(reg => {
            console.log('[SW] Registered', reg);
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                console.log('[SW] New worker found:', newWorker);

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            typeof (window.document.dispatch) == 'function' && window.document.dispatch(`versionChange`, () => {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                setTimeout(() => window.location.reload(), 1000);
                            });
                        } else {
                            console.log('[SW] First install complete.');
                        }
                    }
                });
            });
        })
        .catch(err => console.warn('Error al tratar de registrar el service worker', err))
}