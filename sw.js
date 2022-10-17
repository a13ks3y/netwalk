const APP_PREFIX = 'Netwalk_';     // Identifier for this app (this needs to be consistent across every cache update)
const VERSION = 'version_03';              // Version of the off-line cache (change this value everytime you want to update cache)
const CACHE_NAME = APP_PREFIX + VERSION;
const URLS = [
    '/netwalk/',
    '/netwalk/index.html',
    '/netwalk/index.js',
    '/netwalk/item.class.js',
    '/netwalk/field.class.js',
    '/netwalk/img/background.png',
    '/netwalk/img/cable0001.png',
    '/netwalk/img/cable0010.png',
    '/netwalk/img/cable0011.png',
    '/netwalk/img/cable0100.png',
    '/netwalk/img/cable0101.png',
    '/netwalk/img/cable0110.png',
    '/netwalk/img/cable0111.png',
    '/netwalk/img/cable1000.png',
    '/netwalk/img/cable1001.png',
    '/netwalk/img/cable1010.png',
    '/netwalk/img/cable1011.png',
    '/netwalk/img/cable1100.png',
    '/netwalk/img/cable1101.png',
    '/netwalk/img/cable1110.png',
    '/netwalk/img/cable1111.png',
    '/netwalk/img/computer1.png',
    '/netwalk/img/computer2.png',
    '/netwalk/img/focus.png',
    '/netwalk/img/highscores.png',
    '/netwalk/img/homepage.png',
    '/netwalk/img/locked.png',
    '/netwalk/img/newgame.png',
    '/netwalk/img/qnetwalk.png',
    '/netwalk/img/quit.png',
    '/netwalk/img/server.png',
    '/netwalk/img/shadow.png',
];

// Respond with cached resources
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { // if cache is available, respond with cache
                console.log('responding with cache : ' + e.request.url)
                return request
            } else {       // if there are no cache, try fetching request
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }

            // You can omit if/else for console.log & put one line below like this too.
            // return request || fetch(e.request)
        })
    )
})

// Cache resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME, cache);
            return cache ? cache.addAll(URLS) : Promise.resolve();
        })
    )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            // `keyList` contains all cache names under your username.github.io
            // filter out ones that has this app prefix to create white list
            var cacheWhitelist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX)
            })
            // add current cache name to white list
            cacheWhitelist.push(CACHE_NAME)

            return Promise.all(keyList.map(function (key, i) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i] )
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
});
