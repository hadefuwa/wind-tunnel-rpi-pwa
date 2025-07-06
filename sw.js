// ===== WIND TUNNEL PWA SERVICE WORKER =====
// Enables offline functionality and caching
// Simple and beginner-friendly code

// Service Worker version (increment when making changes)
const CACHE_VERSION = 'wind-tunnel-v1.0.0';

// Files to cache for offline use
const CACHE_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/css/animations.css',
    '/js/main.js',
    '/js/windTunnel.js',
    '/js/windParticles.js',
    '/js/carModel.js',
    '/js/aerodynamics.js',
    '/js/three.min.js'
];

// Install event - cache all files
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function(cache) {
                console.log('Service Worker: Caching files');
                return cache.addAll(CACHE_FILES);
            })
            .then(function() {
                console.log('Service Worker: All files cached successfully');
                // Force the new service worker to become active
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('Service Worker: Caching failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        // Delete old caches
                        if (cacheName !== CACHE_VERSION) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                console.log('Service Worker: Activated successfully');
                // Take control of all clients immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                
                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then(function(response) {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response (can only be read once)
                        const responseToCache = response.clone();
                        
                        // Cache the new response
                        caches.open(CACHE_VERSION)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(function(error) {
                        console.error('Service Worker: Network fetch failed:', error);
                        
                        // For HTML requests, return a basic offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return new Response(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Wind Tunnel - Offline</title>
                                    <style>
                                        body { 
                                            font-family: Arial, sans-serif; 
                                            text-align: center; 
                                            padding: 50px; 
                                            background: #000; 
                                            color: #fff; 
                                        }
                                        h1 { color: #2196F3; }
                                        .spinner { 
                                            border: 4px solid #333; 
                                            border-top: 4px solid #2196F3; 
                                            border-radius: 50%; 
                                            width: 40px; 
                                            height: 40px; 
                                            animation: spin 1s linear infinite; 
                                            margin: 20px auto; 
                                        }
                                        @keyframes spin { 
                                            0% { transform: rotate(0deg); } 
                                            100% { transform: rotate(360deg); } 
                                        }
                                    </style>
                                </head>
                                <body>
                                    <h1>Wind Tunnel Controller</h1>
                                    <div class="spinner"></div>
                                    <p>You are offline. Please check your internet connection.</p>
                                    <p>The app will automatically reload when connection is restored.</p>
                                    <script>
                                        // Check connection every 5 seconds
                                        setInterval(() => {
                                            if (navigator.onLine) {
                                                window.location.reload();
                                            }
                                        }, 5000);
                                    </script>
                                </body>
                                </html>
                            `, {
                                headers: { 'Content-Type': 'text/html' }
                            });
                        }
                        
                        // For other requests, return a generic error response
                        return new Response('Offline - Content not available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Handle background sync (if supported)
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync event');
        // Could be used to sync data when online
    }
});

// Handle push notifications (if needed later)
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        console.log('Service Worker: Push notification received:', data);
        
        const options = {
            body: data.body,
            icon: '/assets/icons/icon-192.png',
            badge: '/assets/icons/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Message handler for communication with main app
self.addEventListener('message', function(event) {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        // Skip waiting and activate immediately
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        // Update cache with new files
        event.waitUntil(
            caches.open(CACHE_VERSION)
                .then(function(cache) {
                    return cache.addAll(CACHE_FILES);
                })
        );
    }
});

// Handle errors
self.addEventListener('error', function(event) {
    console.error('Service Worker: Error occurred:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', function(event) {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

// Utility function to clean up old caches
function cleanupOldCaches() {
    return caches.keys()
        .then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_VERSION) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
}

// Log service worker lifecycle
console.log('Service Worker: Script loaded'); 