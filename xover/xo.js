var xover = {};
var xo = xover;
xover.app = {};
xover.debug = {};
xover.browser = {};
xover.cache = {};
xover.cryptography = {};
xover.cryptography.generateUUID = function () {//from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
    // Public Domain/MIT -- For https we can use Crypto web api
    let d = new Date().getTime();//Timestamp
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
xover.cryptography.decodeJwt = function (token) {//from https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
xover.cryptography.encodeBase64 = function (str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
xover.cryptography.encodeMD5 = function (str) {
    /*
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Copyright (C) Paul Johnston 1999 - 2000.
     * Updated by Greg Holt 2000 - 2001.
     * See http://pajhome.org.uk/site/legal.html for details.
     */

    /*
     * Convert a 32-bit number to a hex string with ls-byte first
     */
    let hex_chr = "0123456789abcdef";
    function rhex(num) {
        str = "";
        for (let j = 0; j <= 3; j++)
            str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
                hex_chr.charAt((num >> (j * 8)) & 0x0F);
        return str;
    }

    /*
     * Convert a string to a sequence of 16-word blocks, stored as an array.
     * Append padding bits and the length, as described in the MD5 standard.
     */
    function str2blks_MD5(str) {
        let i;
        nblk = ((str.length + 8) >> 6) + 1;
        blks = new Array(nblk * 16);
        for (let i = 0; i < nblk * 16; i++) blks[i] = 0;
        for (let i = 0; i < str.length; i++)
            blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = str.length * 8;
        return blks;
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally 
     * to work around bugs in some JS interpreters.
     */
    function add(x, y) {
        let lsw = (x & 0xFFFF) + (y & 0xFFFF);
        let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left
     */
    function rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * These functions implement the basic operation for each round of the
     * algorithm.
     */
    function cmn(q, a, b, x, s, t) {
        return add(rol(add(add(a, q), add(x, t)), s), b);
    }
    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    x = str2blks_MD5(str);
    a = 1732584193;
    b = -271733879;
    c = -1732584194;
    d = 271733878;

    for (let i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;

        a = ff(a, b, c, d, x[i + 0], 7, -680876936);
        d = ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = ff(c, d, a, b, x[i + 10], 17, -42063);
        b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = ff(b, c, d, a, x[i + 15], 22, 1236535329);

        a = gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = gg(b, c, d, a, x[i + 0], 20, -373897302);
        a = gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = gg(b, c, d, a, x[i + 12], 20, -1926607734);

        a = hh(a, b, c, d, x[i + 5], 4, -378558);
        d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = hh(d, a, b, c, x[i + 0], 11, -358537222);
        c = hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = hh(b, c, d, a, x[i + 2], 23, -995338651);

        a = ii(a, b, c, d, x[i + 0], 6, -198630844);
        d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = ii(b, c, d, a, x[i + 9], 21, -343485551);

        a = add(a, olda);
        b = add(b, oldb);
        c = add(c, oldc);
        d = add(d, oldd);
    }
    return rhex(a) + rhex(b) + rhex(c) + rhex(d);
}

Object.defineProperty(Array.prototype, 'coalesce',
    {
        value: function () {
            let args = this instanceof Array && this || arguments;
            for (let item of args) {
                if (item !== undefined && item !== null) {
                    return item;
                }
            }
            return;
        },
        writable: true, enumerable: false, configurable: false
    }
);

Object.defineProperty(Array.prototype, 'distinct',
    {
        value: function (fn) {
            let array = this;
            if (!fn && array.some(item => item && [Attr, Text].includes(item.constructor))) {
                fn = String
            }
            if (typeof (fn) == 'function') {
                array = array.map(fn)
            }
            return [... new Set(array)];
        },
        writable: true, enumerable: false, configurable: false
    }
);

Object.defineProperty(Array.prototype, 'order',
    {
        value: function (direction = 'ASC') {
            return this.sort((a, b) => {
                const orderA = parseInt(a.value || a);
                const orderB = parseInt(b.value || b);
                return (direction || '').toUpperCase() == 'ASC' ? orderA - orderB : orderB - orderA;
            })
        },
        writable: true, enumerable: false, configurable: false
    }
);

xover.components = {};
xover.custom = {};
xover.data = {};
xover.stores = new Proxy({}, {
    get: function (self, key) {
        key = key || "#";
        if (key in self) {
            return self[key];
        } else if (key[0] == '$') {
            return xover.stores[`#${key.split("$").pop()}`];
        } else if (key.indexOf('{$') != -1) {
            return null;
        } else if (key[0] == '#') {
            xover.stores[key] = new xover.Store(xover.sources[key], { tag: key });
            return xover.stores[key];
        }
    },
    set: function (self, key, value) {
        let refresh;
        if (value && !(value instanceof xover.Store)) {
            if (value instanceof XMLDocument && value.stylesheets.length) {
                value = new xover.Store(value);
            } else {
                throw (new Error('Supplied store is not valid type'));
            }
        }
        //Object.defineProperty(value.document, 'store', {
        //    get: function () {
        //        return value
        //    }
        //})
        value.document.store = value;
        self[key] = value
        return self[key];
    },
    deleteProperty: function (self, key) {
        let exists = key in self
        let same = self[xover.site.seed] === self[key]
        sessionStorage.removeItem(key);
        xover.storehouse.remove('sources', key);

        if (exists) {
            delete self[key];
            delete xover.sources[key];
            if (same && xover.site.position > 1) {
                history.back();
            } /*else {
                xover.dom.refresh();
            }*/
        }
        return exists && !(key in self)
    }, has: function (self, key) {
        return (key in self || key.toLowerCase() in self || key in xover.sources) || key in (xover.manifest.server || {});
    }
});

xover.data.binding = {};
xover.data.binding["max_subscribers"] = 30;
xover.data.binding.sources = {};
xover.data.binding.requests = {};
xover.data.titles = {};
xover.storehouse = new Proxy({
    config: {
        'files': { keyPath: "uid" }
        , 'sources': { autoIncrement: true }
    }
}, {
    get: function (self, key) {
        if (key in self) {
            return self[key];
        }
        return self.open(key);
    }
});

Object.defineProperty(xover.storehouse, 'files', {
    get: async function () {
        let store = await xover.storehouse.open('files', { keyPath: "uid" });
        let _add = store.add;
        store.add = function (files) {
            let _url;
            let _cached_ids = [];

            for (let file of files) {
                _url = window.URL.createObjectURL(file);
                let record = {}
                record.uid = _url;
                record.id = _url.substring(_url.lastIndexOf('/') + 1);
                record.extension = file.name.substring(file.name.lastIndexOf('.') + 1);
                record.saveAs = record.id;/*`${record.id}.${record.extension}`;*/
                record.file = file;
                _add(record);
                _cached_ids.push(record);
            }
            return _cached_ids;
        }
        return store;
    }
});

Object.defineProperty(xover.storehouse, 'sources', {
    get: async function () {
        let store = await xover.storehouse.open('sources');
        let _add = store.add;
        store.add = function (source, name = '', type) {
            if (source.constructor === {}.constructor) source = JSON.stringify(source);
            if (source instanceof Node) source = source.outerHTML || source.innerHTML || source.toString();
            let file = new File([`${source}`], name, {
                type: (type || "text/plain").split(",")[0],
            });
            _add(file, record_key);
        }
        let _put = store.put;
        store.put = function (source, name = '', type) {
            if (source.constructor === {}.constructor) source = JSON.stringify(source);
            if (source instanceof Node) source = source.outerHTML || source.innerHTML || source.toString();
            let file = new File([`${source}`], name, {
                type: (type || "text/plain").split(",")[0],
            });
            _put(file, name);
        }
        let _get = store.get;
        store.get = async function (name = '') {
            let record = await _get(name);
            return record;
        }
        return store;
    }
});

Object.defineProperties(xover.storehouse, {
    read: {
        value: async function (store_name, key) {
            let store;
            store = await this[store_name];
            let record = await store.get(key);
            let content = record && record.text && await record.text() || undefined;
            let document = content;
            try {
                if (record && record.type.indexOf("json") != -1) {
                    document = JSON.parse(content)
                } else {
                    document = content && xover.xml.createDocument(content) || content
                }
            } catch (e) {
                console.log(e)
            }
            if (document instanceof Document && record) {
                document.href = record.name
                document.lastModifiedDate = record.lastModified;
            }
            return document
        }
    },
    remove: {
        value: async function (store_name, key) {
            let store = await this[store_name];
            return store.delete(key);
        }
    },
    write: {
        value: async function (store_name, key, value, type) {
            if (value instanceof Node) value = value.cloneNode(true)
            let store = await this[store_name];
            return store.put(value, key, type);
        }
    },
    open: {
        value: function (key, config = { autoIncrement: true }, method = 'readwrite') {
            return new Promise(async (resolve, reject) => {
                let stores = Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(xover.storehouse)).filter(([prop, func]) => func["get"] || func["enumerable"]));
                //let storehouse = await indexedDB.stores().then(stores => stores.find(db => db.name == 'xover.storehouse'));
                let connection = indexedDB.open('xover.storehouse', 4);
                let handler = function (event) {
                    let store = event.target.result.transaction([key], method).objectStore(key);
                    store.add = function (...args) {
                        return new Promise((resolve, reject) => {
                            let request = IDBObjectStore.prototype.add.apply(store, args);

                            request.onerror = function (event) {
                                reject(request.result);
                            };

                            request.onsuccess = function (event) {
                                resolve(request.result);
                            };
                        });
                    }
                    store.get = function (...args) {
                        return new Promise((resolve, reject) => {
                            let request = IDBObjectStore.prototype.get.apply(store, args);

                            request.onerror = function (event) {
                                reject(request.result);
                            };

                            request.onsuccess = function (event) {
                                resolve(request.result);
                            };
                        });
                    }
                    store.put = function (...args) {
                        return new Promise((resolve, reject) => {
                            let request = IDBObjectStore.prototype.put.apply(store, args);

                            request.onerror = function (event) {
                                reject(request.result);
                            };

                            request.onsuccess = function (event) {
                                resolve(request.result);
                            };
                        });
                    }
                    store.delete = function (...args) {
                        return new Promise((resolve, reject) => {
                            let request = IDBObjectStore.prototype.delete.apply(store, args);

                            request.onerror = function (event) {
                                reject(request.result);
                            };

                            request.onsuccess = function (event) {
                                resolve(request.result);
                            };
                        });
                    }
                    store.openCursor = function (...args) {
                        return new Promise((resolve, reject) => {
                            let request = IDBObjectStore.prototype.openCursor.apply(store, args);
                            let records = []
                            request.onerror = function (event) {
                                reject(event.target.result);
                            };

                            request.onsuccess = async function (event) {
                                let cursor = event.target.result;
                                if (cursor) {
                                    records.push([cursor.key, store.get(cursor.key)])
                                    cursor.continue();
                                } else {
                                    resolve(records);
                                }
                            };
                        });
                    }
                    return store;
                }
                connection.onsuccess = function (event) { resolve(handler(event)) };
                connection.onerror = function (event) { reject(event) };
                connection.onupgradeneeded = function (event) {
                    let db = event.target.result;
                    Object.entries(Object.getOwnPropertyDescriptors(stores)).filter(([prop, description]) => description.value.get).map(([store_name]) => {
                        if (!Array.from(db.objectStoreNames).includes(store_name)) {
                            db.createObjectStore(store_name, xover.storehouse.config[store_name]);//autoIncrement: true
                        }
                    });
                };
            })
        }
    }
})

xover.dom = {};
xover.dom.history = [];
xover.dom.intervals = new Proxy({}, {
    get: function (self, key) {
        return self[key];
    },
    set: function (self, key, input) {
        self[key] = input;
        return self[key];
    },
    deleteProperty: function (self, key) {
        if (key in self) {
            window.clearInterval(self[key]);
            delete self[key];
        }
    }
})

xover.dom.controls = {};
xover.dom.updateTitle = function (input) {
    let document_title = (input || document.title).match(/([^\(]+)(.*)/);
    let [, title, environment] = (document_title || [, "", ""]);
    document.title = title.replace(/\s+$/, '') + (` (${xover.session.store_id && xover.session.store_id != 'main' ? xover.session.store_id : 'v.'} ${xover.session.cache_name && xover.session.cache_name.split('_').pop() || ""})`).replace(/\((v\.)?\s+\)|\s+(?=\))/g, '');
}

xover.delay = function (ms) {
    return ms ? new Promise(resolve => setTimeout(() => resolve(true), ms)) : Promise.resolve(true);
}


xover.init = async function () {
    let progress;
    this.init.initializing = this.init.initializing || xover.delay(1).then(async () => {
        try {
            await xover.modernize();
            xover.init.Observer();
            await xover.manifest.init()
            Object.assign(xover.spaces, xover.manifest.spaces);
            if (history.state) delete history.state.active;
            xover.site.seed = (history.state || {}).seed || top.location.hash || '#';
            this.init.status = 'initialized';
            progress = xover.sources['loading.xslt'].render({ action: "append" });
            if (xover.session.status == 'authorized' && 'session' in xover.server) {
                await xover.session.checkStatus();
            }

            await Promise.all(xover.manifest.start.map(async href => await xover.sources[href].ready && xover.sources[href])).catch(e => e && e.render && e.render() || console.error(e));

            await xover.stores.restore();
            xover.session.cache_name = typeof (caches) != 'undefined' && (await caches.keys()).find(cache => cache.match(new RegExp(`^${location.hostname}_`))) || "";
            xover.dom.updateTitle();
            xover.site.sections.forEach(section => section.render());
            let active = xover.stores.active;
            active && await active.render();
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e)
        }
    }).catch(e => {
        this.init.status = 'error';
        /*return*/ Promise.reject(e); // Ommited return to prevent hitting multiple times unhandled rejection
    }).finally(async () => {
        this.init.initializing = 'done';
        progress = await progress || [];
        progress.forEach(item => item.remove());
    });
    return this.init.initializing;
}

Object.defineProperty(xover, 'ready', {
    enumerable: false,
    get: async function () {
        if (xover.init.status != 'initialized') {
            await xover.init();
        }
        return this.init.status == 'initialized';
    }
})

xover.init.Observer = function (target_node = window.document) {
    const config = { characterData: true, attributeOldValue: true, childList: true, subtree: true }; /*attributeFilter: ["xo-source", "xo-stylesheet", "xo-slot", "xo-suspense", "xo-schedule", "xo-static", "xo-stop", "xo-site", "xo-id", "class"], */

    const intersection_observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            entry.target.isIntersecting = entry.isIntersecting;
        });
    }, {
        root: null, // The element that is used as the viewport
        rootMargin: '0px', // Margin around the root
        threshold: 0, // Percentage of the element's visibility to trigger the callback
    });

    const elementsToObserve = target_node.querySelectorAll('[xo-suspense*="Intersection"]');
    elementsToObserve.forEach(element => {
        intersection_observer.observe(element);
    });

    const observer = new MutationObserver((mutationsList, observer) => {
        //if ([MouseEvent, TransitionEvent].includes((event || {}).constructor)) return; // Should these events be skipped? 
        mutationsList = new MutationSet(...mutationsList)
        let mutations = mutationsList.consolidate();
        if (!mutations.size) return;
        //for (let section of mutationsList.filter(mutation =>
        //    mutation.type == 'attributes' && ["xo-source", "xo-stylesheet"].includes(mutation.attributeName)
        //    || mutation.type === 'childList' && !mutation.addedNodes.length && !mutation.removedNodes.length && target.matches("[xo-source],[xo-stylesheet]")
        //    || mutation.type == 'attributes' && mutation.target.getAttributeNode("xo-stylesheet") && mutation.target.stylesheet.selectFirst(`//xsl:stylesheet/xsl:param/@name[.="${mutation.attributeName}"]`)
        //).map(mutation => mutation.target.closest(`[xo-source],[xo-stylesheet]`)).distinct()) {
        //    section.render()
        //}
        ////let listeners = [...xover.listener].filter(([event, map]) => ['mutation', 'change', 'remove', 'input', 'append', 'appendTo', 'reallocate'].includes(event));
        ////mutationsList.filter(mutation => {
        ////    let target = mutation.target;
        ////    let attr = mutation.type == 'attributes' ? target.getAttributeNodeNS(mutation.attributeNamespace, mutation.attributeName) : undefined;
        ////    listeners.map(([event, [[, [[key, fn]]]]]) => key).some(key => attr ? (attr).matches(key) : target.matches(key))
        ////})
        ////if (window.document.designMode !== 'on') return;
        //observer.disconnect();
        let active_element = event && event.srcElement instanceof Element && event.srcElement || window.document.activeElement;
        let mutation_event = new xover.listener.Event('mutate', { document: target_node, srcElement: active_element, mutations }, target_node);
        window.top.dispatchEvent(mutation_event);
        mutations = (mutation_event.detail || {}).hasOwnProperty("returnValue") ? new Map(mutation_event.detail.returnValue) : mutations;
        for (let [target, mutation] of mutations) {
            for (let [attr, oldValue] of Object.values((mutation.attributes || {})[""] || {})) {
                window.top.dispatchEvent(new xover.listener.Event('change', { target, value: attr.value, old: oldValue, parentNode: (attr.parentNode || target) }, attr));
            }
            if (mutation.removedNodes.length && mutation.addedNodes.length) {
                let replace_event = new xover.listener.Event('replaceChildren', { addedNodes: mutation.addedNodes, removedNodes: mutation.removedNodes }, target);
                window.top.dispatchEvent(replace_event);
            }
            for (let node of [...mutation.reallocatedNodes].filter(node => node instanceof Element && ![HTMLStyleElement, HTMLScriptElement].includes(node.constructor))) {/*nodes that were actually reallocated*/
                let remove_event = new xover.listener.Event('reallocate', { nextSibling: node.formerNextSibling, previousSibling: node.formerPreviousSibling, parentNode: target }, node);
                window.top.dispatchEvent(remove_event);
                if (remove_event.defaultPrevented) target.insertBefore(node, node.formerNextSibling);
            }
            for (let node of mutation.removedNodes) {
                if (target.contains(node)
                    || node instanceof Element && [HTMLStyleElement, HTMLScriptElement].includes(node.constructor)
                ) {
                    continue
                };
                node.formerParentNode = target;
                let remove_event = new xover.listener.Event('remove', { nextSibling: mutation.nextSibling, previousSibling: mutation.previousSibling, parentNode: target }, node);
                window.top.dispatchEvent(remove_event);
                if (target.contains(node)) continue;
                if (remove_event.defaultPrevented) target.insertBefore(node, node.formerNextSibling);
            }
            for (let node of mutation.addedNodes) {
                if (!target.contains(node)
                    || node instanceof Element && [HTMLStyleElement, HTMLScriptElement].includes(node.constructor)) {
                    //mutation.addedNodes.delete(node);
                    continue;
                }
                let append_event = new xover.listener.Event('append', { target }, node);
                window.top.dispatchEvent(append_event);
                if (!target.contains(node)) continue;
                const elementsToObserve = typeof (node.querySelectorAll) == 'function' && node.querySelectorAll('[xo-suspense*="Intersection"]') || [];
                elementsToObserve.forEach(element => {
                    intersection_observer.observe(element);
                });
                //dependants = [...node.querySelectorAll('[xo-source],[xo-stylesheet]')];
                //if (target.hasAttribute("xo-source") && node.hasAttribute("xo-source")) dependants = dependants.concat([node]);
                //&& `[${target.getAttribute("xo-source") || ''}].[${target.getAttribute("xo-stylesheet") || ''}]` != `[${node.getAttribute("xo-source") || ''}].[${node.getAttribute("xo-stylesheet") || ''}]` && /*!node.context && */node.matches('[xo-source],[xo-stylesheet]')) dependants = dependants.concat([node]);
                //dependants.forEach(el => el.render());
            }
        }
        for (let section of [...mutations].filter(([node, mutations]) =>
            !mutations.addedNodes.length && !mutations.removedNodes.length && !(mutations.attributes || {})[""] && node.matches("[xo-source],[xo-stylesheet]")
            || mutations.attributes && ["xo-source", "xo-stylesheet"].some(attribute => ((mutations.attributes || {})[""] || {}).hasOwnProperty(attribute))
            || node.stylesheet instanceof Document && node.stylesheet.select(`//xsl:stylesheet/xsl:param/@name`).some(attribute => ((mutations.attributes || {})[""] || {}).hasOwnProperty(attribute))
        ).map(([node]) => node.closest(`[xo-source],[xo-stylesheet]`)).distinct()) {
            section && section.render()
        }
        //observer.observe(target_node, config);

        return;
        for (const mutation of mutationsList) {
            if (mutation.type == 'childList' && mutation.addedNodes.length && [...mutation.addedNodes].every((node, ix) => node.isEqualNode(mutation.removedNodes[ix]))) continue;
            //if (mutation.type == 'attributes' && mutation.target.getAttribute(mutation.attributeName) == mutation.oldValue) continue;
            let target = mutation.target;
            //for (let el of [...target.parentNode.querySelectorAll("[checked]:not(:checked)")]) { el.checked = true };
            let attr;
            if (mutation.attributeName && mutation.type == 'attributes') {
                attr = target.getAttributeNodeNS(mutation.attributeNamespace, mutation.attributeName);
            }
            if (attr && ['xo-working'].includes(attr.nodeName)) {
                continue;
            }
            for (let node of [...mutation.addedNodes].concat(target)) {
                if (node.closest("[xo-id]")) {
                    let observer_node = node.selectFirst(`ancestor-or-self::*[@xo-id][last()]`);
                    let observer_config = { characterData: true, attributes: true, childList: true, subtree: true }
                    observer_node.observer = observer_node.observer || new MutationObserver((mutationsList) => {
                        for (const mutation of mutationsList) {
                            let target = mutation.target;
                            let target_element = mutation.target.closest('*');
                            //await xover.delay(100); /*Added to wait for all changes to apply*/
                            let xo_id = target_element.getAttribute("xo-id");
                            if (xo_id) {
                                for (let synced_node of [...window.document.querySelectorAll(`[xo-id="${xo_id}"]`)].filter(el => el !== target_element && !el.isEqualNode(target_element))) {
                                    target_element.observer && target_element.observer.disconnect();
                                    xover.xml.combine(synced_node, target_element.cloneNode(true))
                                    target_element.observer && target_element.observer.observe(target_element, observer_config);
                                }
                            }
                        }
                    });
                    observer_node.observer.observe(observer_node, observer_config);
                }
            }
            if (![...xover.listener].filter(([event, map]) => ['mutate', 'change', 'remove', 'input', 'append', 'appendTo', 'removeFrom', 'reallocate'].includes(event)).reduce((array, [event, map]) => { array.push(...Array.from(map, ([key, [[predicate, fn]]]) => [event, predicate])); return array }, []).some(([event, key]) => event == 'change' && attr && (attr).matches(key) || event == 'append' && [...mutation.addedNodes].some(node => node.matches(key)) || event == 'remove' && [...mutation.removedNodes].some(node => node.matches(key)) || event == 'appendTo' && target.matches(key) || event == 'appendFrom' && target.matches(key))) continue; /*test if there is any listener that would be triggered*/
            attr && window.top.dispatchEvent(new xover.listener.Event('change', { target, value: attr.value, old: mutation.oldValue }, attr));
            window.top.dispatchEvent(new xover.listener.Event('mutate', { target }, target));
            if (mutation.addedNodes.length) {
                window.top.dispatchEvent(new xover.listener.Event('appendTo', { addedNodes: mutation.addedNodes }, target));
            }

            for (let node of [...mutation.removedNodes].filter(node => node instanceof Element && ![HTMLStyleElement, HTMLScriptElement].includes(node.constructor))) {/*nodes that were actually reallocated*/
                if (target.contains(node)) {
                    window.top.dispatchEvent(new xover.listener.Event('reallocate', { nextSibling: mutation.nextSibling, previousSibling: mutation.previousSibling, parentNode: target }, node));
                } else {
                    observer.disconnect();
                    node.formerParentNode = target;
                    let remove_event = new xover.listener.Event('remove', { nextSibling: mutation.nextSibling, previousSibling: mutation.previousSibling, parentNode: target }, node);
                    window.top.dispatchEvent(remove_event);
                    if (remove_event.defaultPrevented) target.insertBefore(node, mutation.nextSibling);
                    observer.observe(target_node, config);
                }
            }
            for (let node of [...mutation.addedNodes].filter(node => node instanceof Element && ![HTMLStyleElement, HTMLScriptElement].includes(node.constructor))) {
                window.top.dispatchEvent(new xover.listener.Event('append', { target }, node));
                const elementsToObserve = node.querySelectorAll('[xo-suspense*="Intersection"]');
                elementsToObserve.forEach(element => {
                    intersection_observer.observe(element);
                });
                //dependants = [...node.querySelectorAll('[xo-source],[xo-stylesheet]')];
                //if (!node.context && node.matches('[xo-source],[xo-stylesheet]')) dependants = dependants.concat([node]);
                //dependants.forEach(el => el.render());
            }
        }
    });
    observer.observe(target_node, config);
}

xover.initializeDOM = function() {
    for (let iframe of [...document.querySelectorAll("iframe:not([src])")]) {
        let el = iframe.firstChild;
        if (!(el instanceof Text)) continue;
        let url = xover.dom.getGeneratedPageURL({
            html: el.textContent
        });
        iframe.src = url;
        el.remove();
        //TODO: Implementar como método para obtener contenido del archivo
        //file = await fetch(url).then(r => r.blob()).then(blobFile => new File([blobFile], "fileNameGoesHere", { type: blobFile.type }))
        //await file.text()
        //var reader = new FileReader();
        //reader.readAsText(file, "UTF-8");
        //reader.onload = function (evt) {
        //    console.log(evt.target.result);
        //}
    }

    xover.subscribeReferencers()
}

xover.initializeElementListeners = function (document = window.document) {
    const event_handler = function (event, el) {
        window.top.dispatchEvent(new xover.listener.Event(event.type, { event: event }, el));
    };
    const observer = new MutationObserver((mutationsList, observer) => {
        if (event && event.type == 'input') return;
        for (const mutation of mutationsList) {
            if (mutation.type === 'characterData') {
                // Handle text node changes here
                const changedTextNode = mutation.target;
                let scope = changedTextNode.scope;
                if (!scope) continue;
                scope.set(changedTextNode.nodeValue);
            }
        }
    });

    document.querySelectorAll('img').forEach(el => el.addEventListener('error', function () {
        if (event && (event.srcEvent || event).type == 'error') {
            window.top.dispatchEvent(new xover.listener.Event('error', { event: event }));
        }
    }));

    document.querySelectorAll('input,textarea').forEach(el => {
        for (let event_name of ['focus', 'focusin', 'blur']) {
            if (xover.listener.get(event_name)) {
                el.removeEventListener(event_name, event_handler)
                el.addEventListener(event_name, (event) => event_handler(event, el))
            }
        }
    });

    document.querySelectorAll('textarea').forEach(el => el.addEventListener('mouseup', function () {
        let el = event.srcElement;
        let scope = el.scope;
        if (scope instanceof Attr) {
            scope.parentNode.set(`height:${scope.localName}`, el.offsetHeight, { silent: true });
            scope.parentNode.set(`width:${scope.localName}`, el.offsetWidth, { silent: true });
        } else if (scope instanceof Element) {
            scope.set('state:height', el.offsetHeight, { silent: true });
            scope.set('state:width', el.offsetWidth, { silent: true });
        }
    }));

    document.querySelectorAll('[xo-slot="text()"]').forEach(el => observer.observe(el, { characterData: true, subtree: true }));
    document.querySelectorAll('[xo-slot="text()"]').forEach(el => el.addEventListener('blur', function () {
        let target = event.target;
        let new_text = target.textContent;
        let scope = target.scope;
        if (scope) scope.set(new_text);
    }))
}

class Structure {
    constructor(map = new Map(), properties = {}) {
        Object.defineProperties(map, properties);
        return new Proxy(map, {
            get: function (self, key) {
                if (typeof self[key] === 'function') {
                    if (self.hasOwnProperty(key)) return self[key];
                    let fn = self[key].bind(self);
                    return key !== 'get' ? fn : function (...args) {
                        let result = fn.apply(self, args);
                        if (!result) {
                            self.set.bind(self)(args[0], new xover.Source(args[0]).document);
                            result = fn.apply(self, args);
                        }
                        return result
                    }
                }
                if (!(key in self)) {
                    self[key] = new Structure(map instanceof Map ? new Map() : {}, properties);
                }
                return self[key];
            },
            set: function (self, key, value) {
                self[key] = value;
                return true;
            }
        });
    }
}

xover.subscribers = new Structure(new Map(), {
    evaluate: {
        value: function (scope) {
            evaluate = function (values) {
                for (let value of values) {
                    try {
                        let val = eval(`(${value})`);
                        if (val != undefined) {
                            return val;
                        }
                    } catch (e) {
                        if (e instanceof ReferenceError) {
                            return String(value)
                        } else {
                            console.error(e)
                        }
                    }
                }
            }
            for (let [subscriber, formula] of this) {
                if (subscriber instanceof Attr && !subscriber.ownerElement) {
                    this.delete(subscriber)
                    continue;
                }
                if (!subscriber.hasOwnProperty("formula")) {
                    Object.defineProperty(subscriber, 'formula', {
                        value: formula
                    })
                }
                if (subscriber.hasOwnProperty("evaluate")) {
                    subscriber.evaluate()
                } else {
                    let new_value = formula.replace(/\{\$([^\}]*)\}/g, (match, prefixed_name) => {
                        let [variable, ...else_value] = prefixed_name.split(/\s*\|\|\s*/g);
                        let [name, prefix] = variable.split(/:/).reverse();
                        else_value = else_value.concat(match);
                        if (!prefix && scope instanceof Node) {
                            return name && scope.get(name) || evaluate(else_value)
                        } else {
                            return xover[prefix][name] || evaluate(else_value)
                        }
                    });
                    if (subscriber.name == 'style') {
                        if (subscriber.ownerElement) subscriber.ownerElement.style.cssText = new_value;
                    } else {
                        subscriber.set(new_value);
                    }
                }
            }
        }
    }
});

xover.subscribeReferencers = async function (context = window.document) {
    await xover.ready;
    let references = new Map();

    context.select(`.//@*[contains(.,'{$')]|.//html:slot[not(parent::html:code)]/text()[contains(.,'{$')]|.//html:slot[not(parent::html:code)]/text()[starts-with(.,'$\{')]`).forEach(attr => references.set(attr, attr.value));
    for (let [ref, formula] of references.entries()) {
        if (formula.match(/^\$\{/)) {
            formula = formula.slice(2, -1);
            try {
                ref.textContent = eval(formula)
            } catch (e) {
                typeof (e.render) == 'function' ? e.render() : String(e).alert()
            }
            continue;
        }
        for (let match of formula.match(/\{\$([^\}]*)\}/g) || []) {
            match = match.slice(2, -1);
            let [value, else_value] = match.split(/\s*\|\|\s*/);
            let source = ref.source;
            source && source.document && await source.document.ready
            let [variable, scope = ref.scope] = value.split(":").reverse();
            let subscriber = xover.subscribers[scope || ''][variable];
            subscriber.set(ref, formula);
            subscriber.evaluate(scope, else_value)
        }
    }
    context.select(`.//*[@xo-site]//@src|.//*[@xo-site]//@href`).map(src => src.set(xover.URL(src.value, src.closest("[xo-site]").getAttribute("xo-site"))))
}

xover.json = {};

xover.listener = new Map();
xover.listener.Event = function (event_name, params = {}, context = (event || {}).srcElement) {
    if (!(this instanceof xover.listener.Event)) return new xover.listener.Event(event_name, params, context);
    //let _event = new CustomEvent(event_name, { detail: params, cancelable: true });
    let node;
    let [scoped_event, predicate] = event_name.split(/::/);
    let args = context instanceof ErrorEvent && { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno } || context instanceof Event && {} || { detail: params, cancelable: true };
    let _event = eval(`new ${(context instanceof ErrorEvent) && context.constructor.name || 'CustomEvent'}(${context instanceof Event && `'${context.constructor.name}'` || 'scoped_event'}, {cancelable: true, bubbles: true, ...args})`);
    let _srcEvent = event;
    Object.defineProperty(_event, 'srcEvent', {
        get: function () {
            return _srcEvent;
        }
    })
    Object.defineProperty(_event, 'context', {
        get: function () {
            return context;
        }
    })
    if (_event.detail) {
        _event.detail["srcElement"] = _event.detail["srcElement"] || (event || {}).srcElement;
        _event.detail["designMode"] = _event.detail.hasOwnProperty("designMode") ? _event.detail["designMode"] : document.designMode == 'on';
        if (context instanceof Attr) {
            _event.detail["element"] = _event.detail["element"] || context.parentNode;
            _event.detail["attribute"] = _event.detail["attribute"] || context;
            _event.detail["value"] = _event.detail.hasOwnProperty("value") ? _event.detail["value"] : context.value;
            _event.detail["store"] = _event.detail["store"] || context.ownerDocument.store;
            node = context
        } else if (context instanceof Element) {
            _event.detail["element"] = _event.detail["element"] || context;
            _event.detail["value"] = _event.detail.hasOwnProperty("value") ? _event.detail["value"] : context.textContent;
            _event.detail["store"] = _event.detail["store"] || context.ownerDocument.store;
            node = context
        } else if (context instanceof Document) {
            _event.detail["stylesheets"] = _event.detail.hasOwnProperty("stylesheets") ? _event.detail["stylesheets"] : context.stylesheets;
            _event.detail["document"] = _event.detail["document"] || context;
            _event.detail["element"] = _event.detail["element"] || context.firstElementChild;
            _event.detail["store"] = _event.detail["store"] || context.store;
            _event.detail["target"] = _event.detail["target"] || context.documentElement;
        } else if (context instanceof xover.Store) {
            //_event.detail["tag"] = _event.detail["tag"] || context.tag;
            _event.detail["stylesheets"] = _event.detail.hasOwnProperty("stylesheets") ? _event.detail["stylesheets"] : context.stylesheets;
            _event.detail["store"] = _event.detail["store"] || context;
            _event.detail["target"] = _event.detail["target"] || context.documentElement;
        } else if (context instanceof xover.Source) {
            //_event.detail["tag"] = _event.detail["tag"] || context.tag;
            _event.detail["source"] = _event.detail["source"] || context;
            _event.detail["target"] = _event.detail["target"] || context.documentElement;
        } else if (context instanceof Response) {
            _event.detail["response"] = _event.detail["response"] || context;
            _event.detail["request"] = _event.detail["request"] || context.request;
            _event.detail["target"] = _event.detail["target"] || context.documentElement;
            _event.detail["document"] = _event.detail["document"] || context.document;
            _event.detail["body"] = _event.detail["body"] || context.body;
            //_event.detail["tag"] = _event.detail["tag"] || context.tag;
            node = _event.detail["return_value"] || context.document;
            node = node instanceof Document && node.documentElement || node;
        }
        if (context instanceof Node) {
            _event.detail["parentNode"] = _event.detail.hasOwnProperty("parentNode") ? _event.detail["parentNode"] : (context.formerParentNode || context.parentNode);
            _event.detail["nextNode"] = _event.detail.hasOwnProperty("nextNode") ? _event.detail["nextNode"] : context.nextNode;
            _event.detail["previousNode"] = _event.detail.hasOwnProperty("previousNode") ? _event.detail["previousNode"] : context.previousNode;
            _event.detail["node"] = _event.detail["node"] || context;
            _event.detail["target"] = _event.detail["target"] || context;
            _event.detail["document"] = _event.detail["document"] || context.ownerDocument;
            node = context
        }
        if (context) {
            let tag = [_event.detail["tag"], typeof (context) === 'string' && context || undefined, (predicate || '')[0] = '#' && predicate, null].coalesce();
            if (tag != null) _event.detail["tag"] = tag;
        }
    }
    return _event;
}
xover.listener.Event.prototype = Object.create(CustomEvent.prototype);

Object.defineProperty(xover.listener, 'matches', {
    value: function (context, event_type, event_tag) {
        let [scoped_event, predicate] = event_type.split(/::/);
        event_type = scoped_event;
        let default_predicate = Object.fromEntries([['change', '@value'], ['remove', '*'], ['append', '*'], ['render', '*']])

        context = context instanceof Window && event_type.split(/^[\w\d_-]+::/)[1] || context;
        let fns = new Map();
        if (!context.disconnected && xover.listener.get(event_type)) {
            let tag = (event_tag || context.tag || '').replace(/^#/, '');
            let handlers = [...xover.listener.get(event_type).values()].map((predicate) => [...predicate.entries()]).flat().map(([predicate, fn]) => [predicate || default_predicate[event_type] || '', fn]);
            for (let [, handler] of handlers.filter(([predicate]) => !predicate || predicate === tag || predicate[0] == '#' && tag.matches(predicate.slice(1)) || typeof (context.matches) == 'function' && context.matches(predicate)).filter(([, handler]) => !handler.scope || handler.scope.prototype && context instanceof handler.scope || existsFunction(handler.scope.name) && handler.scope.name == context.name)) {
                fns.set(`[${handler.selectors.join(',')}]=>${handler.toString()}`, handler);
            }
        }
        return fns;
    },
    writable: false, enumerable: false, configurable: false
})

xover.listener.debugger = new Map()

Object.defineProperty(xover.listener, 'debug', {
    value: function (...args) {
        let reference
        for (let arg of args) {
            if (arg instanceof Object) {
                xover.listener.debugger.set(arg, (xover.listener.debugger.get(arg) || true))
            }
            if (arg instanceof Attr) {
                reference = `@${arg.nodeName}`
                subreference = arg.parentNode
            } else if (arg instanceof Node && !arg.ownerDocument.contains(arg)) {
                reference = arg.nodeName
                subreference = arg.constructor
            } else if (arg instanceof Element || arg instanceof Comment) {
                reference = arg.nodeName
                subreference = arg
            } else if (arg instanceof Node) {
                reference = `${arg instanceof Attr ? '@' : ''}${arg.nodeName}`
                subreference = arg.parentNode
            } else if (typeof (arg) == 'string') {
                reference = arg
            } else if (typeof (arg) == 'function') {
                reference = arg.name || arg
                subreference = Function
            } else if (arg instanceof Event) {
                reference = arg.name || arg
                subreference = Event
            } else if (arg instanceof Object && arg.constructor) {
                reference = reference || arg
                subreference = arg.constructor
            }
        }
        reference = reference || '*'
        subreference = subreference || '*'


        xover.listener.debugger.set(reference, (xover.listener.debugger.get(reference) || new Map()))
        let target = xover.listener.debugger.get(reference);
        target.set(subreference, (target.get(subreference) || true))
    },
    writable: false, enumerable: false, configurable: false
})

Object.defineProperty(xover.listener.debug, 'matches', {
    value: function (...args) {
        let map = args.pop() || xover.listener.debugger;
        let handler = args.pop();
        if (!map.size) return false;
        let context = this;
        let reference_debugger = map.get(context) || map.get(event.type) || map.get(`${context instanceof Attr ? '@' : ''}${context.nodeName}`) || map.get('*') || new Map();
        if (!reference_debugger.size) return false;
        if (reference_debugger.get('*') || reference_debugger.get(handler) || reference_debugger.get(event) || handler && reference_debugger.get(handler.constructor) || reference_debugger.get(context instanceof Attr && context.parentNode || context) || reference_debugger.get(event.constructor) || handler && (handler.selectors || []).some(selector => reference_debugger.get(selector)) || [...map].some(([reference]) => reference instanceof Function && context instanceof reference)) {
            return true
        }
        return false;
    },
    writable: false, enumerable: false, configurable: false
})

xover.listener.debuggerExceptions = new Map()

Object.defineProperty(xover.listener, 'debugException', {
    value: function (...args) {
        let reference = '*', event = '*';
        for (let arg of args) {
            if (arg instanceof HTMLElement) {
                reference = arg
            } else if (typeof (arg) == 'string') {
                event = arg
            } else if (typeof (arg) == 'function') {
                reference = arg
            }
        }
        if (!xover.listener.debuggerExceptions.has(reference)) {
            xover.listener.debuggerExceptions.set(reference, new Map())
        }
        xover.listener.debuggerExceptions.get(reference).set(event, true)
    },
    writable: false, enumerable: false, configurable: false
})

xover.listener.maxRecursion = 200;
class EventHistory {
    constructor(queryString) {
        this.handlers = new Map();
    }

    set(handler, item) {
        this.handlers.set(handler, (this.handlers.get(handler) || new Map()))
        let target = this.handlers.get(handler);
        target.set(item, (target.get(item) || 0) + 1)
        xover.delay(10).then(() => {
            xover.listener.history.delete(handler, item);
        })
    }

    get(handler, item) {
        return (this.handlers.get(handler) || new Map()).get(item);
    }

    delete(handler, item) {
        let target = this.handlers.get(handler) || new Map();
        target.set(item, (target.get(item) || 0) - 1)
    }

    has(handler, item) {
        let count = (this.handlers.get(handler) || new Map()).get(item) || 0;
        return !!count;
    }

    overflowed(handler, item) {
        let count = (this.handlers.get(handler) || new Map()).get(item) || 0;
        return count > xover.listener.maxRecursion;
    }
}

xover.listener.history = new EventHistory();

Object.defineProperty(xover.listener, 'dispatcher', {
    value: function (event) {
        if (xover.listener.off === true) return;
        let context = event.context || !(event instanceof CustomEvent) && event.target || null;
        if (!context) return;
        if (xover.listener.debug.matches.call(context, null, xover.listener.debugger) && !xover.listener.debug.matches.call(context, null, xover.listener.debuggerExceptions)) {
            debugger;
        }
        let fns = xover.listener.matches(context, event.type, (event.detail || {}).tag);
        let handlers = new Map([...fns, ...new Map((event.detail || {}).listeners)]);
        //context.eventHistory = context.eventHistory || new Map();
        let returnValue;
        for (let handler of [...handlers.values()].reverse()) {
            if (event.propagationStopped || event.cancelBubble) break;
            if (xover.listener.history.overflowed(handler, context)) {
                console.warn(`Listener dispatcher overflown`, [handler, context])
                continue;
            }
            if (event.detail && handler.conditions.length && !handler.conditions.some(condition => [...condition].every(([key, condition]) => {
                let operator = "="
                if (["*", "!"].includes(key[key.length - 1])) {
                    operator = key[key.length - 1];
                    key = key.slice(0, -1);
                } else if (!condition && ["*", "!"].includes(key[0])) {
                    operator = key[0];
                    key = key.slice(1);
                }
                let [arg, ...props] = key.split(/\./g);
                let context = event.detail[arg];
                if (context === undefined && arg in window) {
                    context = window[arg]
                }
                for (let [ix, prop] of Object.entries(props)) {
                    context = context[prop] != null ? context[prop] : props.length - 1 != ix ? {} : null;
                }
                if (context instanceof Document) {
                    context = (context.href || '').replace(/^\//, '')
                }
                if (!condition) {
                    switch (operator) {
                        case "!":
                            return !context
                        default:
                            return context
                    }
                } else {
                    switch (operator) {
                        case "!":
                            return !`${context}`.matches(`${condition}`)
                        case "*":
                            return `${context}`.indexOf(`${condition}`) != -1
                        default:
                            return `${context}`.matches(`${condition}`)
                    }
                }
            }))) continue;
            //if (context.eventHistory.get(handler)) {
            //    console.warn(`Event ${event.type} recursed`)
            //}
            xover.listener.history.set(handler, context);
            if (returnValue !== undefined && !(returnValue instanceof Promise) && event.detail && event.detail.value) {
                event.detail.value = returnValue;
            }
            if (xover.listener.debug.matches.call(context, handler, xover.listener.debugger) && !xover.listener.debug.matches.call(context, handler, xover.listener.debuggerExceptions)) {
                debugger;
            }
            returnValue = /*await */handler.apply(context, event instanceof CustomEvent && (event.detail instanceof Array && [...event.detail, event] || event.detail && handler.toString().replace(/^[^\{\)]+/g, '')[0] == '{' && [{ event: event.srcEvent || event, ...event.detail }, event] || (handler.toString().split(/\(|\)/).splice(1, 1)[0] || '') == 'event' && [event.srcEvent || event] || []) || arguments); /*Events shouldn't be called with await, but can return a promise*/
            if (returnValue !== undefined) {
                //event.returnValue = returnValue; //deprecated
                if (event.detail) {
                    event.detail.returnValue = returnValue;
                }
            }
            //if (event.srcEvent) {
            //    event.srcEvent.returnValue = event.returnValue;
            //}
            if (event.srcEvent && event.defaultPrevented) {
                event.srcEvent.preventDefault();
            }
            if (event.srcEvent && event.cancelBubble) {
                event.srcEvent.stopPropagation();
            }
            //xover.listener.history.delete(handler, context);
        }
    },
    writable: true, enumerable: false, configurable: false
});

xover.listener.silenced = new Map();
Object.defineProperty(xover.listener, 'silence', {
    value: function (name_or_list) {
        name_or_list = name_or_list instanceof Array && name_or_list || [name_or_list];
        for (let xpath of name_or_list) {
            xover.listener.silenced.set(xpath, true)
        }
    },
    writable: true, enumerable: false, configurable: false
});

xover.listener.skip_selectors = new Map();
Object.defineProperty(xover.listener, 'skipSelector', {
    value: function (name_or_list) {
        name_or_list = name_or_list instanceof Array && name_or_list || [name_or_list];
        for (let xpath of name_or_list) {
            xover.listener.skip_selectors.set(xpath, true)
        }
    },
    writable: true, enumerable: false, configurable: false
});

xover.listener.disabled = new Map();
Object.defineProperty(xover.listener, 'turnOff', {
    value: function (name_or_list) {
        if (!name_or_list) name_or_list = '*';
        name_or_list = name_or_list instanceof Array && name_or_list || [name_or_list];
        for (let name of name_or_list) {
            xover.listener.disabled.set(name, true)
        }
    },
    enumerable: false, configurable: false
});

Object.defineProperty(xover.listener, 'off', {
    get: function () {
        if (xover.listener.disabled.get('*')) return true;
        if (event) {
            return !!(xover.listener.disabled.get(event.type) || xover.listener.disabled.get(event.constructor))
        } else {
            return xover.listener.turnOff;
        }
    },
    enumerable: false, configurable: false
});

Object.defineProperty(xover.listener, 'on', {
    value: function (name_or_list, handler, options = {}) {
        if (xover.init.status != 'initialized') {
            xover.init();
        }
        if (!name_or_list) name_or_list = '*';
        name_or_list = name_or_list instanceof Array && name_or_list || [name_or_list];
        if (!handler) {
            for (let name of name_or_list) {
                xover.listener.disabled.delete(name)
            }
            return;
        }
        handler.selectors = handler.selectors || [];
        for (let event_name of name_or_list) {
            handler.selectors.push(event_name);
            let conditions;
            let [scoped_event, ...predicate] = event_name.split(/::/);
            predicate = predicate.join("::");
            [scoped_event, ...conditions] = scoped_event.split(/\?/g);
            let [base_event, scope] = scoped_event.split(/:/).reverse();
            window.top.removeEventListener(base_event, xover.listener.dispatcher);
            window.top.addEventListener(base_event, xover.listener.dispatcher/*, options --removed for it might cause event to trigger multiple times*/);

            handler.scope = scope && eval(scope) || undefined;
            handler.conditions = handler.conditions || conditions && [] || undefined;
            for (let condition of conditions) {
                handler.conditions.push(new URLSearchParams("?" + condition));
            }

            let event_array = xover.listener.get(base_event) || new Map();
            let handler_map = event_array.get(`[${handler.selectors.join(',')}]=>${handler.toString()}`) || new Map();
            handler_map.set(predicate, handler);
            event_array.set(`[${handler.selectors.join(',')}]=>${handler.toString()}`, handler_map);
            xover.listener.set(base_event, event_array);

            if (predicate) {
                window.top.removeEventListener(`${base_event}::${predicate}`, xover.listener.dispatcher);
                window.top.addEventListener(`${base_event}::${predicate}`, xover.listener.dispatcher/*, options*/);
            }
        }
        handler.selectors = handler.selectors.distinct()
    },
    writable: true, enumerable: false, configurable: false
});

xover.listener.on('hashchange', function () {
    xover.site.active = location.hash;
});

xover.listener.on('pushstate', function ({ state }) {
    if (typeof HashChangeEvent !== "undefined") {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        return;
    }

    try {
        window.dispatchEvent(new Event("hashchange"));
        return;
    } catch (error) {
        const ieEvent = document.createEvent("Event");
        ieEvent.initEvent("hashchange", true, true);
        window.dispatchEvent(ieEvent);
    }
});

//xover.listener.on('beforeHashChange', function (new_hash, old_hash) {
//    new_hash = (new_hash || window.location.hash);
//    if (new_hash !== '#' && (document.getElementById(new_hash.substr(1))/* || (new_hash in xover.stores)*/)) {
//        event.preventDefault();
//        document.getElementById(new_hash.substr(1)).scrollIntoView()
//    }
//})

xover.listener.on('blur::[xo-scope][type=search]', async function () {
    let value = this.getAttributeNode("value");
    if (this.value != value) {
        this.value = value
    }
}, true)

xover.listener.on('keyup', async function (event) {
    if (event.keyCode == 27) {
        let first_alert = document.querySelector("[role='alertdialog']:last-of-type");
        first_alert && first_alert.remove();
    }
})

xover.listener.on('scrollIntoView', function (event) {
    this.scrollIntoView()
})

xover.listener.on(['pageshow', 'popstate'], async function (event) {
    await xover.ready;
    event.type == 'popstate' && document.querySelectorAll(`[role=alertdialog],dialog`).toArray().remove();
    if (history.state) delete history.state.active;
    xover.site.seed = (history.state || {}).seed || top.location.hash || '#';
    xover.waitFor(location.hash || document.firstElementChild, 10000).then(target => target.dispatch('scrollIntoView'));
    if (event.defaultPrevented) return;
    (location.search || '').length > 1 && [...xover.site.sections].filter(section => section.store === xover.stores.seed).map(el => [el, el.stylesheet]).filter(([el, stylesheet]) => stylesheet && stylesheet.selectSingleNode(`//xsl:stylesheet/xsl:param[starts-with(@name,'searchParams:')]`)).forEach(([el]) => el.render());
    if (xover.session.status == 'authorizing') xover.session.status = null;
    xover.session.store_id = xover.session.store_id;
    //let item;
    //try {
    //    item = document.querySelector(`${(location.hash || '').replace(/^#/, '') && location.hash || ''}:not([xo-source],[xo-stylesheet])`);
    //} catch (e) { }
    //if (!item) {
    //    xover.site.seed = (event.state || {}).seed || (history.state || {}).seed || event.target.location.hash;
    //}
})

xover.listener.on('popstate', async function (event) {
    history.scrollRestoration = xover.site.scrollRestoration;
})

xover.listener.on('navigatedForward', function (event) {
    if (event.defaultPrevented) return;
    if (xover.site.seed == "#" && xover.site.position > 1 && !(xover.site.history || []).length) {
        console.log("Navigated forward");
        history.back();
    }
})

xover.listener.keypress = {};
xover.mimeTypes = {};
xover.mimeTypes["css"] = "text/css"
xover.mimeTypes["doc"] = "applicaton/msword"
xover.mimeTypes["html"] = "text/html"
xover.mimeTypes["htm"] = "text/html"
xover.mimeTypes["jpg"] = "image/jpeg"
xover.mimeTypes["jpeg"] = "image/jpeg"
xover.mimeTypes["js"] = "application/javascript"
xover.mimeTypes["json"] = "application/json"
xover.mimeTypes["map"] = "text/plain"
xover.mimeTypes["pdf"] = "application/pdf"
xover.mimeTypes["png"] = "image/png"
xover.mimeTypes["resx"] = "text/xml,application/xml,application/octet-stream,text/microsoft-resx"
xover.mimeTypes["svg"] = "application/svg+xml,image/svg+xml"
xover.mimeTypes["text"] = "text/plain"
xover.mimeTypes["xml"] = "text/xml,application/xml"
xover.mimeTypes["xsd"] = "text/xml,application/xml"
xover.mimeTypes["xsl"] = "text/xml,application/xml,text/xsl,application/xslt+xml"
xover.mimeTypes["xslt"] = "text/xml,application/xml,text/xsl,application/xslt+xml"

xover.Manifest = function (manifest = {}) {
    function hasMatchingStructure(input, template) {
        // Check if both objects are of type 'object'
        if (typeof template !== 'object' || typeof input !== 'object') {
            return false;
        }

        for (const key in input) {
            // Check if the key exists in the JSON object
            if (!(key in template)) {
                return false;
            }

            //const jsonValue = template[key];
            //const templateValue = input[key];

            //// Check if the types match
            //if (typeof jsonValue !== typeof templateValue) {
            //    return false;
            //}

            //// Recursively check nested objects/arrays
            //if (typeof jsonValue === 'object' && typeof templateValue === 'object') {
            //    if (!hasMatchingStructure(jsonValue, templateValue)) {
            //        return false;
            //    }
            //}
        }

        return true;
    }

    let base_manifest = {
        "server": {},
        "session": {},
        "sources": {},
        "start": [],
        "state": [],
        "spaces": {},
        "settings": {}
    }
    if (manifest && !hasMatchingStructure(manifest, base_manifest)) {
        throw (`Manifest has an invalid structure`);
    }
    let _manifest = Object.assign(base_manifest, manifest);

    Object.setPrototypeOf(_manifest, xover.Manifest.prototype);
    //Object.defineProperty(_manifest["state"], 'refresh', {
    //    value: function () {
    //        for (let [key, script] of Object.entries(xover.manifest.state || {})) {
    //            try {
    //                xover.state[key] = xover.state[key] || eval(`\`${script}\``);
    //            } catch (e) {
    //                console.error(e)
    //            }
    //        }
    //    }
    //})
    //Object.defineProperty(_manifest["session"], 'refresh', {
    //    value: function () {
    //        for (let [key, script] of Object.entries(xover.manifest.session || {})) {
    //            try {
    //                xover.session[key] = xover.session[key] || eval(`\`${script}\``);
    //            } catch (e) {
    //                console.error(e)
    //            }
    //        }
    //    }
    //})

    return _manifest;
}

Object.defineProperty(xover.Manifest.prototype, 'init', {
    value: function () {
        this.init.initializing = this.init.initializing || xover.delay(1).then(async () => {
            try {
                await xover.modernize();
                for (let link of [...document.querySelectorAll('link[rel="xover-manifest"]')].filter(manifest => (manifest.getAttribute("href") || {}).indexOf('.manifest') != -1 || (manifest.getAttribute("href") || {}).indexOf('manifest.json') != -1)) {
                    let url = xover.URL(link.getAttribute("href"));
                    try {
                        let manifest = await xover.fetch.json(url, { headers: { Accept: "*/*" } }).catch(e => console.log(e));
                        xover.manifest.merge(manifest)
                    } catch (e) {
                        Promise.reject(e);
                    }
                }
                xover.manifest = new xover.Manifest(xover.manifest);
                this.init.status = 'initialized';
                return Promise.resolve()
            } catch (e) {
                return Promise.reject(e)
            }
        }).catch(e => {
            return Promise.reject(e);
        }).finally(() => {
            this.init.initializing = undefined;
        });
        return this.init.initializing;

    },
    writable: true, enumerable: false, configurable: false
});

Object.defineProperty(xover.Manifest.prototype, 'getSettings', {
    value: function (input, config_name) { //returns array of values if config_name is sent otherwise returns entries
        let tag = typeof (input) == 'string' && input || input && input.tag || input instanceof Node && (input.documentElement || input).nodeName || "";
        let tag_url = input instanceof URL && input || xover.URL(tag);
        let settings = Object.entries(this.settings).filter(([full_key, value]) => full_key.split(/\|\|/g).some(key => {
            if (input instanceof Node) {
                if (key[0] != '/') return false;
                return input.selectFirst(key)
            } else if (key[0] == '^') {
                return tag_url.href.matches(key)
            } else {
                if (key[0] == '/') return false;
                let key_url = new xover.URL(!(input instanceof Node) ? key : '');
                return value.constructor === {}.constructor
                    && (
                        tag_url.protocol == key_url.protocol
                    ) && (
                        !key_url.pathname[1]
                        || tag_url.pathname.slice(1).matches(key_url.pathname.slice(1))
                    ) && (
                        !key_url.hash
                        || tag_url.hash == key_url.hash
                        || tag_url.hash.slice(1).matches(key_url.hash.slice(1))
                    ) && (
                        !key_url.searchParams.length ||
                        [...key_url.searchParams].every(([key, predicate]) => {
                            return !predicate ? tag_url.searchParams.has(key) : tag_url.searchParams.get(key) == predicate
                        })
                    )
            }

        }
        )).reduce((config, [key, value]) => { config.push(...Object.entries(value)); return config }, []);
        if (config_name) {
            settings = settings.filter(([key, value]) => key === config_name).map(([key, value]) => value.constructor === {}.constructor && Object.entries(value) || value);
            settings = settings.flat();
        }
        return settings;
    },
    writable: true, enumerable: false, configurable: false
});
xover.manifest = new xover.Manifest();
xover.messages = new Map();
xover.server = new Proxy({}, {
    get: function (self, key) {
        if (key in self) {
            return self[key]
        }
        let return_value, request, response;
        let handler = (async function (payload, ...args) {
            let handlers = [];
            let headers = [];
            for (let i = args.length - 1; i >= 0; --i) {
                if (!args[i]) continue;
                if (typeof (args[i]) == 'function') {
                    handlers.push(args[i]);
                    args.splice(i, 1)
                } else if (args[i] instanceof Headers) {
                    headers.push(args[i]);
                    args.splice(i, 1)
                } else if (args[i].constructor && [Document, File, Blob, FormData, URLSearchParams].includes(args[i].constructor)) {
                    payload.push(args[i]);
                    args.splice(i, 1)
                }
            }
            if (!(xover.manifest.server && xover.manifest.server[key])) {
                return Promise.reject(`Endpoint "${key}" not configured in manifest`);
            }
            let settings = {};
            if (this instanceof xover.Source || this instanceof Document) {
                settings = this.settings || {};
            }
            //let settings = this.settings || {};
            //this.settings = settings.merge(Object.fromEntries(xover.manifest.getSettings(`server:${key}`) || []));
            let url = new xover.URL(xover.manifest.server[key], undefined, { payload, ...settings });
            url.hash = `server:${key}`;
            if (this instanceof Node) {
                this.url = url
            }
            //settings = xover.json.combine(Object.fromEntries(xover.manifest.getSettings(url) || []), settings);
            //url.settings = xover.json.combine(url.settings, settings);

            window.top.dispatchEvent(new xover.listener.Event(`beforeFetch`, { url, request, href: url.href }, url));
            try {
                [return_value, request, response] = await xover.fetch.apply(url, [url, ...args]).then(response => [response.body, response.request, response]);
            } catch (e) {
                [return_value, request, response] = [e.body, e.request, e]
                if (e instanceof DOMException) {
                    if (e.name == 'AbortError') {
                        response = new Response(response.message, { status: 499, statusText: "Client Closed Request" })
                    }
                }
            }
            let manifest_settings = xover.manifest.getSettings(response.tag, "stylesheets");
            return_value instanceof XMLDocument && manifest_settings.reverse().map(stylesheet => {
                return_value.addStylesheet(stylesheet);
            });
            response.response_value = return_value;
            for (let handler of handlers) {
                return_value = handler(return_value, request, response) || return_value
            }
            if (response.ok) {
                window.top.dispatchEvent(new xover.listener.Event(`success`, { response, url, payload: url.settings.body, request, status: response.status, statusText: response.statusText, tag: `#server:${key}` }, response));
                return Promise.resolve(return_value);
            } else {
                window.top.dispatchEvent(new xover.listener.Event(`failure`, { response, url, payload: url.settings.body, request, status: response.status, statusText: response.statusText, tag: `#server:${key}` }, response));
                return Promise.reject(response);/*response.body*/
            }
        })

        if (self.hasOwnProperty(key)) {
            Object.defineProperty(self[key], 'fetch', {
                value: function (...args) {
                    let settings = args.pop() || {};
                    if (settings.constructor === {}.constructor) {
                        settings["method"] = 'GET';
                    }
                    args.push(settings)
                    return handler.apply(this, args);
                },
                writable: true, enumerable: false, configurable: false
            });
            Object.defineProperty(self[key], 'post', {
                value: function (...args) {
                    let settings = args.pop() || {};
                    if (settings.constructor === {}.constructor) {
                        settings["method"] = 'POST';
                    }
                    args.push(settings)
                    return handler.apply(this, args);
                },
                writable: true, enumerable: false, configurable: false
            });
            return self[key];
        } else if (!(xover.manifest.server && xover.manifest.server[key])) {
            throw (new Error(`Endpoint "${key}" not configured`));
        } else {
            return handler;
        }
    }, has: function (self, key) {
        return key in self || key in (xover.manifest.server || {});
    }
})

xover.session = new Proxy({}, {
    get: function (self, key) {
        let return_value;
        if (typeof self[key] === 'function') {
            return self[key];
        }
        if (key in self) {
            return_value = self[key];
            if (!(self[key] instanceof Function) && history.state.context instanceof Array) {
                history.state.context.push(["session", self, key])
            }
        } else {
            return_value = xover.session.getKey(key);
        }
        if (return_value instanceof Array) {
            for (let prop of ['pop', 'push', 'splice', 'shift', 'unshift', 'remove', 'removeAll']) {
                Object.defineProperty(return_value, prop, {
                    value: function () {
                        let result = Array.prototype[prop].apply(return_value, arguments);
                        xover.session[key] = return_value;
                        return result;
                    }, writable: true, enumerable: true, configurable: false
                })
            }
        }
        return_value = return_value != undefined ? return_value : xover.manifest.session[key];
        if (typeof (return_value) == 'string' && return_value.indexOf("${") != -1) {
            return_value = eval(`\`${return_value}\``);
        }
        return return_value;
    },
    set: async function (self, key, new_value) {
        let old_value = xover.session.getKey(key);
        let before = new xover.listener.Event(`beforeChange::session:${key}`, { attribute: key, value: new_value, old: old_value }, this);
        window.top.dispatchEvent(before);
        if (before.cancelBubble || before.defaultPrevented) return;
        xover.session.setKey(key, new_value);
        window.top.dispatchEvent(new xover.listener.Event(`change::#session:${key}`, { attribute: key, value: new_value, old: old_value, tag: `session:${key}` }, this));
        xover.site.sections.map(el => [el, el.stylesheet]).filter(([el, stylesheet]) => stylesheet && stylesheet.selectSingleNode(`//xsl:stylesheet/xsl:param[starts-with(@name,'session:${key}')]`)).forEach(([el]) => el.render());
        for (let subscriber of Object.keys(xover.subscribers.session[key])) {
            subscriber.evaluate()
        }

        new_value != old_value && ["status"].includes(key) && await xover.stores.active.render();

        if (xover.session.network_id) {
            xover.storage.setKey(key, new_value);
            xover.storage.setKey(key, undefined);
        }
        return self[key];
    },
    deleteProperty: function (self, key) {
        xover.session[key] = undefined;
    },
    has: function (self, key) {
        return key in self || key in sessionStorage
    }
})

Object.defineProperty(xover.session, 'getKey', {
    value: function (key) {
        if (typeof (Storage) !== "undefined") {
            let value = JSON.parse(sessionStorage.getItem(key));
            if (!(key in sessionStorage)) {
                return null;
            } else if (value == "null" || value == "undefined") { //Para guardar específicamente null o undefined, se guardarían como texto plano;
                return eval(value);
                //} else if (value && key.indexOf("#") != -1) {
                //    return (xover.xml.createDocument(value, false) || value);
            } else if (key in sessionStorage) {
                return value;
            } else {
                return value; //Se está considerando que si no existe el key, estaría regresando null (si el valor que se quiso guardar fue null, se habría guardado como "null" y se habría atendido en la primer condición). En este caso es mejor definirlo como undefined (no se ha definido)
            }
        } else {
            console.error('Storage is not supported by your browser')
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'setKey', {
    value: function (key, value) {
        if (typeof (Storage) !== "undefined") {
            if (value instanceof Promise) {
                return false;
            } else if (value === undefined) {
                sessionStorage.removeItem(key);
            } else if (value instanceof Attr) {
                sessionStorage.setItem(key, JSON.stringify({ attribute: value.name, value: value.value, target: value.parentNode.getAttribute("xo:id") }));
            } else if ((value instanceof Node || value instanceof xover.Store) && value.toString) {
                sessionStorage.setItem(key, JSON.stringify(value.toString()));
            } else if (value instanceof Node && value.outerHTML) {
                sessionStorage.setItem(key, JSON.stringify(value.outerHTML));
            } else {
                sessionStorage.setItem(key, JSON.stringify(value));
            }
        } else {
            console.error('Storage is not supported by your browser')
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'getCurrentStatus', {
    value: async function () {
        return xover.session.checkStatus();
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'checkStatus', {
    value: async function (settings) {
        if (!(navigator.onLine || 'session' in xover.server)) return xover.session.status;
        let server_status = {};
        //if (!((xover.manifest.server || {}).session)) {
        //    return Promise.reject(new Error("Session endpoint not configured."));
        //}
        if ('session' in xover.server) {
            try {
                server_status = await xover.server.session();
            } catch (e) {
                server_status = { "status": "unauthorized" }
            }
        }
        return new Promise((resolve, reject) => {
            let current_status = xover.session.status;
            xover.session.updateSession(server_status);
            if (current_status != server_status.status) {
                xover.stores.active.render();
            }
            resolve(server_status["status"]);
        });
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'login', {
    value: function () {
        if ('login' in xover.server) {
            try {
                return xover.server.login.apply(xover.server.login, arguments);
            } catch (e) {
                console.error(e);
            }
        } else {
            xover.session.status = 'authorized';
            return false;
        }
    }
    , writable: true, enumerable: false, configurable: true
});

Object.defineProperty(xover.session, 'locale', {
    get() {
        return xover.site.searchParams.get("lang") || this.getKey("locale") || navigator.language
    }
    , set(input) {
        this.setKey("locale", input)
    }
    , enumerable: false
});

Object.defineProperty(xover.session, 'logout', {
    value: function () {
        if ('logout' in xover.server) {
            try {
                return xover.server.logout.apply(xover.server.logout, arguments);
            } catch (e) {
                console.error(e);
            }
        } else {
            xover.session.status = 'unauthorized';
            xover.init();
            return false;
        }
    }
    , writable: true, enumerable: false, configurable: true
});

Object.defineProperty(xover.session, 'use', {
    value: function (store_id, without_confirmation) {
        if (!(xover.session.store_id == store_id)) {
            if (!without_confirmation && confirm("Change connection?")) {
                xover.session.store_id = store_id;
                xover.session.logout();
            }
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'saveLocation', {
    value: function (key, value) {
        xover.session.setKey("xover.current_location", window.location.pathname.replace(/[^/]+$/, ""));
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'getLocation', {
    value: function () {
        return xover.session.getKey("xover.current_location");
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'setData', {
    value: function (data) {
        if (typeof (Storage) !== "undefined") {
            if (data && data.documentElement) {
                data = data.documentElement.outerHTML;
            }
            xover.session.setKey(location.pathname.replace(/[^/]+$/, "") + "xover.data", data);
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'clearCache', {
    value: function (options) {
        let { auto_reload = true } = (options || {});
        if (typeof (Storage) !== "undefined") {
            sessionStorage.clear();
            navigator.serviceWorker && navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister()
                }
            }).then(() => {
                typeof (caches) != 'undefined' && caches.keys()
                    .then(cacheNames => {
                        return Promise.all(
                            cacheNames.map(cacheName => {
                                return caches.delete(cacheName)
                            })
                        )
                    }).then(() => auto_reload && window.location.reload(true))
            })
            //xover.stores.clear();

        } else {
            console.error('Storage is not supported by your browser')
        }
    },
    writable: false, enumerable: false, configurable: false
});

xover.site = new Proxy(Object.assign({}, history.state), {
    get: function (self, key) {
        if (!history.state) {
            with ((window.top || window)) {
                //history.replaceState({}, {}, location.pathname + location.search + (location.hash || ''));
                history.replaceState(Object.assign({ position: history.length - 1 }, history.state), {}, location.pathname + location.search + (location.hash || ''));
            }
            xover.session.setKey('lastPosition', self.position);
        }
        if (!(self[key] instanceof Function) && history.state.context instanceof Array) {
            history.state.context.push(["site", self, key])
        }
        return [/*history.state[key], won't work properly*/self[key], xover.session.getKey(key)].coalesce()
    },
    set: function (self, key, new_value) {
        try {
            xover.site[key];
            self[key] = new_value;
            history.state[key] = new_value;
            let hash = [xover.manifest.getSettings(self['active'], 'hash').pop(), location.hash, self['active'], ''].coalesce();
            history.replaceState(Object.assign({}, history.state), {}, location.pathname + location.search + hash);
            if (key === 'seed') self['active'] = new_value
            for (let [subscriber] of xover.subscribers.site[key]) {
                subscriber.evaluate()
            }
        } catch (e) {
            console.error(e);
        }
    }
})

Object.defineProperty(xover.site, 'reference', {
    get() { return (history.state['reference'] || {}) }
    , set() { throw `State "reference" is readonly` }
    , enumerable: true
});

Object.defineProperty(xover.site, 'location', {
    get() {
        return { ...Object.fromEntries(Object.entries({ ...location }).filter(([key, value]) => typeof (value) == 'string')) }
    }
    , enumerable: true
});

Object.defineProperty(xover.site, 'scrollRestoration', {
    get() {
        return 'scrollRestoration' in xover.state && xover.state.scrollRestoration || (document.querySelector('meta[name=scroll-restoration]') || document.createElement('p')).getAttribute("content") || history.scrollRestoration
    }
    , set(value) {
        xover.state.scrollRestoration = value;
    }
    , enumerable: true
});

Object.defineProperty(xover.site, 'history', {
    get() { return (history.state['history'] || []) }
    , set() { throw `State "history" is readonly` }
    , enumerable: true
});

Object.defineProperty(xover.site, 'navigate', {
    value: function (url, options = {}) {
        if (!(url instanceof xover.URL)) {
            url = new xover.URL(url)
        }
        let hashtag = url.hash;
        xover.site.next = hashtag;
        xover.site.seed = hashtag;
        event && event.preventDefault()
    }, writable: false, configurable: false, enumerable: false
});

Object.defineProperty(xover.site, 'hash', {
    get() { return location.hash }
    , set(input) {
        input = input[input.length - 1] != '#' ? input : '';
        history.replaceState(Object.assign({ position: history.length - 1 }, history.state, { active: history.state.active }), ((event || {}).target || {}).textContent, location.pathname + location.search + (input || ''));
    }
    , enumerable: false
});

class SearchParams {
    constructor(queryString) {
        this.params = new URLSearchParams(queryString);
        this.handlers = new Map();
    }

    set(param, value, action = 'push') {
        let current_state = Object.assign({}, history.state, { active: history.state.active, prev: { searchParams: Object.fromEntries([...this.params.entries()]) } });
        if (value === null) {
            this.params.delete(param);
        } else {
            this.params.set(param, value != undefined ? value : "");
        }
        let searchText = this.params.toString();
        history[`${action}State`](current_state, {}, location.pathname + (searchText ? `?${searchText}` : '').replace(/=(&|$)/g, '') + (location.hash || ''));
        window.top.dispatchEvent(new xover.listener.Event(`searchParams`, { param }, this));
        xover.site.sections.map(el => [el, el.stylesheet]).filter(([el, stylesheet]) => stylesheet && stylesheet.selectSingleNode(`//xsl:stylesheet/xsl:param[starts-with(@name,'searchParams:${param}')]`)).forEach(([el]) => el.render());
    }

    get(param) {
        return this.params.get(param);
    }

    toggle(param, value, else_value) {
        if (this.get(param) != value) {
            this.set(param, value)
        } else if (!else_value) {
            this.set(param, null)
        } else {
            this.set(param, else_value)
        }
    }

    entries() {
        return [...this.params];
    }

    delete(param) {
        return this.set(param, null);
    }

    has(param) {
        return this.params.has(param);
    }
}

Object.defineProperty(xover.site, 'searchParams', {
    get() {
        const observableParams = new SearchParams(location.search);

        return observableParams
    }
    , enumerable: false
});

Object.defineProperty(xover.site, 'state', {
    get() {
        history.state['state'] = history.state['state'] || {};
        return new Proxy(history.state['state'], {
            get: function (self, key) {
                let return_value;
                if (key in self) {
                    return_value = self[key]
                    if (!(self[key] instanceof Function) && history.state.context instanceof Array) {
                        history.state.context.push(["state", self, key])
                    }
                } else if (key in xover.manifest.state) {
                    return_value = xover.manifest.state[key];
                } else if (key[0] == '#') {
                    self[key] = {};
                    return_value = self[key]
                }
                if (typeof (return_value) == 'string' && return_value.indexOf("${") != -1) {
                    let formula = return_value;
                    history.state.context = history.state.context || [];
                    return_value = eval(`\`${return_value}\``);
                    for (let [scope, context, scope_key] of history.state.context) {
                        xover.subscribers[scope][scope_key].set(xover.subscribers.state[key], formula);
                    }
                    delete history.state.context;
                }
                return return_value
            }
            , set: function (self, key, input) {
                let old_value = self[key];
                self[key] = input;
                if (old_value != input && key[0] != '#') {
                    window.top.dispatchEvent(new xover.listener.Event(`change::#state:${key}`, { attribute: key, value: input, old: old_value }, { tag: `state:${key}` }));
                    xover.site.sections.map(el => [el, el.stylesheet]).filter(([el, stylesheet]) => stylesheet && stylesheet.selectSingleNode(`//xsl:stylesheet/xsl:param[starts-with(@name,'state:${key}')]`)).forEach(([el]) => el.render());
                    for (let subscriber of Object.keys(xover.subscribers.state[key])) {
                        subscriber.evaluate()
                    }
                }
            }
        });
    }
    , set(input) { history.state['state'] = input }
    , enumerable: true
});

Object.defineProperty(xover, 'state', {
    get() {
        return xover.site.state;
    }, enumerable: true
});

Object.defineProperty(xover.site, 'sections', {
    get() {
        let sections = new Proxy([...top.window.document.querySelectorAll(`[xo-source],[xo-stylesheet]`)], {
            get: function (self, key) {
                if (key in self) {
                    return self[key]
                } else {
                    let [stylesheet_href, store_name] = key.split(/#/);
                    let store = store_name && xover.stores['#' + store_name];
                    return self.filter(section => (store && section.store == store || !store) && section.getAttribute("xo-stylesheet") == stylesheet_href)
                }
            }
        });
        Object.defineProperty(sections, 'active', {
            get() {
                let active_element = xover.site.activeElement;
                let active_section = active_element.closest(`[xo-stylesheet]`) || this.filter(section => section.store.tag == xover.site.active).find(section => xover.stores.seed.stylesheets.map(stylesheet => stylesheet.href).includes(section.getAttribute("xo-stylesheet")));
                return active_section;
            }
        });

        Object.defineProperty(sections, 'render', {
            value() {
                this.forEach(section => section.render())
            }, writable: false, configurable: false, enumerable: false
        });
        return sections;
    }
    , enumerable: false
});

Object.defineProperty(xover.site, 'set', {
    value(input, value) {
        let prop;
        if (input instanceof Node) {
            prop = input.name;
            value = input.value
        } else if (typeof (input) === 'string') {
            prop = input
        } else if (input instanceof Array) {
            for (let el of input) {
                this.set(el.name, new Object().push(el.parentNode.getAttribute("xo:id"), el.value))
            }
            return
        } else {
            let entries = Object.entries(input);
            prop = entries[0][0];
            value = value !== undefined ? value : entries[0][1]
        }
        let { prefix, name } = xover.xml.getAttributeParts(prop);
        let active = this.active;
        let site_state = this.state;
        site_state[active] = (site_state[active] || {});
        if (prefix) {
            site_state[active][prefix] = (site_state[active][prefix] || {});
        }
        if (value instanceof Array) {
            if (prefix) {
                site_state[active][prefix][name] = site_state[active][prefix][name] || []
                site_state[active][prefix][name] = value
            } else {
                site_state[active][name] = site_state[active][name] || [];
                site_state[active][name] = value
            }
        } else if (value instanceof Object) {
            if (prefix) {
                site_state[active][prefix][name] = site_state[active][prefix][name] || {}
                site_state[active][prefix][name] = value;
            } else {
                site_state[active][name] = site_state[active][name] || {};
                site_state[active][name] = value;
            }
        } else {
            value = (value !== null && value !== undefined && !(value instanceof Array) ? value.toString() : value);
            if (value === undefined) {
                if (prefix) {
                    delete site_state[active][prefix][name]
                } else {
                    delete site_state[active][name];
                }
            } else {
                if (prefix) {
                    site_state[active][prefix][name] = value
                } else {
                    site_state[active][name] = value;
                }
            }
        }

    }
    , enumerable: false
});

Object.defineProperty(xover.site, 'get', {
    value(prop, initial) {
        let { prefix, name } = xover.xml.getAttributeParts(prop);
        let active = this.active;
        let site_state = this.state;
        site_state[active] = (site_state[active] || {});
        let returnValue;
        if (prefix) {
            if (initial) {
                returnValue = (site_state[active][prefix] || {})[name];
                if (returnValue == undefined) {
                    xover.site.set(prop, initial)
                }
                (site_state[active][prefix] || {})[name] = initial;
            }
            return (site_state[active][prefix] || {})[name];
        } else {
            if (initial) {
                returnValue = (site_state[active] || {})[name];
                if (returnValue == undefined) {
                    xover.site.set(prop, initial)
                }
            }
            return site_state[active][name];
        }
    }
    , enumerable: false
});

Object.defineProperty(xover.site, 'activeCaret', {
    get() {
        let active = this.active;
        let site_state = this.state;
        return (site_state[active] || {})["activeCaret"];
    }
    , set(input) {
        let active = this.active;
        let site_state = this.state;
        site_state[active] = (site_state[active] || {});
        site_state[active]["activeCaret"] = input;
    }
    , enumerable: false
});

Object.defineProperty(xover.site, 'activeElement', {
    get() {
        targetDocument = ((document.activeElement || {}).contentDocument || document);
        let active = this.active;
        let site_state = this.state;
        return targetDocument.querySelector((site_state[active] || {})["activeElement"]) || (document.activeElement || {});
    }
    , set(input) {
        if (input instanceof Node) input = input.selector;
        let active = this.active;
        let site_state = this.state;
        site_state[active] = (site_state[active] || {});
        site_state[active]["activeElement"] = input;
    }
    , enumerable: false
});

Object.defineProperty(xover.site, 'next', {
    get() { return (history.state['next'] || {}) }
    , set(input) { history.state['next'] = input }
    , enumerable: false
});

Object.defineProperty(xover.site, 'seed', {
    get() {
        return (history.state || {})['seed'] || '#';//((history.state || {})['seed'] || !document.querySelector(`${(location.hash || '').replace(/^#/, '') && `[id='${(location.hash || '').replace(/^#/, '')}']` || ''}:not([xo-source],[xo-stylesheet])`) && location.hash || '')
    }
    , set(input) {
        if (!history.state['seed']) {
            history.state['seed'] = input; //Initializes seed. Typically when clicked an anchor
        } else if (new xover.URL(history.state['seed']).hash != new xover.URL(input).hash) {
            xover.site.next = input;
            let reference = event && event.srcElement || {};
            let ref_node = reference.scope;
            let prev = [...this["history"]];
            prev.unshift({
                store: (reference.store || {}).tag || null
                , reference: {
                    id: (ref_node && ref_node.ownerElement || ref_node instanceof Element && ref_node || document.createElement('p')).getAttribute("xo:id") || null
                    , attribute: ref_node instanceof Attr && ref_node.name || null
                }
            });
            let new_state = Object.assign({}, history.state); //If state is not copied, attributes that are not present like "stores", might be lost
            //new_state["position"] = history.state.position++;
            //new_state["scrollableElements"] = {};
            new_state["seed"] = input;
            new_state["history"] = prev;
            new_state["next"] = "";
            new_state["position"] = new_state["position"] + 1;
            xover.session.setKey('lastPosition', new_state["position"]);
            history.pushState(Object.assign({ position: history.length - 1 }, new_state), ((event || {}).target || {}).textContent, (xover.stores[input] || {}).tag);
        }
    }
    , enumerable: true

});

Object.defineProperty(xover.site, 'pushState', {
    value: function (state = {}, hash = location.hash) {
        history.pushState(Object.merge.call(history.state, { position: history.length - 1 }, state), {}, hash);
    }
    , enumerable: true, writable: false, configurable: false
});

Object.defineProperty(xover.site, 'replaceState', {
    value: function (state = {}, hash = location.hash) {
        history.replaceState(Object.merge.call(history.state, state), {}, hash);
    }
    , enumerable: true, writable: false, configurable: false
});

Object.defineProperty(xover.site, 'position', {
    get() { return [history.state['position'], Number(this.history.length) + 1].coalesce() }
    , set(input) { history.go(input - xover.site.position) }
    , enumerable: true
});

Object.defineProperty(xover.site, 'active', {
    get: function () {
        if (xover.session.getKey("status") != 'authorized' && 'login' in xover.server) {
            return "#login";
        } else {
            return (history.state || {}).active || this.seed;
        }
    },
    set: function (tag) {
        let store = xover.stores[tag];
        if (!store) {
            let document = xover.sources[tag];
            store = new xover.Store(document);
        }
        if (store) {
            //this.hash = store.hash;
            store.render();
        } else {
            return Promise.reject(`${tag || "store"} not available`)
        }
    }
    , enumerable: false
});

Object.defineProperty(xover.site, 'activeTags', {
    get: function () {
        return function (tag) {
            let active_tag = tag || (xover.stores[this.active] || {}).tag || this.active; //se hace de esta manera porque el estado podría guardar como active el tag "#"
            this.state[active_tag] = this.state[active_tag] || {};
            let active_stores = (this.state[active_tag] || {}).active;
            return active_stores || [(xover.stores[this.active] || {}).tag].filter(tag => tag);
        }
    }
    , set: function (input) {
        let self = this;
        let active = self.active;
        let site_state = self.state;
        site_state[active] = (site_state[active] || {});
        site_state[active]["active"] = input;
    }
    , enumerable: false
});

Object.defineProperty(xover.site, 'update', {
    value: function (new_state) {
        if (!new_state) return;
        let new_active = new_state['active'];
        delete new_state['active'];
        for (let prop in new_state) this[prop] = new_state[prop];
        if (new_active) {
            history.state.active = new_active;
            this.active = new_active;
        }
    }
    , writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.site, 'goto', {
    value: function (href, state) {
        xover.site.seed = href;
    }
    , writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.site, 'save', {
    value: function (srcElement) {
        //xover.delay(1).then(() => {
        //srcElement = (srcElement || event && event.srcElement);
        targetDocument = ((document.activeElement || {}).contentDocument || document);
        //if (srcElement && !(srcElement instanceof HTMLElement) || !targetDocument.querySelector('*')) {
        //    return
        //}
        try {
            srcElement = srcElement || targetDocument.querySelector(this.activeElement.selector || 'body');
        } catch (e) {
            console.error(e)
        }
        if (srcElement) {
            this.activeElement = srcElement.selector || srcElement;
            this.activeCaret = xover.dom.getCaretPosition(srcElement);
        }
        history.replaceState(Object.assign({}, history.state), {}, location.pathname + location.search + (location.hash || ''));
    }
    , enumerable: false, configurable: false
});

Object.defineProperty(xover.site, 'restore', {
    value: function (scope) {
        targetDocument = (scope || (document.activeElement || {}).contentDocument || document);
        let scrollableElements = xover.site.getScrollableElements(targetDocument);
        for (let element of scrollableElements) {
            let [, coordinates = { x: 0, y: 0 }] = Object.entries(xover.site.get("scrollableElements", {})).find(([selector, coordinates]) => element.matches(selector)) || [];
            xover.dom.setScrollPosition(element, coordinates);
        }

        let activeElement = xover.site.activeElement;
        if (!activeElement) {
            return;
        }
        xover.dom.triggeredByTab = undefined;
        if (scope && scope.contains(activeElement)) {
            xover.dom.setCaretPosition(activeElement, xover.site.activeCaret);
        }
    }
    , enumerable: false, configurable: false
});

xover.xml = {};

xover.xml.getDifferences = function (node1, node2) {
    if (!node1 || !node2 || node1.constructor !== node2.constructor) {
        return [new Map([[node1, node2]])];
    }
    if (node1.isEqualNode(node2)) return [];
    if (node1 === top.document.activeElement || [HTMLSelectElement].includes(node1.constructor)) {
        return [new Map([[node1, node2]])];
    }
    if (node1 instanceof Element && (node1.hasAttribute("xo-source") && node1.getAttribute("xo-source") == node2.getAttribute("xo-source") || node1.hasAttribute("xo-stylesheet") && node1.getAttribute("xo-stylesheet") == node2.getAttribute("xo-source"))) {
        node1.staticAttributes = node1.staticAttributes || [...node1.attributes || []].map(attr => `@${attr.name}`);
    }
    let static = document.firstElementChild.cloneNode().classList;
    static.value = node1 instanceof Element && node1.getAttribute("xo-static") || "";
    node1.constructor === node2.constructor && static.add(...node1.staticAttributes || []);
    for (let item of [...static].filter(item => item != "@*" && item[0] == "@")) {
        let static_attribute = node1.getAttributeNode(item.substring(1));
        static_attribute && node2.setAttributeNode(static_attribute.cloneNode(), { silent: true })
    }
    if (node1.cloneNode().isEqualNode(node2.cloneNode()) || [...xover.listener.skip_selectors.keys()].find(rule => node1.matches(rule))) {
        if (node1.childNodes.length && node1.childNodes.length == node2.childNodes.length) {
            const node1_children = [...node1.childNodes];
            const node2_children = [...node2.childNodes];
            if (node1_children.every((el, ix) => el.constructor == node2_children[ix].constructor)) {
                let differences = [...node1_children].map((item, ix) => xover.xml.getDifferences(item, node2_children[ix])).filter(item => item);
                if (differences.length) {
                    return differences.flat(Infinity);
                } else {
                    return [new Map([[node1, node2]])];
                }
            } else {
                return [new Map([[node1, node2]])];
            }
        } else {
            return [new Map([[node1, node2]])];
        }
    } else {
        return [new Map([[node1, node2]])];
    }
}

xover.string = {}
xover.string.htmlDecode = function (string) {
    let txt = document.createElement("textarea");
    txt.style.textTransform = 'unset'
    txt.innerHTML = string;
    return txt.value;
}

xover.string.getFileParts = function (file_name = '') {
    let parts = {}
    parts["extension"] = file_name.lastIndexOf('.') != -1 && file_name.substring(file_name.lastIndexOf('.') + 1) || undefined;
    parts["name"] = file_name.substring(file_name.lastIndexOf('/') + 1)
    parts["path"] = file_name.substring(0, file_name.lastIndexOf('/') + 1)
    return parts;
}

xover.json.isValid = function (input) {
    try {
        return !(input instanceof Node) && input !== undefined && [{}.constructor, [].constructor].includes(JSON.parse(JSON.stringify(input)).constructor)
    } catch (e) {
        return false;
    }
    return true;
}

xover.json.tryParse = function (input) {
    let output;
    if (xover.json.isValid(input) || !input) {
        return input;
    }
    try {
        output = eval(`(${input})`);
    } catch (e) {
        output = eval(`(${JSON.stringify(input && input.value || `${input}`)})`)
    }
    return output;
}

xover.xml.createDocument = function (xml, options = { autotransform: true }) {
    let result = undefined;
    if (xml instanceof Node) {
        result = document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", "", null);
        result.append(xml.cloneNode(true));
    } else if (xover.json.isValid(xml)) {
        return xover.xml.fromJSON(xml, { mode: 'elements', typed: 'full' })
    } else {
        let sXML = (xml && xml.document || xml || '').toString();
        if (sXML.indexOf('<<<<<<< ') != -1) {
            throw (new Error("Possible unresolved GIT conflict on file."));
        }
        parser = new DOMParser();
        if (!sXML) {
            result = document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", "", null);
        } else {
            if (xml.namespaceURI && xml.namespaceURI.indexOf("http://www.w3.org") == 0) {
                result = parser.parseFromString(sXML, "text/html");
            } else {
                let escaped_line_breaks
                result = parser.parseFromString(sXML.replace(/[\u0000-\u001F]/g, (char) => ['\r', '\n', '\t'].includes(char) && char || '').replace(/\w+="[^"]+[\n\r]+[^"]+"/ig, (attr) => {
                    escaped_line_breaks = true;
                    attr = attr.replace(/\r\n/ig, "&#10;");
                    attr = attr.replace(/\t/ig, "&#9;");
                    return attr
                }), "text/xml");
            }
            if (sXML && result.getElementsByTagName && (result.getElementsByTagName('parsererror').length || 0) > 0) {
                for (let message of [...result.querySelectorAll('parsererror div')]) {
                    if (String(message.textContent).match(/prefix|prefijo/)) {
                        let prefix = (message.textContent).match(/(?:prefix|prefijo)\s+([^\s]+\b)/).pop();
                        if (!xover.spaces[prefix] || sXML.indexOf(` xmlns:${prefix}=`) != -1) {
                            //xml.documentElement.appendChild(message.documentElement);
                            return Promise.reject(message.textContent.match("(error [^:]+):(.+)"));
                        }
                        //(xml.documentElement || xml).setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:" + prefix, xover.spaces[prefix]);
                        sXML = sXML.replace(new RegExp(`(<[^\\s\/\!\?>]+)`), `$1 xmlns:${prefix}="${xover.spaces[prefix] || ''}"`);
                        result = xover.xml.createDocument(sXML, options);
                        return result;
                    } else if (message.closest("html") && String(message.textContent).match(/Extra content at the end of the document/)) {
                        message.closest("html").remove();
                        //result = document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", "", null);
                    } else if (String(message.textContent).match(/Extra content at the end of the document/)) {
                        let frag = window.document.createDocumentFragment();
                        let p = window.document.createElement('p');
                        p.innerHTML = xml;
                        frag.append(...p.childNodes);
                        return frag;
                    } else if (message.closest("html")) {
                        if (options["silent"] !== true) {
                            xover.dom.createDialog(message.closest("html"));
                        }
                        throw (new Error(message.textContent));
                    } else {
                        return Promise.reject(message.textContent.match("(error [^:]+):(.+)").pop())
                    }
                }
            }
        }
    }
    if (result instanceof Document) {
        result.settings = result.settings || {}
    }

    //if (options["autotransform"]) {
    if (result.documentElement && !["http://www.w3.org/1999/xhtml", "http://www.w3.org/1999/XSL/Transform"].includes(result.documentElement.namespaceURI)) {
        xover.manifest.getSettings(result, 'stylesheets').reverse().forEach(stylesheet => result.addStylesheet(stylesheet));
    }
    //    // Considerar quitar esta parte de aquí. 
    //    (result.stylesheets || []).filter(stylesheet => stylesheet.role == 'init').forEach(stylesheet => {
    //        if (stylesheet.document.documentElement instanceof Document) {
    //            let new_document = result.transform(stylesheet.document);
    //            if ((((new_document.documentElement || {}).namespaceURI || '').indexOf("http://www.w3.org") == -1)) {
    //                new_document.stylesheets[stylesheet.href].replaceBy(result.createComment('Initialized by ' + stylesheet.href));
    //                /*La transformación no debe regresar un html ni otro documento del estándar*/
    //                result = new_document;
    //            } else {
    //                delete stylesheet["role"];
    //                result.addStylesheet(stylesheet);
    //                console.warn("Initial transformation shouldn't yield and html or any other document from the w3 standard.");
    //            }
    //        }
    //    });
    //}
    return result;
}

xover.Source = function (tag) {
    let expiration_ms = function (expiry) {
        if (expiry == null) return null;
        let ms = 0;
        if (typeof (expiry) == 'object') {
            ms += (expiry["d"] || 0) * 1000 * 60 * 60 * 24
            ms += (expiry["h"] || 0) * 1000 * 60 * 60
            ms += (expiry["m"] || 0) * 1000 * 60
            ms += (expiry["s"] || 0) * 1000
            ms += (expiry["ms"] || 0)
        } else {
            ms += expiry * 1000
        }
        return ms
    }
    if (!(this instanceof xover.Source)) return new xover.Source(tag/*source, tag, manifest_key*/);
    let self = this;
    let __document;

    let _manifest;
    let manifest_key;

    let definition;
    if (!this.hasOwnProperty("definition")) {
        Object.defineProperty(this, 'definition', {
            get: function () {
                _manifest = _manifest || JSON.parse(JSON.stringify(xover.manifest.sources)) || {};
                let tag_string = tag instanceof Node ? `${tag instanceof Attr ? '@' : ''}${tag.nodeName}::${tag.value}` : tag;
                manifest_key = manifest_key || Object.keys(_manifest).find(manifest_key => manifest_key === tag_string) || Object.keys(_manifest).reverse().find(manifest_key => tag_string[0] == '#' && manifest_key[1] && manifest_key === '#' + xover.URL(tag_string.substring(1)).pathname.slice(location.pathname.length) || manifest_key[0] === '^' && tag_string.matches(manifest_key));
                //if (definition !== undefined) return definition;
                if (manifest_key) {
                    let source = _manifest[manifest_key];
                    if (typeof (source) == 'function') {
                        definition = source;
                        return definition
                    }
                    //source = JSON.parse(JSON.stringify(source));
                    source = manifest_key && manifest_key[0] === '^' && [...tag_string.matchAll(new RegExp(manifest_key, "ig"))].forEach(([...groups]) => {
                        if (typeof (source) == 'string') {
                            source = tag_string.replace(new RegExp(manifest_key, "i"), source)
                        } else {
                            Object.keys(source).forEach(fn => source[fn].constructor === [].constructor && source[fn].forEach((value, ix) => source[fn][ix] = typeof (value) == 'string' ? value.replace(/\{\$(\d+|&)\}/g, (...args) => groups[args[1].replace("&", "0")]) : value) || source[fn].constructor === {}.constructor && Object.entries(source[fn]).forEach(([el, value]) => source[fn][el] = value.replace(/\{\$(\d+|&)\}/g, (...args) => groups[args[1].replace("&", "0")])))
                        }
                    }) || source;
                    if (source && source.constructor !== {}.constructor) {
                        source = JSON.parse(JSON.stringify(source));
                    }
                    if (typeof (source) == 'string' && source[0] == '#') {
                        __document = xover.sources[source];
                        source = __document.source.definition;
                    }
                    definition = source != null ? source : tag_string;
                } else if (tag instanceof Node) {
                    definition = tag;
                } else if (existsFunction(tag)) {
                    definition = eval(tag);
                } else {
                    try {
                        definition = eval(`(${decodeURI(tag)})`);
                        if (typeof (definition) == 'function') {
                            try {
                                definition = definition()
                            } catch (e) {
                                return Promise.reject(e)
                            }
                        }
                        if (definition instanceof Node) {
                            definition = definition.cloneNode(true)
                        } else if (definition == undefined || isNaN(definition)) {
                            definition = tag
                        } else {
                            definition = document.createTextNode(definition)
                        }
                    } catch (e) {
                        definition = tag;
                    }
                }
                return definition;
            }, enumerable: false, configurable: false
        });
    }

    let __settings = Object.fromEntries(xover.manifest.getSettings(tag)) || {};
    if (!this.hasOwnProperty("settings")) {
        Object.defineProperty(this, 'settings', {
            value: __settings,
            writable: false, enumerable: false, configurable: false
        });
    }

    if (!this.hasOwnProperty("tag")) {
        Object.defineProperty(this, 'tag', {
            value: tag,
            writable: false, enumerable: false, configurable: false
        });
    }

    if (!this.hasOwnProperty("delete")) {
        Object.defineProperty(this, 'delete', {
            value: function () {
                delete xover.sources[tag];
            },
            writable: false, enumerable: false, configurable: false
        });
    }

    if (!this.hasOwnProperty("clear")) {
        Object.defineProperty(this, 'clear', {
            value: function () {
                this.document.select(`//comment()[starts-with(.,'ack:imported-from')]`).map(comment => comment.textContent.replace(/^ack:imported-from "|" ===>+\s*$/g, '')).forEach(href => xover.sources[href].replaceContent());
                this.document.replaceContent();
            },
            writable: false, enumerable: false, configurable: false
        });
    }

    if (!this.hasOwnProperty("manifest_key")) {
        Object.defineProperty(this, 'manifest_key', {
            get: function () {
                return manifest_key

            }, enumerable: false, configurable: false
        });
    }

    Object.defineProperty(this, 'document', {
        enumerable: true,
        get: function () {
            let source = self.definition;
            __document = __document || xover.xml.createDocument();
            if (!__document.hasOwnProperty("source")) {
                Object.defineProperty(__document, 'source', {
                    value: this,
                    writable: false, enumerable: false, configurable: false
                });
            }
            return __document;
        }
    });

    //Object.defineProperty(this, 'progress', {
    //    get: function () {
    //        return _progress
    //    }, set: function (input) {
    //        _progress = input;
    //        window.top.dispatchEvent(new xover.listener.Event('progress', { percent: _progress, document: __document, source: self }, self));
    //    }
    //});

    this.state = new Proxy({}, {
        get: function (target, name) {
            return target[name];
        },
        set: function (target, name, value) {
            target[name] = value
        }
    })
    Object.defineProperty(this, `fetch`, {
        value: async function (...args) {
            let tag_string = tag.toString();
            if (tag_string[0] == '#' && xover.manifest.init.status != 'initialized') {
                await xover.manifest.init();
            }
            let definition = self.definition;
            let sources;
            if (definition instanceof Array) {
                sources = definition
            } else if (definition.constructor === {}.constructor) {
                sources = Object.keys(definition)
            } else {
                sources = [definition]
            }
            let response;
            while (!response && sources.length) {
                let evaluate_json = (value) => {
                    let result;
                    if (value == null) {
                        result = value
                    } else if ([].constructor === value.constructor) {
                        result = [];
                        for (let item of value) {
                            result.push(evaluate_json(item))
                        }
                    } else if ({}.constructor === value.constructor) {
                        result = {}
                        for (let key in value) {
                            result[key] = evaluate_json(value[key]);
                        }
                    } else {
                        result = value.indexOf && value.indexOf('${') !== -1 && eval(`(${value.replace(/^\$\{(.*)\}$/, '$1')})`) || value;
                    }
                    return result;
                }
                let source = sources.shift();
                if (!source) continue;
                let parameters = {}.constructor === definition.constructor && definition[source] || args;
                source = typeof (source) == 'string' && source.indexOf('${') !== -1 ? eval("`" + source + "`") : source;
                //parameters = parameters.concat(args);

                if (typeof (source) == 'string' && source.replace(/^server:/, '') in xover.server || existsFunction(source)) {
                    if (parameters.constructor === {}.constructor) {
                        parameters = Object.entries(parameters) || parameters
                    }
                    let url = new xover.URL(tag_string.replace(/^#/, ''));
                    parameters = parameters.concat([...url.searchParams.entries()]);
                    let current_url = xover.URL(xover.site.seed.replace(/^#/, ''));
                    if (location.searchParams && current_url.pathname === xover.URL(url).pathname) {
                        parameters = parameters.concat([...location.searchParams.entries()])
                    }
                }

                let url;
                if (typeof (source) != 'object') url = xover.URL(source);
                if (tag_string[0] == '#' && url instanceof URL && !['.', '^', '~', '#'].includes(tag_string)) url.hash = tag_string;

                parameters = evaluate_json(parameters);

                if (Array.isArray(parameters) && parameters.length && parameters.every(item => Array.isArray(item) && item.length == 2)) {
                    parameters = parameters && parameters.map(([key, value]) => [key, value && value.indexOf && value.indexOf('${') !== -1 && eval("`" + value + "`") || value]) || parameters;

                    parameters = [parameters];
                } else {
                    parameters = Array.isArray(parameters) && parameters.map(value => value && value.indexOf && value.indexOf('${') !== -1 && eval("`" + value + "`") || value) || parameters;
                }

                try {
                    let settings = Object.entries(xover.json.merge({}, Object.fromEntries(xover.manifest.getSettings(url)), self.settings));
                    this.settings = xover.json.merge(Object.fromEntries(settings), this.settings);
                    let before_event = new xover.listener.Event('beforeFetch', { tag: tag_string, settings: settings }, this);
                    window.top.dispatchEvent(before_event);
                    if (before_event.cancelBubble || before_event.defaultPrevented) return;
                    if (source instanceof Node) {
                        response = source
                    } else if (url.protocol == 'server:' || existsFunction(source)) {
                        let promises = [];
                        let endpoint = source;

                        promises.push(new Promise(async (resolve, reject) => {
                            try {
                                if (endpoint.replace(/^server:/, '') in xover.server) {
                                    response = await xover.server[endpoint.replace(/^server:/, '')].apply(this, parameters);
                                } else if (existsFunction(endpoint)) {
                                    let fn = eval(endpoint);
                                    response = await fn.apply(this, args.length ? args : parameters);
                                }
                            } catch (e) {
                                if (e instanceof Response && e.document instanceof XMLDocument) {
                                    if ([412].includes(e.status)) {
                                        response = e.document;
                                    } else {
                                        return reject(e.document)
                                    }
                                } else {
                                    return reject(e)
                                }
                            } finally {
                                progress = await this.settings.progress || [];
                                progress.forEach(item => item.remove());
                            }
                            resolve(response);
                        }));

                        let documents;
                        try {
                            documents = await Promise.all(promises).then(document => document);
                        } catch (e) {
                            return Promise.reject(e);
                        }
                        response = documents[0];
                    } else if (typeof (source) == 'function') {
                        response = await source.apply(this, args);
                    } else if (source && source[0] !== '#') {
                        //this["settings"].headers = new Headers(this["settings"].headers || {});
                        if (typeof (source) == 'string' && source.indexOf("${") != -1) {
                            source = eval(`\`${source}\``);
                        }
                        let headers = new Headers(this["settings"].headers || {});
                        try {
                            headers.append("accept", xover.mimeTypes[source.substring(source.lastIndexOf(".") + 1)] || "*/*");
                            headers.set("accept", headers.get("accept").split(/\s*,\s*/g).concat("*/*").distinct().join(","))
                            let accept_header = headers.get("accept");
                            if (accept_header && accept_header.indexOf('xml') != -1) {
                                response = await xover.fetch.xml.apply(this, [source, this["settings"], headers]);
                            } else if (accept_header && accept_header.indexOf('json') != -1) {
                                response = await xover.fetch.json.apply(this, [source, this["settings"], headers]);
                            } else {
                                response = await xover.fetch.apply(this, [source, this["settings"], headers]);
                            }
                        } catch (e) {
                            if (!e || e instanceof Error) return Promise.reject(e);
                            if (e.headers && headers.get("accept").indexOf(e.headers.get("content-type")) != -1) {
                                response = e;
                            } else {
                                throw (e);
                            }
                        }
                    }
                    if (response instanceof Response) {
                        let body_content = response.body;
                        if (body_content instanceof Node) {
                            response = body_content;
                        } else {
                            try {
                                response = await xover.xml.createDocument(body_content)
                            } catch (e) {
                                return Promise.reject(e)
                            }
                        }
                    }
                    if (!response) {
                        response = xover.sources.defaults[source];
                    }
                    if (!(response instanceof Node) && xover.json.isValid(response)) {
                        response = xover.xml.fromJSON(response);
                    }
                    if (response == null) {
                        response = __document.createComment("ack:empty");
                    }
                    if (!(response instanceof Node)) {
                        response = __document.createTextNode(response)
                    }
                    if (response instanceof Document) {
                        this.settings.stylesheets && this.settings.stylesheets.forEach(stylesheet => typeof (response.addStylesheet) == 'function' && response.addStylesheet(stylesheet));
                    }
                    window.top.dispatchEvent(new xover.listener.Event(`fetch`, { document: response, tag: tag_string, settings: this.settings }, self));
                    return Promise.resolve(response);
                } catch (e) {
                    if (sources.length && e instanceof Response && e.status === 404) continue;
                    if (!e) {
                        return Promise.reject(e);
                    }
                    window.top.dispatchEvent(new xover.listener.Event('failure', { tag: tag_string, response: e, request: source }, this));

                    let document = e.document;
                    let targets = []
                    if (e.status != 404 && document && document.render) {
                        targets = await document.render();
                        if (!(targets && targets.length)) {
                            return Promise.reject(e)
                        }
                    } else {
                        return Promise.reject(e);
                    }
                }
            }
        },
        writable: false, enumerable: false, configurable: false
    });
    return this
}

xover.sources = new Proxy(new Map(), {
    get: function (self, key) {
        key = key || "#";
        if (typeof self[key] === 'function') {
            let fn = self[key].bind(self);
            return key !== 'get' ? fn : function (...args) {
                let result = fn.apply(self, args);
                if (!result) {
                    self.set.bind(self)(args[0], new xover.Source(args[0]).document);
                    result = fn.apply(self, args);
                }
                return result
            }
        }
        if (key in self) {
            return self[key];
        }
        key = xover.URL(key).href;
        if (key in self) {
            return self[key];
        }
        if (key.indexOf('{$') != -1) return null;
        xover.sources[key] = new xover.Source(key).document;
        return self[key];
    },
    set: function (self, key, input) {
        self[key] = input;
    },
    has: function (self, key) {
        if (!key) return false;
        return key in self || !!Object.keys(xover.manifest.sources || {}).filter(manifest_key => manifest_key[0] === '^' && key.match(new RegExp(manifest_key, "i")) || manifest_key === key).pop()
    }
})

Object.defineProperty(xover.sources, 'defaults', {
    value: new Proxy({}, {
        get: function (self, key) {
            if (key in self) {
                return self[key].cloneNode(true);
            }
        }
    }),
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.sources, '#', {
    get: function () {
        let key = xover.manifest.sources['#'] || '#';
        if (!this.has(key)) {
            this.set(key, new xover.Source(key).document);
        }
        return this.get(key);
    }
});

xover.URL = function (url, base, settings = {}) {
    if (url === null) {
        return Promise.reject(`${url} is not a valid value for xover.URL`)
    }
    if (!(this instanceof xover.URL)) return new xover.URL(url, base, settings);

    let method;
    if (!(url instanceof URL)) {
        url = url || '';
        [, method, url] = (url.toString() || '').match(/^(GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH)?(.*)/);
        if (settings["payload"] instanceof Node) {
            settings["body"] = settings["payload"];
            delete settings["payload"];
        }
        method = settings["method"] || method;
        url = new URL(url.trim()/*.replace(/\+/g, '%2B').replace(/\s/g, '%20')*/, base || location.origin + location.pathname.replace(/[^/]+$/, ""));
        if (!method && settings["body"]) {
            method = 'POST'
        }
    }
    let query = new URLSearchParams(settings["query"] || settings["payload"] || {});
    [...query.entries()].forEach(([key, value]) => url.searchParams.append(key, value));
    delete settings["query"];
    delete settings["payload"];

    url.settings = url.settings || {};
    url.settings.method = method || url.settings.method;
    url.settings = Object.assign(url.settings, settings);
    url.settings.headers = new Headers(url.settings.headers || {});

    [...new Headers(settings["headers"] || {}).entries()].forEach(([key, value]) => {
        if (value) {
            url.settings.headers.set(key, value);
        }
    });
    [...url.searchParams.entries()].filter(([key]) => key[0].indexOf("^") == 0).forEach(([key, value]) => {
        if (value) {
            url.settings.headers.set(key, value);
        }
        url.searchParams.delete(key)
    });
    if (!url.hasOwnProperty('method')) {
        Object.defineProperty(url, 'method', {
            get: function () {
                return method;
            }, set: function (input) {
                return method = input;
            }
        })
    }
    Object.setPrototypeOf(url, URL.prototype);
    return url;
}

URL.href = URL.href || Object.getOwnPropertyDescriptor(URL.prototype, 'href');
Object.defineProperty(URL.prototype, 'href', {
    get: function (...args) {
        let href = URL.href.get.apply(this, args);
        return href.replace(new RegExp(`^${location.origin}`), "").replace(new RegExp(`^${location.pathname.replace(/[^/]+$/, "")}`), "")//.replace(/^\/+/, '');
    }
});

Object.defineProperty(URL.prototype, 'tag', {
    get: function () {
        return '#' + xover.URL(this.hash.replace(/^#/, '')).pathname.replace(/^\//, '')
    }
});

Object.defineProperty(URL.prototype, 'fetch', {
    value: async function (...args) {
        let url = this;
        let endIndex = args.length - 1;
        while (endIndex >= 0 && (args[endIndex] === undefined)) {
            endIndex--;
        }
        args.splice(endIndex + 1);
        let payload = [];
        let handlers = [];
        let headers = [];
        for (let i = args.length - 1; i >= 0; --i) {
            if (!args[i]) continue;
            if (typeof (args[i]) == 'function') {
                handlers.push(args[i]);
                args.splice(i, 1)
            } else if (args[i] instanceof Headers) {
                headers.push(args[i]);
                args.splice(i, 1)
            } else if (args[i].constructor && [Document, File, Blob, FormData, URLSearchParams].includes(args[i].constructor)) {
                payload.push(args[i]);
                args.splice(i, 1)
            }
        }

        let settings = args.pop() || {};
        if (!(url instanceof xover.URL)) {
            url = new xover.URL(url, undefined, {});
        }
        settings = xover.json.combine(Object.fromEntries(xover.manifest.getSettings(url) || []), settings);
        for (let header of headers) {
            for (let [key, value] of [...header.entries()]) {
                url.settings.headers.set(key, value);
            }
        }
        url.settings = xover.json.combine(url.settings, settings, this.hasOwnProperty("settings") ? this.settings : {});
        if (url.settings.body) {
            payload = payload.concat(url.settings.body);
        }
        payload = payload.concat(args);
        if (payload.length) {
            if (url.method === 'POST' || payload.some(item => [Document, File, Blob, FormData].includes(item.constructor))) {
                url.method = 'POST';
                url.body = payload;
            }
            for (let item of payload.filter(item => [URLSearchParams].includes(item.constructor))) {
                for (let [key, value] of [...new URLSearchParams(item).entries()]) {
                    url.searchParams.append(key, value);
                }
            }
        }
        payload = url.body;
        if (payload) {
            settings["method"] = 'POST';
            let pending = [];
            for (let item of payload) {
                if (item instanceof XMLDocument) {
                    item.select(".//@*[starts-with(.,'blob:')]").filter(node => node && (!node.namespaceURI || node.namespaceURI.indexOf('http://panax.io/state') == -1)).map(node => { pending.push(xover.server.uploadFile(node)) })
                }
            }
            await Promise.all(pending);
        }

        if (settings.progress instanceof HTMLElement) {
            settings.progress.value = 0;
        }
        //settings.headers = new Headers(Object.fromEntries([...new Headers(this instanceof xover.Source && this.headers || {}), ...new Headers(this instanceof xover.Source && (this.settings || {}).headers || {}), ...new Headers(settings.headers)]));
        let request = new xover.Request(url);

        let original_response;
        let stored_document;
        let expiry = (new URLSearchParams(new Headers(settings.headers || {}).get("cache-control") || {}).get("max-age") || 0) * 1000
        if (expiry) {
            let storehouse = await xover.storehouse.sources;
            stored_document = !xover.session.disableCache && await storehouse.get(request.url.href);
            if (stored_document && (!stored_document.lastModifiedDate || (Date.now() - stored_document.lastModifiedDate) < expiry)) {
                original_response = new Response(stored_document, { headers: { "Cache-Control": "no-store" } })
            }
        }
        const controller = new AbortController();
        if (this instanceof URL) {
            this.controller = controller;
        }
        if (!original_response) {
            stored_document = null;
            const signal = controller.signal;
            try {
                original_response = await fetch(request.clone(), { signal })
            } catch (e) {
                //try {
                //    if (!original_response && request.method == 'POST') {
                //        const body = await request.clone().text();
                //        const { cache, credentials, headers, integrity, mode, redirect, referrer } = request;
                //        const init = { body, cache, credentials, headers, integrity, mode, redirect, referrer };
                //        original_response = await fetch(request.url, init);
                //    }
                //} catch (e) {
                //return Promise.reject([e, request, { bodyType: 'text' }]);
                //}
                return Promise.reject(e)
            }
        }
        if (!original_response && !controller.signal.aborted) return Promise.reject(`No response for ${url}!`);

        let response = new xover.Response(original_response, request);
        let res = original_response.clone();
        const contentLength = res.headers.get('content-length');
        let receivedLength = 0;
        const stream = res.body.getReader();
        const progress = () => {
            stream.read().then(({ done, value }) => {
                let _progress;
                //source.abortFetch = null;
                if (done) {
                    _progress = 100;
                } else {
                    receivedLength += value.byteLength;
                    let percent = (receivedLength / contentLength) * 100
                    _progress = percent;
                    progress();
                }
                window.top.dispatchEvent(new xover.listener.Event('progress', { controller, percent: _progress }, request));
            }).catch(e => {
                if (e.name != 'AbortError') {
                    console.log(e)
                }
            });
        };
        if (controller.signal.aborted) {
            debugger
        } else {
            progress();
        }
        let document = await response.processBody.apply(this);

        if (document instanceof Document) {
            let url = request.url;
            let href = url.href.replace(new RegExp(`^${location.origin}`), "").replace(new RegExp(`^${location.pathname.replace(/[^/]+$/, "")}`), "").replace(/^\/+/, '');
            Object.defineProperty(document, 'url', {
                get: function () {
                    return url;
                }
            });
            Object.defineProperty(document, 'href', {
                get: function () {
                    return href
                }
            });
        }
        let self = this;
        if (this instanceof xover.Source) {
            Object.defineProperty(document, 'source', {
                get: function () {
                    return self;
                }
            });
        }
        response.tag = ((`${url.pathname || url}`).replace(/^\//, ''));
        let manifest_settings = xover.manifest.getSettings(response.tag, "stylesheets");
        document instanceof XMLDocument && manifest_settings.reverse().map(stylesheet => {
            return_value.addStylesheet(stylesheet);
        });
        //window.top.dispatchEvent(new xover.listener.Event(`response`, { request }, response)); 
        if (response.ok) {
            handlers.forEach(handler => handler(return_value, response, request));
            window.top.dispatchEvent(new xover.listener.Event(`success`, { url, request, response, status: response.status, statusText: response.statusText }, response));
        } else {
            window.top.dispatchEvent(new xover.listener.Event(`failure`, { url, request, response, status: response.status, statusText: response.statusText }, response));
        }

        if (!response.ok && (typeof (settings.rejectCodes) == 'number' && response.status >= settings.rejectCodes || settings.rejectCodes instanceof Array && settings.rejectCodes.includes(response.status))) {
            return Promise.reject(response);
        } else if (response.status == 401 && url.host == location.host) {
            xover.session.status = "unauthorized";
        }
        if (response.status == 204) {
            document = xover.xml.createDocument();
        }

        if (response.ok) {
            if (
                (request.headers.get("Accept") || "").indexOf("*/*") != -1 ||
                request.headers.get("Accept").split(/\s*,\s*/g).includes(response.headers.get("content-type")) ||
                xover.mimeTypes[response.bodyType] == request.headers.get("Accept") ||
                (request.headers.get("Accept") || "").replace("text/plain", "text").indexOf(document.type) != -1 ||
                (request.headers.get("Accept") || "").replace("text/plain", "text").indexOf(response.bodyType) != -1) {

                return Promise.resolve(response);
            } else {
                return Promise.reject(response);
            }
        } else {
            return Promise.reject(response);
        }


        //if (response.status == 204) {
        //    return Promise.reject(response);
        //} else if ([409, 449, 503].includes(response.status)) {
        //    return Promise.reject(response);
        //} else if (
        //    (request.headers.get("Accept") || "").indexOf("*/*") != -1 ||
        //    xover.mimeTypes[response.bodyType] == request.headers.get("Accept") ||
        //    (request.headers.get("Accept") || "").replace("text/plain", "text").indexOf(document.type) != -1 ||
        //    (request.headers.get("Accept") || "").replace("text/plain", "text").indexOf(response.bodyType) != -1) {
        //    return Promise.resolve(response);
        //} else if (response.bodyType == 'html' && document instanceof DocumentFragment) {
        //    xover.dom.createDialog(document);
        //}
        //return Promise.reject(response);
    }
});

xover.sources.defaults["#login"] = xover.xml.createDocument(`<?xml-stylesheet type="text/xsl" href="login.xslt" role="login" target="body"?><xo:login xmlns:xo="http://panax.io/xover"/> `);

xover.sources.defaults["#shell"] = xover.xml.createDocument('<?xml-stylesheet type="text/xsl" href="shell.xslt" role="shell" target="body"?><shell:shell xmlns:xo="http://panax.io/xover" xmlns:shell="http://panax.io/shell" xmlns:state="http://panax.io/state" xmlns:source="http://panax.io/source" xo:id="shell" xo:hash=""></shell:shell>');

xover.sources.defaults["#settings"] = xover.xml.createDocument('<?xml-stylesheet type="text/xsl" href="settings.xslt" role="settings" target="@#shell @#settings"?><shell:settings xmlns:shell="http://panax.io/shell"/>');

xover.ProcessingInstruction = function (stylesheet) {
    if (!(this instanceof xover.ProcessingInstruction)) return new xover.ProcessingInstruction(stylesheet);
    let attribs = xover.json.fromAttributes(stylesheet.data);
    attribs["dependencies"] = [];
    if (attribs.target) {
        attribs["target"] = ((attribs["target"] || '').replace(new RegExp("@(#[^\\s\\[]+)", "ig"), `[xo-source="$1"]`) || undefined);
        attribs["dependencies"] = [...attribs["target"].matchAll(new RegExp(`\\[xo-source=('|")([^\\1\\]]+)\\1\\]`, 'g'))].reduce((arr, curr) => { arr.push(curr[2]); return arr }, []);
    } else {
        attribs["target"] = undefined;
    }
    for (let prop in attribs) {
        if (stylesheet.hasOwnProperty(prop)) continue;
        Object.defineProperty(stylesheet, prop, {
            get: function () {
                return attribs[prop];
            },
            set: function (input) {
                attribs[prop] = input
                let current_attributes = xover.json.fromAttributes(stylesheet.data);
                let new_attributes = Object.assign({}, attribs);
                delete new_attributes["target"];
                delete new_attributes["dependencies"];
                stylesheet.data = xover.json.toAttributes(Object.assign(current_attributes, new_attributes));
            }
        });
    }
    if (!stylesheet.hasOwnProperty("document")) {
        Object.defineProperty(stylesheet, 'document', {
            get: function () {
                //this.ownerDocument.store = this.ownerDocument.store || (xover.stores.find(this.ownerDocument).shift() || document.createElement('p')).store //Se pone esta solución pero debería tomar automáticamente el store. Ver si se puede solucionar este problema de raíz.
                try {
                    let store = this.ownerDocument.store;
                    href = this.href;
                    let document = store && store.sources[href] || xover.sources[href];
                    document.store = store;
                    document.href = href;
                    return document
                } catch (e) {
                    console.log(`Couldn't retrieve document for stylesheet ${this.href}: ${e.message}`)
                }
            }
        });
    }
    //if (!stylesheet.href) {
    //    console.warn('Href attribute is missing from stylesheet!');
    //}
    Object.setPrototypeOf(stylesheet, xover.ProcessingInstruction.prototype)
    return stylesheet;
}

xover.ProcessingInstruction.prototype = Object.create(ProcessingInstruction.prototype);

xover.storage = {};
xover.spaces = {};
xover.xml.namespaces = xover.spaces;

xover.spaces["context"] = "http://panax.io/context"
xover.spaces["debug"] = "http://panax.io/debug"
xover.spaces["height"] = "http://panax.io/state/height"
xover.spaces["html"] = "http://www.w3.org/1999/xhtml"
xover.spaces["js"] = "http://panax.io/xover/javascript"
xover.spaces["meta"] = "http://panax.io/metadata"
xover.spaces["metadata"] = "http://panax.io/metadata"
xover.spaces["mml"] = "http://www.w3.org/1998/Math/MathML"
xover.spaces["session"] = "http://panax.io/session"
xover.spaces["shell"] = "http://panax.io/shell"
xover.spaces["searchParams"] = "http://panax.io/site/searchParams"
xover.spaces["site"] = "http://panax.io/site"
xover.spaces["state"] = "http://panax.io/state"
xover.spaces["svg"] = "http://www.w3.org/2000/svg"
xover.spaces["temp"] = "http://panax.io/temp"
xover.spaces["transformiix"] = "http://www.mozilla.org/TransforMiix"
xover.spaces["width"] = "http://panax.io/state/width"
xover.spaces["xhtml"] = "http://www.w3.org/1999/xhtml"
xover.spaces["xlink"] = "http://www.w3.org/1999/xlink"
xover.spaces["xmlns"] = "http://www.w3.org/2000/xmlns/"
xover.spaces["x"] = "http://panax.io/xover"
xover.spaces["xo"] = "http://panax.io/xover"
xover.spaces["xml"] = "http://www.w3.org/XML/1998/namespace"
xover.spaces["xsi"] = "http://www.w3.org/2001/XMLSchema-instance"
xover.spaces["xson"] = "http://panax.io/xson"
xover.spaces["xsl"] = "http://www.w3.org/1999/XSL/Transform"

/* Binding */
xover.spaces["request"] = "http://panax.io/fetch/request"
xover.spaces["source"] = "http://panax.io/source"
xover.spaces["binding"] = "http://panax.io/xover/binding"
xover.spaces["changed"] = "http://panax.io/xover/binding/changed"
xover.spaces["source_text"] = "http://panax.io/source/request/text"
xover.spaces["source_prefix"] = "http://panax.io/source/request/prefix"
xover.spaces["source_value"] = "http://panax.io/source/request/value"
xover.spaces["source_filters"] = "http://panax.io/source/request/filters"
xover.spaces["source_fields"] = "http://panax.io/source/request/fields"
/* Values */
xover.spaces["exception"] = "http://panax.io/state/exception"
xover.spaces["confirmation"] = "http://panax.io/state/confirmation"
xover.spaces["readonly"] = "http://panax.io/state/readonly"
xover.spaces["suggested"] = "http://panax.io/state/suggested"
xover.spaces["initial"] = "http://panax.io/state/initial"
xover.spaces["search"] = "http://panax.io/state/search"
xover.spaces["filter"] = "http://panax.io/state/filter"
xover.spaces["prev"] = "http://panax.io/state/previous"
xover.spaces["fixed"] = "http://panax.io/state/fixed"
xover.spaces["draft"] = "http://panax.io/state/draft"
xover.spaces["text"] = "http://panax.io/state/text"
xover.spaces["env"] = "http://panax.io/state/environment"

xover.timeouts = new Map();

xover.alertManager = new Map();
xover.dom.alert = async function (message) {
    xover.alertManager[message] = xover.alertManager[message] || xover.delay(1).then(async () => {
        let xMessage = xover.data.createMessage(message)
        await xMessage.addStylesheet({ href: "message.xslt", role: "modal" });
        try {
            dom = await xMessage.transform();
            document.body && document.body.appendChild(dom.documentElement)
            return dom.documentElement;
        } catch (e) {
            console.error(e)
            return xover.dom.createDialog(typeof (message.cloneNode) != 'undefined' && message.cloneNode(true) || message)
        }
    }).finally(() => {
        delete xover.alertManager[message];
    })
    return xover.alertManager[message];
}

xover.dom.createDialog = function (message) {
    if (!message) { return null }
    window.top.dispatchEvent(new xover.listener.Event('beforeDialog', { message }, message));
    let original_message = message;
    if (xover.messages.get(original_message)) return;
    let dialog_id = `dialog_${xover.cryptography.generateUUID()}`
    let dialog = document.querySelector(`#${dialog_id}`);
    if (!dialog) {
        let frag = window.document.createDocumentFragment();
        let p = window.document.createElement('p');
        p.innerHTML = `<dialog id="${dialog_id}" class="xover-component"><form method="dialog" onsubmit="closest('dialog').remove()" style="width:100%; height:100%"><section></section><menu><button type="submit">Close</button></menu></form></dialog>`;
        frag.append(...p.childNodes);
        window.document.body.appendChild(frag);
        dialog = document.querySelector(`#${dialog_id}`);
    }
    dialog.querySelector("section").innerHTML = '';
    if (message.documentElement instanceof HTMLHtmlElement) {
        const blob = new Blob([message], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.src = blobUrl;
        iframe.onload = function () {
            iframe.style.height = (iframe.contentDocument.firstElementChild.scrollHeight + 0) + 'px';
            iframe.style.width = (iframe.contentDocument.firstElementChild.scrollWidth + 100) + 'px';
            dialog.focus();
            window.top.dispatchEvent(new xover.listener.Event('dialog', { message }, iframe));
        }
        message = iframe;
    } else if (message.documentElement instanceof HTMLElement) {
        let frag = window.document.createDocumentFragment();
        let p = window.document.createElement('p');
        p.innerHTML = message.documentElement.outerHTML;
        frag.append(...p.childNodes);
        message = frag;
    } else if ({}.constructor == message.constructor) {
        message = JSON.stringify(message);
    } else if (message instanceof Response) {
        message = message.statusText;
    }

    dialog.querySelector("section").append(message);
    document.querySelector(`#${dialog_id}`);
    dialog.showModal();
    xover.messages.set(original_message, dialog);
    return dialog;
}

Object.defineProperty(xover.session, 'updateSession', {
    value: async function (attribute, sync) {
        let session_variables;
        if (!attribute) {
            return;
        } else if (attribute.constructor == {}.constructor) {
            session_variables = new URLSearchParams(attribute);
        } /*else {
            session_variables = new URLSearchParams(`${attribute}=${value}`);
        }*/
        for (let pair of session_variables.entries()) {
            xover.session[pair[0]] = pair[1];
        }
        /*Se deshabilita la actualización por default*/
        if (sync && navigator.onLine && (xover.manifest.server || {})["session"] && await xover.session.status == 'authorized') {
            xover.post.to((xover.manifest.server || {})["session"], session_variables).catch(() => {
                console.log("Error al enviar sesión")
            })
        }
        return Promise.all([...session_variables.keys()].map((key) => xover.session[key]));
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.session, 'user_login', {
    get: function () {
        return xover.session.getKey("user_login")
    }
    , set: function (input) {
        if (xover.session.getKey("user_login") != input) {
            xover.session.id_token = undefined;
        }
    }
});

Object.defineProperty(xover.session, 'connection_id', {
    get: function () {
        return xover.session.getKey("store_id")
    }
    , set: function (input) {
        xover.session.store_id = input;
    }
});

//var __store_id_getter = function () { return xover.session.getKey("store_id") }  /*muestra de getter dinámico*/
Object.defineProperty(xover.session, 'store_id', {
    get: function () {
        return (xover.manifest.server && isFunction(xover.manifest.server.store_id) && xover.manifest.server.store_id() || xover.session.getKey("store_id") || xover.manifest.server.store_id)
    }
    , set: async function (input) {
        xover.dom.updateTitle();
    }
});

Object.defineProperty(xover.session, 'cache_name', {
    get: function () {
        return xover.session.getKey("cache_name") || "";
    }
    , set() { }
});

xover.browser.isIE = function () {
    let ua = window.navigator.userAgent;
    return /MSIE|Trident/.test(ua) && !xover.browser.isEdge();
}

xover.browser.isEdge = function () {
    let ua = window.navigator.userAgent;
    return /Edge/.test(ua);
}

xover.browser.isSafari = function () {
    let ua = window.navigator.userAgent;
    return /Safari/.test(ua);
}

xover.browser.isIphone = function () {
    return navigator.userAgent.match(/iPhone/i);
}

xover.browser.isIPad = function () {
    return navigator.userAgent.match(/iPad/i);
}

xover.browser.isIOS = function () {
    return xover.browser.isIphone() || xover.browser.isIPad() || navigator.userAgent.match(/Macintosh/i);
}

Object.defineProperty(xover.debug, 'enabled', {
    get: function (ref) {
        return xover.session.debug;
    }
    , set: function (input) {
        xover.session.debug = !!input;
    }
});

var relative_path = (relative_path || "");

function getdate() { return autoCompleteDate("") }

function autoCompleteDate(sDate) {
    let pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4}))?)?/
    let currentDate = new Date();
    let parts = (sDate.match(pattern) || []);
    let day = (parts[1] || currentDate.getDate())
    let month = (parts[3] || currentDate.getMonth() + 1)
    let year = (parts[4] || currentDate.getFullYear())
    let new_date = new Date(month + "/" + day + "/" + year)
    let new_string_date = new_date.toLocaleDateString("en-GB");
    let full_pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4})))/
    if (new_string_date.match(full_pattern)) {
        sDate = new_string_date
    } else {
        new_string_date = day + "/" + month + "/" + year;
        if (new_string_date.match(full_pattern)) {
            sDate = new_string_date
        } else {
            sDate = '';
        }
    }
    return sDate;
}

function setDefaultDate(control) {
    if (!control) return;
    new_string_date = autoCompleteDate(control.value);
    let full_pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4})))/
    if (new_string_date.match(full_pattern)) {
        control.value = new_string_date
    } else {
        control.value = '';
    }
    xover.data.update({
        target: control.id
        , attributes: [{ '@value': new_string_date }, { '@text': new_string_date }]
    });
    return new_string_date;
}

function isValidDate(date_string) {
    //let full_pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4})))/
    //return (sDate.match(full_pattern) && Date.parse(sDate) != 'NaN');
    let date = new Date(date_string);
    return !isNaN(date.getTime());
}

function isValidISODate(sDate) {
    let full_pattern = /\b(\d{4})(?:(-)(\d{1,2})(?:\2(\d{1,2})))/
    return (sDate.match(full_pattern) && Date.parse(sDate) != 'NaN' && (new Date().getFullYear()) - (new Date(Date.parse(sDate)).getFullYear()) < 1000);
}

xover.dom.getGeneratedPageURL = function (config) {
    let html = config["html"];
    let css = config["css"];
    let js = config["js"];
    const getBlobURL = (code, type) => {
        const blob = new Blob([code], { type })
        return URL.createObjectURL(blob)
    }

    const cssURL = getBlobURL(css, 'text/css')
    const jsURL = getBlobURL(js, 'text/javascript')

    const source = `
    <html>
      <head>
        ${(css || "") && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
        ${(js || "") && `<script defer="defer" src="${jsURL}"></script>`}
      </head>
      <body>
        ${html || ''}
      </body>
    </html>
  `
    return getBlobURL(source, 'text/html')
}

Object.defineProperty(xover.server, 'uploadFile', {
    value: async function (source, saveAs) {
        if (!(xover.manifest.server["uploadFile"])) {
            throw (new Error("Endpoint for uploadFile is not defined in the manifest"));
        }
        function uploadFile(file, source) {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.onload = function (e) {
                    let formData = new FormData();
                    formData.append(file.name, file);

                    let request = new xover.Request(xover.manifest.server["uploadFile"] + `?UploadID=${file.id}&saveAs=${file.saveAs}&parentFolder=${(file.parentFolder || '').replace(/\//g, '\\')}`, { method: 'POST', body: formData });
                    fetch(request).then(async response => {
                        let file_name = response.headers.get("File-Name") + `?name=${file.name.normalize()}`;
                        if (!file_name) throw (new Error("Cound't get file name"));
                        if (source && source instanceof Node) {
                            let temp_value = source.value;
                            //if (temp_value.match(/^blob:http:/)) {
                            if (source instanceof HTMLElement) {
                                if (!source.getAttribute("xo-slot")) {
                                    source.setAttribute("xo-slot", "x:value");
                                }
                                source = source.scope;
                                source.set(file_name)
                            } else if (source instanceof Attr || source instanceof Text) {
                                source.set(file_name)
                            }
                            //}
                            //[source, ...xover.stores.find(`//@*[starts-with(.,'blob:') and .='${temp_value}']`)].map(node => node instanceof Attr ? node.set(file_name) : node.setAttribute("value", file_name));
                        }
                        let progress_bar = document.getElementById('_progress_bar_' + file.id);
                        if (progress_bar) {
                            progress_bar.style.width = '100%';
                            progress_bar.className = progress_bar.className.replace(/\bbg-\w+/ig, 'bg-success');
                            progress_bar.className = progress_bar.className.replace(/\progress-bar-\w+/ig, '');
                        }
                        resolve(file_name);
                        //let res = new xover.Response(response, request);;
                        //let document = await res.processBody();
                    })
                }
                reader.readAsDataURL(file);
            })
        }
        let files;
        let uploading = [];
        if (source instanceof HTMLElement && source.type === 'file') {
            file = source.files && source.files[0]
            if (!file) return;
            file.id = source.id;
            file.saveAs = saveAs || source.saveAs || file.id;
            uploading.push(uploadFile(file, source));
        } else if (source instanceof File) {
            file = source;
            file.id = file.id || source.id;
            file.saveAs = saveAs || file.saveAs || file.name;
            uploading.push(uploadFile(file, source));
        } else if (source instanceof Attr) {
            let files = source.value.split(/;/);
            for (let [ix, file_ref] of [...files.entries()]) {
                if (file_ref.indexOf("blob:") == -1) continue;
                let [file_name, searchParams] = file_ref.split("?");
                let record = await (await xover.storehouse.files).get(file_name);
                if (!(record && record.file)) {
                    return Promise.reject('Invalid file, upload again');
                }
                file = record.file;
                file.id = record.id;
                file.saveAs = saveAs || record.saveAs || file.id;
                /*let searchParameters = new URLSearchParams(Object.fromEntries(Object.entries({ file: record.file, id: record.id }), [...new URLSearchParams(searchParams.join("&")).entries()]));*/
                uploading.push(uploadFile(file, source).then(file_name => files[ix] = file_name).then(() => source.set(files.join(";"))));
            }
        }
        try {
            return Promise.all(uploading);
        } catch (e) {
            return Promise.reject("Couln't finish uploading files, please try again");
        }
    },
    writable: true, enumerable: false, configurable: false
})

function paddingDiff(col) {
    if (getStyleVal(col, 'box-sizing') == 'border-box') {
        return 0;
    }

    let padLeft = getStyleVal(col, 'padding-left');
    let padRight = getStyleVal(col, 'padding-right');
    return (parseInt(padLeft) + parseInt(padRight));
}

function getStyleVal(elm, css) {
    return (window.getComputedStyle(elm, null).getPropertyValue(css))
}

//xover.data.updateScrollPosition = function (document, coordinates) {
//    let target = coordinates.target;
//    if (target) {
//        Object.entries(coordinates).forEach(([key, value]) => {
//            if (key != 'target' && target.source) {
//                target.source.setAttributeNS(null, `state:${key}-position`, value);
//                //let attributeRef = target.selectSingleNode(`//@state:${key}-position`);
//                //if (attributeRef) {
//                //    attributeRef.ownerElement.setAttributeNS(xover.spaces["state"], `state:${key}-position`, value, false);
//                //}
//            }
//        })
//    }
//}

//xover.dom.onscroll = function () {
//    let element = this;
//    xover.delay(500).then(async () => {
//        let selector = this.selector;
//        xover.site.get("scrollableElements", {})[selector] = xover.dom.getScrollPosition(element);
//        history.replaceState(Object.assign({}, history.state), {}, location.pathname + location.search + (location.hash || ''));
//    })
//}

document.addEventListener("DOMContentLoaded", function (event) {
    //class XO_Param extends HTMLElement {
    //    constructor() {
    //        super();
    //        this.style.display = 'none';
    //        //        const shadow = this.attachShadow({ mode: "open" });
    //        //        let style = document.createElement("style");
    //        //        console.log(eval(this.textContent))
    //        //        //this.textContent = ''
    //        //        let self = this;
    //        //        let name = (this.attributes.name || {}).value;
    //        //        if (!name) return;
    //        //        let context = this.section || this.closest('body');
    //        //        let params = [this.attributes.name];
    //        //        self.subscribers = self.subscribers || new Map();

    //        //        let parameters = Object.fromEntries(params.map(el => [`$${el.value}`, (function () { return eval.apply(this, arguments) }(el.parentNode.textContent || el.parentNode.getParameter("value")))]));
    //        //        context.select(`.//xo-value/@select`).forEach(el => el.parentNode.textContent = parameters[el.value]);
    //        //        context.select(`.//@*[contains(.,'{$')]`).forEach(attr => self.subscribers.set(attr, attr.value))
    //        //        for (let [attr, formula] of self.subscribers.entries()) {
    //        //            //if (!self.contains(attr.ownerElement)) continue;
    //        //            let new_value = formula.replace(/\{\$[^\}]*\}/g, (match) => match.substr(1, match.length - 2) in parameters ? parameters[match.substr(1, match.length - 2)] : match);
    //        //            if (attr.name == 'style') {
    //        //                if (attr.ownerElement) attr.ownerElement.style.cssText = new_value;
    //        //            } else {
    //        //                attr.set(new_value);
    //        //            }
    //        //        }
    //    }
    //}
    //class xo_value extends HTMLElement {
    //    constructor() {
    //        super();
    //        //xover.sources["#site"].ready.then(()=> this.textContent = xover.sources["#site"].get("subtitulo"));
    //        //        const shadow = this.attachShadow({ mode: "open" });
    //        //        let style = document.createElement("style");
    //        //        console.log(eval(this.textContent))
    //        //        //this.textContent = ''
    //        //        let self = this;
    //        //        let name = (this.attributes.name || {}).value;
    //        //        if (!name) return;
    //        //        let context = this.section || this.closest('body');
    //        //        let params = [this.attributes.name];
    //        //        self.subscribers = self.subscribers || new Map();

    //        //        let parameters = Object.fromEntries(params.map(el => [`$${el.value}`, (function () { return eval.apply(this, arguments) }(el.parentNode.textContent || el.parentNode.getParameter("value")))]));
    //        //        context.select(`.//xo-value/@select`).forEach(el => el.parentNode.textContent = parameters[el.value]);
    //        //        context.select(`.//@*[contains(.,'{$')]`).forEach(attr => self.subscribers.set(attr, attr.value))
    //        //        for (let [attr, formula] of self.subscribers.entries()) {
    //        //            //if (!self.contains(attr.ownerElement)) continue;
    //        //            let new_value = formula.replace(/\{\$[^\}]*\}/g, (match) => match.substr(1, match.length - 2) in parameters ? parameters[match.substr(1, match.length - 2)] : match);
    //        //            if (attr.name == 'style') {
    //        //                if (attr.ownerElement) attr.ownerElement.style.cssText = new_value;
    //        //            } else {
    //        //                attr.set(new_value);
    //        //            }
    //        //        }
    //    }
    //}
    //customElements.define("xo-value", xo_value);
    xover.initializeDOM()
});

var content_type = {}
content_type["json"] = "application/json";
content_type["xml"] = "text/xml";


//Object.defineProperty(xover.sources, 'reload', {
//    value: function (file_name_or_array, on_complete) {
//        Object.values(xover.stores).map(store => {
//            //(store.documentElement || document.createElement("p")).setAttributeNS(null, "state:refresh", true);
//            if (store.sources) {
//                store.sources = undefined;
//            }
//        });
//        let current_keys = xover.sources.cloneObject();

//        file_name_or_array = (file_name_or_array || Object.keys(current_keys));
//        if (typeof (file_name_or_array) == 'string') {
//            file_name_or_array = [file_name_or_array];
//        }
//        for (let document_index = 0; document_index < file_name_or_array.length; document_index++) {
//            let file_name = file_name_or_array[document_index];
//            if (file_name in xover.sources) {
//                xover.sources[file_name] = undefined;
//            }
//        }
//        //let storage_enabled = xover.storage.enabled;
//        //if (storage_enabled) {
//        //    xover.storage.disable(file_name_or_array);
//        //}
//        xover.sources.load(file_name_or_array).then(response => {
//            if ((xover.manifest.server || {}).session) {
//                xover.session.checkStatus().then(() => xover.dom.refresh());
//            }
//        });
//        //xover.sources.load(file_name_or_array, (on_complete || function () {
//        //    xover.session.checkStatus().then(() => xover.dom.refresh());
//        //}));
//        //if (storage_enabled) {
//        //    xover.storage.enable();
//        //}
//    },
//    writable: true, enumerable: false
//});

Object.defineProperty(xover.sources, 'xover/normalize_namespaces.xslt', {
    get: function () {
        return xover.xml.createDocument(`
        <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
          <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
          <xsl:template match="@* | * | text() | processing-instruction() | comment()" priority="-1">
            <xsl:copy>
              <xsl:copy-of select="//namespace::*"/>
              <xsl:copy-of select="@*|*|text()"/>
            </xsl:copy>
          </xsl:template>
        </xsl:stylesheet>
        `)
    }
})

Object.defineProperty(xover.sources, 'xover/databind.xslt', {
    get: function () {
        return xover.xml.createDocument(`
<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xo="http://panax.io/xover"
  xmlns:source="http://panax.io/source"
  xmlns:prev="http://panax.io/state/previous"
  xmlns:changed="http://panax.io/xover/binding/changed"
  xmlns:fetch="http://panax.io/fetch"
  xmlns:data="http://panax.io/fetch"
  xmlns:request="http://panax.io/fetch/request"
  xmlns:debug="http://panax.io/debug"
  xmlns:state="http://panax.io/state" version="1.0">
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:key name="datasource" match="source:*" use="concat(generate-id(..),'::',local-name(),'::')"/>
  <xsl:key name="sourcedefinition" match="@source:*" use="concat(generate-id(..),'::',local-name(),'::')"/>

  <xsl:template match="@* | text() | processing-instruction() | comment()" priority="-1">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="node()" priority="-1">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="@source:*" mode="sources">
        <xsl:with-param name="mode">attributes</xsl:with-param>
      </xsl:apply-templates>
      <xsl:apply-templates select="@source:*" mode="sources">
        <xsl:with-param name="mode">nodes</xsl:with-param>
      </xsl:apply-templates>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="source:*/*/@xo:id" priority="-1"/>

  <xsl:template match="source:*[key('sourcedefinition',concat(generate-id(..),'::',local-name(),'::'))]"/>

  <xsl:template match="@source:*" mode="sources">
    <xsl:param name="ref" select=".."/>
    <xsl:param name="mode">nodes</xsl:param>
    <xsl:variable name="attribute_name" select="local-name()"/>
    <xsl:variable name="curr_value" select="../@xo:*[local-name()=$attribute_name and .!='' and .!='NULL']"/>
    <xsl:variable name="prev_value" select="../@prev:*[local-name()=$attribute_name]"/>
    <xsl:variable name="curr_source" select="../@source:*[local-name()=$attribute_name]"/>
    <xsl:variable name="prev_source" select="../@changed:*[local-name()=$attribute_name]"/>
    <xsl:variable name="current_datasource" select="key('datasource',concat(generate-id($ref),'::',local-name(),'::'))"/>
    <xsl:variable name="current_source_value">
      <xsl:choose>
        <xsl:when test="not(self::*)">
          <xsl:value-of select="."/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="../@*[local-name()=$attribute_name]"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="selected_record" select="$current_datasource/xo:r[@xo:*[local-name()=$attribute_name]=$curr_value]"/>
    <xsl:choose>
      <xsl:when test="$mode='attributes'">
        <!-- Sólo pueden ir atributos en esta sección -->
        <xsl:if test="$curr_value and not($current_datasource)">
          <xsl:attribute name="prev:{local-name()}">
            <xsl:value-of select="$curr_value"/>
          </xsl:attribute>
        </xsl:if>
        <!--<xsl:attribute name="debug:selected_record">
          <xsl:value-of select="$selected_record/@xo:id"/>
        </xsl:attribute>-->
        <xsl:copy-of select="$selected_record/@*[not(namespace-uri()='http://panax.io/xover' and local-name()='id')]"/>
        <xsl:choose>
          <xsl:when test="$current_datasource and not($current_datasource[@command=$curr_source]) or contains($curr_source,'{{') and $curr_value">
            <xsl:if test="$curr_value">
              <xsl:attribute name="xo:{local-name()}"></xsl:attribute>
              <xsl:attribute name="prev:{local-name()}">
                <xsl:value-of select="$curr_value"/>
              </xsl:attribute>
            </xsl:if>
            <xsl:attribute name="changed:{local-name()}">
              <xsl:value-of select="$curr_source"/>
            </xsl:attribute>
            <xsl:attribute name="state:refresh">true</xsl:attribute>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$mode='nodes'">
        <!-- Sólo pueden ir nodos en esta sección -->
        <xsl:choose>
          <xsl:when test="contains($curr_source,'{{')"></xsl:when>
          <xsl:when test="$current_datasource[@command=$curr_source]">
            <xsl:copy-of select="($current_datasource[@command=$curr_source])[1]"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:element name="{name()}" namespace="{namespace-uri()}">
              <xsl:attribute name="xo:id">
                <xsl:value-of select="concat('__request_',generate-id())"/>
              </xsl:attribute>
              <xsl:attribute name="changed:{local-name()}"></xsl:attribute>
              <xsl:attribute name="command">
                <xsl:value-of select="$curr_source"/>
              </xsl:attribute>
              <!--<xsl:if test="$curr_value">
                <xsl:element name="xo:r">
                  <xsl:attribute name="xo:{local-name()}">
                    <xsl:value-of select="$curr_value"/>
                  </xsl:attribute>
                </xsl:element>
              </xsl:if>-->
            </xsl:element>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@source:init[.='true']">
  </xsl:template>

  <xsl:template match="@source:init[.='true']" mode="sources">
  </xsl:template>

  <xsl:template match="@changed:*">
  </xsl:template>
</xsl:stylesheet>`);
    }
})

Object.defineProperty(xover.stores, '#', {
    get: function () {
        return xover.manifest.sources["#"] && (this[xover.manifest.sources["#"]] || new xover.Store(xover.sources["#"], { tag: xover.manifest.sources["#"] })) || xover.sources["#"].source;
    }
});

Object.defineProperty(xover.stores, 'active', {
    get: function () {
        let store = xover.stores[xover.site.active] || xover.stores["#"];// || xover.Store(`<?xml-stylesheet type="text/xsl" href="message.xslt" role="modal" target="body" action="append"?><xo:message xmlns:xo="http://panax.io/xover" xo:id="xhr_message_${Math.random()}"/>`);
        //store = store || new xover.Store(xover.xml.createDocument());
        return store;
    }
    , set: async function (input) {
        if (input && typeof input.then == 'function') {
            input = await input;
        }
        if (!(input instanceof xover.Store)) {
            input = new xover.Store(input);
        }

        if (input) {
            let hashtag = input.tag;// || xover.data.hashTagName(input);
            //if (hashtag === xover.stores.active.tag) {
            //    let current_position = xover.data.getScrollPosition();
            //    xover.data.updateScrollPosition(input, current_position);
            //}

            xover.stores[hashtag] = input;
            //if (hashtag != (history.state.seed || (window.top || window).location.hash || xover.stores["#"].tag)) {//(history.state.hash || (window.top || window).location.hash)
            if (!xover.stores[hashtag].isActive) {
                //xover.dom.history.push((window.top || window).location.hash);
                xover.site.active = hashtag;
            }
            /*await */xover.stores[hashtag].render();
        }
    }
});

Object.defineProperty(xover.stores, 'find', {
    value: function (ref) {
        let return_array = [];

        let target = xover.stores.active.find(ref);
        if (target) {
            //return_array.push([target, xover.stores.active]);
            return_array.push(target);
        }
        //xover.stores.filter((nombre, document) => document.selectSingleNode(`//*[@xo:id="${typeof (ref) == 'string' ? ref : ref.getAttributeNS("http://panax.io/xover", "id")}"]`))
        for (let xDocument in xover.stores) {
            target = xover.stores[xDocument].find(ref);
            if (target) {
                //return_array.push([target, xover.stores[xDocument]]);
                return_array.push(target);
            }
        }
        //Object.entries(sessionStorage).filter(([key]) => key.match(/^#/) && !xover.stores.hasOwnProperty(key)).map(([hashtag, value]) => {
        //    let restored_document = xover.session.getKey(hashtag)
        //    if (restored_document) {
        //        restored_document = new xover.Store(new xover.Source(restored_document.source).document, { tag: hashtag });
        //        if (restored_document.find(ref)) {
        //            return_array.push(xover.stores[hashtag].find(ref));
        //        }
        //    }
        //})
        return_array = [...new Set(return_array)];
        return new NodeSet(return_array);
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.stores, 'getActive', {
    value: function (attribute, value) {
        let active = Object.entries(xover.stores).reduce((json, [tag, store]) => {
            if (store && store.isActive) {
                json[tag] = store;
            };
            return json;
        }, {});

        Object.defineProperty(active, 'getInitiators', {
            value: function () {
                return Object.values(active).reduce((arr, item) => {
                    if (item.initiator) {
                        arr.push(item.initiator);
                    };
                    return arr;
                }, []);
            },
            writable: false, enumerable: false, configurable: false
        });
        return active;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.stores, 'getInactive', {
    value: function (attribute, value) {
        return Object.entries(xover.stores).reduce((json, item) => { if (!(item[1].isActive)) { json[item[0]] = item[1]; }; return json }, {});
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.stores, 'clear', {
    value: function (attribute, value) {
        Object.keys(this).map(key => delete this[key]);
        sessionStorage.clear();
        return this;
    },
    writable: false, enumerable: false, configurable: false
});

xover.modernize = async function (targetWindow) {

    this.modernizing = this.modernizing || xover.delay(0).then(async () => {
        targetWindow = (targetWindow || window);
        if (targetWindow.modernized) return;
        targetWindow.modernized = 'modernizing'
        with (targetWindow) {

            Attr.value = Attr.value || Object.getOwnPropertyDescriptor(Attr.prototype, 'value');

            Node.namespaceURI = Node.namespaceURI || Object.getOwnPropertyDescriptor(Node.prototype, 'namespaceURI');

            Element.setAttribute = Element.setAttribute || Element.prototype.setAttribute;
            Element.setAttributeNS = Element.setAttributeNS || Element.prototype.setAttributeNS;
            Element.setAttributeNode = Element.setAttributeNode || Element.prototype.setAttributeNode;
            Element.setAttributeNodeNS = Element.setAttributeNodeNS || Element.prototype.setAttributeNodeNS;

            Element.replaceChild = Element.replaceChild || Element.prototype.replaceChild;

            Element.remove = Element.remove || Element.prototype.remove;
            Element.removeChild = Element.removeChild || Node.prototype.removeChild;
            Element.removeAttribute = Element.removeAttribute || Element.prototype.removeAttribute;
            Element.removeAttributeNS = Element.removeAttributeNS || Element.prototype.removeAttributeNS;

            if (typeof (HasContent) == 'undefined') HasContent = async (element) => (element.ownerElement || element).hasChildNodes();

            if (typeof (Await) == 'undefined') Await = async (script) => xover.waitFor(script);

            if (typeof (Click) == 'undefined') Click = function (...args) { return this instanceof HTMLElement && this.contains(xover.listener.click.target) && (args.length ? args : true) || null }

            if (typeof (Delay) == 'undefined') Delay = async function (time = 1000, then_clause) { return xover.delay(time).then(result => then_clause ? xover.eval.call(this, then_clause) : result) }

            if (typeof (CurrentYear) == 'undefined') CurrentYear = () => new Date().getFullYear();

            if (typeof (Entries) == 'undefined') Entries = (node) => [node.name, +node.value];

            if (typeof (Parent) == 'undefined') Parent = function (node) { return node.parentNode }

            if (typeof (NodeName) == 'undefined') NodeName = function (node) { return node.name }

            if (typeof (Name) == 'undefined') Name = function (node = this) { return node instanceof Element ? (node.getAttributeNode("Name") || node.getAttributeNode("name")) : node.nodeName }

            if (typeof (Sum) == 'undefined') Sum = function (x, y) { return +x + +y }

            if (typeof (Find) == 'undefined') Find = function (selector, target = document) { return selector ? target.querySelector(selector) : target.contains(this) && this }

            if (typeof (Intersection) == 'undefined') Intersection = function () { return this.isIntersecting || null };

            if (typeof (Avg) == 'undefined') Avg = function (x) { return ((this.Count * this.Value) + x) / ((this.Count || 0) + 1) }

            if (typeof (Money) == 'undefined') Money = function (x, format = xover.site.locale) {
                let money = new Intl.NumberFormat(format, {
                    style: 'currency',
                    currency: 'USD',
                });
                return money.format(x)
            }

            if (typeof (Group) == 'undefined') Group = (result, arg) => {
                result = result instanceof Node && {} || result;
                for (let [key, value] of [(arg instanceof Attr && Entries(arg) || arg instanceof Element && [...arg.attributes].map(attr => [attr.name, attr.value]) || [])]) {
                    Object.defineProperty(result, "Count", { value: !result.hasOwnProperty("Count") ? 0 : result.Count, writable: true, enumerable: false, configurable: true });
                    result.Count += 1;

                    Object.defineProperty(result, "Operator", { value: result.Operator || (x => x), writable: true, enumerable: false, configurable: true });

                    if (!result[key]) result[key] = 0;
                    result.Value = result[key];
                    result[key] = result.Operator.apply(result, [value, result[key]]);
                    delete result["Value"]
                }
                return result
            }

            xover.eval = function (condition, params = []) {
                let self = this;
                params = params instanceof Array ? params : [params];
                try {
                    if (condition == undefined) {
                        return condition
                    } else if (typeof (condition) == 'boolean') {
                        return condition;
                    } else if (typeof (condition) == 'function') {
                        return condition.apply(self, params);
                    } else if (existsFunction(condition)) {
                        let fn = eval(condition);
                        try {
                            return fn.apply(self, params)
                        } catch (e) {
                            if (e.message.indexOf('Illegal invocation') != -1) {
                                return fn.apply(Window.document, params)
                            }
                        }
                    } else {
                        let promises = [];
                        let json = "[]"
                        if (condition.constructor === {}.constructor) {
                            json = JSON.stringify(condition)
                        } else if (condition[0] != "{") {
                            json = `{${condition.replace(/`/g, '"')}}`
                        }
                        for (let [fn, params] of [...eval(`new Map(Object.entries(${json}))`)]) {
                            let result = xover.eval.call(self, fn, params);
                            if (!(result == undefined || result instanceof Promise)) {
                                if (!([true, false].includes(result) || result instanceof Node)) {
                                    result = xover.eval.apply(self, result instanceof Array ? result : [result]);
                                }
                            }
                            promises.push(result)
                        }
                        return Promise.all(promises).then(results => results.every(result => ([true, false].includes(result) || result instanceof Node)) ? !results.some(result => result === false) : null);
                    }
                } catch (e) {
                    if (e instanceof SyntaxError || e.message.indexOf('not a valid selector') != -1) {
                        xover.context = self;
                        let result;
                        try {
                            result = eval(`(${condition.replace(/^#/, '')})`);
                            if (result instanceof Promise && params.length) {
                                result = new Promise((resolve, reject) => {
                                    return resolve(result.then(async result => result == true ? await xover.waitFor.apply(self, params) : result))
                                })
                            }
                        } catch (e) {
                            if (e instanceof ReferenceError) {
                                try {
                                    return window.document.querySelector(condition) || condition;
                                } catch (e) { }
                            }
                        }
                        return result;
                    } else if (e instanceof ReferenceError) {
                        try {
                            return window.document.querySelector(condition) || condition;
                        } catch (e) { }
                    }
                }
            }

            xover.waitFor = async function (condition, timeout) {
                let self = this;
                return new Promise((resolve, reject) => {
                    const startTime = Date.now();

                    async function check() {
                        let result;
                        if (!condition) {
                            return resolve(condition);
                        } else if (condition instanceof Node) {
                            result = condition
                        } else if (condition instanceof Promise) {
                            return resolve(await condition);
                        } else {
                            result = await xover.eval.call(self, condition)
                        }
                        if ([true, false].includes(result) || result instanceof Node) {
                            return resolve(result)
                        }

                        if (timeout && Date.now() - startTime >= timeout) {
                            return reject(new TimeoutError(''));
                        }
                        setTimeout(check, 100);
                    }

                    check();
                });
            }

            if (typeof (WaitFor) == 'undefined') WaitFor = xover.waitFor;

            function extend(sup, base) {
                let descriptor = Object.getOwnPropertyDescriptor(
                    base.prototype, "constructor"
                );
                base.prototype = Object.create(sup.prototype);
                let handler = {
                    construct: function (target, args) {
                        let obj = Object.create(base.prototype);
                        this.apply(target, obj, args);
                        return obj;
                    },
                    apply: function (target, that, args) {
                        sup.apply(that, args);
                        base.apply(that, args);
                    }
                };
                let proxy = new Proxy(base, handler);
                descriptor.value = proxy;
                Object.defineProperty(base.prototype, 'constructor', descriptor);
                return proxy;
            }

            String.prototype.matches = function (key) {
                tag = this;
                return tag == key
                    || key[0] == '^' && (
                        tag.match(RegExp(key, "i"))
                        //|| tag.match(RegExp(key.replace(/([.*()\\])/ig, '\\$1'), "i"))
                    )
                    || key[0] == '~' && (
                        key.slice(-1) == '~' ? tag.indexOf(key.slice(1)) != -1
                            : tag.endsWith(key.slice(1))
                    )
                    || ['~', '*'].includes(key.slice(-1)) && tag.startsWith(key.slice(0, -1))
            }

            Date.prototype.addDays = function (days = 0) {
                let date = new Date(this.valueOf());
                date.setDate(date.getDate() + +days);
                return date;
            }

            String.parseDate = String.parseDate || String.prototype.parseDate
            String.prototype.parseDate = function (input_format = "dd/mm/yyyy") {
                sDate = this.toString();
                let result;
                if (new RegExp(/(\d{4})(-?)(\d{2})-?(\d{2})/).test(sDate)) {
                    let pattern = /(\d{4})(-?)(\d{2})-?(\d{2})/
                    let [, year, separator, month, day] = (sDate.match(pattern) || []);
                    result = new Date(`${year}-${month}-${day}T00:00:00`);
                } else {
                    let pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4}))?)?/
                    let [, day, separator, month, year] = (sDate.match(pattern) || []);
                    result = new Date(`${year}-${month}-${day}T00:00:00`);
                }
                return result;
            }

            if (!String.prototype.matchAll) {
                String.prototype.matchAll = function (regex) {
                    const text = this;
                    const matches = [];
                    const regexGlobal = new RegExp(regex, "g");

                    let match;
                    while ((match = regexGlobal.exec(text)) !== null) {
                        const capturingGroups = Array.prototype.slice.call(match, 1);
                        matches.push(capturingGroups);
                    }

                    return matches[Symbol.iterator]();
                };
            }

            if (!Object.hasOwnProperty('getPropertyDescriptor')) {
                Object.defineProperty(Object, 'getPropertyDescriptor', {
                    value: function (source, key) {
                        return source && (Object.getOwnPropertyDescriptor(source.constructor.prototype, key) || Object.getPropertyDescriptor(Object.getPrototypeOf(source), key)) || null;
                    },
                    writable: false, enumerable: false, configurable: false
                });
            }

            if (!Object.prototype.hasOwnProperty('push')) {
                Object.defineProperty(Object.prototype, 'push', {
                    value: function (key, value) {
                        this[key] = value;
                        return this;
                    },
                    writable: true, enumerable: false, configurable: false
                });
            }

            //if (!Object.prototype.hasOwnProperty('get')) {
            //    Object.defineProperty(Object.prototype, 'get', {
            //        value: function (key) {
            //            return this[key];
            //        },
            //        writable: true, enumerable: false, configurable: false
            //    });
            //}

            if (!String.prototype.hasOwnProperty('alert')) {
                Object.defineProperty(String.prototype, 'alert', {
                    value: function () {
                        xover.dom.alert(this)
                    },
                    writable: true, enumerable: false, configurable: false
                });
            }

            Object.render = Object.render || Object.prototype.render;
            if ((Object.getPropertyDescriptor(Object.prototype, 'render') || { writable: true })["writable"]) {
                Object.defineProperty(Object.prototype, 'render', {
                    value: function (...args) {
                        let source = this.message && typeof (this.message) === 'string' && new String(this.message) || this;
                        if (typeof (source.alert) === 'function') {
                            source.alert.apply(source, args)
                        } else if (source !== this && source.render) {
                            source.render.apply(source, args)
                        } else if (source instanceof Attr) {
                            source.value.render()
                        } else if (source instanceof Array && source.length) {
                            let ul = document.cloneNode().createElement("ul");
                            ul.append(...this.map(el => { let li = document.createElement("li"); li.textContent = el; return li }))
                            xover.dom.createDialog(ul)
                        }
                        if (Object.render) {
                            return Object.render.apply(this, args)
                        }
                    },
                    writable: true, enumerable: false, configurable: false
                })
            }

            if (!Response.prototype.hasOwnProperty('render')) {
                Object.defineProperty(Response.prototype, 'render', {
                    value: function (target) {
                        let source = typeof (this.json) != 'function' && this.json || this.document || !(this.body instanceof ReadableStream) && this.body || this.statusText || {};
                        source.render && source.render()
                    },
                    writable: true, enumerable: false, configurable: false
                });
            }

            if (!Object.prototype.hasOwnProperty('cloneObject')) {
                Object.defineProperty(Object.prototype, 'cloneObject', {
                    value: function () {
                        return xover.json.merge({}, this);//JSON.parse(JSON.stringify(this));
                    },
                    writable: false, enumerable: false, configurable: false
                });
            }

            //if (!Object.prototype.hasOwnProperty('filter')) {
            //    Object.defineProperty(Object.prototype, 'filter', {
            //        get: function () {
            //            return function (_filter_function) {
            //                let subset = {}
            //                Object.entries(this).forEach(([key, value]) => {
            //                    if (_filter_function && _filter_function.apply && _filter_function.apply(this, [key, value])) {
            //                        subset[key] = value;
            //                    }
            //                })
            //                return subset;
            //            }
            //        }, set: function (input) {
            //            return;
            //        }, enumerable: false, configurable: false
            //    });
            //}

            if (!Object.prototype.hasOwnProperty('merge')) {
                Object.defineProperty(Object.prototype, 'merge', {
                    value: function (...args) {
                        let self = this;
                        for (let object of args) {
                            if (object && typeof (object) == 'object') {
                                for (let key in object) {
                                    if (object[key] && object[key].constructor == {}.constructor) {
                                        self[key] = Object.prototype.merge.call(self[key] || {}, object[key]);
                                    } else {
                                        let new_value = object[key];
                                        new_value = new_value instanceof Attr ? new_value.value : new_value;
                                        self[key] = (new_value !== undefined ? new_value : self[key]);
                                    }
                                }
                            }
                        }
                        return self;
                    },
                    writable: true, enumerable: false, configurable: false
                });
            }

            if (targetWindow.document.implementation.hasFeature("XPath", "3.0")) {
                if (typeof XMLDocument == "undefined") { XMLDocument = Document; }

                if (!Node.prototype.hasOwnProperty('resolveNS')) {
                    Object.defineProperty(Node.prototype, 'resolveNS', {
                        get: function () {
                            let element = this;
                            let resolver = element instanceof Document ? element.createNSResolver(element) : element.ownerDocument.createNSResolver(element);

                            return function (prefix) {
                                let namespace = resolver.lookupNamespaceURI(prefix) || resolver.lookupNamespaceURI(prefix == '_' && '');
                                if (namespace == undefined) {
                                    return null;
                                }
                                return namespace;

                            };
                        }
                    });
                }

                HTMLTextAreaElement.select = HTMLTextAreaElement.select || HTMLTextAreaElement.prototype.select;
                Node.prototype.selectNodes = function (xpath) {
                    if (this instanceof HTMLTextAreaElement && xpath == undefined) {
                        return HTMLTextAreaElement.select.apply(this)
                    }
                    if (this instanceof DocumentFragment) {
                        let children = new DocumentFragment();
                        let matches = [];
                        const temp_doc = this.firstElementChild instanceof HTMLElement ? window.document.cloneNode() : new DOMParser().parseFromString("<root/>", 'text/xml');
                        if (!temp_doc.firstElementChild) temp_doc.append(window.document.body.cloneNode());
                        let original_root = temp_doc.firstElementChild;
                        for (let child of [...this.childNodes]) {
                            let target = temp_doc;
                            if ([3].includes(child.nodeType)) {
                                temp_doc.firstElementChild.replaceChildren(child);
                                target = temp_doc.firstElementChild;
                            } else {
                                temp_doc.firstElementChild.replaceWith(child);
                            }
                            matches = matches.concat(target.selectNodes(xpath));
                            children.appendChild(child);
                            if (!temp_doc.firstChild) temp_doc.append(original_root);
                        }
                        this.append(...children.childNodes)
                        return matches;
                    }
                    let remove = false;
                    //let store = this.ownerDocument.store;
                    //let observer = (this.ownerDocument || this).observer;
                    if (this instanceof Attr && !this.ownerElement && this.parentNode instanceof Element) {
                        //observer && observer.disconnect(0);
                        //this.ownerDocument.disconnect(0);
                        Element.setAttributeNode.call(this.parentNode, this);
                        remove = true;
                    }
                    let context = xpath.match(/^\(*\/+/) && (this.document || this instanceof Document && this || this instanceof Attr && this.parentNode || this.ownerDocument.contains(this) && this.ownerDocument) || /*xpath.match(/^\(*(ancestor|parent|\.\.)/) && this instanceof Attr && !this.ownerElement && this.parentNode || */this;
                    context = context || this instanceof Node && this || this.document;
                    //if (!xpath.match(/[^\w\d\-\_]/g)) {
                    //    xpath = `*[${context.resolveNS("") !== null && `namespace-uri()='${context.resolveNS("")}' and ` || ''}name()='${xpath}']`
                    //}
                    let nsResolver = (function (element) {
                        let resolver = element instanceof Document ? element.createNSResolver(element) : element.ownerDocument.createNSResolver(element);

                        return function (prefix) {
                            return resolver.lookupNamespaceURI(prefix) || resolver.lookupNamespaceURI(prefix == '_' && '') || xover.spaces[prefix] || "urn:unknown";
                        };
                    }(context))

                    let selection = new Array;
                    let aItems;
                    try {
                        aItems = (context.ownerDocument || context).evaluate(xpath, context instanceof Document ? this : context, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    } catch (e) {
                        if (e.message.match(/contains unresolvable namespaces/g)) {
                            ////let prefixes = xpath.match(/\w+(?=\:)/g);
                            ////prefixes = [...new Set(prefixes)];
                            ////for (let prefix of prefixes) {
                            ////    let target = (context.documentElement || context);
                            ////    Element.setAttributeNS.call(target, 'http://www.w3.org/2000/xmlns/', `xmlns:${prefix}`, nsResolver(prefix));
                            ////}
                            ////try {
                            ////    aItems = (context.ownerDocument || context).evaluate(xpath, context, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                            ////} catch (e) {
                            if (!xover.browser.isIOS()) {
                                xpath = xpath.replace(RegExp("(?<=::|@|\\/|\\[|^|\\()([\\w-_]+):([\\w-_]+|\\*)", "g"), ((match, prefix, name) => `*[namespace-uri()='${nsResolver(prefix)}' and local-name()="${name}"]`));
                            }
                            aItems = (context.ownerDocument || context).evaluate(xpath, context instanceof Document ? this : context, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                        } else {
                            //if (xover.session.debug) console.warn(e);
                            aItems = {};
                        }
                    } finally {
                        if (remove && this instanceof Attr) {
                            //this.parentNode.removeAttributeNS(this.namespaceURI, this.localName)
                            this.remove({ silent: true });
                            //observer && observer.connect();
                            //this.ownerDocument.connect()
                        }
                    }
                    for (let i = 0; i < aItems.snapshotLength; i++) {
                        selection[i] = aItems.snapshotItem(i);
                        if (selection[i] instanceof ProcessingInstruction) {
                            selection[i] = new xover.ProcessingInstruction(selection[i]);
                        }
                    }

                    Object.setPrototypeOf(selection, NodeSet.prototype)
                    return selection
                }

                Object.defineProperty(Document.prototype, 'ready', {
                    enumerable: false,
                    get: async function () {
                        try {
                            if (!this.childNodes.length) {
                                if (this.source) {
                                    //this.observe();
                                    await this.fetch();
                                }
                            }
                            return true;
                        } catch (e) {
                            if (e instanceof Response && e.status == 499) {
                                e = ''
                            }
                            return Promise.reject(e)
                        }
                    }
                })

                if (!Document.prototype.hasOwnProperty('settings')) {
                    let settings = new Map()
                    Object.defineProperty(Document.prototype, 'settings', {
                        get: function () {
                            if (!settings.has(this)) {
                                settings.set(this, {})
                            }
                            return settings.get(this);
                        }, set: function (input) {
                            if (input) {
                                settings.set(this, input)
                            } else {
                                settings.delete(this)
                            }
                            return settings.get(this);
                        }
                    });
                }

                xover.xml.observer = new MutationObserver(async (mutationList, observer) => {
                    let mutated_targets = new MutationSet(...mutationList).consolidate();
                    if (!mutated_targets.size) return;
                    //observer.disconnect()
                    let [first_node] = mutated_targets.keys();
                    let self = first_node instanceof Document ? first_node : first_node.ownerDocument;
                    let sections = xover.site.sections.filter(el => el.source == self || el.source && el.source.document === self).sort(el => el.contains(document.activeElement) && -1 || 1);
                    let active_element = event && event.srcElement instanceof Element && event.srcElement || window.document.activeElement || window.document.createElement('p');;

                    if (event instanceof InputEvent) await xover.delay(1);

                    //mutationList = mutationList.filter(mutation => !mutation.target.silenced && !mutation.target.disconnected && !(mutation.type == 'attributes' && mutation.target.getAttributeNS(mutation.attributeNamespace, mutation.attributeName) === mutation.oldValue || mutation.type == 'childList' && [...mutation.addedNodes, ...mutation.removedNodes].filter(item => !item.nil).length == 0) && !["http://panax.io/xover", "http://www.w3.org/2000/xmlns/"].includes(mutation.attributeNamespace))//.filter(mutation => !(mutation.target instanceof Document));

                    let mutation_event = new xover.listener.Event('mutate', { document: self, srcElement: active_element, mutations: mutated_targets }, self);
                    window.top.dispatchEvent(mutation_event);
                    mutated_targets = (mutation_event.detail || {}).hasOwnProperty("returnValue") ? new Map(mutation_event.detail.returnValue || []) : mutated_targets;

                    //let node_event = new xover.listener.Event('change', { srcElement: active_element }, self);
                    //window.top.dispatchEvent(node_event);
                    //if (node_event.defaultPrevented) return;

                    for (const [target, mutation] of [...mutated_targets]) {
                        /*Known issues: Mutation observer might break if interrupted and page is reloaded. In this case, closing and reopening tab might be a solution. */
                        let node_event = new xover.listener.Event('change', { srcElement: active_element, target: target, removedNodes: mutation.removedNodes, addedNodes: mutation.addedNodes, attributes: mutation.attributes }, target);
                        window.top.dispatchEvent(node_event);
                        if (node_event.defaultPrevented) {
                            mutated_targets.delete(target);
                            continue;
                        }

                        if (mutation.removedNodes.length) {
                            if (typeof (target.getAttributeNS) === 'function' && !target.getAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "nil") && !(target.firstElementChild || target.textContent)) {
                                target.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:nil", "true");
                            }
                        }

                        if (mutation.addedNodes.length) {
                            let node_event = new xover.listener.Event('appendTo', { srcElement: active_element, addedNodes: mutation.addedNodes }, target);
                            window.top.dispatchEvent(node_event);
                            if (node_event.defaultPrevented) mutation.addedNodes.splice(0);
                            if (target instanceof Element && target.getAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "nil") && (target.firstElementChild || target.textContent)) {
                                target.removeAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "nil");
                            }
                        }
                        for (let [index, el] of [...mutation.addedNodes].entries()) {
                            let node_event = new xover.listener.Event('append', { srcElement: active_element, target }, el);
                            window.top.dispatchEvent(node_event);
                            if (node_event.defaultPrevented) mutation.addedNodes.splice(index, 1);
                            el.selectNodes("descendant-or-self::*[not(contains(namespace-uri(),'www.w3.org'))][not(@xo:id)]").forEach(el => el.seed());
                        }

                        if (mutation.removedNodes.length) {
                            let node_event = new xover.listener.Event('removeFrom', { srcElement: active_element, removedNodes: mutation.removedNodes }, target);
                            window.top.dispatchEvent(node_event);
                            if (node_event.defaultPrevented) mutation.removedNodes.splice(0);
                        }
                        for (let el of [...mutation.removedNodes]) {
                            let node_event = new xover.listener.Event('remove', { srcElement: active_element, target }, el);
                            window.top.dispatchEvent(node_event);
                            if (node_event.defaultPrevented) mutation.removedNodes.splice(index, 1);
                            el.selectNodes("descendant-or-self::*[not(contains(namespace-uri(),'www.w3.org'))][not(@xo:id)]").forEach(el => el.seed());
                        }

                        for (let [namespace, attributes] of Object.entries(mutation.attributes || {})) {
                            for (let [attribute_name, [attribute, old_value]] of Object.entries(attributes)) {
                                if (String(attribute.value) === String(old_value)) continue;
                                let node_event = new xover.listener.Event('change', { srcElement: active_element, element: target, attribute, value: attribute.value, old: old_value, removedNodes: mutation.removedNodes, addedNodes: mutation.addedNodes, attributes: mutation.attributes }, attribute);
                                window.top.dispatchEvent(node_event);
                                if (node_event.defaultPrevented) delete (mutation.attributes[attribute.namespaceURI] || {})[attribute.localName];
                                if (!Object.keys(mutation.attributes[attribute.namespaceURI] || {}).length) delete mutation.attributes[attribute.namespaceURI];
                            }
                        }
                    }
                    if (![...mutated_targets.values()].some(config => Object.values(config).some(arr => Object.values(arr).length))) return;
                    let renders = [];
                    for (let section of sections) {
                        !(active_element instanceof HTMLBodyElement) && active_element instanceof HTMLElement && active_element.classList.add("xo-working")
                        if (section.contains(active_element)) {
                            await xover.delay(100); //delay to let animations end
                        }
                        renders.push(section.render())
                    }
                    Promise.all(renders).then(() => {
                        if (active_element.ownerDocument && !active_element.ownerDocument.contains(active_element)) {
                            active_element = document.activeElement || document.documentElement
                        }
                        [...active_element.querySelectorAll(".xo-working")].concat([active_element]).forEach(element => element.classList.remove("xo-working"))
                    })
                })

                if (!Node.prototype.hasOwnProperty('observe')) {
                    Node.prototype.observe = function (config = { characterData: true, attributes: true, childList: true, subtree: true, attributeOldValue: true, characterDataOldValue: true }) {
                        let self = this;
                        if (self.observer && self.observer.hasOwnProperty('observer')) {
                            self.connect()
                            return;
                        }
                        xover.xml.observer.observe(self, config);

                        const _observer = {}
                        if (!self.hasOwnProperty('observer')) {
                            Object.defineProperty(self, 'observer', {
                                get: function () {
                                    return _observer;
                                }
                            })
                        }
                        if (!self.observer.hasOwnProperty('disconnect')) {
                            Object.defineProperty(self.observer, 'disconnect', {
                                value: function (ms = 1) {
                                    _observer.disconnected = true;
                                    let mutations = mutation_observer.takeRecords()
                                    mutation_observer.disconnect();
                                    if (ms || mutations.length) {
                                        xover.delay(ms || 1).then(async () => {
                                            ms && mutation_observer.observe(self, config);
                                            mutations.length && callback(mutations);
                                        });
                                    }
                                },
                                writable: false, enumerable: false, configurable: false
                            });
                        }
                        if (!self.observer.hasOwnProperty('connect')) {
                            Object.defineProperty(self.observer, 'connect', {
                                value: function () {
                                    delete _observer.disconnected;
                                    mutation_observer.observe(self, config);
                                },
                                writable: false, enumerable: false, configurable: false
                            });
                        }
                    }
                }

                Node.prototype.selectSingleNode = function (xpath) {
                    if (!xpath) {
                        return null;
                    }
                    xpath = xpath.replace(/&quot;/gi, '"');
                    let namespace = this.resolveNS("");
                    //if (!xpath.match(/[^\w\d\-\_]/g) && namespace) {
                    //    xpath = `*[namespace-uri()='${namespace}' and name()='${xpath}']`
                    //}
                    let scope = this instanceof Node && this || this.document;
                    let xItems = scope.selectNodes(`(${xpath})[1]`);
                    if (xItems.length > 0) { return xItems[0]; }
                    else { return null; }
                }
                Node.prototype.select = Node.prototype.selectNodes;
                Node.prototype.selectFirst = Node.prototype.selectSingleNode;
                HTMLTextAreaElement.prototype.select = Node.prototype.selectNodes;

                HTMLInputElement.select = HTMLInputElement.select || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'select');
                Object.defineProperty(HTMLInputElement.prototype, 'select', {
                    value: function (...args) {
                        if (!args.length) {
                            return HTMLInputElement.select && HTMLInputElement.select.value.apply(this, args);
                        } else {
                            return Node.prototype.select.apply(this, args)
                        }
                    }
                })

                Element.prototype.createNode = function (node_description) {
                    let node = xover.xml.createNode(node_description)
                    //this.append(node);
                    return node;
                }

                Node.contains = Node.contains || Object.getOwnPropertyDescriptor(Node.prototype, 'contains');
                Object.defineProperty(Node.prototype, 'contains', {
                    value: function (...args) {
                        let selector = args[0];
                        try {
                            if (Node.contains && Node.contains.value && (!selector || selector instanceof Node)) {
                                return Node.contains.value.apply(this, args);
                            }
                            return this.matches(selector) || !!this.querySelector(selector) || null
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                try {
                                    return !!this.selectFirst(`.//${selector}`)
                                } catch (e) {
                                    return null;
                                }
                            }
                        }
                    }
                })

                Node.find = Node.find || Object.getOwnPropertyDescriptor(Node.prototype, 'find');
                Object.defineProperty(Node.prototype, 'find', {
                    value: function (...args) {
                        let selector = args[0];
                        try {
                            if (Node.find && Node.find.value) {
                                return Node.find.value.apply(this, args);
                            }
                            return this.matches(selector) && this || this.querySelector(selector) || null
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                try {
                                    return this.selectFirst(`.//${selector}`)
                                } catch (e) {
                                    return null;
                                }
                            }
                        }
                    }
                })

                Node.findAll = Node.findAll || Object.getOwnPropertyDescriptor(Node.prototype, 'findAll');
                Object.defineProperty(Node.prototype, 'findAll', {
                    value: function (...args) {
                        let selector = args[0];
                        try {
                            if (Node.findAll && Node.findAll.value) {
                                return Node.findAll.value.apply(this, args);
                            }
                            return new NodeSet(...(this.matches(selector) && [this] || [])).concat(...this.querySelectorAll(selector)) || []
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                try {
                                    return new NodeSet(...(this.matches(selector) && [this] || [])).concat(this.selectAll(`.//${selector}`))
                                } catch (e) {
                                    return null;
                                }
                            }
                        }
                    }
                })

                HTMLCollection.filter = HTMLCollection.filter || Object.getOwnPropertyDescriptor(HTMLCollection.prototype, 'filter');
                Object.defineProperty(HTMLCollection.prototype, 'filter', {
                    value: function (...args) {
                        if (typeof (args[0]) === 'string') {
                            return [...this].filter(el => el.selectSingleNode(args[0]))
                        } else if (typeof (args[0]) === 'function') {
                            return [args[0].apply(this, [this].concat([1, 2, 3].slice(1))) && this || null].filter(item => item);
                        }
                    }
                })

                let xo_handler_toArray = {
                    value: function () {
                        return new NodeSet(...this);
                    }, writable: true, enumerable: false, configurable: false
                }

                if (!HTMLCollection.prototype.hasOwnProperty('toArray')) Object.defineProperty(HTMLCollection.prototype, 'toArray', xo_handler_toArray);

                if (!HTMLAllCollection.prototype.hasOwnProperty('toArray')) Object.defineProperty(HTMLAllCollection.prototype, 'toArray', xo_handler_toArray);

                if (!HTMLOptionsCollection.prototype.hasOwnProperty('toArray')) Object.defineProperty(HTMLOptionsCollection.prototype, 'toArray', xo_handler_toArray);

                if (!HTMLFormControlsCollection.prototype.hasOwnProperty('toArray')) Object.defineProperty(HTMLFormControlsCollection.prototype, 'toArray', xo_handler_toArray);

                if (!Array.prototype.hasOwnProperty('toArray')) Object.defineProperty(Array.prototype, 'toArray', { value: function () { return this } });

                if (!NodeList.prototype.hasOwnProperty('toArray')) Object.defineProperty(NodeList.prototype, 'toArray', xo_handler_toArray);

                if (!NamedNodeMap.prototype.hasOwnProperty('toArray')) Object.defineProperty(NamedNodeMap.prototype, 'toArray', xo_handler_toArray);

                NodeList.filter = NodeList.filter || Object.getOwnPropertyDescriptor(NodeList.prototype, 'filter');
                Object.defineProperty(NodeList.prototype, 'filter', {
                    value: function (...args) {
                        if (typeof (args[0]) === 'string') {
                            return [...this].filter(el => el.matches(args[0]))
                        } else if (typeof (args[0]) === 'function') {
                            return Array.prototype.filter.apply(this, args);
                        }
                    }
                })

                let xo_handler_Nodes = {
                    get: function () {
                        return new NodeSet(this);
                    }
                }
                if (!Array.prototype.hasOwnProperty('Nodes')) Object.defineProperty(Array.prototype, 'Nodes', xo_handler_Nodes);

                if (!Array.prototype.hasOwnProperty('toNodeSet')) Object.defineProperty(Array.prototype, 'toNodeSet', xo_handler_Nodes);

                if (!NodeList.prototype.hasOwnProperty('toNodeSet')) Object.defineProperty(NodeList.prototype, 'toNodeSet', xo_handler_Nodes);

                if (!NamedNodeMap.prototype.hasOwnProperty('toNodeSet')) Object.defineProperty(NamedNodeMap.prototype, 'toNodeSet', xo_handler_Nodes);



                Node.prototype.filter = function (...args) {
                    if (typeof (args[0]) === 'string') {
                        if (this.selectSingleNode(args[0])) {
                            return [this]
                        } else {
                            return [];
                        }
                    } else if (typeof (args[0]) === 'function') {
                        return [args[0].apply(this, [this].concat([1, 2, 3].slice(1))) && this || null].filter(item => item);
                    }
                }

                Object.defineProperty(Response.prototype, 'matches', {
                    value: function (...args) {
                        let predicate = args.pop();
                        let tag = this.tag || event && event.detail && event.detail.tag || '';
                        if (predicate[0] == '#') {
                            if (tag == predicate || predicate == tag.split(/[:\?~]/)[0]) {
                                return true;
                            }
                            return false;
                        }
                        let node = this.documentElement;
                        return node && [node.ownerDocument].find(el => el && el.selectNodes(predicate).includes(node))
                    }
                })

                Element.matches = Element.matches || Object.getOwnPropertyDescriptor(Element.prototype, 'matches');
                Object.defineProperty(Element.prototype, 'matches', {
                    value: function (...args) {
                        let node = this;
                        let remove = false;
                        let matches = false;
                        if (!this.parentNode && this.formerParentNode) {
                            remove = true;
                            let selector = this.formerParentNode.selector;
                            let document_copy = this.formerParentNode instanceof Document ? this.formerParentNode.cloneNode(true) : this.formerParentNode.ownerDocument.cloneNode(true);
                            document_copy.disconnect()
                            let target_copy = !selector ? document_copy : (this instanceof HTMLElement || this instanceof SVGElement) ? document_copy.querySelector(selector) : document_copy.selectFirst(selector);
                            if (target_copy instanceof Document && target_copy.documentElement) {
                                target_copy.replaceChild(node, target_copy.documentElement)
                            } else {
                                target_copy instanceof Node && target_copy.insertBefore(node, null)
                            }
                        }
                        try {
                            if (args[0].match(/\/|@/)) {
                                throw new DOMException('not a valid selector');
                            }
                            if (event && ['click'].includes(event.type)) {
                                matches = Element.closest && Element.closest.value.apply(node, args);
                            } else {
                                matches = Element.matches && Element.matches.value.apply(node, args);
                            }
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                /*node = node.parentNode || node.formerParentNode;*/
                                let key = args[0];
                                let return_value = !![node.selectNodes('self::*|ancestor::*').reverse(), node.ownerDocument].flat().find(el => {
                                    try {
                                        return el && el.selectNodes(el instanceof Document && key.replace(/^self::/, '') || key).includes(this)
                                    } catch (e) {
                                        console.warn(`Not a valid xpath was provided: ${key}`)
                                    }
                                });
                                matches = return_value;
                            }
                        }
                        if (remove) this.remove();
                        return matches;
                    }
                })

                Object.defineProperty(Document.prototype, 'matches', {
                    value: function (...args) {
                        let predicate = args.pop();
                        let tag = this.tag || event && event.detail && event.detail.tag || '';
                        let document = this;
                        if (predicate[0] == '#') {
                            if (tag == predicate || predicate == tag.split(/[:\?~]/)[0]) {
                                return true;
                            }
                            return false;
                        }
                        return !["appendTo"].includes((event || {}).type) && document.childElementCount && [...document.childNodes].some(node => typeof (node.matches) == 'function' && node.matches(predicate));
                    }
                })

                Object.defineProperty(xover.Store.prototype, 'matches', {
                    value: function (...args) {
                        let predicate = args.pop();
                        let tag = this.tag || event && event.detail && event.detail.tag || '';
                        let document = this.document;
                        if (predicate[0] == '#') {
                            if (tag == predicate || predicate == tag.split(/[:\?~]/)[0]) {
                                return true;
                            }
                            return false;
                        }
                        return !["appendTo"].includes((event || {}).type) && document.childElementCount && [...document.childNodes].some(node => typeof (node.matches) == 'function' && node.matches(predicate));
                    }
                })

                Attr.matches = Attr.matches || Object.getOwnPropertyDescriptor(Attr.prototype, 'matches');
                Object.defineProperty(Attr.prototype, 'matches', {
                    value: function (...args) {
                        let node = this;
                        try {
                            if (!(Attr.matches && node.ownerElement instanceof HTMLElement)) {
                                throw new DOMException('not a valid selector');
                            }
                            return (Attr.matches || {}).value && Attr.matches.value.apply(node, args);
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                let key = args[0];
                                let remove;
                                let observer = (this.ownerDocument || this).observer;

                                if (!this.ownerElement && this.parentNode) {
                                    //this.ownerDocument.disconnect(0);
                                    this.parentNode.setAttributeNode(this);
                                    //clonedParent = cloneNodePath(this.formerParentNode);
                                    remove = true;
                                }
                                let return_value = [this, node.selectNodes('self::*|ancestor::*').reverse(), node.ownerDocument].flat().some(el => el && el.selectNodes(key).includes(this));
                                if (remove) {
                                    this.remove({ silent: true });
                                    ////observer && observer.connect();
                                    //this.ownerDocument.connect()
                                }

                                return return_value;
                            }
                        }
                    }
                })

                Object.defineProperty(Document.prototype, 'closest', {
                    value: function (...args) {
                        return null
                    }
                })

                Element.closest = Element.closest || Object.getOwnPropertyDescriptor(Element.prototype, 'closest');
                Object.defineProperty(Element.prototype, 'closest', {
                    value: function (...args) {
                        let node = this;
                        try {
                            return Element.closest && Element.closest.value.apply(node, args);
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                node = node.parentNode || node.formerParentNode;
                                let key = args[0];
                                try {
                                    let return_value = this.selectFirst(`ancestor::${key}[1]`);
                                    return return_value;
                                } catch (err) {
                                    return undefined;
                                }
                            }
                        }
                    }
                })

                Attr.closest = Attr.closest || Object.getOwnPropertyDescriptor(Attr.prototype, 'closest');
                Object.defineProperty(Attr.prototype, 'closest', {
                    value: function (...args) {
                        let node = this;
                        try {
                            return (Attr.closest || {}).value && Attr.closest.value.apply(node, args) || (Element.closest || {}).value && Element.closest.value.apply(node.parentNode, args);
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                node = node.parentNode || node.formerParentNode;
                                let key = args[0];
                                try {
                                    let return_value = this.matches(key) || this.ownerElement && this.ownerElement.selectFirst(`ancestor-or-self::${key}[1]`);
                                    return return_value;
                                } catch (err) {
                                    return undefined;
                                }
                            }
                        }
                    }
                })

                let oldValues = new Map()
                Attr.oldValue = Attr.oldValue || Object.getOwnPropertyDescriptor(Attr.prototype, 'oldValue');
                Object.defineProperty(Attr.prototype, 'oldValue', {
                    get: function () {
                        oldValues.set(this.parentNode, oldValues.get(this.parentNode) || {});
                        return oldValues.get(this.parentNode)[`{${this.namespaceURI}}:${this.localName}`];
                    }, set: function (value) {
                        oldValues.set(this.parentNode, oldValues.get(this.parentNode) || {});
                        oldValues.get(this.parentNode)[`{${this.namespaceURI}}:${this.localName}`] = value;
                    }
                })

                Comment.closest = Comment.closest || Object.getOwnPropertyDescriptor(Comment.prototype, 'closest');
                Object.defineProperty(Comment.prototype, 'closest', {
                    value: function (...args) {
                        let node = this;
                        try {
                            //if (!(Comment.closest && node.parentNode instanceof HTMLElement)) {
                            //    throw new DOMException('not a valid selector');
                            //}
                            return (Comment.closest || {}).value && Comment.closest.value.apply(node, args) || (Element.closest || {}).value && Element.closest.value.apply(node.parentNode, args);
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                node = node.parentNode || node.formerParentNode;
                                let key = args[0];
                                try {
                                    let return_value = this.matches(key) || this.parentNode && this.parentNode.selectFirst(`ancestor-or-self::${key}[1]`);
                                    return return_value;
                                } catch (err) {
                                    return undefined;
                                }
                            }
                        }
                    }
                })

                Text.closest = Text.closest || Object.getOwnPropertyDescriptor(Text.prototype, 'closest');
                Object.defineProperty(Text.prototype, 'closest', {
                    value: function (...args) {
                        let node = this;
                        try {
                            //if (!(Text.closest && node.parentNode instanceof HTMLElement)) {
                            //    throw new DOMException('not a valid selector');
                            //}
                            return (Text.closest || {}).value && Text.closest.value.apply(node, args) || (Element.closest || {}).value && Element.closest.value.apply(node.parentNode, args);
                        } catch (e) {
                            if (e.message.indexOf('not a valid selector') != -1) {
                                node = node.parentNode || node.formerParentNode;
                                let key = args[0];
                                try {
                                    let return_value = this.matches(key) || this.parentNode && this.parentNode.selectFirst(`ancestor-or-self::${key}[1]`);
                                    return return_value;
                                } catch (err) {
                                    return undefined;
                                }
                            }
                        }
                    }
                })

                Event.stopPropagation = Event.stopPropagation || Object.getOwnPropertyDescriptor(Event.prototype, 'stopPropagation');
                Object.defineProperty(Event.prototype, 'stopPropagation', {
                    value: function () {
                        Object.defineProperty(this, 'propagationStopped', { value: true })
                        Event.stopPropagation.value.call(this);
                    }
                });

                Object.defineProperty(Node.prototype, 'dispatch', {
                    value: function (event_name, ...args) {
                        let detail = { target: this, element: this.closest("*"), attribute: this instanceof Attr ? this : null };
                        for (let arg of args) {
                            if (arg instanceof Array) {
                                detail.args = detail.args || []
                                detail.args.concat(arg)
                            } else if (arg && arg.constructor === {}.constructor) {
                                detail.assign(arg)
                            } else {
                                detail.args = detail.args || []
                                detail.args.push(arg)
                            }
                        }
                        let event = new xover.listener.Event(event_name, detail, this);
                        window.top.dispatchEvent(event);
                        return event.detail.returnValue;
                    }
                })

                Object.defineProperty(Text.prototype, 'matches', {
                    value: function (...args) {
                        let node = this.parentNode;
                        let xpath = args[0];
                        try {
                            let return_value = !![this, node.selectNodes('self::*|ancestor::*').reverse(), node.ownerDocument].flat().find(el => el && el.selectNodes(xpath).includes(this));
                            return return_value;
                        } catch (e) {
                            return false;
                        }
                    }
                })

                Object.defineProperty(Comment.prototype, 'matches', {
                    value: function (...args) {
                        return false;
                    }
                })

                Object.defineProperty(ProcessingInstruction.prototype, 'matches', {
                    value: function (...args) {
                        return false;
                    }
                })

                XMLDocument.prototype.getDifferences = function (document) {
                    return xover.xml.getDifferences(this, document);
                }

                if (!Node.prototype.hasOwnProperty('$')) {
                    Object.defineProperty(Node.prototype, '$', {
                        enumerable: true,
                        get: function () {
                            let node = this;
                            let handler = {
                                get: function (target, prop) {
                                    let new_proxy;
                                    if (target === Node.prototype.selectSingleNode) {
                                        new_proxy = target.apply(node, [prop]);
                                        new_proxy = (new_proxy && new_proxy.selectSingleNode("xson:object|xson:array") || new_proxy);
                                    } else if (target[prop] && isFunction(target[prop])) {
                                        return (function () {
                                            return target[prop].apply(target, arguments);
                                        });
                                    } else if (typeof (prop) == 'symbol') {
                                        return target[prop];
                                    } else if (target instanceof Node) {
                                        if (target.selectSingleNode("self::xson:object")) {
                                            new_proxy = target.selectSingleNode(prop);
                                            new_proxy = (new_proxy.selectSingleNode("xson:object|xson:array") || new_proxy);
                                        } else if (Number.parseInt(prop) == prop && target.selectSingleNode("self::xson:array")) {
                                            new_proxy = target.selectSingleNode("self::xson:array").selectNodes("*")[prop]
                                        } else if (Number.parseInt(prop) == prop && target.selectSingleNode("xson:array")) {
                                            new_proxy = target.selectSingleNode("xson:array").selectNodes("*")[prop]
                                        } else if (target.selectSingleNode("self::*[not(*[2])]/*[self::xson:object or self::xson:array]")) {
                                            new_proxy = target.selectSingleNode("*").selectSingleNode(prop);
                                        } else {
                                            new_proxy = target.selectNodes(prop);
                                            if (!new_proxy.length) {
                                                new_proxy = null;
                                            }
                                        }
                                        //}
                                        //if (target.constructor == [].constructor) {
                                        //    if (target.selectSingleNode("self::xson:object")) {
                                        //        return new Proxy(new_proxy.length > 1 || target.getAttribute && target.getAttribute("xsi:type") == 'array' || target.parentNode && target.parentNode.name == 'xson:array' ? new_proxy : new_proxy[0], handler);
                                        //    }
                                    } else if (prop in target) {
                                        new_proxy = target[prop];
                                    }
                                    if (new_proxy) {
                                        return new Proxy(new_proxy, handler);
                                    } else if (target instanceof Node && prop === 'node') {
                                        return target;
                                    }
                                    new_proxy = target.constructor == [].constructor && target.find(el => el.nodeName == prop) || target;
                                    if (new_proxy.length) {
                                        return new Proxy(new_proxy.length > 1 || target.getAttribute && target.getAttribute("xsi:type") == 'array' || target.parentNode && target.parentNode.name == 'xson:array' ? new_proxy : new_proxy[0], handler);
                                    } else {
                                        return null;
                                    }
                                }
                                , set: function (target, prop, value) {
                                    return target[prop] = value;
                                }
                            }
                            return new Proxy(this.selectSingleNode, handler);
                            //return new Proxy(this.documentElement && this.selectSingleNode("xson:object|xson:array") || this, handler);
                        }
                    });
                }

                if (!Node.prototype.hasOwnProperty('$$')) {
                    Object.defineProperty(Node.prototype, '$$', {
                        enumerable: true,
                        get: function () {
                            return this.selectNodes;
                        }
                    });
                }

                if (!Node.prototype.hasOwnProperty('highlight')) {
                    Object.defineProperty(Node.prototype, 'highlight', {
                        value: function () {
                            let node = this;
                            if (node.nodeType !== 2) {
                                [node instanceof HTMLElement && node || undefined, ...document.querySelectorAll(`#${node.getAttributeNS("http://panax.io/xover", "id")},[xo-source="${node.getAttributeNS("http://panax.io/xover", "id")}"]`)].filter(el => el).map(target => target.style.outline = '#f00 solid 2px');
                            }
                        },
                        writable: false, enumerable: false, configurable: false
                    });
                }

                if (!Node.prototype.hasOwnProperty('buildSelector')) {
                    Object.defineProperty(Node.prototype, 'buildSelector', {
                        enumerable: true,
                        value: function (...args) {
                            if (!(this.ownerDocument instanceof HTMLDocument)) {
                                return null;
                            }
                            let config = {};
                            if (args.length && args[args.length - 1].constructor === {}.constructor) {
                                config = args.pop();
                            }
                            config.ignore = config.ignore || [];

                            selector_method = this.method || 'fast'; /*fast || full*/
                            let buildQuerySelector = function (target = this.ownerDocument, path = []) {
                                if (!(this && this.parentNode)) {
                                    return path.filter(el => el).join(" > ");
                                } else if (this.id) {
                                    path.unshift(`${this.tagName}[id='${this.id}']`);
                                } else if ((this.classList || []).length && !(selector_method == 'full')) {
                                    let classes = [...this.classList].filter(class_name => !(config.ignore.includes(`.${class_name}`) || class_name.match("[.]")));
                                    path.unshift(this.tagName + (classes.length && '.' + classes.join(".") || ""));
                                } else if (this.nodeName == '#text') {
                                    path.unshift(buildQuerySelector.call(this.parentNode, target, path.flat()));
                                } else {
                                    path.unshift(this.tagName || '*');
                                }
                                if (this instanceof Element && this.hasAttribute("xo-stylesheet")) {
                                    path[0] = path[0] + `[xo-stylesheet='${this.getAttribute("xo-stylesheet")}']`;
                                }
                                if (this instanceof Element && this.hasAttribute("xo-source")) {
                                    path[0] = path[0] + `[xo-source='${this.getAttribute("xo-source")}']`;
                                }

                                if (target.querySelector(path.filter(el => el).join(" > ")) === this) {
                                    return path.filter(el => el).join(" > ");
                                } else if (this.parentNode && this.parentNode.querySelector(path.filter(el => el).join(" > "))) {
                                    let position = this.parentNode && [...this.parentNode.children].findIndex(el => el == this);
                                    if (position) {
                                        path[path.length - 1] = `${path[path.length - 1]}:nth-child(${position + 1})`;
                                    }
                                    path.unshift(buildQuerySelector.call(this.parentNode, target, []));
                                } else {
                                    return path.filter(el => el).join(" > ");
                                }
                                return path.filter(el => el).flat().join(" > ");
                            }
                            return buildQuerySelector.apply(this, args);
                        },
                        writable: true, enumerable: false, configurable: true
                    });
                }

                if (!Node.prototype.hasOwnProperty('selector')) {
                    Object.defineProperty(Node.prototype, 'selector', {
                        enumerable: true,
                        get: function () {
                            let selector_type = this.preferredSelectorType || this.event instanceof Event && 'full_path' || 'fast';
                            let buildQuerySelector = function (target, path = []) {
                                if (!(target && target.parentNode)) {
                                    return path.filter(el => el).join(" > ");
                                } else if (target.id) {
                                    path.unshift(`${target.tagName}[id='${target.id}']`);
                                } else if ((target.classList || []).length && selector_type != 'full_path') {
                                    let classes = [...target.classList].filter(class_name => !["xo-working"].includes(class_name) && class_name.match(/^[a-zA-Z_][a-zA-Z0-9_\-]*$/));
                                    path.unshift(target.tagName + (classes.length && '.' + classes.join(".") || ""));
                                } else if (target.nodeName == '#text') {
                                    path.unshift(buildQuerySelector(target.parentNode, path.flat()));
                                } else {
                                    path.unshift(target.tagName || '*');
                                }
                                if (target instanceof Element && target.hasAttribute("xo-stylesheet")) {
                                    path[0] = path[0] + `[xo-stylesheet='${target.getAttribute("xo-stylesheet")}']`;
                                }
                                if (target instanceof Element && target.hasAttribute("xo-source")) {
                                    path[0] = path[0] + `[xo-source='${target.getAttribute("xo-source")}']`;
                                }

                                if (target.ownerDocument.querySelector(path.filter(el => el).join(" > ")) === target) {
                                    return path.filter(el => el).join(" > ");
                                } else if (target.parentNode && target.parentNode.querySelector(path.filter(el => el).join(" > "))) {
                                    let position = target.parentNode && [...target.parentNode.children].findIndex(el => el == target);
                                    if (position) {
                                        path[path.length - 1] = `${path[path.length - 1]}:nth-child(${position + 1})`;
                                    }
                                    path.unshift(buildQuerySelector(target.parentNode, []));
                                } else {
                                    return path.filter(el => el).join(" > ");
                                }
                                return path.filter(el => el).flat().join(" > ");
                            }
                            let buildXPath = function (target, path = []) {
                                if (!(target && target.parentNode)) {
                                    return path.filter(el => el).join("/");
                                } else {
                                    let nodeName = target.localName;
                                    let namespacePrefix = target.prefix || null;
                                    let namespaceURI = target.namespaceURI || null;

                                    if (namespacePrefix) {
                                        path.unshift(`${namespacePrefix}:${nodeName}`);
                                    } else if (namespaceURI) {
                                        path.unshift(`*[namespace-uri()='${namespaceURI}' and local-name()='${nodeName}']`);
                                    } else {
                                        path.unshift(nodeName);
                                    }
                                }

                                if (target.parentNode.selectFirst(path[0]) === target) {
                                    return buildXPath(target.parentNode, path);
                                } else if (target.parentNode) {
                                    let position = [...target.parentNode.children].indexOf(target) + 1;
                                    path[0] = `*[${position}]`;
                                    path.unshift(buildXPath(target.parentNode, []));
                                } else {
                                    return path.filter(el => el).join("/");
                                }

                                return path.filter(el => el).flat().join("/");
                            }

                            if (this instanceof HTMLElement || this instanceof SVGElement) {
                                return buildQuerySelector(this);
                            } else {
                                return buildXPath(this);
                            }
                        }

                    });
                }

                XMLDocument.createProcessingInstruction = XMLDocument.createProcessingInstruction || XMLDocument.prototype.createProcessingInstruction;
                XMLDocument.prototype.createProcessingInstruction = function (target, data) {
                    if (target) {
                        let last_stylesheet = this.selectNodes("processing-instruction('xml-stylesheet')").pop();
                        let definition = data.constructor === {}.constructor && xover.json.toAttributes(data) || data instanceof ProcessingInstruction && data.textContent || data
                        let piNode = new xover.ProcessingInstruction(XMLDocument.createProcessingInstruction.call(this, 'xml-stylesheet', definition));
                        return piNode;
                    }
                }

                XMLDocument.prototype.consolidate = function (xsl) {
                    xsl = this.cloneNode(true);
                    let imports = xsl.documentElement.selectNodes("xsl:import|xsl:include");
                    let processed = {};
                    while (imports.length) {
                        for (let node of imports) {
                            let href = node.getAttribute("href");
                            if (xsl.selectSingleNode(`//comment()[contains(.,'ack:imported-from "${href}" ===')]`)) {
                                node.remove();
                            } else if (xover.sources[href]) {
                                //xsltProcessor.importStylesheet(xover.sources[href]);
                                let fragment = document.createDocumentFragment();
                                fragment.append(xsl.createComment(`ack:imported-from "${href}" ===>>>>>>>>>>>>>>> `));
                                let sources = xover.sources[href].cloneNode(true);
                                Object.entries(xover.json.difference(xover.xml.getNamespaces(sources), xover.xml.getNamespaces(xsl))).map(([prefix, namespace]) => {
                                    xsl.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', `xmlns:${prefix}`, namespace)
                                });
                                fragment.append(...sources.documentElement.childNodes);
                                fragment.append(xsl.createComment(` <<<<<<<<<<<<<<<=== ack:imported-from "${href}" === `));

                                Element.replaceChild.apply(node.parentNode, [fragment, node]); //node.replace(fragment);
                                xsl.documentElement.selectNodes(`xsl:import[@href="${href}"]|xsl:include[@href="${href}"]`).remove(); //Si en algún caso hay más de un nodo con el mismo href, quitamos los que quedaron (sino es posible que no se quite)
                            } else {
                                console.warn(`Import "${href}" not available.`)
                            }
                            processed[href] = true;
                        }
                        let xsltProcessor = new XSLTProcessor();
                        xsltProcessor.importStylesheet(xover.xml.createDocument(`
            <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@name)" match="/*/xsl:param"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@name)" match="/*/xsl:variable"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@name)" match="/*/xsl:template[@name]"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@href)" match="/*/xsl:include"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@href)" match="/*/xsl:import"/>
                <xsl:key name="node_by_name" use="concat(name(),'::')" match="/*/xsl:output"/>
                <xsl:template match="@* | * | text() | processing-instruction() | comment()" priority="-1">
                    <xsl:if test="count(key('node_by_name',concat(name(),'::',@name,@href))[last()]|.)&lt;=1">
                        <xsl:copy-of select="."/>
                    </xsl:if>
                </xsl:template>
                <xsl:template match="/*">                                
                <xsl:copy>
                    <xsl:copy-of select="@*"/>
                    <xsl:apply-templates/>
                </xsl:copy>
                </xsl:template>
            </xsl:stylesheet>
        `), 'text/xml');
                        xsl = xsltProcessor.transformToDocument(xsl);
                        xsl.source = this.source;
                        xsl.store = this.store;
                        xsl.href = this.href;
                        xsl.url = this.url;
                        imports = xsl.documentElement.selectNodes("xsl:import|xsl:include").filter(node => {
                            return !(processed[node.getAttribute("href")]) || xsl.selectSingleNode(`//comment()[contains(.,'ack:imported-from "${node.getAttribute("href")}" ===')]`);
                        });
                    }
                    xsl.select(`//xsl:key/@name`).filter(key => !xsl.selectFirst(`//xsl:template//@*[name()='select' or name()='match' or name()='test'][contains(.,"key('${key}'")]`)).forEach(key => key.parentNode.replaceWith(new Comment(`ack:removed: ${key.parentNode.nodeName} '${key}'`)))
                    return xsl;
                }

                XMLDocument.prototype.toClipboard = async function () {
                    let source = this;
                    let sourceContent = source.toString();
                    if (navigator.clipboard) {
                        try {
                            return Promise.resolve(await navigator.clipboard.writeText(sourceContent));
                        } catch (e) {
                            return Promise.reject(e)
                        }
                    } else {
                        await xover.delay(200);
                        let textarea = (document.createElement('textarea'));
                        textarea.setAttribute("readonly", "");
                        textarea.style.position = "absolute";
                        textarea.style.left = "-9999px";
                        textarea.value = sourceContent;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        await xover.delay(5000);
                        textarea.remove();
                    }
                }

                XMLDocument.prototype.findById = function (xo_id) {
                    return this.selectSingleNode('//*[@xo:id="' + xo_id + '"]')
                }

                Object.defineProperty(XMLDocument.prototype, `fetch`, {
                    get: function () {
                        let self = this;
                        return function (...args) {
                            let context = this;
                            if (!self.hasOwnProperty("source")) {
                                return Promise.reject("Document is not associated to a Source and can't be fetched");
                            }
                            let controller = (context.url || {}).controller;
                            if (controller instanceof AbortController && controller.signal.aborted) {
                                context.fetching = undefined;
                            }
                            let store = self.store;
                            context.fetching = context.fetching || new Promise((resolve, reject) => {
                                self.source && self.source.fetch.apply(context, args).then(response => {
                                    if (!(response instanceof Node) && xover.json.isValid(response)) {
                                        response = xover.xml.fromJSON(response);
                                    }
                                    if (!(response instanceof Node) || response instanceof Text) {
                                        response = new DOMParser().parseFromString(response, 'text/html');
                                        response = response.querySelector('html > body');
                                        response && response.ownerDocument.documentElement.replaceWith(response);
                                    }
                                    let old = context.cloneNode(true);
                                    context.href = response.href;
                                    context.url = response.url;
                                    if (response instanceof Document || response instanceof DocumentFragment) {
                                        context.replaceBy(response); //transfers all contents
                                    } else {
                                        context.replaceContent(response);
                                    }
                                    window.top.dispatchEvent(new xover.listener.Event(`fetch`, { tag: '', document: context, store: store, old: old, target: context }, context));
                                    resolve(context);
                                }).catch(async (e) => {
                                    if (!e) {
                                        return reject(e);
                                    }
                                    let document = e.document || e instanceof Document && e || null//e;
                                    let targets = []
                                    if (e.status != 404 && document && document.render) {
                                        window.top.dispatchEvent(new xover.listener.Event(`failure`, { tag: '', response: document, document }, document));
                                        //targets = await document.render();
                                        if (!(targets && targets.length)) {
                                            return reject(e)
                                        }
                                    } else {
                                        return reject(e);
                                    }
                                });
                            }).catch(async (e) => {
                                return Promise.reject(e);
                            }).finally(() => {
                                context.fetching = undefined;
                            });
                            return context.fetching;
                        }
                    }
                })


                //XMLDocument.prototype.initialize = async function () {
                //    if (this instanceof XMLDocument) {
                //        xover.manifest.getSettings(this, 'stylesheets').reverse().forEach(stylesheet => this.addStylesheet(stylesheet));
                //    }
                //    this.stylesheets.filter(stylesheet => stylesheet.role == 'init' && !this.selectSingleNode(`comment()[.="Initialized by ${stylesheet.href}"]`)).forEach(async stylesheet => {
                //        let _document_stylesheet = stylesheet.document;
                //        _document_stylesheet = await _document_stylesheet.fetch()
                //        if (_document_stylesheet) {
                //            _document_stylesheet.append(this.createComment('Initialized by ' + stylesheet.href));
                //        }

                //        let new_document = this.transform(_document_stylesheet);
                //        if ((((new_document.documentElement || {}).namespaceURI || '').indexOf("http://www.w3.org") == -1)) {
                //            this.document.replaceBy(new_document);
                //        } else {
                //            //delete stylesheet["role"];
                //            //__document.addStylesheet(stylesheet);
                //            console.warn("Initial transformation shouldn't yield a html or any other document from the w3 standard.");
                //        }
                //    });
                //}

                XMLDocument.prototype.reload = async function () {
                    await this.fetch()
                    let store = this.store;
                    [...top.document.querySelectorAll(`[xo-stylesheet="${this.href}"]`)].filter(el => el.store === store).forEach((el) => el.render())
                }

                if (!XMLDocument.prototype.hasOwnProperty('type')) {
                    Object.defineProperty(XMLDocument.prototype, 'type', {
                        get: function () {
                            let self = this;
                            return (Object.entries(xover.spaces).find(([key, namespace]) => self.documentElement && namespace == self.documentElement.namespaceURI) || [])[0] || (this.documentElement || {}).prefix || "xml";
                        }
                    })
                }

                XMLDocument.prototype.getNamespaces = function () {
                    return this.documentElement && this.documentElement.getNamespaces() || {};
                }

                HTMLDocument.prototype.getNamespaces = function () {
                    return this.documentElement && this.documentElement.getNamespaces() || {};
                }

                Object.defineProperty(XMLDocument.prototype, 'stylesheets',
                    {
                        get: function () {
                            let self = this;
                            let stylesheets_nodes = this.selectNodes("processing-instruction('xml-stylesheet')");
                            Object.defineProperty(stylesheets_nodes, 'getDocuments', {
                                value: function () {
                                    let docs = []
                                    for (let stylesheet of this) {
                                        docs.push(stylesheet.document);
                                    }
                                    return docs;
                                },
                                writable: false, enumerable: false, configurable: false
                            });

                            Object.defineProperty(stylesheets_nodes, 'toJSON', {
                                value: function () {
                                    let json = []
                                    for (let stylesheet of this) {
                                        json[stylesheet.href] = stylesheet
                                    }
                                    return json;
                                },
                                writable: false, enumerable: false, configurable: false
                            });

                            return new Proxy(stylesheets_nodes, {
                                get: function (target, prop) { //para búsquedas por href
                                    if (prop in target) {
                                        return target[prop];
                                    }
                                    return target.find(stylesheet => stylesheet.href == prop);
                                }
                            })
                            return stylesheets_nodes
                        }
                    }
                );

                Object.defineProperty(Node.prototype, 'getStylesheets', {
                    value: function (predicate) {
                        let document = (this.document || this.ownerDocument || this);
                        if (this instanceof xover.Store) {
                            document.store = this
                        }
                        if (predicate && predicate.constructor === {}.constructor) {
                            predicate = Object.entries(predicate).reduce((result, [key, value]) => { result += `[contains(.,'${key}="${value}"')]`; return result }, '')
                        } else {
                            predicate = (predicate ? `[${predicate}]` : '');
                        }
                        stylesheets_nodes = document.selectNodes("//processing-instruction('xml-stylesheet')" + predicate);
                        //_stylesheets = [];
                        //for (let s = 0; s < stylesheets_nodes.length; ++s) {
                        //    let stylesheet = xover.json.fromAttributes(stylesheets_nodes[s].textContent);
                        //    Object.defineProperty(stylesheet, 'ownerDocument', {
                        //        value: document
                        //    });
                        //    Object.defineProperty(stylesheet, 'document', {
                        //        get: function () {
                        //            return ((this.ownerDocument.store || {}).sources || {})[this.href] || xover.sources[this.href]
                        //        }
                        //    });

                        //    _stylesheets.push(stylesheet);
                        //}
                        //Object.defineProperty(_stylesheets, 'ownerDocument', {
                        //    get: function () {
                        //        return document;
                        //    }
                        //});
                        //Object.defineProperty(_stylesheets, 'remove', {
                        //    value: function () {
                        //        for (let stylesheet of this) {
                        //            let target = this.ownerDocument.getStylesheet({ href: stylesheet.href });
                        //            if (target) target.remove();
                        //        }
                        //        //xover.dom.refresh();
                        //    },
                        //    writable: false, enumerable: false, configurable: false
                        //});
                        Object.defineProperty(stylesheets_nodes, 'getDocuments', {
                            value: function () {
                                let docs = []
                                for (let stylesheet of this) {
                                    docs.push(this.document);
                                    //docs.push(this.ownerDocument.store.sources[stylesheet.href] || xover.sources[stylesheet.href])
                                }
                                return Promise.all(docs);
                            },
                            writable: false, enumerable: false, configurable: false
                        });
                        return stylesheets_nodes;
                    }
                })

                XMLDocument.prototype.getStylesheet = function (predicate) {
                    let document = (this.document || this);

                    if (predicate && predicate.constructor === {}.constructor) {
                        predicate = Object.entries(predicate).reduce((result, [key, value]) => { result += `[contains(.,'${key}="${value}"')]`; return result }, '')
                    } else {
                        predicate = (predicate ? `[contains(.,'href="${predicate}"')]` : '');
                    }
                    return document.selectSingleNode(`//processing-instruction('xml-stylesheet')${predicate}`);
                }

                XMLDocument.prototype.addStylesheet = function (definition, target, refresh) {
                    let store = this.store;
                    let style_definition;
                    let document = (this.document || this);
                    if (definition.constructor === {}.constructor) {
                        definition = xover.json.merge({ type: 'text/xsl' }, definition);
                        style_definition = xover.json.toAttributes(definition);
                    } else {
                        style_definition = definition
                    }
                    let stylesheet = this.getStylesheet(definition.href);
                    if (!stylesheet) {
                        stylesheet = document.createProcessingInstruction('xml-stylesheet', style_definition);
                        if (store && (refresh/* || !store.state.initializing*/)) {
                            store.render();
                        }
                        let beforeEvent = new xover.listener.Event('beforeAddStylesheet', { stylesheet: stylesheet }, this);
                        window.top.dispatchEvent(beforeEvent);
                        if (beforeEvent.cancelBubble || beforeEvent.defaultPrevented) return;
                        document.insertBefore(stylesheet, target || document.selectSingleNode(`(processing-instruction('xml-stylesheet')${definition.role == 'init' ? '' : definition.role == 'binding' ? `[not(contains(.,'role="init"') or contains(.,'role="binding"'))]` : '[1=0]'} | *[1])[1]`));
                    }
                    return stylesheet; //.document.documentElement && document || stylesheet.document.fetch();
                }

                XMLDocument.prototype.removeStylesheet = function (definition_or_stylesheet) {
                    let style_definition, pi;
                    let document = this;
                    if (definition_or_stylesheet instanceof ProcessingInstruction) {
                        pi = definition_or_stylesheet;
                    }
                    else if (definition_or_stylesheet.constructor === {}.constructor) {
                        pi = this.getStylesheet(definition_or_stylesheet.href);
                    } else {
                        throw (new Error("Not a valid stylesheet"));
                    }
                    this.selectNodes(`processing-instruction('xml-stylesheet')`).forEach(node => node.isEqualNode(pi) && el.remove());
                }

                var toString_original = Node.prototype.toString;
                Node.prototype.toString = function () {
                    //if (this instanceof HTMLElement) {
                    //    return toString_original
                    //} else {
                    return new XMLSerializer().serializeToString(this);
                    //}
                }
                if (!Node.prototype.hasOwnProperty('xml')) {
                    Object.defineProperty(Node.prototype, 'xml', {
                        get: function () {
                            return this.toString();
                        }
                    })
                }

                if (!Node.prototype.hasOwnProperty('queryChildren')) {
                    Object.defineProperty(Node.prototype, 'queryChildren', {
                        value: function (selector) {
                            return [...this.children].filter((child) => child.matches(selector))
                        },
                        writable: false, enumerable: false, configurable: false
                    });
                }

                HTMLTableCellElement.scope = HTMLTableCellElement.scope || Object.getOwnPropertyDescriptor(HTMLTableCellElement.prototype, 'scope')
                let scope_handler = { /*Estaba con HTMLElement, pero los SVG los ignoraba. Se deja abierto para cualquier elemento*/
                    get: function () {
                        //if (this.scopeNode instanceof Node && this.scopeNode.parentNode && this.scopeNode.name == this.closest('*').getAttribute("xo-slot")) return this.scopeNode;
                        //if (this.ownerDocument instanceof XMLDocument) return null;
                        let original_PropertyDescriptor = this instanceof HTMLTableCellElement && HTMLTableCellElement.scope || {};
                        let self = this;
                        let section = this.section;
                        let source = section && section.source;
                        if (!source) {
                            this.scopeNode = null;
                            return this.scopeNode || (this.ownerDocument || this).createComment("ack:no-scope");
                        } else {
                            //let ref = this.parentElement && this.closest && this || this.parentNode || this
                            let ref = this instanceof Element ? this : this.parentNode;
                            let node_by_id = !ref.hasAttribute("xo-scope") && (((ref.hasAttribute("xo-source") || ref.hasAttribute("xo-stylesheet")) && source) || source.selectFirst(`//*[@xo:id="${ref.getAttributeNode("xo:id") || ref.id}"]`));
                            let [dom_scope, node] = node_by_id && [ref, node_by_id] || [ref.closest("slot,[xo-scope],[xo-source],[xo-stylesheet]")].filter(el => el).map(el => [el, el.hasAttribute("xo-scope") ? source.selectFirst(`//*[@xo:id="${el.getAttribute("xo-scope")}"]`) : el.name ? source.documentElement && source.documentElement.get(el.name) : source.documentElement]).pop() || [];
                            let attribute = ref.closest("slot,[xo-slot],[xo-source],[xo-stylesheet]");
                            if (!dom_scope) {
                                this.scopeNode = null;
                                return this.scopeNode || this.ownerDocument.createComment("ack:no-scope");
                            } else if (!(node instanceof Attr) && dom_scope.contains(attribute)) {
                                attribute = attribute.getAttribute("xo-slot");
                            } else {
                                attribute = null;
                            }
                            //if (!attribute && this instanceof Text) attribute = 'text()';
                            if (node && attribute) {
                                if (attribute === 'text()') {
                                    let textNode = [...node.childNodes].filter(el => el instanceof Text).pop() || node.createTextNode(null);
                                    this.scopeNode = textNode;
                                    return this.scopeNode || this.ownerDocument.createComment("ack:no-scope");
                                } else {
                                    let attribute_node;
                                    attribute_node = node.getAttributeNode(attribute);
                                    attribute_node = attribute_node || node.createAttribute(attribute, null);
                                    this.scopeNode = attribute_node;
                                    return this.scopeNode || this.ownerDocument.createComment("ack:no-scope");
                                }
                            }
                            //Implementar para Text $0.select('ancestor-or-self::*').map(el => el.scope).filter(el => el && el.selectFirst('self::xo:r')).pop().getAttributeNode($0.scope.value)
                            this.scopeNode = node || original_PropertyDescriptor.get && original_PropertyDescriptor.get.apply(this, arguments) || null;
                            return this.scopeNode || this.ownerDocument.createComment("ack:no-scope");
                        }
                    }
                }
                if (!Node.prototype.hasOwnProperty('scope')) {
                    Object.defineProperty(Node.prototype, 'scope', scope_handler);
                }

                //if (!Element.prototype.hasOwnProperty('source')) {
                //    Object.defineProperty(Element.prototype, 'source', Object.getOwnPropertyDescriptor(Element.prototype, 'scope'));
                //}
                Object.defineProperty(HTMLTableCellElement.prototype, 'scope', Object.getOwnPropertyDescriptor(Node.prototype, 'scope'));

                const source_handler = {
                    get: function () {
                        let section = this.section;
                        if (!section) return null;
                        let source = section && section.getAttribute("xo-source") || null;
                        if (source == 'inherit') {
                            return (section.parentNode.section || {}).source
                        }
                        if (!source) return null;
                        if (source && source.indexOf("{$") != -1) {
                            source = source.replace(/\{\$(state|session):([^\}]*)\}/g, (match, prefix, name) => xover[prefix][name] || match)
                        }
                        let store = source in xover.stores && xover.stores[source] || xover.sources[source];
                        return store;
                    }
                }

                if (!Text.prototype.hasOwnProperty('store')) {
                    Object.defineProperty(Text.prototype, 'store', source_handler);
                }
                if (!Attr.prototype.hasOwnProperty('store')) {
                    Object.defineProperty(Attr.prototype, 'store', source_handler);
                }
                if (!Element.prototype.hasOwnProperty('store')) {
                    Object.defineProperty(Element.prototype, 'store', source_handler);
                }
                if (!Comment.prototype.hasOwnProperty('store')) {
                    Object.defineProperty(Comment.prototype, 'store', source_handler);
                }
                if (!ProcessingInstruction.prototype.hasOwnProperty('store')) {
                    Object.defineProperty(ProcessingInstruction.prototype, 'store', source_handler);
                }

                if (!Text.prototype.hasOwnProperty('source')) {
                    Object.defineProperty(Text.prototype, 'source', source_handler);
                }
                if (!Attr.prototype.hasOwnProperty('source')) {
                    Object.defineProperty(Attr.prototype, 'source', source_handler);
                }
                if (!Element.prototype.hasOwnProperty('source')) {
                    Object.defineProperty(Element.prototype, 'source', source_handler);
                }
                if (!Comment.prototype.hasOwnProperty('source')) {
                    Object.defineProperty(Comment.prototype, 'source', source_handler);
                }
                if (!ProcessingInstruction.prototype.hasOwnProperty('source')) {
                    Object.defineProperty(ProcessingInstruction.prototype, 'source', source_handler);
                }

                if (!Node.prototype.hasOwnProperty('stylesheet')) {
                    Object.defineProperty(Node.prototype, 'stylesheet', {
                        get: function () {
                            let section = this.section;
                            if (!section) return null;
                            let stylesheet_name = section && section.getAttribute("xo-stylesheet") || null;
                            return stylesheet_name && xover.sources[stylesheet_name] || null;
                        }
                    });
                }

                if (!Node.prototype.hasOwnProperty('section')) {
                    Object.defineProperty(Node.prototype, 'section', {
                        get: function () {
                            //if (this.ownerDocument instanceof XMLDocument) {
                            //    return undefined
                            //} else { /* Some nodes like processing-instructions have no closest method */
                            return typeof (this.closest) === 'function' ? this.closest("[xo-source],[xo-stylesheet]") : null;
                            //}
                        }
                    });
                }

                Node.prototype.normalizeNamespaces = function () {
                    let normalized = xover.xml.normalizeNamespaces(this)
                    let target = this instanceof Document ? this.documentElement : this;
                    target.replaceWith(normalized instanceof Document ? normalized.documentElement : normalized)
                    return this;
                }

                Element.prototype.remove = function (settings = {}) {
                    if (!this.reactive || settings.silent) {
                        Element.remove.apply(this);
                        return this;
                    }
                    let beforeRemove = new xover.listener.Event('beforeRemove', { target: this, srcEvent: event }, this);
                    window.top.dispatchEvent(beforeRemove);
                    if (beforeRemove.cancelBubble || beforeRemove.defaultPrevented) return;
                    let parentNode = this.parentNode;
                    let nextSibling = this.nextSibling;
                    let previousSibling = this.previousSibling;
                    let parentElement = this.parentElement;

                    //let store = this.ownerDocument.store
                    ////this.ownerDocument.store = (this.ownerDocument.store || xover.stores[xover.data.hashTagName(this.ownerDocument)]) /*Se comenta para que quede el antecedente de que puede traer problemas de desempeño este enfoque. Nada grave*/
                    //if (store) { /*Asumimos que el store es administrado correctamente por la misma clase. Garantizar que se mantenga la referencia*/
                    //    store.takeSnapshot();
                    //}
                    //let context_store = this.store;
                    //if (context_store) {
                    //    context_store.save();
                    //}
                    let event_type = 'remove', node = this;
                    //let matching_listeners = xover.listener.matches(node, event_type);

                    Element.remove.apply(this, arguments);

                    let descriptor = Object.getPropertyDescriptor(this, 'formerParentNode') || { writable: true };
                    if (!this.formerParentNode && (descriptor.hasOwnProperty("writable") ? descriptor.writable : true)) {
                        let node = this;
                        let descriptor_formerParentNode = Object.getPropertyDescriptor(node, 'formerParentNode') || { writable: true };
                        if (!node.formerParentNode && (descriptor_formerParentNode.hasOwnProperty("writable") ? descriptor_formerParentNode.writable : true)) {
                            Object.defineProperty(node, 'formerParentNode', { value: parentNode, writable: true, configurable: true });
                        }
                        let descriptor_formerPreviousSibling = Object.getPropertyDescriptor(node, 'formerPreviousSibling') || { writable: true };
                        if (!node.formerPreviousSibling && (descriptor_formerPreviousSibling.hasOwnProperty("writable") ? descriptor_formerPreviousSibling.writable : true)) {
                            Object.defineProperty(node, 'formerPreviousSibling', { value: previousSibling, writable: true, configurable: true });
                        }
                        let descriptor_formerNextSibling = Object.getPropertyDescriptor(node, 'formerNextSibling') || { writable: true };
                        if (!node.formerNextSibling && (descriptor_formerNextSibling.hasOwnProperty("writable") ? descriptor_formerNextSibling.writable : true)) {
                            Object.defineProperty(node, 'formerNextSibling', { value: nextSibling, writable: true, configurable: true });
                        }
                    }
                    //if (this.ownerDocument.selectSingleNode && store) {
                    //    //let refresh = !parent.selectSingleNode('//@state:refresh');
                    //    //if (refresh) {
                    //    //store = (store || xover.stores[xover.data.hashTagName(this.ownerDocument)])
                    //    if (store) {
                    //        if (parentElement) {
                    //            //parentNode.setAttributeNS(xover.spaces["state"], "state:refresh", "true");
                    //            ////parentNode = (parentNode.ownerDocument.store.find(parentNode) || parentNode); //Se quita para que la operación de borrado sólo ocurra en el documento actual
                    //            store.render();
                    //        } /*else { //Removed because replaceBy removes everything and then inserts new_elements
                    //            delete xover.stores[store.tag]
                    //        }*/
                    //    }
                    //    //}
                    //    //parentNode.setAttributeNS(null, "state:refresh", "true");
                    //    //parentNode.ownerDocument.store = (parentNode.ownerDocument.store || xover.stores[xover.data.hashTagName(parentNode.ownerDocument)]);
                    //    //parentNode.setAttributeNS(xover.spaces["state"], "state:refresh", "true");
                    //    //return new Promise(resolve => {
                    //    //    setTimeout(() => {
                    //    //        xover.stores.active.render();
                    //    //        resolve(true);
                    //    //    }, 50);
                    //    //});
                    //window.top.dispatchEvent(new xover.listener.Event('remove', { listeners: matching_listeners }, this));
                    //}
                    /*!(this instanceof HTMLElement) && xover.site.sections.filter(el => el.store && el.store === this.store).forEach((el) => el.render())*/
                    return this;
                }

                Node.prototype.removeChild = function (child) {
                    let parentNode = this;
                    Element.removeChild.call(this, child);
                    let descriptor = Object.getPropertyDescriptor(child, 'formerParentNode') || { writable: true };
                    if (!child.parentNode && (descriptor.hasOwnProperty("writable") ? descriptor.writable : true)) {
                        Object.defineProperty(child, 'formerParentNode', { value: parentNode, writable: true }); //Si un elemento es borrado, pierde la referencia de parentElement y parentNode, pero con esto recuperamos cuando menos la de parentNode. La de parentElement no la recuperamos para que de esa forma sepamos que es un elemento que está desconectado. Métodos como "closest" dejan de funcionar cuando el elemento ya fue borrado.
                    }
                    return child;
                }

                Element.prototype.setAttributes = async function (attributes) {
                    if (!attributes) return;
                    self = this
                    let responses = [];
                    for (let [attribute, value] of Object.entries(attributes)) {
                        responses.push(self.setAttribute(attribute, value));
                    }
                    return responses;
                }

                Node.textContent = Node.textContent || Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
                Object.defineProperty(Node.prototype, 'textContent',
                    // Passing innerText or innerText.get directly does not work,
                    // wrapper function is required.
                    {
                        get: function () {
                            return Node.textContent.get.call(this);
                        },
                        set: function (value) {
                            if (this.textContent != value) {
                                Node.textContent.set.call(this, value);
                                if (this.namespaceURI && this.namespaceURI.indexOf('www.w3.org') != -1 && this.selectSingleNode(`//xsl:comment/text()[contains(.,'Session stylesheet')]`)) {
                                    this.ownerDocument.store.render(); //xover.stores.active.documentElement && xover.stores.active.documentElement.setAttributeNS(xover.spaces["state"], "state:refresh", "true");
                                }
                                return Node.textContent.set.call(this, value);
                            } else {
                                return Node.textContent.set.call(this, value);
                            }
                        }
                    }
                );

                Object.defineProperty(Node.prototype, 'value',
                    {
                        get: function () {
                            let value = this.textContent;
                            if (this instanceof Comment && value.indexOf("ack:") == 0) {
                                value = ''
                            }
                            return value;
                        },
                        set: function (value) {
                            this.textContent = value;
                        }
                    }
                );

                Object.defineProperty(Text.prototype, 'value',
                    {
                        get: function () {
                            return this.textContent;
                        },
                        set: function (value) {
                            this.textContent = value;
                        }
                    }
                );

                Object.defineProperty(ProcessingInstruction.prototype, 'textContent',
                    // Passing innerText or innerText.get directly does not work,
                    // wrapper function is required.
                    {
                        get: function () {
                            return Node.textContent.get.call(this);
                        },
                        set: function (value) {
                            if (this.textContent != value) {
                                this.replaceBy(this.ownerDocument.createProcessingInstruction('xml-stylesheet', value));
                                Node.textContent.set.call(this, value);
                                if (this.namespaceURI && this.namespaceURI.indexOf('www.w3.org') != -1 && this.selectSingleNode(`//xsl:comment/text()[contains(.,'Session stylesheet')]`)) {
                                    this.ownerDocument.store.render(); //xover.stores.active.documentElement && xover.stores.active.documentElement.setAttributeNS(xover.spaces["state"], "state:refresh", "true");
                                } else if (this.ownerDocument && this.ownerDocument.selectSingleNode && this.ownerDocument.store) {
                                    //this.setAttributeNS(xover.spaces["state"], "state:refresh", "true");
                                    this.ownerDocument.store.render();
                                }
                                return Node.textContent.set.call(this, value);
                            } else {
                                return Node.textContent.set.call(this, value);
                            }
                        }
                    }
                );

                Object.defineProperty(Array.prototype, 'searchText',
                    {
                        value: function (search, { caseSensitive = false, accentSensitive = false, literal = true } = {}) {

                            if (!accentSensitive) {
                                search = search.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                            }
                            if (literal) {
                                search = search.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
                                search = search.replace(/[\s]/g, '\\$&+');
                            }
                            search = new RegExp(search, caseSensitive ? "" : "i");

                            return this.filter(el => el.value && el.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "").match(search) || typeof (el) === 'string' && el.normalize('NFD').replace(/[\u0300-\u036f]/g, "").match(search) || typeof (el.toString) === 'function' && el.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, "").match(search));
                        },
                        writable: true, enumerable: false, configurable: false
                    }
                );

                var removeAll = {
                    value: function (...args) {
                        let items = this instanceof Array && this || args;
                        args = this instanceof Array && args || [];
                        let removed = [];
                        for (let i = items.length; i > 0; --i) {
                            let el = items.pop();
                            removed.unshift(el);
                            if (typeof (el) == 'object' && el && "remove" in el) {
                                el.remove.apply(el, args);
                            }
                        }
                        return removed;
                    },
                    writable: false, enumerable: false, configurable: false
                }

                Object.defineProperty(Array.prototype, 'removeAll', removeAll);
                Object.defineProperty(Array.prototype, 'remove', removeAll);

                var element_proxy = new Proxy(Node, {
                    get: function (target, name) {
                        return target[name];
                    },
                    set: async function (target, name, value) {
                        let refresh;
                        if (value && ['object', 'function'].includes(typeof (value))) {
                            throw (new Error('State value is not valid type'));
                        }
                        if (target[name] != value) {
                            refresh = true
                        }
                        target[name] = value
                        let return_value
                        if (refresh) {
                            let name = name, value = value;
                            await self.sources.load();
                            if ([...Object.values(self.sources || {})].filter(stylesheet => {
                                return !!(stylesheet || window.document.createElement('p')).selectSingleNode(`//xsl:stylesheet/xsl:param[@name='state:${name}']`)
                            }).length) {
                                console.log(`Rendering ${document.tag} triggered by state:${name}`);
                                self.render(/*true*/);
                            };
                        }
                    }
                })

                if (!Document.prototype.hasOwnProperty('reactive')) {
                    Object.defineProperty(Document.prototype, 'reactive', {
                        get: function () {
                            return !(this.disconnected)
                        },
                        enumerable: true,
                        configurable: true
                    })
                }

                if (!Element.prototype.hasOwnProperty('reactive')) {
                    Object.defineProperty(Element.prototype, 'reactive', {
                        get: function () {
                            return this.ownerDocument.reactive && !(this.disconnected || this.disconnected === undefined && (this instanceof HTMLElement || this instanceof SVGElement || ['http://www.w3.org/1999/XSL/Transform'].includes(this.namespaceURI)))
                        },
                        enumerable: true,
                        configurable: true
                    })
                }

                if (!Attr.prototype.hasOwnProperty('reactive')) {
                    Object.defineProperty(Attr.prototype, 'reactive', {
                        get: function () {
                            return this.disconnected === undefined ? this.ownerElement && this.ownerElement.reactive : !this.disconnected;
                        },
                        enumerable: true,
                        configurable: true
                    })
                }

                if (!Text.prototype.hasOwnProperty('reactive')) {
                    Object.defineProperty(Text.prototype, 'reactive', {
                        get: function () {
                            return this.disconnected === undefined ? this.parentElement && this.parentElement.reactive : !this.disconnected;
                        },
                        enumerable: true,
                        configurable: true
                    })
                }

                if (!Node.prototype.hasOwnProperty('silenced')) {
                    Object.defineProperty(Node.prototype, 'silenced', {
                        get: function () {
                            return !![...xover.listener.silenced].find(([xpath, enabled]) => enabled && this.matches(xpath))
                        }
                    })
                }

                if (!Node.prototype.hasOwnProperty('disconnect')) {
                    Object.defineProperty(Node.prototype, 'disconnect', {
                        value: function (reconnect = 1) {
                            if (this.disconnected) reconnect = 0;
                            this.disconnected = true;
                            //let observer;
                            //if (this instanceof Document && this.observer) {
                            //    observer = (this.ownerDocument || this).observer;
                            //}
                            //observer && observer.disconnect(reconnect);
                            //if (reconnect) {
                            //    xover.delay(reconnect).then(async () => {
                            //        this.connect();
                            //        observer && observer.connect();
                            //    });
                            //}

                            let document = (this.ownerDocument || this);
                            //xover.delay(reconnect).then(() => {
                            //    this.disconnected && this.connect();
                            //});

                            for (let [observer, config] of document.observers || []) {
                                let pending_records = observer.takeRecords();
                                observer.disconnect();
                                if (reconnect || pending_records.length) {
                                    xover.delay(reconnect).then(() => {
                                        observer.observe(document, config);
                                    });
                                }
                            }
                        }
                    })
                }

                MutationObserver.observe = MutationObserver.observe || MutationObserver.prototype.observe;
                MutationObserver.prototype.observe = function (target, options) {
                    target.observers = target.observers || new Map();
                    target.observers.set(this, options)
                    return MutationObserver.observe.apply(this, arguments);
                }

                if (!Node.prototype.hasOwnProperty('connect')) {
                    Object.defineProperty(Node.prototype, 'connect', {
                        value: function () {
                            //let observer;
                            //if (this instanceof Document && this.observer) {
                            //    observer = (this.ownerDocument || this).observer;
                            //}
                            //observer && observer.connect();
                            delete this.disconnected
                            let document = (this.ownerDocument || this);
                            for (let [observer, config] of document.observers || []) {
                                observer.observe(document, config);
                            }
                        }
                    })
                }

                if (!Node.prototype.hasOwnProperty('freeze')) {
                    Object.defineProperty(Node.prototype, 'freeze', {
                        value: function (reconnect = 1) {
                            this.frozen = true;
                            if (reconnect) {
                                xover.delay(reconnect).then(async () => {
                                    this.unfreeze();
                                });
                            }
                        }
                    })
                }

                if (!Node.prototype.hasOwnProperty('unfreeze')) {
                    Object.defineProperty(Node.prototype, 'unfreeze', {
                        value: function () {
                            delete this.frozen
                        }
                    })
                }


                HTMLElement.prototype.silenceAttribute = function (attr) {
                    this.silencedAttributes = this.silencedAttributes || new Map();
                    if (attr) {
                        this.silencedAttributes.set(attr instanceof Attr ? attr.name : attr, false)
                    }
                    return this.silencedAttributes;
                }

                Element.prototype.setAttributeNS = function (namespace, attribute, value, options = {}) {
                    if (options.silent) {
                        typeof (this.silenceAttribute) == 'function' && this.silenceAttribute(attribute)
                    }
                    if (!this.reactive || options.silent) {
                        if (value == null) {
                            Element.removeAttributeNS.call(this, namespace, attribute);
                        } else {
                            Element.setAttributeNS.call(this, namespace, attribute, value);
                        }
                        return this;
                    }
                    let target = this;
                    let attribute_node;
                    if (namespace) {
                        let { prefix, name: attribute_name } = xover.xml.getAttributeParts(attribute);
                        attribute_node = target.getAttributeNodeNS(namespace, attribute_name)
                    } else {
                        attribute_node = target.getAttributeNode(attribute)
                    }

                    attribute_node = attribute_node || this.createAttributeNS(namespace, attribute, value);
                    attribute_node.value = value;
                    return this;
                }

                Element.prototype.setAttribute = function (attribute, value, options = {}) {
                    if (!attribute) return Promise.reject("No attribute set");
                    if (arguments.length < 2 && !(attribute instanceof Attr)) return Promise.reject("Missing value on setAttribute");
                    let namespace;
                    if (attribute instanceof Attr) {
                        value = [value, attribute.value].coalesce();
                        namespace = attribute.namespaceURI;
                        attribute = attribute.name;
                    }
                    let target = this;
                    if (attribute.indexOf(':') != -1) {
                        let { prefix, name: attribute_name } = xover.xml.getAttributeParts(attribute);
                        namespace = namespace || this.resolveNS(prefix) || xover.spaces[prefix];
                        target.setAttributeNS(namespace, attribute, value, options);
                    } else {
                        if (!this.reactive || options.silent) {
                            Element.setAttribute.call(this, attribute, value);
                        } else {
                            target.setAttributeNS(namespace || "", attribute, value, options);
                        }
                    }
                    return this;
                }

                //Element.prototype.setAttributeNode = function (attribute, options = {}) {
                //    let disconnected = this.disconnected;
                //    if (!this.reactive || options.silent) {
                //        this.disconnect()
                //    }
                //    Element.setAttributeNode.apply(this, [attribute])
                //    if (!disconnected) xover.delay(1).then(() => this.connect())
                //    return this;
                //}

                Element.prototype.set = function (...args) {
                    if (!args.length) return Promise.reject("Nothing to set");
                    if (args[0] instanceof Text) {
                        this.textContent = args[0];
                    } else if (typeof (args[0]) === 'function') {
                        args[0].apply(this, [this]);
                    } else if (typeof (args[0]) === 'string') {
                        let is_attribute = !!args[0].match(/^@/, '');
                        args[0] = args[0].replace(/^@/, '')
                        if (typeof (args[2]) === 'string') {
                            this.setAttributeNS(args[2], args[0], args[1])
                        } else if (args[1] === undefined) {
                            if (this.hasAttribute(args[0])) {
                                this.removeAttribute(args[0])
                            } else {
                                this.textContent = args[0];
                            }
                        } else if (typeof (args[1]) === 'function') {
                            if (this.hasAttribute(args[0])) {
                                this.setAttribute(args[0], args[1])
                            } else {
                                let attribute = this.createAttribute(args[0], null);
                                attribute.value = args[1]
                            }
                        } else {
                            this.setAttribute.apply(this, [args.shift(), args.shift(), ...args])
                        }
                    } else if (args[0] instanceof Attr) {
                        if (typeof (args[args.length - 1]) === 'string') {
                            this.setAttributeNodeNS(args[args.length - 1], args[0])
                        } else {
                            this.setAttributeNode(args[0])
                        }
                    } else if (args[0] instanceof Node) {
                        this.append(args[0]);
                    } else {
                        return Promise.reject("Couldn't set argument")
                    }
                    return this;
                }

                Element.getAttribute = Element.getAttribute || Element.prototype.getAttribute;
                Element.getAttributeNS = Element.getAttributeNS || Element.prototype.getAttributeNS;

                //Element.prototype.getAttribute = function (attribute) {
                //    let target = this;
                //    if (this.ownerDocument && this.ownerDocument.store) {
                //        attribute = attribute.replace(/^@/, "");
                //    }

                //    if (this.hasAttribute(attribute)) {
                //        return Element.getAttribute.call(this, attribute)
                //    }

                //    let attribute_node = target.getAttributeNode(attribute);
                //    return attribute_node ? attribute_node.value : null;
                //}

                let generic_attributeNode = function () {
                    return new Comment("ack:not-supported");
                }
                Comment.prototype.getAttributeNode = generic_attributeNode;
                Attr.prototype.getAttributeNode = generic_attributeNode;
                Text.prototype.getAttributeNode = generic_attributeNode;
                let generic_attribute = function () {
                    return null;
                }
                Text.prototype.getAttribute = generic_attribute;
                Text.prototype.querySelector = generic_attribute;
                let generic_attributeNodeArray = function () {
                    return [];
                }
                Text.prototype.querySelectorAll = generic_attributeNodeArray;
                Element.prototype.getAttributes = function (attributes = []) {
                    let node = this;
                    let return_attributes = Object.fromEntries(Object.values(node.attributes).filter(el => attributes.includes(el.name) || !attributes.length && el.namespaceURI != xover.spaces["xmlns"]).map(el => [el.name, el.value]))
                    return return_attributes;
                }

                Element.prototype.getAttributeNodes = function (attributes = []) {
                    let node = this;
                    let return_attributes = Object.values(node.attributes).filter(el => attributes.includes(el.name) || !attributes.length && el.namespaceURI != xover.spaces["xmlns"]).map(el => el)
                    return return_attributes;
                }

                Element.prototype.attr = function () {
                    return this.getAttribute.apply(this, arguments)
                }

                Element.getAttributeNode = Element.getAttributeNode || Element.prototype.getAttributeNode;
                Element.getAttributeNodeNS = Element.getAttributeNodeNS || Element.prototype.getAttributeNodeNS;
                Element.prototype.getTextNodes = function (attribute) {
                    return [...this.childNodes].filter(node => node instanceof Text)
                }

                Element.prototype.getTextNode = function (attribute) {
                    return this.getTextNodes()[0] || this.createTextNode()
                }

                Element.prototype.getAttributeNode = function (attribute) {
                    attribute = (attribute instanceof Attr ? attribute.value : attribute);

                    if (this.hasAttribute(attribute)) {
                        return Element.getAttributeNode.call(this, attribute)
                    }
                    let namespace;
                    let { prefix, name: attribute_name } = xover.xml.getAttributeParts(attribute);
                    namespace = prefix && (this.resolveNS(prefix) || xover.spaces[prefix]);
                    if (!namespace) {
                        return Element.getAttributeNode.call(this, attribute);
                    } else {
                        return Element.getAttributeNodeNS.call(this, namespace, attribute_name);
                    }
                }

                Element.prototype.getAttributeNodeOrMock = function (...args) {
                    let attribute_node = this.getAttributeNode.apply(this, args) || this.createAttribute.apply(this, [args[0], null, ...args.splice(2)]);
                    return attribute_node;
                }

                Element.prototype.getAttributeNodeNSOrMock = function (...args) {
                    let attribute_node = this.getAttributeNodeNS.apply(this, args) || this.createAttributeNS.apply(this, [args[0], args[1], null, ...args.splice(3)]);
                    return attribute_node;
                }

                Element.prototype.get = function (...args) {
                    let node = this.getAttributeNode.apply(this, args) || this.selectFirst.apply(this, args);
                    return node;
                }

                Element.prototype.createTextNode = function (value = '') {
                    let node = (value === null && this.cloneNode() || this)
                    let parentNode = this;
                    let new_text_node;
                    new_text_node = node.ownerDocument.createTextNode(value || '');
                    Object.defineProperty(new_text_node, 'nil', { get: function () { return !new_text_node.textContent } });
                    this.appendChild(new_text_node)
                    return new_text_node;
                }

                Element.prototype.createAttribute = function (attribute, value = '') {
                    //attribute = attribute.replace(/^@/, "");
                    let node = (value === null && this.cloneNode() || this)
                    let parentNode = this;
                    let new_attribute_node;
                    let { prefix, name: attribute_name } = xover.xml.getAttributeParts(attribute);
                    let namespace = prefix && (this.resolveNS(prefix) || xover.spaces[prefix]);
                    if (!namespace) {
                        Element.setAttribute.call(node, attribute, value);
                    } else {
                        Element.setAttributeNS.call(node, namespace, attribute, value);
                    }
                    new_attribute_node = Element.getAttributeNode.call(node, attribute);
                    if (value === null) {
                        Element.removeAttribute.call(node, attribute);
                        let descriptor = Object.getPropertyDescriptor(new_attribute_node, 'parentNode') || { writable: true };
                        if (descriptor.hasOwnProperty("writable") ? descriptor.writable : true) {
                            Object.defineProperty(new_attribute_node, 'parentNode', { get: function () { return parentNode } });
                        }
                    }
                    Object.defineProperty(new_attribute_node, 'nil', { value: true, writable: true, editable: true });
                    return new_attribute_node;
                }

                Element.prototype.createAttributeNS = function (namespace_URI, attribute, value = '') {
                    //attribute = attribute.replace(/^@/, "");
                    let node = (value === null && this.cloneNode() || this)
                    let parentNode = this;
                    let new_attribute_node;
                    if (namespace_URI) {
                        let { prefix, name: attribute_name } = xover.xml.getAttributeParts(attribute);
                        if (!this.hasAttributeNS(namespace_URI, attribute_name)/* && (this.namespaceURI || '').indexOf("http://www.w3.org") !== 0*/) {
                            Element.setAttributeNS.call(node, namespace_URI, attribute, value);
                        }
                        new_attribute_node = Element.getAttributeNodeNS.call(node, namespace_URI, attribute_name);
                    } else {
                        if (!node.hasAttribute(attribute)/* && (node.namespaceURI || '').indexOf("http://www.w3.org") !== 0*/) {
                            Element.setAttribute.call(node, attribute, value);
                        }
                        new_attribute_node = Element.getAttributeNode.call(node, attribute);
                    }
                    if (value === null) {
                        Element.removeAttribute.call(node, attribute);
                        let descriptor = Object.getPropertyDescriptor(new_attribute_node, 'parentNode') || { writable: true };
                        if (descriptor.hasOwnProperty("writable") ? descriptor.writable : true) {
                            Object.defineProperty(new_attribute_node, 'parentNode', { get: function () { return parentNode } });
                        }
                    }

                    Object.defineProperty(new_attribute_node, 'nil', { value: true, writable: true, editable: true });
                    return new_attribute_node;
                }

                if (!XMLDocument.prototype.hasOwnProperty('body')) {
                    Object.defineProperty(XMLDocument.prototype, 'body', {
                        get: function () {
                            if (this instanceof XMLDocument) {
                                return this.documentElement
                            } else {
                                return this.querySelector('body')
                            }
                        }
                    });
                }

                Element.prototype.toggleAttribute = function (attribute, value, otherwise_value = null) {
                    value = typeof value === 'function' && value.call(this) || value && value.constructor === {}.constructor && JSON.stringify(value) || value != null && String(value) || value;
                    if (this.getAttribute(attribute) == value) {
                        this.setAttribute(attribute, otherwise_value)
                    } else {
                        this.setAttribute(attribute, value)
                    }
                    return this;
                }
                //Element.prototype.toggle = Element.prototype.toggleAttribute;

                xover.listener.on('attributeChanged', function ({ target, attribute, value, old: oldValue }) {
                })

                Element.prototype.removeAttributeNS = function (namespace_URI, attribute, value, refresh = false) {
                    let target = this;
                    let attribute_node = target.getAttributeNodeNS(namespace_URI, attribute);
                    attribute_node && attribute_node.remove();
                }

                Element.prototype.removeAttribute = function (attribute, options = {}) {
                    if (!this.reactive || options.silent) {
                        return_value = Element.removeAttribute.call(this, attribute)
                        return this;
                    }
                    //if (attribute instanceof Attr) {
                    //    value = [value, attribute.value].coalesce();
                    //    attribute = attribute.name;
                    //} else {

                    //if (this.ownerDocument && this.ownerDocument.store) {
                    //    attribute = attribute.replace(/^@/, "");
                    //}
                    let attribute_node = this.getAttributeNode(attribute);
                    attribute_node && attribute_node.remove();
                    return this;
                }

                //Element.prototype.removeAttribute = function (attribute, refresh) {
                //    if (!this.hasAttribute(attribute)) return;
                //    let attribute_node = this.getAttributeNode(attribute);
                //    let beforeRemove = new xover.listener.Event('beforeRemove', { target: attribute_node, srcEvent: event });
                //    xover.listener.dispatchEvent(beforeRemove, attribute_node);
                //    if (beforeRemove.cancelBubble || beforeRemove.defaultPrevented) return;
                //    if (this.ownerDocument.selectSingleNode && this.ownerDocument.store) {
                //        //if (attribute != 'state:refresh' && (xover.manifest.server || {}).login && !(xover.session.status == 'authorized')) {
                //        //    return;
                //        //}
                //        let { prefix, name: attribute_name } = xover.xml.getAttributeParts(attribute);
                //        let refresh = Array.prototype.coalesce(refresh, !(["xml", "xmlns"].includes(prefix) || attribute == 'state:refresh'));
                //        Element.removeAttribute.apply(this, arguments);
                //        if (refresh) {
                //            this.ownerDocument.store.render(refresh);
                //        }
                //        let source = this.ownerDocument.source;
                //        source && source.save();
                //    } else {
                //        Element.removeAttribute.apply(this, arguments);
                //    }
                //    xover.listener.dispatchEvent(new xover.listener.Event('remove', { target: attribute_node, element: this, attribute: attribute_node }), this);
                //}

                Attr.prototype.selectSingleNode = function (xpath) {
                    return this.ownerDocument.selectSingleNode.apply(this, [xpath]);
                }

                Attr.prototype.getPropertyValue = function (property_name) {
                    for (let match of this.value.matchAll(new RegExp(`\\b(${property_name}):([^;]+)`, 'g'))) {
                        return match[2]
                    }
                }

                Attr.prototype.setPropertyValue = function (property_name, value) {
                    this.value = this.value.replace(new RegExp(`\\b(${property_name}):([^;]+)`, 'g'), (match, property) => `${property}:${value}`)
                }

                //Object.defineProperty(Attr.prototype, 'source', {
                //    get: function () {
                //        return xover.sources[this.nodeName]
                //    }
                //})

                //var original_document_documentElement = Object.getOwnPropertyDescriptor(Document.prototype, 'documentElement');
                //Object.defineProperty(Document.prototype, 'documentElement', {
                //    get: function () {
                //        let _documentElement = original_document_documentElement.get.call(this) || this.source && this.fetch && this.fetch() || null;
                //        return original_document_documentElement.get.call(this);
                //    },
                //    set: function (value) { }
                //});


                //Event.srcElement = Event.srcElement || Object.getOwnPropertyDescriptor(Event.prototype, 'srcElement');
                //Object.defineProperty(Event.prototype, 'srcElement', {
                //    get: function () {
                //        let return_value = Event.srcElement.get.call(this);
                //        return_value.event = this;
                //        return return_value
                //    }
                //})

                Object.defineProperty(Attr.prototype, 'value',
                    // Passing innerText or innerText.get directly does not work,
                    // wrapper function is required.
                    {
                        get: function () {
                            return this.nil ? null : Attr.value.get.call(this);
                        },
                        set: function (value) {
                            if (!this.ownerDocument.contains(this.parentNode)) {
                                return Attr.value.set.call(this, value);
                            }
                            if (this.frozen) return this;
                            if (event && (event.type || "").split(/::/, 1).shift() == 'beforeChange' && this.name == ((event.detail || {}).target || {}).name) {
                                event.preventDefault();
                            }
                            if (typeof value === 'function') {
                                value = value.call(this, this);
                            }
                            let old_value = this.value;
                            let set_event = new xover.listener.Event('set', { element: this.parentNode, attribute: this, value: value, old: old_value }, this);
                            window.top.dispatchEvent(set_event);
                            if (set_event.defaultPrevented) return;
                            value = (set_event.detail || {}).hasOwnProperty("returnValue") ? set_event.detail.returnValue : value;

                            if (value instanceof Node) {
                                value = value.value
                            } else if (value && value.constructor === {}.constructor) {
                                value = JSON.stringify(value)
                            }
                            let target = this;
                            let target_node = this.parentNode;
                            let attribute_name = this.localName;
                            //let store = /*this.store || */this.ownerDocument.store;
                            //let source = store && store.source || null;
                            let return_value;
                            if (value != null) {
                                value = `${value}`
                            };

                            if (old_value !== value) {
                                let before = new xover.listener.Event('beforeChange', { element: this.parentNode, attribute: this, value: value, old: old_value }, this);
                                if (!(event && (event.type || "").split(/::/, 1).shift() == 'beforeChange')) {
                                    (old_value != value || event && (event.type || "").split(/::/, 1).shift() == 'change') && window.top.dispatchEvent(before);
                                }
                                value = (before.detail || {}).hasOwnProperty("returnValue") ? before.detail.returnValue : value;
                                //if (before.cancelBubble || before.defaultPrevented) return;
                            }
                            if (!this.ownerElement && value !== undefined && value !== null) {
                                Attr.value.set.call(this, value);
                                this.parentNode.setAttributeNode(this);
                            }
                            if (value === null || value === undefined) {
                                this.nil = true;
                                this.ownerElement && this.remove()
                            } else {
                                this.nil = false;
                                Attr.value.set.call(this, value);
                            }
                            //if (old_value !== value) {
                            //    if (!(old_value === null && this.namespaceURI === 'http://panax.io/xover' && this.localName === 'id')) {
                            //        //window.top.dispatchEvent(new xover.listener.Event('change', { element: this.parentNode, attribute: this, value: value, old: old_value }, this));
                            //        if ((this.namespaceURI || '').indexOf("http://panax.io/state") != -1 || Object.values(xover.site.get(this.name) || {}).length) {
                            //            xover.site.set(this.name, new Object.push(this.parentNode.getAttribute("xo:id"), value))
                            //        }
                            //        //let source = this.ownerDocument.source;
                            //        //source && source.save && source.save();

                            //        ////let context = ((event || {}).srcEvent || event || {}).target && event.srcEvent.target.closest('*[xo-stylesheet]') || store;
                            //        ////context && context.render();
                            //        //let prefixes = Object.entries(xover.spaces).filter(([key, value]) => this.namespaceURI.indexOf(value) == 0).map(([key]) => key);
                            //        //[...top.document.querySelectorAll('[xo-stylesheet]'), ...top.document.querySelectorAll(`[xo-slot="${this.name}"]`)].filter(el => el.store === store).filter(el => el.get('xo-slot') || el.stylesheet.selectFirst(`xsl:stylesheet/xsl:param[@name="${this.name}"]${prefixes.map(prefix => `|xsl:stylesheet/xsl:param[@name="${prefix}:dirty"]`).join('')}`)).forEach((el) => el.render())
                            //    }
                            //}
                            return return_value;

                        }
                    }
                );

                Object.defineProperty(Attr.prototype, 'get', {
                    value: function (name) {
                        return this.nodeName == (name || this.nodeName) && this.value || null;
                    }
                });

                Object.defineProperty(Node.prototype, 'namespaceURI',
                    {
                        get: function () {
                            return Node.namespaceURI && Node.namespaceURI.get.call(this) || "";
                        },
                        set: function (value) {
                            return Node.namespaceURI && Node.namespaceURI.set.call(this);

                        }
                    }
                );

                Attr.namespaceURI = Attr.namespaceURI || Object.getOwnPropertyDescriptor(Attr.prototype, 'namespaceURI');
                Object.defineProperty(Attr.prototype, 'namespaceURI',
                    {
                        get: function () {
                            return Attr.namespaceURI.get.call(this) || "";
                        },
                        set: function (value) {
                            return Attr.namespaceURI.set.call(this);

                        }
                    }
                );

                HTMLTextAreaElement.value = HTMLTextAreaElement.value || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
                HTMLSelectElement.value = HTMLSelectElement.value || Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
                var value_handler = {
                    get: function () {
                        return this.constructor.value.get.call(this);
                    },
                    set: function (value) {
                        let return_value = this.constructor.value.set.call(this, [value]);
                        this.dispatchEvent(new Event('change'));
                        return return_value;
                    }
                }

                Object.defineProperty(HTMLTextAreaElement.prototype, 'value', value_handler);
                Object.defineProperty(HTMLSelectElement.prototype, 'value', value_handler);

                Attr.prototype.set = function (value, options = {}) {
                    //let disconnected = this.disconnected;
                    //if (options.silent) {
                    //    this.disconnect()
                    //}
                    this.value = value;
                    //if (!disconnected) this.connect()
                    ////if (!disconnected) xover.delay(100).then(() => this.connect())
                    return this;
                }

                Object.defineProperty(Comment.prototype, 'metadata', {
                    get: function () {
                        let info = xover.xml.createNode(this.data);
                        return `template ${info.textContent.replace(/\n/g, '')}`
                    }
                });

                Object.defineProperty(Comment.prototype, 'template', {
                    get: function () {
                        let info = xover.xml.createNode(this.data.replace(/- -/g, '--'));
                        let attributes = xover.json.fromAttributes(info.textContent);
                        let xpath = Object.entries(attributes).map(([key, value]) => `@${key}="${value}"`).join(' and ');
                        let source = xover.sources[info.getAttribute("file")].cloneNode(true);
                        source.select(`//xsl:comment[contains(.,'<template')]`).remove();
                        let matches = source.selectNodes(`//xsl:template[${xpath}]`);
                        let node = matches.pop();
                        node.prepend(node.ownerDocument.createComment(`ack:source-file: ${info.getAttribute("file")}`));
                        return node;
                    }
                });

                Object.defineProperty(Node.prototype, 'trace', {
                    value: function () {
                        try {
                            return this.select(`./comment()[starts-with(normalize-space(.),'debug:trace')]`).map(comment => comment.trace()).flat();
                        } catch (e) {
                            console.log(e);
                            return null;
                        }
                    }, writable: true, enumerable: false, configurable: false
                });

                Object.defineProperty(Comment.prototype, 'trace', {
                    value: function () {
                        try {
                            return this.section.document.select(this.textContent.replace(/^debug:trace=/, '').split(/;/).map(ref => ref.replace(/^[^/]+/, `.//*[@xo:id="$&"]`)).join('|'))
                        } catch (e) {
                            console.log(e)
                            return null;
                        }
                    }
                });

                Comment.prototype.set = function (value) {
                    if (this.textContent !== "ack:no_match") {
                        this.textContent = value
                    }
                    return this;
                }

                Comment.prototype.get = function (value) {
                    if (this.textContent === value) {
                        return this.ownerDocument.createTextNode(this.textContent);
                    }
                    return null;
                }

                Element.prototype.has = function (attribute_name) {
                    return !!this.getAttributeNode(attribute_name);
                }

                Attr.prototype.toggle = function (value, else_value) {
                    value = typeof value === 'function' && value.call(this, this.value) || value && value.constructor === {}.constructor && JSON.stringify(value) || value != null && String(value) || value;
                    //if (this.value != value) {
                    //this.parentNode.store && this.parentNode.store.render();
                    //}
                    if (this.value == value) {
                        this.value = else_value
                    } else {
                        this.value = value
                    }
                    //let source = this.ownerDocument.source;
                    //source && source.save();
                    return this;
                }

                if (!Text.prototype.hasOwnProperty('get')) {
                    Text.prototype.reactive = function (value) { }
                }

                if (!Text.prototype.hasOwnProperty('get')) {
                    Text.prototype.get = function (key) { }
                }

                if (!Text.prototype.hasOwnProperty('set')) {
                    Text.prototype.set = function (value) {
                        value = typeof value === 'function' && value(this) || value && value.constructor === {}.constructor && JSON.stringify(value) || value != null && String(value) || value;
                        let new_value = this.ownerDocument.createTextNode(value);
                        if (this.reactive) {
                            let old_value = this.textContent;
                            let before_set = new xover.listener.Event('set', { element: this.parentNode, attribute: this, value: new_value, old: old_value }, this);
                            window.top.dispatchEvent(before_set);
                            if (before_set.defaultPrevented || event.cancelBubble) return;
                            if (old_value == new_value) return;
                            let before = new xover.listener.Event('beforeChange', { element: this.parentNode, attribute: this, value: new_value, old: old_value }, this);
                            window.top.dispatchEvent(before);
                        }
                        this.textContent = new_value;
                        return this;
                    }
                }

                if (!Attr.prototype.hasOwnProperty('parentNode')) {
                    Object.defineProperty(Attr.prototype, 'parentNode', {
                        get: function () {
                            return this.ownerElement;
                        }
                    })
                }

                ProcessingInstruction.remove = ProcessingInstruction.remove || ProcessingInstruction.prototype.remove;
                ProcessingInstruction.prototype.remove = function (refresh = true) {
                    ProcessingInstruction.remove.apply(this, arguments);
                    if (this.ownerDocument && this.ownerDocument.store) {
                        [document.querySelector(`[xo-source="${this.ownerDocument.store.tag}"][xo-stylesheet='${xover.json.fromAttributes(this.textContent)["href"]}']`)].map(el => el && el.remove());
                        this.ownerDocument.store.removeStylesheet(this);
                    }
                }

                ProcessingInstruction.prototype.replaceBy = function (new_element) {
                    if (new_element !== this) {
                        this.parentNode.insertBefore(new_element, this);
                        return ProcessingInstruction.remove.apply(this, arguments);
                    } else {
                        return this;
                    }
                }

                Node.prototype.replace = function (new_node) {
                    new_node = (new_node.documentElement || new_node)
                    return this.parentNode && this.parentNode.replaceChild(new_node/*.cloneNode(true)*/, this) || new_node;
                }

                Attr.replace = Attr.replace || Attr.prototype.replace;
                Attr.prototype.replace = function (...args) {
                    if (args[0] instanceof Attr) {
                        return Attr.replace.apply(this, args)
                    } else if (typeof (args[0]) == 'string' || args[0] instanceof RegExp) {
                        this.value = this.value.replace(args[0], args[1])
                        return this;
                    }
                }

                Node.prototype.replaceContent = function (...nodes) {
                    while (this.firstChild) {
                        this.firstChild.remove();
                    }
                    if (nodes && nodes.length) {
                        this.append(...nodes);
                    }
                };

                if (typeof Node.prototype.replaceChildren !== 'function') {
                    Node.prototype.replaceChildren = function (...nodes) {
                        while (this.firstChild) {
                            this.firstChild.remove();
                        }
                        if (nodes && nodes.length) {
                            this.append(...nodes);
                        }
                    };
                }

                Element.clear = Element.clear || Element.prototype.clear;
                Element.prototype.clear = function () {
                    this.replaceChildren()
                }

                Document.prototype.clear = Element.prototype.clear;

                Node.prototype.replaceBy = function (new_node) {
                    let parent_node = this.parentNode;
                    if (!parent_node) {
                        return new_node
                    }
                    new_node = (new_node.documentElement || new_node);
                    return this.parentNode.replaceChild(new_node.cloneNode(true), this);
                }

                Document.prototype.replaceBy = function (new_document) {
                    if (new_document !== this) {
                        while (this.firstChild) {
                            this.removeChild(this.lastChild);
                        }
                        if (new_document.childNodes) {
                            for (let node of new_document.childNodes) {
                                if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
                                    this.appendChild(node)
                                }
                            }
                            this.append(...new_document.childNodes.toArray().filter(node => ![3, 10].includes(node.nodeType)))
                        }
                    }
                    return this;
                }

                Node.prototype.replaceChild = function (new_node, target, refresh = true) {
                    new_node = (new_node.documentElement || new_node);
                    let beforeEvent = new xover.listener.Event('beforeAppendTo', { target: this.parentElement, srcEvent: event }, this.parentElement);
                    window.top.dispatchEvent(beforeEvent);
                    if (beforeEvent.cancelBubble || beforeEvent.defaultPrevented) return;
                    if ((this.ownerDocument || this) instanceof XMLDocument) {
                        let store = this.store;
                        //if ((xover.manifest.server || {}).login && !(xover.session.status == 'authorized')) {
                        //    return;
                        //}
                        ////refresh = (refresh ?? !!xover.stores.getActive()[this.ownerDocument.store.tag]);
                        //this.ownerDocument.documentElement.setAttributeNS(xover.spaces["state"], 'state:refresh', 'true', refresh);
                        let result = Element.replaceChild.apply(this, [new_node, target]);
                        if (this.selectSingleNode(`//xsl:comment/text()[contains(.,'Session stylesheet')]`)) {
                            /*Update of session variables*/
                            let attribute = new_node;
                            Object.values(xover.stores).map(store => {
                                (store.documentElement || document.createElement("p")).setAttribute(attribute.getAttribute("name"), attribute.textContent.replace(/[\s]+$/, ''));
                            });
                        }
                        if (refresh && store) store.render()
                    } else {
                        Element.replaceChild.apply(this, [new_node, target]);
                    }
                    window.top.dispatchEvent(new xover.listener.Event('appendTo', { target: this.parentElement, srcEvent: event }, this.parentElement));
                    return new_node;
                }

                Attr.prototype.remove = function (options = {}) {
                    if (!this.reactive || options.silent) {
                        this.removing = true;
                        if (this.namespaceURI) {
                            return_value = Element.removeAttributeNS.call(this.parentNode, this.namespaceURI, this.localName)
                        } else {
                            return_value = Element.removeAttribute.call(this.parentNode, this.name)
                        }
                        return this;
                    }
                    let parentNode = this.parentNode;
                    let ownerElement = this.ownerElement;
                    if (ownerElement) {
                        let return_value;
                        let event_type = 'remove', node = this;
                        this.oldValue = Attr.value.get.call(this);
                        let matching_listeners; //= xover.listener.matches(node, event_type);
                        if (this.namespaceURI) {
                            return_value = Element.removeAttributeNS.call(this.parentNode, this.namespaceURI, this.localName)
                        } else {
                            return_value = Element.removeAttribute.call(this.parentNode, this.name)
                        }
                        let descriptor = Object.getPropertyDescriptor(this, 'parentNode') || { writable: true };
                        if (!(this.parentNode) && (descriptor.hasOwnProperty("writable") ? descriptor.writable : true)) {
                            Object.defineProperty(this, 'parentNode', { get: function () { return parentNode } }); //Si un elemento es borrado, pierde la referencia de ownerElement y parentNode, pero con esto recuperamos cuando menos la de parentNode. La de parentElement no la recuperamos para que de esa forma sepamos que es un elemento que está desconectado. Métodos como "closest" dejan de funcionar cuando el elemento ya fue borrado.
                        }
                        this.value = null;
                        //window.top.dispatchEvent(new xover.listener.Event('remove', { listeners: matching_listeners }, this));
                        return return_value;
                    }
                }

                Element.prototype.getNamespaces = function () {
                    return Object.fromEntries([this, ...this.querySelectorAll("*")].map(el => [...el.attributes].filter(attr => attr.namespaceURI === 'http://www.w3.org/2000/xmlns/')).flat(Infinity).map(attr => [attr.localName, attr.value]));
                }

                Element.insertBefore = Element.insertBefore || Element.prototype.insertBefore
                Element.prototype.insertBefore = function (new_node, options = {}) {
                    if ((this.ownerDocument || this) instanceof XMLDocument) {
                        //if ((xover.manifest.server || {}).login && !(xover.session.status == 'authorized')) {
                        //    return;
                        //}
                        Element.insertBefore.apply(this, arguments);
                        if (this.selectSingleNode(`//xsl:comment/text()[contains(.,'Session stylesheet')]`)) {
                            /*Update of session variables*/
                            let attribute = new_node;
                            Object.values(xover.stores).map(store => {
                                (store.documentElement || document.createElement("p")).setAttribute(attribute.getAttribute("name"), attribute.textContent.replace(/[\s]+$/, ''));
                            });
                        }
                        //if (this.ownerDocument.store) {
                        //    this.ownerDocument.store.render();
                        //}
                        //window.top.dispatchEvent(new xover.listener.Event('change', { node: this }, this));
                        //window.top.dispatchEvent(new xover.listener.Event('insert', { node: this }, this));
                    } else {
                        Element.insertBefore.apply(this, arguments);
                    }
                }

                Element.append = Element.append || Element.prototype.append
                Element.prototype.append = function (...args) {
                    if (this.frozen) return this;
                    if (!args.length) return;
                    let options = {};
                    if ((args[args.length - 1] || '').constructor === {}.constructor) {
                        options = args.pop();
                    }
                    if (!this.reactive || options.silent) {
                        try {
                            Element.append.apply(this, args);
                        } catch (e) {
                            if (e.name == 'RangeError') {
                                let array = args
                                let chunkSize = 9999;
                                let index = 0;
                                while (index < array.length) {
                                    Element.append.apply(this, (array.slice(index, index + chunkSize)));
                                    index += chunkSize;
                                }
                            }
                        }
                        return args;
                    }
                    if (!(args.length)) return [];
                    args.forEach(el => {
                        let beforeEvent = new xover.listener.Event('beforeAppend', { target: this, args: args }, el);
                        window.top.dispatchEvent(beforeEvent);
                        if (beforeEvent.cancelBubble || beforeEvent.defaultPrevented) el.remove();
                    })
                    let beforeEvent = new xover.listener.Event('beforeAppendTo', { target: this, args: args, srcEvent: event }, this);
                    window.top.dispatchEvent(beforeEvent);
                    if (beforeEvent.cancelBubble || beforeEvent.defaultPrevented) return;
                    Element.append.apply(this, args);
                    if (!(this instanceof HTMLElement) && this.store) this.seed();
                    return args;
                }

                Node.prototype.appendAfter = function (new_node) {
                    return this.parentNode.insertBefore((new_node.documentElement || new_node), this.nextElementSibling);
                }

                Node.prototype.appendBefore = function (new_node) {
                    return this.parentNode.insertBefore((new_node.documentElement || new_node), this);
                }

                Node.prototype.insertFirst = function (new_node) {
                    let node = this;
                    return node.insertBefore((new_node.documentElement || new_node), node.firstChild);
                }

                Node.prototype.insertAfter = function (new_node, reference_node) {
                    let node = this;
                    if (node && node.nextElementSibling) {
                        return node.parentNode.insertBefore(new_node, node.nextElementSibling);
                    } else {
                        return (reference_node || (node || {}).parentNode).appendChild(new_node);
                    }
                }

                Node.prototype.moveTo = function (target, position = 'child') {
                    let source = this;
                    switch (position) {
                        case 'child':
                            target.appendChild(source);
                            break;
                        case 'before':
                            target.appendBefore(source)
                            break;
                        case 'after':
                            target.appendAfter(source)
                            break;
                        default:
                            throw (new Error('Invalid option'));
                    }
                }

                Node.prototype.duplicate = function (options = { seed: true }) {
                    let new_node = this.cloneNode(true);
                    this.appendAfter(new_node);
                    if (options instanceof Object && options.seed && new_node.hasAttributeNS("http://panax.io/xover", "id")) {
                        new_node = new_node.seed(true);
                    }
                    return new_node;
                }

                Document.prototype.seed = function () {
                    this.documentElement && this.documentElement.seed();
                    return this;
                }

                let originalCloneNode = XMLDocument.prototype.cloneNode;
                XMLDocument.prototype.cloneNode = function (...args) {
                    let cloned_element = originalCloneNode.apply(this, args);
                    cloned_element.source = this.source;
                    cloned_element.store = this.store;
                    cloned_element.href = this.href;
                    cloned_element.url = this.url;
                    return cloned_element;
                }

                Element.prototype.seed = function (reseed) {
                    ////if (navigator.userAgent.indexOf("Safari") == -1) {
                    ////    this = xover.xml.transform(this, "xover/normalize_namespaces.xslt");
                    ////}
                    ////try {
                    if (reseed) {
                        this.selectNodes('.//@xo:id').remove()
                    }
                    //let observer = this.ownerDocument && this.ownerDocument.observer
                    //let reconnect = !document.disconnected;
                    //observer && observer.disconnect(0)
                    this.selectNodes(`descendant-or-self::*[not(@xo:id!="")]`).forEach(node => Element.setAttributeNS.call(node, xover.spaces["xo"], 'xo:id', (function (node) { return `${node.nodeName}_${xover.cryptography.generateUUID()}`.replace(/[:-]/g, '_') })(node)));
                    //reconnect && observer && observer.connect();
                    ////} catch (e) {
                    ////    this.selectNodes(`descendant-or-self::*[not(@xo:id!="")]`).setAttributeNS(xover.spaces["xo"], 'xo:id', (function () { return `${(this.nodeName}_${xover.cryptography.generateUUID()}`.replace(/[:-]/g, '_') }));
                    ////}
                    return this;
                }

                //if (!Node.prototype.hasOwnProperty('clone')) {
                //    Object.defineProperty(Node.prototype, 'clone', {
                //        value: function (deep) {
                //            let cloned = this.cloneNode(deep);
                //            cloned.copyPropertiesFrom(this);
                //            return cloned;
                //        }
                //    })
                //}

                if (!Node.prototype.hasOwnProperty('copyPropertiesFrom')) {
                    Object.defineProperty(Node.prototype, 'copyPropertiesFrom', {
                        value: function (source) {
                            //let target = this;
                            //for (let prop in source.prototype) {
                            //    let prop_desc = Object.getOwnPropertyDescriptor(target, prop) || { writable: true };
                            //    if (prop_desc.writable) {
                            //        Object.defineProperty(target, prop, {
                            //            value: source[prop],
                            //            writable: true, enumerable: true, configurable: false
                            //        });
                            //    }
                            //}
                            //if (Object.getPrototypeOf(source) instanceof this.constructor) {
                            //    this.prototype.copyPropertiesFrom.apply(this, Object.getPrototypeOf(source.constructor))
                            //}

                            //for (let prop in current_source) {
                            //    let source_desc = Object.getPropertyDescriptor(current_source, prop);
                            //    let prop_desc = Object.getOwnPropertyDescriptor(target, prop) || source_desc && [source_desc.writable, source_desc.configurable, true].coalesce();
                            //    if (source_desc && prop_desc) {
                            //        Object.defineProperty(target, prop, {
                            //            value: source[prop]
                            //            , writable: [prop_desc.writable, source_desc.writable].coalesce()
                            //            , enumerable: [prop_desc.enumerable, source_desc.enumerable].coalesce()
                            //            , configurable: [prop_desc.configurable, source_desc.configurable].coalesce()
                            //        });
                            //    }
                            //}

                            let current_source = source;
                            let target = this;

                            for (let prop in current_source) {
                                let prop_desc = Object.getPropertyDescriptor(current_source, prop);
                                if (!prop_desc) {
                                    continue;
                                } else if (prop_desc.value) {
                                    Object.defineProperty(this, prop, {
                                        value: function () { return current_source[prop].apply(current_source, arguments) }
                                        , enumerable: true, configurable: false
                                    });
                                } else if (prop_desc.get) {
                                    Object.defineProperty(this, prop, {
                                        get: function () { return current_source[prop] }
                                        , enumerable: true, configurable: false
                                    });
                                }
                            }
                            return target;
                        }
                    })
                }

                if (!Node.prototype.hasOwnProperty('transform')) {
                    Object.defineProperty(Node.prototype, 'transform', {
                        value: function (xml_document) {
                            let self = this;
                            if (xml_document instanceof Document && !xml_document.documentElement && xml_document.source) {
                                return new Promise(async (resolve, reject) => {
                                    try {
                                        let result = self.transform(await xml_document.source.fetch().catch(e => Promise.reject(e)))
                                        return resolve(result);
                                    } catch (e) {
                                        return reject(e)
                                    }
                                })
                            }
                            if (xml_document instanceof Promise) {
                                return xml_document.then((document) => self.transform(document));
                            }
                            if (typeof (xml_document) == "string") {
                                let xsl = xml_document;
                                if (xsl in xover.sources) {
                                    xml_document = xover.sources[xsl];
                                } else if (xsl in xover.sources.defaults) {
                                    xml_document = xover.sources.defaults[xsl];
                                } else {
                                    if (xover.browser.isIphone()) { //Probablemente esto tiene que cambiar
                                        return this.transform(xover.sources.load(xsl));
                                        //(async () => {
                                        //    xover.sources[xsl] = await xover.fetch.xml(xsl);
                                        //    xsl = xover.sources[xsl];
                                        //})();
                                    } else {
                                        xml_document = xover.xml.createDocument(`                          
                <xsl:stylesheet version="1.0"                        
                    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                    <xsl:import href="${xsl}" />
                </xsl:stylesheet>`);
                                    }
                                }
                            }
                            if (xml_document && !((xml_document.ownerDocument || xml_document) instanceof XMLDocument)) {
                                throw (new Error("Document must be a valid xml document."));
                            };
                            if (this.selectSingleNode('xsl:*') && !(xml_document && xml_document.selectSingleNode('xsl:*'))) {//Habilitamos opción para que un documento de transformación pueda recibir un documento para transformar (Proceso inverso)
                                return (xml_document || xover.xml.createDocument(`<xo:empty xo:id="empty" xmlns:xo="http://panax.io/xover"/>`).seed()).transform(this);
                            }
                            let xsl = xml_document;
                            let xml = this;
                            let xmlDoc;
                            let result = undefined;
                            if (!xsl/* && ((arguments || {}).callee || {}).caller != Node.prototype.transform*/) {
                                //return new Promise(async (resolve, reject) => {
                                //    return resolve(self.transform(await xml_document.source.fetch()));
                                //})
                                for (let stylesheet of xml.stylesheets) {
                                    xml = xml.transform(stylesheet.document || stylesheet.href);
                                }
                                return xml;
                            }
                            let before_listeners = xover.listener.matches(xml, 'beforeTransform')
                            let after_listeners = xover.listener.matches(xml, 'transform')
                            xml.disconnect();
                            //if (!(xml && xsl)) {
                            //    return xml;//false;
                            //}
                            let original_doc = xml;
                            if (!(typeof (xsl.selectSingleNode) != 'undefined' && xsl.selectSingleNode('xsl:*'))) {
                                throw (new Error("XSL document is empty or invalid"));
                            }
                            let empty_node
                            if (!xml.selectSingleNode("self::*|*|comment()") && xml.createComment) {
                                empty_node = xml.appendChild(xml.createComment("empty"))
                            }

                            if (document.implementation && document.implementation.createDocument) {
                                let xsltProcessor = new XSLTProcessor();
                                try {
                                    if (navigator.userAgent.indexOf("Firefox") != -1) {
                                        let invalid_node = xsl.selectSingleNode("//*[contains(@select,'namespace::')]");
                                        if (invalid_node) {
                                            console.warn('There is an unsupported xpath in then file');
                                        }
                                    }
                                    //if (navigator.userAgent.indexOf("iPhone") != -1 || xover.debug["xover.xml.consolidate"]) {
                                    //    xsl = xover.xml.consolidate(xsl); //Corregir casos cuando tiene apply-imports
                                    //}

                                    for (let param of xsl.selectNodes(`//xsl:stylesheet/xsl:param[starts-with(@name,'globalization:')]`)) {
                                        try {
                                            let param_name = param.getAttribute("name").split(/:/).pop()
                                            if (param.value != undefined) {
                                                let source = xover.sources[param.value];
                                                source.ready;
                                                let templates = source.select(`//data/@name`).map(name => xover.xml.createNode(`<xsl:template mode="globalization:${param_name}" match="text()[.='${name.value}']|@*[.='${name.value}']"><xsl:text><![CDATA[${name.parentNode.selectFirst("value").textContent}]]></xsl:text></xsl:template>`));
                                                param.replaceWith(...templates)
                                            }
                                        } catch (e) {
                                            Promise.reject(e.message);
                                        }
                                    };
                                    xsltProcessor.importStylesheet(xsl);
                                    for (let param of xsl.selectNodes(`//xsl:stylesheet/xsl:param[starts-with(@name,'js:') or not(contains(@name,':'))][text()]`)) {
                                        try {
                                            xsltProcessor.setParameter(null, param.getAttribute("name"), eval(param.textContent))
                                        } catch (e) {
                                            //xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                                            Promise.reject(e.message);
                                            xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                                        }
                                    };
                                    for (let param of xsl.selectNodes(`//xsl:stylesheet/xsl:param[starts-with(@name,'session:')]`)) {
                                        try {
                                            let param_name = param.getAttribute("name").split(":").pop();
                                            //if (!(param_name in xover.session)) xover.session[param_name] = [eval(`(${param.textContent !== '' ? param.textContent : undefined})`), ''].coalesce();
                                            let session_value = xover.session[param.getAttribute("name").split(/:/).pop()];
                                            if (session_value != undefined) {
                                                xsltProcessor.setParameter(null, param.getAttribute("name"), session_value);
                                            }
                                        } catch (e) {
                                            //xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                                            Promise.reject(e.message);
                                        }
                                    };
                                    for (let param of xsl.selectNodes(`//xsl:stylesheet/xsl:param[starts-with(@name,'state:')]`)) {
                                        try {
                                            let param_name = param.getAttribute("name").split(/:/).pop();
                                            //if (!(param_name in xover.state)) xover.state[param_name] = [eval(`(${param.textContent !== '' ? param.textContent : undefined})`), ''].coalesce();
                                            let state_value = [xover.state[param_name], xover.stores.active.state[param_name], xover.site[param_name]].coalesce();
                                            if (state_value != undefined) {
                                                xsltProcessor.setParameter(null, param.getAttribute("name"), state_value);
                                            }
                                        } catch (e) {
                                            //xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                                            Promise.reject(e.message);
                                        }
                                    };
                                    for (let param of xsl.selectNodes(`//xsl:stylesheet/xsl:param[starts-with(@name,'site:')]`)) {
                                        try {
                                            let param_name = param.getAttribute("name").split(/:/).pop()
                                            let param_value = param_name.indexOf("-") != -1 ? eval(`(xover.site.${param_name.replace(/-/g, '.')})`) : xover.site[param_name];
                                            if (param_value != undefined) {
                                                xsltProcessor.setParameter(null, param.getAttribute("name"), param_value);
                                            }
                                        } catch (e) {
                                            //xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                                            Promise.reject(e.message);
                                        }
                                    };
                                    for (let param of xsl.selectNodes(`//xsl:stylesheet/xsl:param[starts-with(@name,'searchParams:')]`)) {
                                        try {
                                            let param_name = param.getAttribute("name").split(/:/).pop()
                                            let param_value = xover.site.searchParams.get(param_name);
                                            if (!xover.site.searchParams.has(param_name)) {
                                                let default_value = [eval(`(${param.textContent !== '' ? param.textContent : undefined})`), ''].coalesce();
                                                if (typeof (default_value) === 'function') {
                                                    param_value = default_value(param_value)
                                                } else {
                                                    param_value = default_value !== undefined ? default_value : '';
                                                }
                                            }
                                            if (param_value !== undefined) {
                                                xsltProcessor.setParameter(null, param.getAttribute("name"), param_value);
                                            }
                                        } catch (e) {
                                            if (e instanceof ReferenceError || e instanceof SyntaxError) {
                                                param_value = param.textContent
                                                //xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                                            } else {
                                                Promise.reject(e.message);
                                            }
                                        }
                                    };
                                    for (let param_name of xsl.selectNodes(`//xsl:stylesheet/xsl:param/@name`).filter(name => this.target && this.target.getAttribute(name.value))) {
                                        let param = param_name.parentNode;
                                        let prefix = param_name.prefix || '';
                                        param_name = param_name.value;

                                        xsltProcessor.setParameter(null, param_name, this.target.getAttribute(param_name))
                                    }

                                    ////if (!xml.documentElement) {
                                    ////    xml.appendChild(xover.xml.createDocument(`<xo:empty xo:id="empty" xmlns:xo="http://panax.io/xover"/>`).documentElement)
                                    ////}
                                    let tag = xml.tag || `#${xsl.href || ""}`;
                                    xml.tag = tag;
                                    window.top.dispatchEvent(new xover.listener.Event('beforeTransform', { listeners: before_listeners, document: this instanceof Document && this || this.ownerDocument, node: this, store: xml.store, stylesheet: xsl }, xml));
                                    let timer_id = `${xsl.href || "Transform"}-${Date.now()}`;
                                    performance.mark(`${timer_id} - Transform start`);
                                    if (xover.session.debug || xsl.selectSingleNode('//xsl:param[@name="debug:timer" and text()="true"]')) {
                                        console.time(timer_id);
                                    }
                                    if (xsl.documentElement.getAttribute("xmlns") && !(xsl.selectSingleNode('//xsl:output[@method="html"]')) /*xover.browser.isIOS()*/) {// && ((result || {}).documentElement || {}).namespaceURI == "http://www.w3.org/1999/xhtml" ) {
                                        let transformed = xsltProcessor.transformToFragment(xml, document);
                                        let newDoc;
                                        if (transformed && transformed.children.length > 1) {
                                            newDoc = transformed;
                                        } else if (transformed) {
                                            newDoc = window.document.cloneNode()//document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", "", null);//
                                            newDoc.replaceBy(transformed)
                                        }
                                        result = newDoc;
                                    }
                                    if (result == null) {
                                        result = xsltProcessor.transformToDocument(xml);
                                    }
                                    result && [...result.children].map(el => el instanceof HTMLElement && el.select('//@*[starts-with(., "`") and substring(., string-length(.))="`"]').map(val => { try { val.value = eval(val.value.replace(/\$\{\}/g, '')) } catch (e) { console.log(e) } }));
                                    if (!(result && result.documentElement) && !xml.documentElement) {
                                        xml.appendChild(xover.xml.createNode(`<xo:empty xo:id="empty" xmlns:xo="http://panax.io/xover"/>`).seed())
                                        return Promise.reject(xml.transform("empty.xslt"));
                                    }
                                    if ((xover.session.debug || {})["transform"] || xsl.selectSingleNode('//xsl:param[@name="debug:timer" and text()="true"]')) {
                                        console.timeEnd(timer_id);
                                    }
                                    empty_node && empty_node.remove()
                                    performance.mark(`${timer_id} - Transform end`);
                                } catch (e) {
                                    return Promise.reject(e)
                                    //let default_document = xover.sources.defaults[(xsl.selectSingleNode("//xsl:import") || document.createElement('p')).getAttribute("href")];
                                    //if (default_document /*&& arguments.callee.caller != xover.xml.transform*/) {
                                    //    result = xml.transform(default_document);
                                    //} else if (!xml.documentElement) {
                                    //    return xml;
                                    //} else {
                                    //    console.error("xover.xml.transform: " + (e.message || e.name || e)); //TODO: No está entrando en esta parte, por ejemplo cuando hay un error 404. net::ERR_ABORTED 404 (Not Found)
                                    //    return xml;
                                    //}
                                }
                                if (!result) {
                                    if (this.documentElement instanceof HTMLElement) return new Comment("ack:empty");
                                    if (/*((arguments || {}).callee || {}).caller != xover.xml.transform && */xsl.selectSingleNode('//xsl:import[@href="login.xslt"]')) {
                                        result = xml.transform(xover.sources.defaults["login.xslt"]);
                                    } else if (/*((arguments || {}).callee || {}).caller != xover.xml.transform && */xsl.selectSingleNode('//xsl:import[@href="shell.xslt"]')) {
                                        result = xml.transform(xover.sources.defaults["shell.xslt"]);
                                    } else if (!xml.documentElement) {
                                        return xml;
                                    } else {
                                        if (!xsl.selectFirst(`*[@debug:tested="true"]`) && xsl.documentElement.selectFirst(`//xsl:template/xsl:attribute[@name="xo-debug"]|//xsl:template//xsl:comment`)) {
                                            let cleanedup_xsl = xsl.cloneNode(true);
                                            if (xsl.documentElement.selectFirst('//xsl:template/xsl:attribute[@name="xo-debug"]|//xsl:template//xsl:comment')) {
                                                let test_xsl = xsl.cloneNode(true);
                                                test_xsl.select('//xsl:template/xsl:attribute[@name="xo-debug"]|//xsl:template//xsl:comment').remove()
                                                if (xml.transform(test_xsl)) {
                                                    cleanedup_xsl.documentElement.setAttribute("debug:tested", true);
                                                }
                                            }
                                            let removed = cleanedup_xsl.documentElement.selectFirst(`//xsl:template/xsl:attribute[@name="xo-debug"]|//xsl:template//xsl:comment`)
                                            let template = removed.parentNode.cloneNode(true);
                                            removed.remove();
                                            result = xml.transform(cleanedup_xsl)
                                            if (cleanedup_xsl.documentElement.selectFirst(`//xsl:template/xsl:attribute[@name="xo-debug"][1]`)) {
                                                debugger
                                            }
                                            return result;
                                        } else {
                                            debugger
                                            console.error(xover.messages.transform_exception || "There must be a problem with the transformation file. A misplaced attribute, maybe?", { xsl, xml }); //Podría ser un atributo generado en un lugar prohibido. Se puede enviar al servidor y aplicar ahí la transformación //TODO: Hacer una transformación del XSLT para identificar los problemas comúnes.
                                            result = new Text();
                                        }
                                    }
                                }
                                else if (typeof (result.selectSingleNode) == "undefined" && result.documentElement) {
                                    result = xover.xml.createDocument(result.documentElement);
                                }
                                [...typeof (result.querySelectorAll) == 'function' && result.querySelectorAll('parsererror div') || []].map(message => {
                                    if (String(message.textContent).match(/prefix|prefijo/)) {
                                        let prefix = (message.textContent).match(/(?:prefix|prefijo)\s+([^\s]+\b)/).pop();
                                        if (!xover.spaces[prefix]) {
                                            let message = xover.data.createMessage(message.textContent.match("(error [^:]+):(.+)").pop());
                                            xml.documentElement.appendChild(message.documentElement);
                                            return xml;
                                        }
                                        (xml.documentElement || xml).setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:" + prefix, xover.spaces[prefix]);
                                        result = xml.transform(xsl);
                                        return result;
                                    } else if (String(message.textContent).match(/Extra content at the end of the document/)) {
                                        message.remove();
                                    } else if (String(message.textContent).match(/Document is empty/)) {
                                        if (xsl.documentElement.selectNodes('xsl:template').length == 1 && xsl.documentElement.selectNodes('xsl:template[not(*) and text()]')) {
                                            message.textContent = `Template can't return text without a wrapper`
                                        }
                                    }
                                });
                            }
                            try {
                                //if (((arguments || {}).callee || {}).caller != xover.xml.transform) {
                                window.top.dispatchEvent(new xover.listener.Event('transform', { original: xml, tag: tag, result, transformed: result, listeners: after_listeners }, result));
                                //}
                            } catch (e) { }
                            return result
                        },
                        writable: false, enumerable: false, configurable: false
                    });
                }

                //if (!XMLDocument.prototype.hasOwnProperty('tag')) {
                //    Object.defineProperty(XMLDocument.prototype, 'tag', {
                //        get: function () {
                //            return this.store && this.store.tag || "";//xover.stores.active.tag;
                //        }
                //    });
                //}

                xover.manager = {};
                xover.manager.render = new Map();
                xover.manager.replace = new Map();
                xover.manager.stoped = new Map();
                xover.manager.delay = new Map();

                let section_renderer_handler = async function () {
                    await xover.ready;
                    xover.manager.render.set(this, xover.manager.render.get(this) || xover.delay(1).then(async () => {
                        let self = this;
                        if (!this.ownerDocument.contains(this)) return;
                        let stylesheet = this.getAttributeNode("xo-stylesheet");
                        if (stylesheet instanceof Node && stylesheet.value.indexOf("{$") != -1) {
                            stylesheet.value = stylesheet.value.replace(/\{\$(state|session):([^\}]*)\}/g, (match, prefix, name) => xover[prefix][name] || match)
                            if (stylesheet.value.indexOf("{$") != -1) {
                                return;
                            }
                        }

                        let source_document = this.store;
                        if (this.select(`ancestor::*[@xo-stylesheet or @xo-source]`).some(ancestor => ancestor.getAttribute("xo-stylesheet") == stylesheet && ancestor.source == source_document)) {
                            console.warn(`A recursion was prevented`, this)
                            return Promise.resolve(this)
                        }

                        let do_render = true;
                        let stop_condition = this.getAttribute("xo-stop");
                        let stop;
                        if (stop_condition) {
                            if (xover.manager.stoped.get(this)) {
                                this.removeAttribute("xo-schedule");
                                this.removeAttribute("xo-stop");
                                xover.manager.stoped.delete(this);
                                return this
                            }
                            this.stop = this.stop || xover.waitFor.call(this, stop_condition);
                        }
                        let suspense_condition = this.getAttribute("xo-suspense");
                        if (suspense_condition) {
                            do_render = suspense_condition && await xover.waitFor.call(this, suspense_condition);
                            if (do_render) {
                                this.removeAttribute("xo-suspense")
                            }
                        }
                        let stylesheets = []
                        if (do_render) {
                            if (source_document instanceof Document && this.hasAttribute("xo-source")) {
                                source_document.settings.headers = source_document.settings.headers || new Headers({});
                                if (this instanceof SVGElement) {
                                    source_document.settings.headers.set("accept", "application/svg+xml");
                                } else if (this instanceof HTMLImageElement || this instanceof HTMLPictureElement) {
                                    source_document.settings.headers.set("accept", "image/*");
                                }
                                if (this.hasAttribute("xo-settings")) {
                                    let document = xover.xml.createDocument();
                                    let headers = this.getAttribute("xo-settings");
                                    try {
                                        headers = eval(`({${headers}})`)
                                    } catch (e) {
                                        try {
                                            headers = eval(`({${headers}})`)
                                        } catch (e) {
                                            throw (e)
                                        }
                                    }
                                    document.settings.headers = new Headers(headers || {});
                                    source_document = await source_document.source.fetch.apply(document);
                                }
                            }
                            source_document && await source_document.ready;
                            stylesheets = stylesheet && [stylesheet.value] || [];
                            if (stylesheets.length) {
                                stylesheets = stylesheets.map(stylesheet => typeof (stylesheet) === 'string' && { type: 'text/xsl', href: stylesheet, target: self, store: (source_document || {}).tag } || stylesheet instanceof ProcessingInstruction && xover.json.fromAttributes(stylesheet.data) || null).filter(stylesheet => stylesheet);
                                for (let stylesheet of stylesheets) {
                                    stylesheet.target = stylesheet.target || self;
                                }
                                source_document = (source_document && source_document.document || source_document);
                                if (source_document instanceof Document) {
                                    await source_document.render(stylesheets) || null;
                                } else {
                                    let document = xover.sources[stylesheet];
                                    await document.render({ target: self });
                                }
                            } else if (source_document instanceof xover.Store) {
                                await source_document.render(self)
                            } else {
                                let body = source_document.cloneNode(true);
                                let result = await xover.dom.combine(self, body);
                                result.stop = self.stop;
                            }
                        }
                        for (let suspense_node of [self.matches("[xo-schedule],[xo-suspense]") && self, ...self.querySelectorAll("[xo-schedule],[xo-suspense]")]) {
                            let xo_schedule = self.getAttributeNode("xo-schedule");
                            if (suspense_node === self && xo_schedule) {
                                if (isNumber(xo_schedule.value)) {
                                    await xover.delay(xo_schedule.value)
                                } else {
                                    await xover.waitFor.call(self, suspense_node.getAttribute("xo-schedule"));
                                }
                            }
                            self.stop && self.stop.then(result => xover.manager.stoped.set(self, result)).finally(() => delete self.stop)
                            xover.delay(1).then(() => suspense_node.render())
                        }
                        return Promise.resolve(this)
                    }).catch((e) => {
                        return Promise.reject(e)
                    }).finally(async () => {
                        xover.manager.render.delete(this);
                    }));
                    return xover.manager.render.get(this);
                }

                if (!Node.prototype.hasOwnProperty('getClosestScroller')) {
                    Object.defineProperty(Node.prototype, 'getClosestScroller', {
                        value: function () {
                            if (this.scrollHeight > this.clientHeight && (this.scrollTop || this.scrollLeft)) {
                                return this;
                            } else {
                                const parentElement = this.parentElement;
                                if (!(parentElement instanceof HTMLElement)) return null;
                                return parentElement.getClosestScroller();
                            }
                        }
                    });
                }

                if (!Node.prototype.hasOwnProperty('scrollPosition')) {
                    Object.defineProperty(Node.prototype, 'scrollPosition', {
                        get: function () {
                            scrollParent = this.getClosestScroller();
                            if (!scrollParent) return null;
                            let coordinates =
                            {
                                x: (scrollParent.pageXOffset !== undefined ? scrollParent.pageXOffset : scrollParent.scrollLeft),
                                y: (scrollParent.pageYOffset !== undefined ? scrollParent.pageYOffset : scrollParent.scrollTop),
                                target: scrollParent
                            }
                            return coordinates;
                        },
                        set: function (coordinates) {
                            scrollParent = this.getClosestScroller();
                            if (!scrollParent) return null;
                            scrollParent.scrollTo && scrollParent.scrollTo(coordinates);
                        }
                    });
                }

                if (!HTMLElement.prototype.hasOwnProperty('render')) {
                    Object.defineProperty(HTMLElement.prototype, 'render', {
                        value: section_renderer_handler
                    });
                }

                if (!SVGElement.prototype.hasOwnProperty('render')) {
                    Object.defineProperty(SVGElement.prototype, 'render', {
                        value: section_renderer_handler
                    });
                }

                if (!HTMLDocument.prototype.hasOwnProperty('render')) {
                    Object.defineProperty(HTMLDocument.prototype, 'render', {
                        value: function () {
                            xover.dom.createDialog(this)
                        }
                    });
                }

                if (!DocumentFragment.prototype.hasOwnProperty('render')) {
                    Object.defineProperty(DocumentFragment.prototype, 'render', {
                        value: function () {
                            xover.dom.createDialog(this)
                        }
                    });
                }

                History.pushState = History.pushState || Object.getOwnPropertyDescriptor(History.prototype, 'pushState');
                Object.defineProperty(History.prototype, 'pushState', {
                    value: function (...args) {
                        let before = new xover.listener.Event('beforePushstate', { state: args[0] }, this)
                        window.top.dispatchEvent(before);
                        if (before.cancelBubble || before.defaultPrevented) return;
                        let response = History.pushState.value.apply(this, [JSON.parse(JSON.stringify(args[0])), args[1], args[2]]);
                        window.top.dispatchEvent(new xover.listener.Event('pushstate', { state: args[0] }, this));
                        return response;
                    }
                });

                if (!Location.prototype.hasOwnProperty('tag')) {
                    Object.defineProperty(Location.prototype, 'tag', {
                        get: function () {
                            return '#' + xover.URL(this.hash.replace(/^#/, '')).pathname.replace(/^\//, '')
                        }
                    });
                }

                //if (!XMLDocument.prototype.hasOwnProperty('save')) {
                //    Object.defineProperty(XMLDocument.prototype, 'save', {
                //        value: async function () {
                //            if (this.href) {
                //                xover.storehouse.write('sources', this.href, this.toString());
                //            } else {
                //                console.warn("File can't be saved on storehouse if lacks of href property")
                //            }
                //        },
                //        writable: false, enumerable: false, configurable: false
                //    })
                //}


                if (!XMLDocument.prototype.hasOwnProperty('render')) {
                    Object.defineProperty(XMLDocument.prototype, 'render', {
                        value: async function (stylesheets = []) {
                            let self = this;
                            await this.ready;
                            stylesheets = stylesheets instanceof Array && stylesheets || stylesheets && [stylesheets] || [];

                            let targets = [];
                            if (this.selectSingleNode('xsl:*')) {//Habilitamos opción para que un documento de transformación pueda recibir un documento para transformar (Proceso inverso)
                                if (!stylesheets.length) {
                                    stylesheets.push({})
                                }
                                for (let stylesheet of stylesheets) {
                                    let document = stylesheet["document"] || xover.xml.createDocument().seed();
                                    stylesheet["type"] = 'text/xsl'
                                    stylesheet["href"] = stylesheet["href"] || this.href;
                                    stylesheet["document"] = stylesheet["document"] || this;
                                    stylesheet["target"] = stylesheet["target"] || document.querySelector(`[xo-source="${stylesheet["document"] && stylesheet["document"].tag /*|| options["document"] || tag*/}"]`);
                                    stylesheet["store"] = stylesheet["store"] || this.store;
                                    targets.push(document.render([stylesheet]));
                                }
                                targets = await Promise.all(targets).then(target => target);
                                return Promise.resolve(targets.flat());
                            }
                            stylesheets = stylesheets.length && stylesheets || this.stylesheets;
                            let data;
                            let self_stylesheets = this.stylesheets.map(stylesheet => Object.fromEntries(Object.entries(xover.json.fromAttributes(stylesheet.data)))).filter(stylesheet => stylesheet.target == 'self');
                            stylesheets = self_stylesheets.concat(stylesheets);
                            for (let stylesheet of stylesheets.filter(stylesheet => stylesheet.role != "init" && stylesheet.role != "binding")) {
                                let xsl = stylesheet instanceof XMLDocument && stylesheet || stylesheet instanceof ProcessingInstruction && stylesheet.document || stylesheet.href && xover.sources[stylesheet.href];
                                xsl instanceof Document && await xsl.ready;
                                if (xsl instanceof Document && xsl.selectSingleNode('xsl:*')) {
                                    xsl.href = xsl.href || ""
                                }
                                data = data || this.cloneNode(true);
                                if (stylesheet.assert && !data.selectFirst(stylesheet.assert)) {
                                    continue;
                                }
                                let store = typeof (stylesheet.store) == 'string' && xover.stores[stylesheet.store] || xover.stores.active.document == self && xover.stores.active || null;
                                let tag = store && store.tag || '';
                                let action = stylesheet.action;// || !stylesheet.target && "append";
                                let stylesheet_target = stylesheet instanceof HTMLElement && stylesheet || stylesheet.target instanceof HTMLElement && stylesheet.target || (stylesheet.target || '').indexOf("@#") != -1 && stylesheet.target.replace(new RegExp("@(#[^\\s\\[]+)", "ig"), `[xo-source="$1"]`) || stylesheet.target || 'body';
                                stylesheet_target = typeof (stylesheet_target) == 'string' && document.querySelector(stylesheet_target) || stylesheet_target;
                                if (!(stylesheet_target instanceof HTMLElement)) {
                                    let dependencies = typeof (stylesheet_target) == 'string' && [...stylesheet_target.matchAll(new RegExp(`\\[xo-source=('|")([^\\1\\]]+)\\1\\]`, 'g'))].reduce((arr, curr) => { arr.push(curr[2]); return arr }, []).filter(source => !(source == tag || document.querySelector(`[xo-source="${tag}"]`)));
                                    if (!(dependencies || []).length) {
                                        if (stylesheet_target == 'self') {
                                            let result, i = 0;
                                            while (i < 20 && (!result || stylesheet.assert && data.selectFirst(stylesheet.assert) && xover.xml.getDifferences(result, data).length)) {
                                                data = result || data;
                                                result = data.transform(xsl);
                                                ++i;
                                            }
                                            data = result || data;
                                            continue;
                                        } else {
                                            continue;
                                        }
                                    }
                                    let dependency_promises = dependencies.map(parent_tag => parent_tag != tag && xover.stores[parent_tag] || undefined).filter(store => store).map(store => store.render());
                                    await Promise.all(dependency_promises);
                                }
                                let target = stylesheet_target instanceof HTMLElement && stylesheet_target || document.querySelector(stylesheet_target);
                                target = target instanceof HTMLElement && (tag && target.queryChildren(`[xo-source="${tag}"][xo-stylesheet='${stylesheet.href}']`)[0] || !tag && target.querySelector(`[xo-stylesheet="${stylesheet.href}"]:not([xo-source])`)) || target;
                                if (store && store !== xover.stores.active && target instanceof Node && [...target.querySelectorAll(`[xo-source]`)].some(source => source.store === xover.stores.active)) continue;
                                if (!(target instanceof Node && document.contains(target) && [target, target.parentNode].includes(stylesheet.srcElement || target))) { //
                                    continue;
                                }
                                //let active_element = document.activeElement;
                                //if (target.contains(active_element)) {
                                //    await xover.delay(100);
                                //    xover.delay(250).then(() => active_element.classList && active_element.classList.remove("xo-working"))
                                //}

                                if (!data.firstElementChild) {
                                    data.append(xover.xml.createNode(`<xo:empty xo:id="empty" xmlns:xo="http://panax.io/xover"/>`).seed())
                                }

                                if (!(data.firstElementChild instanceof HTMLElement || data.firstElementChild instanceof SVGElement) && (data.documentElement || data) instanceof Element) {
                                    Element.setAttributeNS.call((data.documentElement || data), 'http://panax.io/state/environment', "env:store", tag);
                                    Element.setAttributeNS.call((data.documentElement || data), 'http://panax.io/state/environment', "env:stylesheet", stylesheet.href);
                                }
                                data.store = store;
                                data.target = target;
                                //data.disconnected = false;
                                target.tag = data.tag;
                                let dom;
                                if (xsl) {
                                    data.tag = /*'#' + */xsl.href.split(/[\?#]/)[0];
                                    dom = await data.transform(xsl);
                                    dom.select(`//html:script/@*[name()='xo:id']|//html:style/@*[name()='xo:id']|//html:meta/@*[name()='xo:id']|//html:link/@*[name()='xo:id']`).remove()
                                } else if (data.firstElementChild instanceof HTMLElement || data.firstElementChild instanceof SVGElement) {
                                    dom = this.cloneNode(true);
                                } else {
                                    return new Text()
                                }

                                typeof (dom.querySelectorAll) == 'function' && dom.querySelectorAll(`[xo-stylesheet="${stylesheet.href}"]`).forEach(el => el.removeAttribute("xo-stylesheet"));

                                let documentElement = dom.firstElementChild;
                                if (!documentElement) {
                                    continue;
                                }
                                dom.selectNodes('//@xo-slot[.="" or .="xo:id"]').forEach(el => el.parentNode.removeAttributeNode(el));
                                dom.querySelectorAll('[xo-scope="inherit"]').forEach(el => el.removeAttribute("xo-scope"));

                                let stylesheet_href = stylesheet.href;
                                let target_source = target.getAttributeNode("xo-source");
                                for (let el of dom.children) {
                                    el.document = this;
                                    el.context = data;
                                    el.attributes.toArray().filter(attr => attr.name.split(":")[0] === 'xmlns').remove()
                                    if (![HTMLStyleElement, HTMLScriptElement, HTMLLinkElement].includes(el.constructor)) {
                                        let current_scope = el.getAttributeNode("xo-scope");
                                        current_scope && el.setAttributeNS(null, "xo-scope", current_scope.value);
                                        let store_tag = el.getAttributeNode("xo-source") || target_source || tag || '';
                                        store_tag && el.setAttributeNS(null, "xo-source", store_tag.value || store_tag);
                                        stylesheet_href && el.setAttributeNS(null, "xo-stylesheet", stylesheet_href);
                                    }
                                }
                                //if (dom instanceof DocumentFragment) {
                                //    //let content = target.cloneNode();
                                //    content.append(...dom.children);
                                //    documentElement = content;
                                //} else {
                                //    documentElement.attributes.toArray().filter(attr => attr.name.split(":")[0] === 'xmlns').remove()
                                //}

                                let old = target.cloneNode(true);
                                target = await xover.dom.combine(target, dom);
                                target.document = this;
                                target.context = data;

                                xover.delay(10).then(() => {
                                    let render_event = new xover.listener.Event('render', { store, tag: stylesheet.href, stylesheet: xsl, target, dom: target, context: target.context, old }, target);
                                    window.top.dispatchEvent(render_event);
                                    if (render_event.cancelBubble || render_event.defaultPrevented) return target;
                                })
                                targets.push(target);
                            }
                            return Promise.resolve(targets);
                        },
                        writable: false, enumerable: false, configurable: false
                    });
                }

                Date.prototype.toISOString = function () {/*Current method ignores z-time offset*/
                    let tzo = -this.getTimezoneOffset(),
                        dif = tzo >= 0 ? '+' : '-',
                        pad = function (num) {
                            let norm = Math.floor(Math.abs(num));
                            return (norm < 10 ? '0' : '') + norm;
                        };

                    return this.getFullYear() +
                        '-' + pad(this.getMonth() + 1) +
                        '-' + pad(this.getDate()) +
                        'T' + pad(this.getHours()) +
                        ':' + pad(this.getMinutes()) +
                        ':' + pad(this.getSeconds()) +
                        '.' + pad(this.getMilliseconds()) +
                        'Z';
                }

                Date.prototype.toLongDateString = function (format = 'es-mx') {
                    let date = this;
                    const monthNames = {
                        "es-mx": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                        ]
                    };
                    if (date instanceof Date) {
                        date = date.toISOString()
                    }
                    let parts = date.match(/(\d{4})(\/|-)(\d{1,2})\2(\d{1,2})/)
                    if (format.indexOf('es') === 0) {
                        return parts[4] + ' de ' + monthNames[format][parseInt(parts[3]) - 1] + ' de ' + parts[1];
                    }
                }
            }

            // Production steps of ECMA-262, Edition 5, 15.4.4.18
            // Reference: http://es5.github.com/#x15.4.4.18
            if (!Array.prototype.forEach) {
                Array.prototype.forEach = function forEach(callback, thisArg) {
                    'use strict';
                    let T, k;

                    if (this == null) {
                        throw new TypeError("this is null or not defined");
                    }

                    let kValue,
                        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
                        O = Object(this),

                        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
                        // 3. Let len be ToUint32(lenValue).
                        len = O.length >>> 0; // Hack to convert O.length to a UInt32

                    // 4. If IsCallable(callback) is false, throw a TypeError exception.
                    // See: http://es5.github.com/#x9.11
                    if ({}.toString.call(callback) !== "[object Function]") {
                        throw new TypeError(callback + " is not a function");
                    }

                    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
                    if (arguments.length >= 2) {
                        T = thisArg;
                    }

                    // 6. Let k be 0
                    k = 0;

                    // 7. Repeat, while k < len
                    while (k < len) {

                        // a. Let Pk be ToString(k).
                        //   This is implicit for LHS operands of the in operator
                        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                        //   This step can be combined with c
                        // c. If kPresent is true, then
                        if (k in O) {

                            // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                            kValue = O[k];

                            // ii. Call the Call internal method of callback with T as the this value and
                            // argument list containing kValue, k, and O.
                            callback.call(T, kValue, k, O);
                        }
                        // d. Increase k by 1.
                        k++;
                    }
                    // 8. return undefined
                };
            }

            for (let prop of ['set', 'setAttribute', 'setAttributeNS', 'get', 'getAttribute', 'getAttributeNS', 'remove', 'removeAttribute', 'append', 'appendBefore', 'appendAfter', 'textContent', 'value', 'replaceChildren', 'replaceContent']) {
                let prop_desc = Object.getOwnPropertyDescriptor(Node.prototype, prop) || Object.getOwnPropertyDescriptor(Element.prototype, prop);
                if (!prop_desc) {
                    continue
                }
                if (prop_desc.value) {
                    if (NodeSet.prototype.hasOwnProperty(prop)) continue;
                    Object.defineProperty(NodeSet.prototype, prop, {
                        value: prop_desc.value && function (...args) {
                            results = [];
                            for (let target of this) {
                                if (typeof (target[prop]) == 'function') {
                                    results.push(target[prop].apply(target, args))
                                } else {
                                    results.push(null)
                                }
                            }
                            return results;
                        },
                        writable: true, enumerable: false, configurable: false
                    });
                } else {
                    if (NodeSet.prototype.hasOwnProperty(prop)) continue;
                    Object.defineProperty(NodeSet.prototype, prop, {
                        get: prop_desc.get && function () {
                            results = [];
                            for (let target of this) {
                                if (typeof (target) == 'object' && prop in target) {
                                    results.push(target[prop])
                                } else {
                                    results.push(null)
                                }
                            }
                            return results;
                        },
                        set: prop_desc.set && function (value) {
                            results = [];
                            for (let target of this) {
                                if (typeof (target) == 'object' && prop in target) {
                                    results.push(target[prop] = value)
                                } else {
                                    results.push(null)
                                }
                            }
                            return results;
                        },
                        enumerable: false, configurable: false
                    });

                }
            }

            targetWindow.modernized = true;
        }
    }).catch(e => {
        throw (e)
    }).finally(() => {
        delete this.modernizing
    })
    return this.modernizing;
}

Object.defineProperty(xover.stores, 'restore', {
    value: async function (name_list = []) {
        name_list = name_list instanceof Array && name_list || [name_list];
        let restoring = [];
        if (xover.session.disableCache) return;

        //Object.entries(sessionStorage).filter(([key]) => key != '#' && (!name_list.length || name_list.includes(key)) && key.match(/^#/)).forEach(([tag, value]) => {
        //    console.log('Restoring document ' + tag);
        //    xover.stores[tag] = new xover.Store(xover.sources[JSON.parse(value)["source"]], { tag: tag });
        //})
        return restoring;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.stores, 'seed', {
    get: function () {
        return this[xover.site.seed] || this["#"] || xover.stores[xover.site.seed];
    }
});

class NodeSet extends Array {
    constructor(...args) {
        super(...args)
    }

    highlight() {
        this.forEach(node => { [...document.querySelectorAll(`#${node.getAttributeNS("http://panax.io/xover", "id")},[xo-scope='${node.getAttributeNS("http://panax.io/xover", "id")}']`)].map(target => target.style.outline = '#f00 solid 2px') })
    }

    showTable(...args) {
        let entries = [...this].map(node => [...(node instanceof Attr ? [node] : node.attributes || [])].map(el => [el.name, el]));
        let show_all = false;
        let columns = Object.fromEntries(Object.keys(Object.fromEntries(entries.flat())).map(key => [key]));
        for (let i = args.length - 1; i >= 0; --i) {
            if (typeof (args[i]) == 'string') {
                if (args[i] == '*') {
                    show_all = true;
                } else {
                    columns[args[i]] = undefined;
                }
            }
            if (args[i].constructor == {}.constructor) {
                for (let key in args[i]) {
                    columns[key] = args[i][key];
                    if (args[i][key] === false) delete columns[key]
                }
            }
            args.splice(i, 1)
        }
        let rows = entries.map(entry => Object.fromEntries(entry.filter(([key]) => key in columns).map(([key, el]) => [key, columns[key] ? columns[key](el) : (+el.value == el.value ? +el.value : el.value)])))
        return console.table(rows, show_all && [] || Object.keys(columns))
    }
}

class MutationSet extends Array {
    constructor(...args) {
        super(...args)
    }

    consolidate() {
        let mutationList = this;
        let mutated_targets = new Map();
        for (let mutation of mutationList.filter(mutation => !["http://panax.io/xover", "http://www.w3.org/2000/xmlns/"].includes(mutation.attributeNamespace))) {
            let inserted_ids = [];
            let target = mutation.target instanceof Text && mutation.target.parentNode || mutation.target;
            if ([target.closest('.xo-silent,.xo-silent-off') || document.createElement('p')].filter(node => node.classList.contains('xo-silent') && !node.classList.contains('xo-silent-off')).length) {
                continue;
            }

            let value = mutated_targets.get(target) || {};
            if (mutation.target instanceof Text) {
                value.texts = value.texts || new Map();
                if (!value.texts.has(mutation.target)) {
                    value.texts.set(mutation.target, `${mutation.target}`)
                }
            } else if (mutation.type == "attributes") {
                let attribute = target.getAttributeNodeNSOrMock(mutation.attributeNamespace, mutation.attributeName);
                if (String(attribute.value) == String(mutation.oldValue)) continue;
                value.attributes = value.attributes || {};
                value.attributes[mutation.attributeNamespace || ''] = value.attributes[mutation.attributeNamespace || ''] || {};
                value.attributes[mutation.attributeNamespace || ''][mutation.attributeName] = [attribute, mutation.oldValue];
            }
            mutation.removedNodes.length && mutation.removedNodes.forEach(node => {
                let descriptor_formerParentNode = Object.getPropertyDescriptor(node, 'formerParentNode') || { writable: true };
                if (!node.formerParentNode && (descriptor_formerParentNode.hasOwnProperty("writable") ? descriptor_formerParentNode.writable : true)) {
                    Object.defineProperty(node, 'formerParentNode', { value: target, writable: true, configurable: true });
                }
                let descriptor_formerPreviousSibling = Object.getPropertyDescriptor(node, 'formerPreviousSibling') || { writable: true };
                if (!node.formerPreviousSibling && (descriptor_formerPreviousSibling.hasOwnProperty("writable") ? descriptor_formerPreviousSibling.writable : true)) {
                    Object.defineProperty(node, 'formerPreviousSibling', { value: mutation.previousSibling, writable: true, configurable: true });
                }
                let descriptor_formerNextSibling = Object.getPropertyDescriptor(node, 'formerNextSibling') || { writable: true };
                if (!node.formerNextSibling && (descriptor_formerNextSibling.hasOwnProperty("writable") ? descriptor_formerNextSibling.writable : true)) {
                    Object.defineProperty(node, 'formerNextSibling', { value: mutation.nextSibling, writable: true, configurable: true });
                }
            })
            value.removedNodes = value.removedNodes || [];
            value.removedNodes.push(...mutation.removedNodes.filter(node => !target.contains(node)));
            let reallocatedNodes = mutation.removedNodes.filter(node => target.contains(node));
            value.reallocatedNodes = value.reallocatedNodes || [];
            value.reallocatedNodes.push(...reallocatedNodes);
            value.addedNodes = value.addedNodes || [];
            value.addedNodes.push(...mutation.addedNodes.filter(node => target.contains(node) && value.reallocatedNodes.indexOf(node) == -1));
            mutated_targets.set(target, value);
            [...mutation.addedNodes].forEach((addedNode) => {
                inserted_ids = inserted_ids.concat(addedNode.select(`.//@xo:id`).map(node => node.value));
            })
        }
        return mutated_targets;
    }
}

xover.xml.createFromActiveX = function () {
    if (typeof arguments.callee.activeXString != "string") {
        let versions = ["MSXML2.DOMDocument"];

        for (let i = 0, len = versions.length; i < len; i++) {
            try {
                let xmldom = new ActiveXObject(versions[i]);
                arguments.callee.activeXString = versions[i];
                return xmldom;
            } catch (ex) {
                //skip
            }
        }
    }
    return new ActiveXObject(arguments.callee.activeXString);
}

xover.xml.getNamespaces = function (...args) {
    let namespaces = {};
    for (let a = 0; a < args.length; ++a) {
        if (!args[a]) {
            continue;
        }
        if (args[a].getNamespaces) {
            namespaces.merge(args[a].getNamespaces())
        } else if (typeof (args[a].selectSingleNode) != 'undefined') {
            let sXML = (args[a].document || args[a]).toString();
            if (sXML) {
                if (sXML.match(/\bxml:/)) {
                    namespaces["xml"] = "http://www.w3.org/XML/1998/namespace";
                }
                namespaces.merge(JSON.parse('{' + (sXML.match(/(xmlns:\w+)=(["'])([^\2]+?)\2/ig) || []).join(", ").replace(/xmlns:(\w+)=(["'])([^\2]+?)\2/ig, '"$1":$2$3$2') + '}'));
            }
        }
    }
    return namespaces;
}

xover.xml.setNamespaces = function (xml_document, namespaces) {
    Object.entries(namespaces).forEach(ns => {
        xml_document.setAttribute(ns[0], ns[1], false);
    })
    return xml_document;
}

xover.xml.createNamespaceDeclaration = function () {
    let namespaces = xover.xml.getNamespaces.apply(this, arguments);
    return Object.entries(namespaces).map(([key, value]) => `xmlns:${key}="${value}"`).join(" ");
}

xover.Response = function (response, request) {
    if (!(this instanceof xover.Response)) return new xover.Response(response);
    let _original = response.clone();
    let url = request.url;
    let file_name = new URL(url).pathname.replace(new RegExp(location.pathname.replace(/[^/]+$/, "")), "");
    if (response.status == 404) {
        if (file_name in xover.sources.defaults) {
            response = new Response(xover.sources.defaults[file_name], { headers: { "Content-type": "text/xsl" } })
        }/* else if (request.settings.tag in xover.sources.defaults) {
            response = new Response(xover.sources.defaults[request.settings.tag], { headers: { "Content-type": "text/xml" } })
        }*/
    }
    let self = this;
    Object.defineProperty(self, 'originalResponse', {
        get: function () {
            return _original.clone();
        }
    });
    Object.defineProperty(self, 'request', {
        get: function () {
            return request;
        }
    });
    Object.defineProperty(response, 'url', {
        get: function () {
            return url;
        }
    });

    Object.defineProperty(response, 'href', {
        get: function () {
            return url.href;
        }
    });
    Object.defineProperty(self, 'settings', {
        get: function () {
            return request.settings || {};
        }
    });
    Object.defineProperty(self, 'render', {
        value: function () {
            let response = this.json || this.document || this.body || `${this.statusText}: ${file_name}`;
            if (this.status == 404 && decodeURI(file_name).indexOf("{$") != -1) {
                console.warn(`Couldn't fetch: ${file_name}`)
            } else if (response instanceof HTMLElement) {
                return Promise.reject(response)
            } else {
                response.render && response.render();
            }
        }
    });
    Object.defineProperty(self, 'processBody', {
        value: async function () {
            let body = undefined;
            let charset = {}.merge(
                Object.fromEntries([...new URLSearchParams((request.headers.get('Accept') || '').toLowerCase().replace(/;\s*/g, '&'))])
                , Object.fromEntries([...new URLSearchParams((response.headers.get('Content-Type') || '').toLowerCase().replace(/;\s*/g, '&'))])
            )["charset"] || '';
            let contentType = response.headers.get('Content-Type') || 'text/plain';

            let responseContent;
            if (contentType.toLowerCase().indexOf("manifest") != -1 || (request.url.href || '').match(/(\.manifest|\.json)$/i)) {
                //await response.json().then(json => body = json);
                await response.text().then(text => body = text);
                responseContent = body;
            } else if (contentType.toLowerCase().indexOf("json") != -1) {
                responseContent = await response.json();
                body = JSON.stringify(responseContent);
            } else if (contentType.toLowerCase().split("/")[0].includes("image", "video", "audio") && ((((this.settings || {}).headers || new Headers({})).get("accept") || contentType).split(/\s*,\s*/ig)).includes(contentType)) {
                responseContent = await response.blob();
            } else {
                const clonedResponse = response.clone();
                responseContent = charset.indexOf("iso-8859-1") == -1 && await response.text() || "";
                if (charset.indexOf("iso-8859-1") != -1 || responseContent.indexOf('�', 2) != -1) {
                    const buffer = await clonedResponse.arrayBuffer();
                    const decoder = new TextDecoder('iso-8859-1');
                    const text = decoder.decode(buffer);
                    responseContent = text;
                }
                if (responseContent.substr(0, 2) === 'ÿþ') { //Removes BOM mark
                    responseContent = responseContent.replace(/\x00/ig, '');
                    responseContent = responseContent.substr(2);
                }
            }

            let cache_control = response.headers.get("Cache-Control") || request.headers.get("Cache-Control");
            expiry = (new URLSearchParams(cache_control || {}).get("max-age") || 0) * 1000;
            if (expiry && !["no-store"].includes(cache_control)) {
                xover.storehouse.write('sources', request.url.href, responseContent, contentType);
            }

            Object.defineProperty(response, 'responseText', {
                get: function () {
                    return responseContent;
                }
            });

            let _body_type;
            Object.defineProperty(response, 'bodyType', {
                get: function () {
                    let contentType = response.headers.get('Content-Type') || '*/*';
                    if (_body_type) {
                        return _body_type;
                    } else if (responseContent instanceof Blob) {
                        return 'blob';
                    } else if (contentType.toLowerCase().indexOf("html") != -1) {
                        return "html";
                    } else if ((contentType.toLowerCase().indexOf("json") != -1 || contentType.toLowerCase().indexOf("manifest") != -1 || (request.url.href || '').match(/(\.manifest|\.json)$/i)) && xover.json.isValid(xover.json.tryParse(responseContent))) {
                        return "json";
                    } else if ((contentType.toLowerCase().indexOf("xml") != -1 || contentType.toLowerCase().indexOf("xsl") != -1 || responseContent.toLowerCase().indexOf("<?xml ") != -1 || contentType.toLowerCase().indexOf('application/octet-stream') != -1) && xover.xml.isValid(xover.xml.tryParse(responseContent))) {
                        return "xml"
                    } else {
                        return "text";
                    }
                }, set: function (input) {
                    _body_type = input;
                }
            });

            switch (response.bodyType) {
                case "html":
                    let html_doc = new DOMParser().parseFromString(responseContent, 'text/html');
                    if (!html_doc.head.childNodes.length) {
                        if (html_doc.body.childNodes.length == 1) {
                            body = html_doc.body.firstChild;
                        } else {
                            body = new DocumentFragment();
                            body.append(...html_doc.body.childNodes);
                            body = body.hasChildNodes() && body || new Text("")
                        }
                    } else {
                        body = html_doc
                    }
                    Object.defineProperty(response, 'json', {
                        value: null
                    });
                    Object.defineProperty(response, 'html', {
                        get: function () {
                            return body;
                        }
                    });
                    break;
                case "xml":
                    body = xover.xml.createDocument(responseContent, { autotransform: false });
                    Object.defineProperty(response, 'json', {
                        value: null
                    });
                    Object.defineProperty(response, 'xml', {
                        get: function () {
                            return body;
                        }
                    });
                    break;
                case "json":
                case "manifest":
                    body = xover.json.tryParse(responseContent);
                    Object.defineProperty(response, 'json', {
                        get: function () {
                            return body;
                        }
                    });
                    if ((request.headers.get('Accept') || '').toLowerCase().indexOf("xml") != -1) {
                        try {
                            body = xover.xml.fromJSON(body);
                            Object.defineProperty(response, 'xml', {
                                get: function () {
                                    return body;
                                }
                            });
                            _body_type = 'xml';
                        } catch (e) {
                            console.warn(e);
                        }
                    }
                    break;
                case "blob":
                    let obj;
                    let type = responseContent.type;
                    const url = URL.createObjectURL(responseContent);
                    if (type.startsWith('image/')) {
                        obj = document.createElement('img');
                    } else if (type.startsWith('video/')) {
                        obj = document.createElement('video');
                        obj.controls = true;
                    } else if (type.startsWith('audio/')) {
                        obj = document.createElement('audio');
                        obj.controls = true;
                    } else {
                        body = responseContent;
                        break;
                    }
                    obj.src = url;
                    //body = xover.xml.createFragment(obj);
                    body = obj;
                    break;
                default:
                    body = responseContent;
                    Object.defineProperty(response, 'json', {
                        value: null
                    });
            }

            if (body instanceof Document) {
                Object.defineProperty(response, 'document', {
                    get: function () {
                        return body;
                    }
                });
                let __document = body;
                for (let prop of ['$', '$$', 'cloneNode', 'normalizeNamespaces', 'contains', 'querySelector', 'querySelectorAll', 'selectSingleNode', 'selectNodes', 'select', 'selectFirst', 'evaluate', 'getStylesheets', 'createProcessingInstruction', 'firstElementChild', 'insertBefore', 'resolveNS']) {
                    let prop_desc = Object.getPropertyDescriptor(__document, prop);
                    if (!prop_desc) {
                        continue
                    } else if (prop_desc.value) {
                        Object.defineProperty(self, prop, {
                            value: function () { return __document[prop].apply(__document, arguments) }
                            , enumerable: true, configurable: false
                        });
                    } else if (prop_desc.get) {
                        Object.defineProperty(self, prop, {
                            get: function () { return __document[prop] }
                            , enumerable: true, configurable: false
                        });
                    }
                }
            }

            if (body.documentElement) {
                Object.defineProperty(response, 'documentElement', {
                    get: function () {
                        return body.documentElement;
                    }
                });
            }

            Object.defineProperty(response, 'body', {
                get: function () {
                    return body;
                }
            });

            return body;
        }
    });
    Object.setPrototypeOf(response, this);
    return response;
}
xover.Response.prototype = Object.create(Response.prototype);

xover.QUERI = function (href) {
    function encodeValue(value) {
        if (!value) return value;
        value = value.replace(/%/g, '%25');
        return value
    }
    class Predicate extends URLSearchParams {
        constructor(queryString) {
            super(queryString);
        }
        append(name, value) {
            value = encodeValue(value);
            if (value === undefined) {
                url.searchParams.delete(name)
            } else {
                url.searchParams.append(name, value)
            }
        }
        set(name, value) {
            value = encodeValue(value);
            url.searchParams.set(name, value)
        }
        delete(name) {
            url.searchParams.delete(name)
        }
    };
    class Fields {
        constructor(json) {
            let proxy = new Proxy(json, {
                get(self, key) {
                    if (self.hasOwnProperty(key)) {
                        return self[key];
                    }
                    return undefined; // or delegate to another object
                }, set(self, key, value) {
                    if (value === undefined) {
                        delete self[key];
                    } else {
                        self[key] = value;
                    }
                    headers.set("fields", new URLSearchParams(Object.entries(self)))
                    url.hash = `#${new URLSearchParams(headers.entries()).toString()}`
                }, deleteProperty: function (self, key) {
                    delete self[key];
                    url.hash = `#${new URLSearchParams(headers.entries()).toString()}`
                }
            });

            Object.defineProperties(proxy, {
                toString: {
                    value: function () {
                        return new URLSearchParams(this).toString()
                    }, enumerable: false, writable: false, configurable: false
                }
            });
            return proxy
        }
    }


    if (!(this instanceof xover.QUERI)) return new xover.QUERI(href);
    let ref = href;
    let fields, schema, name, mode, identity_value, primary_values, ref_node, settings = new URLSearchParams();
    href = (href instanceof Attr ? href.value : href);

    let getParts = function (key) {
        let pathname = url.pathname.replace(/^\/|\/$/g, '');
        [pathname, mode] = pathname.split(/~/);
        [pathname, identity_value] = pathname.split(/:/);
        [pathname, ref_node] = pathname.split(/@/);
        [schema = '', name = '', ...primary_values] = pathname.split(/\//);
        return { schema, name, mode, primary_values, identity_value, ref_node }
    }
    let url = xover.URL(href);
    if (!(url instanceof URL)) {
        if (url instanceof Promise)
            return url
        else
            return Promise.reject(`${href} is not a valid value for QUERI`)
    }
    let predicate = new Predicate(url.searchParams);
    let headers = new Headers(new URLSearchParams(url.hash.replace(/^[\?#]+/, '')));
    parts = getParts();
    let target = new Proxy({}, {
        get: function (self, key) {
            if (parts.hasOwnProperty(key)) {
                return parts[key];
            }
            if (self.hasOwnProperty(key)) {
                return self[key];
            }
            return url[key];
        },
        set: function (self, key, value) {
            self[key] = value;
            if (key in url) {
                url[key] = value;
            }
            parts = getParts();
        }
    });

    Object.defineProperties(target, {
        fields: {
            get: function () {
                let fields = Object.fromEntries(new URLSearchParams((headers.get("fields") || '').replace(/\+/g, '%2B')).entries());
                return new Fields(fields);
            },
            set: function (input) {
                headers.set("fields", input);
                parts = getParts();
            }
        },
        predicate: {
            get: function () {
                return new Predicate(url.searchParams);
            },
            set: function (input) {
                url.search = input;
            }
        },
        headers: {
            get: function () {
                return headers;
            }
        }, toString: {
            value: function () {
                return `${url.pathname}?${url.searchParams.toString()}#${new URLSearchParams(headers.entries()).toString()}`;
            }, enumerable: false, writable: false, configurable: false
        }, update: {
            value: function () {
                if (ref instanceof Node) {
                    ref.value = this.toString();
                }
            }, enumerable: false, writable: false, configurable: false
        }
    });

    Object.defineProperties(target, {
        assign: {
            value: function (attribs) {
                target.merge(attribs);
                if (ref instanceof Node) {
                    ref.set(target.toString());
                } else {
                    ref = target.toString();
                }
                return ref;
            }, enumerable: false, writable: false, configurable: false
        }
    });
    return target;
}

xover.qri = xover.QUERI;
xover.QRI = xover.qri;

xover.Request = function (request, settings = {}) {
    if (!(this instanceof xover.Request)) return new xover.Request(request, settings);
    settings.merge(request.settings);
    let url, req;
    let self = this;
    let _request = request;
    if (request instanceof Request) {
        req = request;
        if (Object.keys(settings).length) {
            let { method, headers, mode, credentials, cache, redirect, referrer, integrity } = req;
            let url = new xover.URL(req.url, location.origin + location.pathname.replace(/[^/]+$/, ""), settings);
            req = new Request(url, Object.assign({ method, headers, mode, credentials, cache, redirect, referrer, integrity }, { body: settings.body }));
        }
    } else {
        let headers;
        if (request instanceof URL) {
            url = new xover.URL(request, undefined, settings);
        } else if (request.constructor == {}.constructor) {
            url = new xover.URL(url, undefined, settings);
        } else {
            url = new xover.URL(request, undefined, settings);
        }
        let fileExtension = url.pathname.substring(url.pathname.lastIndexOf('.') + 1);
        headers = new Headers();
        if (settings["headers"] instanceof Headers) {
            for (let key of Object.keys(Object.fromEntries(settings["headers"].entries()))) {
                headers.set(key, settings["headers"].get(key));
            }
        }
        for (let key of Object.keys(settings["headers"] || {})) {
            headers.set(key, settings["headers"][key]);
        }
        headers.set("Accept", (headers.get("Accept") || xover.mimeTypes[fileExtension] || '*/*'));
        settings["method"] = url.method || request.method;
        settings = xover.json.merge(settings, {
            headers: headers
        });
        req = new Request(url, settings);
    }
    if (req.method == 'POST' && ((event || {}).srcElement || {}).closest) {
        let form = event.srcElement.closest('form');
        if (form && !form.getAttribute('action')) {
            form.setAttributeNS(null, 'action', 'javascript:void(0);'); //Esto corrige comportamiento indeseado en los post cuando el formulario no tiene action
        }
    }

    //let srcElement = event && event.target;
    //if (srcElement instanceof HTMLElement) {
    //    let initiator_button = srcElement.closest('button, .btn')
    //    initiator_button && initiator_button.classList.add("xo-working");
    //    //if (event && event.target && event.target.store && event.target.store.documentElement.selectSingleNode('self::xo:prompt')) { //TODO: Cambiar el método para identificar el initiator
    //    //    req.initiator = event && event.target && event.target.store;
    //    //}
    //}
    //if (req.initiator) {
    //    req.initiator.state.loading = true;
    //}
    Object.defineProperty(self, 'url', {
        get: function () {
            return url;
        }
    })
    //Object.defineProperty(self, 'initiator', {
    //    get: function () {
    //        return _request.initiator;
    //    }
    //})
    Object.defineProperty(self, 'settings', {
        value: settings
    })
    Object.defineProperty(self, 'toString', {
        get: function () {
            return url.toString;
        }
    })
    Object.defineProperty(self, 'parameters', {
        get: function () {
            return Object.fromEntries(new URL(url).searchParams.entries());
        }
    })
    Object.defineProperty(self, 'body', {
        get: function () {
            return url.body;
        }
    })
    Object.setPrototypeOf(req, this);
    return req;
}
xover.Request.prototype = Object.create(Request.prototype);

xover.fetch = async function (url, ...args) {
    let endIndex = args.length - 1;
    while (endIndex >= 0 && (args[endIndex] === undefined)) {
        endIndex--;
    }
    args.splice(endIndex + 1);
    let payload = [];
    let handlers = [];
    let headers = [];
    for (let i = args.length - 1; i >= 0; --i) {
        if (!args[i]) continue;
        if (typeof (args[i]) == 'function') {
            handlers.push(args[i]);
            args.splice(i, 1)
        } else if (args[i] instanceof Headers) {
            headers.push(args[i]);
            args.splice(i, 1)
        } else if (args[i].constructor && [Document, File, Blob, FormData, URLSearchParams].includes(args[i].constructor)) {
            payload.push(args[i]);
            args.splice(i, 1)
        }
    }

    let settings = args.pop() || {};
    if (!(url instanceof xover.URL)) {
        url = new xover.URL(url, undefined, {});
    }
    settings = xover.json.combine(Object.fromEntries(xover.manifest.getSettings(url) || []), settings);
    for (let header of headers) {
        for (let [key, value] of [...header.entries()]) {
            url.settings.headers.set(key, value);
        }
    }
    url.settings = xover.json.combine(url.settings, settings, this.hasOwnProperty("settings") ? this.settings : {});
    if (url.settings.body) {
        payload = payload.concat(url.settings.body);
    }
    payload = payload.concat(args);
    if (payload.length) {
        if (url.method === 'POST' || payload.some(item => [Document, File, Blob, FormData].includes(item.constructor))) {
            url.method = 'POST';
            url.body = payload;
        }
        for (let item of payload.filter(item => [URLSearchParams].includes(item.constructor))) {
            for (let [key, value] of [...new URLSearchParams(item).entries()]) {
                url.searchParams.append(key, value);
            }
        }
    }
    payload = url.body;
    if (payload) {
        settings["method"] = 'POST';
        let pending = [];
        for (let item of payload) {
            if (item instanceof XMLDocument) {
                item.select(".//@*[starts-with(.,'blob:')]").filter(node => node && (!node.namespaceURI || node.namespaceURI.indexOf('http://panax.io/state') == -1)).map(node => { pending.push(xover.server.uploadFile(node)) })
            }
        }
        await Promise.all(pending);
    }

    if (settings.progress instanceof HTMLElement) {
        settings.progress.value = 0;
    }
    //settings.headers = new Headers(Object.fromEntries([...new Headers(this instanceof xover.Source && this.headers || {}), ...new Headers(this instanceof xover.Source && (this.settings || {}).headers || {}), ...new Headers(settings.headers)]));
    let request = new xover.Request(url);

    let original_response;
    let stored_document;
    let expiry = (new URLSearchParams(new Headers(settings.headers || {}).get("cache-control") || {}).get("max-age") || 0) * 1000
    if (expiry) {
        let storehouse = await xover.storehouse.sources;
        stored_document = !xover.session.disableCache && await storehouse.get(request.url.href);
        if (stored_document && (!stored_document.lastModifiedDate || (Date.now() - stored_document.lastModifiedDate) < expiry)) {
            original_response = new Response(stored_document, { headers: { "Cache-Control": "no-store" } })
        }
    }
    const controller = new AbortController();
    if (this instanceof URL) {
        this.controller = controller;
    }
    if (!original_response) {
        stored_document = null;
        const signal = controller.signal;
        try {
            original_response = await fetch(request.clone(), { signal })
        } catch (e) {
            //try {
            //    if (!original_response && request.method == 'POST') {
            //        const body = await request.clone().text();
            //        const { cache, credentials, headers, integrity, mode, redirect, referrer } = request;
            //        const init = { body, cache, credentials, headers, integrity, mode, redirect, referrer };
            //        original_response = await fetch(request.url, init);
            //    }
            //} catch (e) {
            //return Promise.reject([e, request, { bodyType: 'text' }]);
            //}
            return Promise.reject(e)
        }
    }
    if (!original_response && !controller.signal.aborted) return Promise.reject(`No response for ${url}!`);

    let response = new xover.Response(original_response, request);
    let res = original_response.clone();
    const contentLength = res.headers.get('content-length');
    let receivedLength = 0;
    const stream = res.body.getReader();
    const progress = () => {
        stream.read().then(({ done, value }) => {
            let _progress;
            //source.abortFetch = null;
            if (done) {
                _progress = 100;
            } else {
                receivedLength += value.byteLength;
                let percent = (receivedLength / contentLength) * 100
                _progress = percent;
                progress();
            }
            window.top.dispatchEvent(new xover.listener.Event('progress', { controller, percent: _progress }, request));
        }).catch(e => {
            if (e.name != 'AbortError') {
                console.log(e)
            }
        });
    };
    if (!controller.signal.aborted) {
        progress();
    }
    let document = await response.processBody.apply(this);

    if (document instanceof Document) {
        let url = request.url;
        let href = url.href.replace(new RegExp(`^${location.origin}`), "").replace(new RegExp(`^${location.pathname.replace(/[^/]+$/, "")}`), "").replace(/^\/+/, '');
        Object.defineProperty(document, 'url', {
            get: function () {
                return url;
            }
        });
        Object.defineProperty(document, 'href', {
            get: function () {
                return href
            }
        });
    }
    let self = this;
    if (this instanceof xover.Source) {
        Object.defineProperty(document, 'source', {
            get: function () {
                return self;
            }
        });
    }
    response.tag = ((`${url.pathname || url}`).replace(/^\//, ''));
    let manifest_settings = xover.manifest.getSettings(response.tag, "stylesheets");
    document instanceof XMLDocument && manifest_settings.reverse().map(stylesheet => {
        return_value.addStylesheet(stylesheet);
    });
    //window.top.dispatchEvent(new xover.listener.Event(`response`, { request }, response)); 
    if (response.ok) {
        handlers.forEach(handler => handler(return_value, response, request));
        window.top.dispatchEvent(new xover.listener.Event(`success`, { url, request, response, status: response.status, statusText: response.statusText }, response));
    } else {
        window.top.dispatchEvent(new xover.listener.Event(`failure`, { url, request, response, status: response.status, statusText: response.statusText }, response));
    }

    if (!response.ok && (typeof (settings.rejectCodes) == 'number' && response.status >= settings.rejectCodes || settings.rejectCodes instanceof Array && settings.rejectCodes.includes(response.status))) {
        return Promise.reject(response);
    } else if (response.status == 401 && url.host == location.host) {
        xover.session.status = "unauthorized";
    }
    if (response.status == 204) {
        document = xover.xml.createDocument();
    }

    if (response.ok) {
        if (
            (request.headers.get("Accept") || "").indexOf("*/*") != -1 ||
            request.headers.get("Accept").split(/\s*,\s*/g).includes(response.headers.get("content-type")) ||
            xover.mimeTypes[response.bodyType] == request.headers.get("Accept") ||
            (request.headers.get("Accept") || "").replace("text/plain", "text").indexOf(document.type) != -1 ||
            (request.headers.get("Accept") || "").replace("text/plain", "text").indexOf(response.bodyType) != -1) {

            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    } else {
        return Promise.reject(response);
    }


    //if (response.status == 204) {
    //    return Promise.reject(response);
    //} else if ([409, 449, 503].includes(response.status)) {
    //    return Promise.reject(response);
    //} else if (
    //    (request.headers.get("Accept") || "").indexOf("*/*") != -1 ||
    //    xover.mimeTypes[response.bodyType] == request.headers.get("Accept") ||
    //    (request.headers.get("Accept") || "").replace("text/plain", "text").indexOf(document.type) != -1 ||
    //    (request.headers.get("Accept") || "").replace("text/plain", "text").indexOf(response.bodyType) != -1) {
    //    return Promise.resolve(response);
    //} else if (response.bodyType == 'html' && document instanceof DocumentFragment) {
    //    xover.dom.createDialog(document);
    //}
    //return Promise.reject(response);
}

xover.fetch.from = async function () {
    let response = await xover.fetch.apply(this, arguments);
    return response.body;
}

xover.fetch.xml = async function (url, ...args) {
    if (!url) return null;
    if (!(url instanceof xover.URL)) {
        url = new xover.URL(url);
    }
    url.settings["headers"].append("Accept", "text/xml,application/xml,text/xsl,application/xslt+xml")

    try {
        let response = await xover.fetch.apply(this, [url, ...args]);
        let return_value = response.document || response;
        if (return_value instanceof Response && return_value.headers.get('Content-Type').toLowerCase().indexOf("json") != -1) {
            return_value = xover.xml.fromJSON(return_value.body);
        }
        if (return_value instanceof Document && xover.session.debug) {
            for (let el of return_value.select(`//xsl:template/*[not(self::xsl:*) or self::xsl:attribute[not(preceding-sibling::xsl:attribute)] or self::xsl:comment[not(preceding-sibling::xsl:comment)]]|//xsl:template//xsl:*//html:option|//xsl:template//html:*[not(parent::html:*)]|//xsl:template//svg:*[not(ancestor::svg:*)]|//xsl:template//xsl:comment[.="debug:info"]`).filter(el => !el.selectFirst(`preceding-sibling::xsl:text|preceding-sibling::text()[normalize-space()!='']`))) {
                let ancestor = el.select("ancestor::xsl:template[1]|ancestor::xsl:if[1]|ancestor::xsl:when[1]|ancestor::xsl:for-each[1]|ancestor::xsl:otherwise[1]").pop();
                let debug_node = xover.xml.createNode((el.selectSingleNode('preceding-sibling::xsl:attribute') || el.matches('xsl:attribute') || el.selectSingleNode('self::html:textarea')) && `<xsl:attribute xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:debug="http://panax.io/debug" name="xo-debug"><![CDATA[${new xover.URL(url).href}: template ${el.select(`ancestor::xsl:template[1]/@*`).map(attr => `${attr.name}="${attr.value}"`).join(" ")}]]></xsl:attribute>` || `<xsl:comment xmlns:xsl="http://www.w3.org/1999/XSL/Transform">&lt;template
scope="<xsl:value-of select="name(ancestor-or-self::*[1])"/><xsl:if test="not(self::*)"><xsl:value-of select="concat('/@',name())"/></xsl:if>"
file="${new xover.URL(url).href}"
>${ancestor.localName == 'template' ? '' : `
&lt;!- -${ancestor.nodeName} ${[...ancestor.attributes].filter(attr => !['xo:id'].includes(attr.nodeName)).map(attr => `${attr.nodeName}="${attr.value.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/--/g, '- -')}"`)}- -&gt;`}
${el.select(`ancestor::xsl:template[1]/@*`).map(attr => `${attr.name}="${new Text(attr.value).toString()}"`).join(" ")} &lt;/template></xsl:comment>`);
                if (el.selectSingleNode('self::xsl:comment[.="debug:info"]')) {
                    el.replaceWith(debug_node)
                } else if (debug_node.selectSingleNode('self::xsl:attribute') || el.selectSingleNode('self::html:*')) {
                    el.prepend(debug_node)
                } else {
                    el.before(debug_node)
                }
            }
        }
        if (return_value.documentElement && return_value.selectFirst('xsl:*')) {
            //if (!return_value.documentElement.resolveNS('')) {
            //    return_value.documentElement.setAttributeNS(xover.spaces["xmlns"], "xmlns", xover.spaces["xhtml"])
            //}/*doesn't work properly as when declared from origin */

            /*sets xhtml namespace by default */
            if (!return_value.documentElement.hasAttribute("xmlns")) {
                return_value.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns", "http://www.w3.org/1999/xhtml");
            }
            /*Fixes naamespace for svg with missing xmlns*/
            for (let svg of [...return_value.documentElement.querySelectorAll(`svg, svg > *`)].filter(svg => !svg.attributes.xmlns && svg.namespaceURI == 'http://www.w3.org/1999/xhtml')) {
                let new_svg = document.createElementNS('http://www.w3.org/2000/svg', svg.nodeName);
                Array.from(svg.attributes).forEach(attr => {
                    new_svg.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
                });
                new_svg.append(...svg.childNodes)
                svg.replaceWith(new_svg)
            }

            /* Preserve significant spaces*/
            for (let text of return_value.select(`.//text()[.!='' and normalize-space(.)='']`).filter(text => text.nextElementSibling instanceof HTMLElement && text.previousElementSibling instanceof HTMLElement && ![HTMLStyleElement, HTMLScriptElement, HTMLLinkElement].includes(text.previousElementSibling) && ![HTMLStyleElement, HTMLScriptElement, HTMLLinkElement].includes(text.nextElementSibling))) {
                text.replaceWith(xover.xml.createNode(`<xsl:text xmlns:xsl="http://www.w3.org/1999/XSL/Transform"> </xsl:text>`))
            }

            if (!return_value.documentElement.resolveNS('xo')) {
                return_value.documentElement.setAttributeNS(xover.spaces["xmlns"], "xmlns:xo", xover.spaces["xo"])
            }

            for (let el of return_value.select(`(//xsl:template[not(@match="/")]//html:*[not(self::html:script or self::html:style or self::html:link)]|//svg:*[not(ancestor::svg:*)])[not(@xo-source or @xo-stylesheet or ancestor-or-self::*[@xo-slot or @xo-scope])]`)) {
                el.set("xo-slot", el.getAttribute("type") == "search" ? "search:{local-name(current())}" : "{name(current()[not(self::*)])}")
            }

            for (let el of return_value.select(`//xsl:template[not(.//xsl:param/@name="xo:context") and not(.//xsl:variable/@name="xo:context")]`)) {
                el.prepend(xover.xml.createNode(`<xsl:param name="xo:context" select="."/>`));
            }

            for (let el of return_value.select(`//xsl:template[xsl:param/@name="xo:context"]//xsl:apply-templates[not(xsl:with-param/@name="xo:context")]|//xsl:template[xsl:param/@name="xo:context"]//xsl:call-template[not(xsl:with-param/@name="xo:context")]`)) {
                el.prepend(xover.xml.createNode(`<xsl:with-param name="xo:context" select="$xo:context"/>`));
            }

            for (let el of return_value.select(`(//xsl:*[not(@match="/")]/html:*[not(self::html:script or self::html:style or self::html:link)]|//xsl:*/svg:*[not(ancestor::svg:*)])[not(@xo-source or @xo-stylesheet or ancestor-or-self::*[@xo-scope])]`)) {
                el.set("xo-scope", "{current()[not(self::*)]/../@xo:id|@xo:id}");
            }

            for (let el of return_value.select(`//xsl:template[not(@match="/")]//xsl:element`)) {
                el.prepend(xover.xml.createNode(`<xsl:attribute name="xo-slot"><xsl:value-of select="name(current()[not(self::*)])"/></xsl:attribute>`));
                el.prepend(xover.xml.createNode(`<xsl:attribute name="xo-scope"><xsl:value-of select="current()[not(self::*)]/../@xo:id|@xo:id"/></xsl:attribute>`));
            }
        }
        if (location.host == url.host) {
            return_value.documentElement && return_value.documentElement.selectNodes("xsl:import/@href|xsl:include/@href|//html:link/@href|//html:script/@src|//processing-instruction()").map(async node => {
                let href = `${node.href || node}`;
                if (!href.match(/^[\/#]|^\.\/|{/)) {
                    let new_href = new URL(href, response.url || response.href).href;//Permite que descargue correctamente los templates, pues con documentos vacíos creados, no se tiene referencia de la URL actual (devuelve about:blank). Con esto se corrige
                    if (href != new_href) {
                        if (node instanceof ProcessingInstruction) {
                            node.href = new_href;
                        } else {
                            node.set(new_href);
                        }
                    }
                }
            });
            let imports = return_value.documentElement && return_value.documentElement.selectNodes("xsl:import/@href|xsl:include/@href|//processing-instruction()").reduce((arr, item) => { arr.push(item.href || item.value); return arr; }, []) || [];
            if (imports.length) {
                function assert(condition, message) {
                    if (!condition) {
                        throw new Error(message);
                    }
                }

                try {
                    let rejections = []
                    await Promise.all(imports.map(async href => await xover.sources[href].ready && xover.sources[href]));
                    if (xover.session.debug) {
                        return_value.select(`//xsl:*[xsl:param]`).forEach(template => {
                            let param_names = [...template.select(`xsl:param/@name`).map(param => param.value)];
                            try {
                                assert(param_names.length == [...new Set(param_names)].length, `Los nombres de los parámetros deben ser únicos en: ${template.nodeName} ${template.select(`@*`).map(attr => `${attr.name}="${new Text(attr.value).toString()}"`).join(" ")}>`)
                            } catch (e) {
                                rejections.push(e)
                            }
                        })
                    }
                    if (rejections.length) {
                        return Promise.reject(xover.xml.createNode(`<fieldset xmlns="http://www.w3.org/1999/xhtml"><legend>En el archivo ${url.href || url}, se encuentran los siguientes problemas: </legend><ol>${rejections.map(item => `<li>${item.href || item.url || item}${item.status == 404 ? ' - No encontrado' : ''}</li>`)}</ol></fieldset>`));
                    }
                    return_value = return_value.consolidate();
                } catch (e) {
                    window.top.dispatchEvent(new xover.listener.Event('importFailure', { tag: url.toString(), response: e, request: url }, this));
                    return Promise.reject(e);
                }
            }
            if (return_value instanceof Node) {
                for (let el of return_value.select(`//xsl:template//@xo:use-attribute-sets`)) {
                    let attribute_sets = el.value.split(/\s+/g);
                    let attributes = attribute_sets.reduce((attrs, key) => attrs.concat([el.ownerDocument.createComment(`ack:attribute-set ${key}`)]).concat(el.select(`//xsl:attribute-set[@name="${key}"]/*`)), [return_value.createComment(`ack:importing-attribute-sets-begins`)]);
                    attributes = attributes.concat(return_value.createComment(`ack:importing-attribute-sets-end`))
                    el.parentNode.prepend(...attributes)
                    el.remove();
                }
            }
            if (return_value.documentElement && return_value.documentElement.namespaceURI == 'http://www.w3.org/1999/XSL/Transform') {
                return_value.documentElement.set("exclude-result-prefixes", return_value.documentElement.attributes.toArray().filter(attr => attr.prefix == 'xmlns').map(attr => attr.localName).distinct().join(" "))
            }
        }
        return return_value;
    } catch (e) {
        return Promise.reject(e);
    }
}

xover.fetch.json = async function (url, settings) {
    if (!(url instanceof xover.URL)) {
        url = new xover.URL(url);
    }
    url.settings["headers"].append("Accept", "application/json");
    let return_value = await xover.fetch.call(this, url, settings).then(response => response.json || response.body && Promise.reject(response));
    return return_value;
}

xover.xml.fromString = function (xmlString) {
    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlString, "text/xml");
    }
    else // Internet Explorer
    {
        xmlDoc = xover.xml.createDocument();
        xmlDoc.loadXML(xmlString);
        xmlDoc.setProperty("SelectionLanguage", "XPath");
    }
    return xmlDoc
}

xover.xml.normalizeNamespaces = function (xml) {
    if (!xml || xml instanceof HTMLDocument || xml instanceof HTMLElement) return xml;
    //Element.setAttributeNS.call(xml.documentElement, xover.spaces["xmlns"], "xmlns:xsi", xover.spaces["xsi"]);
    //return xml;
    let xsl_transform = xover.sources["xover/normalize_namespaces.xslt"];
    if (navigator.userAgent.indexOf("Firefox") != -1) {
        xsl_transform.selectNodes("//xsl:copy-of[contains(@select,'namespace::')]").remove();
    }
    return xml.transform(xsl_transform);
}

xover.xml.isValid = function (input) {
    return (input instanceof XMLDocument);
}

xover.xml.tryParse = function (input) {
    try {
        let output = xover.xml.createDocument(input, { silent: true });
        return (output.getElementsByTagName('parsererror') || []).length && input || output;
    } catch (e) {
        return false;
    }
}

xover.xml.createFragment = function (xml_string) {
    const xmlDoc = new DOMParser().parseFromString("<root/>", 'text/xml');
    const fragment = xmlDoc.createDocumentFragment();
    let p = top.document.createElement('p');
    p.innerHTML = xml_string || "";
    fragment.append(...p.childNodes);
    return fragment;
}

xover.xml.createNode = function (xml_string, options) {
    let result = xover.xml.createDocument(xml_string, options);
    result.disconnect();
    result = result.firstElementChild || result
    if (!result.prefix && result.namespaceURI && !result.attributes.xmlns) {
        result.setAttributeNS(xover.spaces["xmlns"], "xmlns", result.namespaceURI)
    }
    return result;
}

xml = xover.xml.createNode

xover.xml.encodeValue = function (value) {
    try {
        value = value === "null" && String(value) || value !== undefined && (isFinite(value) && eval(`(${value})`) || `'${value || ''}'`) || '';
    } catch (e) {
        value = value;
    }
    return value
}

xover.xml.parseValue = function (value) {
    return eval(`(${value})`)
}

xover.xml.staticMerge = function (node1, node2) {
    node1.select(`.//text()[normalize-space(.)='']`).forEach(text => !text.nextElementSibling && text.remove());
    node2.select(`.//text()[normalize-space(.)='']`).forEach(text => !text.nextElementSibling && text.remove());
    if (node1.classList && node2.classList && node1.classList.contains("xo-working")) node2.classList.add("xo-working");
    if (!(node1.contains(document.activeElement) || node1.contains("[xo-static],.xo-working")) || node1.nodeName.toLowerCase() !== node2.nodeName.toLowerCase() || node1.isEqualNode(node2)) return;
    let static = document.firstElementChild.cloneNode().classList;
    static.value = node1 instanceof Element && node1.getAttribute("xo-static") || "";

    if (static.contains("self::*")) {
        node2.replaceWith(node1.cloneNode(true))
        return null;
    }
    if (static.length && node1.nodeName.toLowerCase() === node2.nodeName.toLowerCase()) {
        for (let attr of node1.attributes) {
            if (!(static.contains("@*") && !(static.contains(`-@${attr.name}`)) || static.contains(`@${attr.name}`))) continue;
            node2.setAttributeNode(attr.cloneNode(true));
        }
    }
    if (static.contains("*")) {
        node2.replaceChildren(...node1.cloneNode(true).childNodes)
    }
    if (node1.childNodes.length && node1.children.length == node2.children.length) {
        const node1_children = [...node1.children];
        const node2_children = [...node2.children];
        const pairs = node1_children.map((el, ix) => [el, node2_children[ix]]);
        for (let [child1, child2] of pairs) {
            xover.xml.staticMerge(child1, child2)
        }
    } else if (node1.cloneNode().isEqualNode(node2.cloneNode())) {
        /*TODO: Detect changes in children*/
    }
}

xover.xml.combine = function (target, new_node) {
    if (target instanceof Element && !target.staticAttributes && target.hasAttributes() && (
        target.hasAttribute("xo-source") && target.getAttribute("xo-source") == (new_node.getAttribute("xo-source") || target.getAttribute("xo-source"))
        || target.hasAttribute("xo-stylesheet") && target.getAttribute("xo-stylesheet") == (new_node.getAttribute("xo-source") || target.getAttribute("xo-stylesheet"))
    )
    ) {
        target.staticAttributes = [...target.attributes || []].map(attr => `@${attr.name}`);
    }
    let swap = document.firstElementChild.cloneNode().classList;
    swap.value = target instanceof Element && target.getAttribute("xo-swap") || "";
    let static = document.firstElementChild.cloneNode().classList;
    static.value = target instanceof Element && target.getAttribute("xo-static") || "";
    (target.staticAttributes instanceof Array && (target.constructor != HTMLElement && target.constructor === new_node.constructor || target.nodeName.toUpperCase() == new_node.nodeName.toUpperCase())) && static.add(...target.staticAttributes);
    if (target instanceof HTMLElement && new_node instanceof Element && (new_node.namespaceURI || '').indexOf("http://www.w3.org") == -1) {
        let text = target.ownerDocument.createTextNode(new_node);
        new_node = document.createElement(`code`);
        new_node.append(text);
    }
    for (let item of [...static].filter(item => item != "@*" && item[0] == "@")) {
        let static_attribute = target.getAttributeNode(item.substring(1));
        static_attribute && new_node.setAttributeNode(static_attribute.cloneNode(), { silent: true })
    }
    let named_slots = new_node instanceof Element && new_node.hasAttribute("xo-source") && !(new_node.hasAttribute("xo-stylesheet")) && new_node.querySelectorAll("slot[name]") || [];
    if (named_slots.length) {
        let context = new_node.source;
        if (context.documentElement && context.documentElement.matches("xson:*")) {
            for (let slot of named_slots) {
                let name = slot.name;
                let new_content = context.documentElement.get(name);
                if (!(name && new_content)) continue
                slot.replaceChildren(...[new_content.value].flat())
            }
        }
    }
    if (![HTMLScriptElement].includes(target.constructor) && target.isEqualNode(new_node)) return target;
    if (
        target instanceof Element && (
            /*`${new_node.getAttributeNode("xo-scope")}` !== `${target.getAttributeNode("xo-scope")
            || new_node.getAttributeNode("xo-scope")}` && `${target.closest(`[xo-stylesheet],[xo-source]`).getAttributeNode("xo-source")}` == `${new_node.closest(`[xo-stylesheet],[xo-source]`).getAttributeNode("xo-source")}`
            || */swap.contains("self")
            || [...swap].some(predicate => target.matches(predicate))
        )
        || target.constructor !== new_node.constructor && (
            target.id && target.id === new_node.id
            || target.hasAttribute("xo-source") && target.getAttribute("xo-source") == new_node.getAttribute("xo-source")
            || target.hasAttribute("xo-stylesheet") && target.getAttribute("xo-stylesheet") == new_node.getAttribute("xo-stylesheet")
        )
        || target.constructor == new_node.constructor && (
            !(target instanceof Element)
            || [HTMLScriptElement, HTMLSelectElement].includes(target.constructor)
        )
        || target instanceof SVGElement && !(new_node instanceof SVGElement)
    ) {
        let restore_focus = target.contains(document.activeElement)
        for (let item of [...static].filter(item => item != "@*" && item[0] == "@")) {
            new_node.setAttributeNode(target.removeAttributeNode(target.getAttributeNode(item.slice(1))))
        }
        target.replaceWith(new_node)
        restore_focus && new_node.focus()
        return new_node
    } else if (
        (target.constructor != HTMLElement && target.constructor === new_node.constructor || target.nodeName.toUpperCase() == new_node.nodeName.toUpperCase()) && (target.getAttribute("xo-source") || new_node.getAttribute("xo-source")) == (new_node.getAttribute("xo-source") || target.getAttribute("xo-source"))
        || new_node instanceof HTMLBodyElement
        || target.hasAttribute("xo-stylesheet") && target.getAttribute("xo-stylesheet") == new_node.getAttribute("xo-stylesheet")
        || target.parentNode.matches(".xo-swap")
    ) {
        let remove_attributes = [...target.attributes].filter(attr => !static.contains(`@${attr.name}`) && ![...new_node.attributes].map(NodeName).concat(["id", "class", "xo-source", "xo-stylesheet", "xo-suspense", "xo-stop", "xo-site", "xo-schedule", "xo-static"]).includes(attr.name));
        remove_attributes.forEach(attr => attr.remove({ silent: true }));
        for (let attr of new_node.attributes) { //[...new_node.attributes].filter(attr => !attr.namespaceURI) //Is it necessary to copy attributes with namespaces?
            if (static.contains(`@${attr.name}`) && !static.contains(`-@${attr.name}`)) continue;
            if (attr.isEqualNode(target.attributes[attr.name])) continue;
            if (["value"].includes(attr.name)) {
                target[attr.name] = attr.value
            }
            target.setAttributeNode(attr.cloneNode());
        }
        //let active_element = new_node.children.toArray().find(node => node.isEqualNode(document.activeElement))
        try {
            target.replaceChildren(...new_node.childNodes)
        } catch (e) {
            if (!(e instanceof DOMException && e.name == 'NotFoundError')) {
                return Promise.reject(e)
            }
        }
        //active_element && xover.delay(100).then(() => active_element.focus());
        return target
    } else {
        if (new_node instanceof Comment && new_node.data == 'ack:empty' && target.classList instanceof DOMTokenList) {
            target.classList.add("no-source")
            return target
        } if (target.matches("[xo-source],[xo-stylesheet]")) {
            target.replaceChildren(new_node)
            return target
        } else {
            target.append(new_node);
            return new_node
        }
    }
}

xover.dom.combine = async function (target, new_node) {
    let scripts;
    let script_wrapper = window.document.firstElementChild.cloneNode();
    script_wrapper.append(...new_node.selectNodes(`html:script|html:style|.//*[self::html:script[@src or @async or not(text())][not(@defer)] or self::html:link[@href] or self::html:meta][not(text())]`));
    if (target instanceof HTMLElement && (new_node instanceof Document || new_node instanceof DocumentFragment)) {
        if (target.tagName != 'CODE' && !(new_node.firstElementChild instanceof HTMLElement)) {
            let named_slots = target.querySelectorAll("slot[name]");
            if (named_slots.length) {
                for (let slot of named_slots) {
                    let name = slot.name;
                    let new_content = new_node.documentElement.get(name);
                    if (!(name && new_content)) continue
                    slot.replaceChildren(...[new_content.value].flat())
                }
                return target;
            }
        }
        if ((new_node.firstElementChild || new_node).matches("xson:*")) {
            new_node = xover.xml.toJSON(new_node)
            new_node = JSON.stringify(new_node)
        }
        if (!(new_node instanceof Node)) {
            new_node = new Text(new_node)
        } else if (new_node.childElementCount > 1) {
            let target_clone = target.cloneNode();
            target_clone.append(...new_node.childNodes)
            new_node = target_clone;
        } else {
            new_node = new_node.firstElementChild || new_node.firstChild
        }
    }
    if (!(new_node instanceof Node)) return;
    let _applyScripts = async function (targetDocument, scripts = []) {
        for (let script of scripts) {
            let promise;
            if (script.hasAttribute("defer")) await xover.delay(1);
            if (script.selectSingleNode(`self::*[self::html:script[@src] or self::html:link[@href] or self::html:meta]`)) {
                if (![...targetDocument.querySelectorAll(script.tagName)].filter(node => node.isEqualNode(script.cloneNode())).length) {
                    let new_element = targetDocument.createElement(script.tagName); /*script.cloneNode(); won't work properly*/
                    [...script.attributes].map(attr => new_element.setAttributeNode(attr.cloneNode(true)));
                    let on_load = script.textContent;

                    if (new_element instanceof HTMLScriptElement) {
                        promise = new Promise(async (resolve, reject) => {
                            new_element.onload = function () {
                                on_load && (function () { return eval.apply(this, arguments) }(on_load))
                                resolve()
                            };
                        });
                    }
                    targetDocument.head.appendChild(new_element);
                }
            } else if (!script.getAttribute("src") && script.innerHTML) {
                script.innerHTML = xover.string.htmlDecode(script.innerHTML); //Cuando el método de output es html, algunas /entidades /se pueden codificar. Si el output es xml las envía corregidas
                if (script.hasAttribute("defer") || script.hasAttribute("async") || script.selectSingleNode(`self::html:style`)) {
                    if (![...targetDocument.documentElement.querySelectorAll(script.tagName)].find(node => node.isEqualNode(script))) {
                        targetDocument.documentElement.appendChild(script);
                    }
                } else {
                    try {
                        //function evalInScope(js, scope) {
                        //    return function () {
                        //        with (this) { return eval(js) }
                        //    }.call(scope)
                        //}
                        //let result = evalInScope(script.textContent, script.getAttributeNode("xo-scope") && script.scope || window)
                        let result = (function () {
                            xover.context = script.original || script;
                            if (window.document.contains(xover.context)) {
                                return eval.apply(this, arguments)
                            }
                        }(`/*${target.getAttribute("xo-stylesheet")}*/ let self = xover.context; let context = self.parentNode; ${script.textContent};xover.context = undefined;`));
                        if (['string', 'number', 'boolean', 'date'].includes(typeof (result))) {
                            let target = document.getElementById(script.id);
                            target && target.parentNode.replaceChild(target.ownerDocument.createTextNode(result), target);
                        }
                    } catch (message) {
                        console.error(message)
                    }
                }
            } else {
                throw (new Error(`A script couldn't be loaded.`));
            }
            if (script.hasAttribute("defer")) await promise;
        }
    }
    await _applyScripts(document, [...script_wrapper.children]);
    target.disconnected = false;
    let post_render_scripts = new_node.selectNodes('.//*[self::html:script][@src]');
    post_render_scripts.forEach(script => script_wrapper.append(script));

    xover.xml.staticMerge(target, new_node);
    let before_dom = new xover.listener.Event('beforeRender', { store: target.store, stylesheet: target.stylesheet, target: target, document, context: target.context, dom: new_node.cloneNode(true), element: new_node }, new_node);
    window.top.dispatchEvent(before_dom);
    await xover.subscribeReferencers(new_node);
    let changes = xover.xml.getDifferences(target, new_node);
    if (!changes.length) return target;
    let preceding_siblings = [];
    let target_preceding_siblings = [];

    //target.ownerDocument.disconnect();
    scripts = new_node.selectNodes('.//*[self::html:script][not(@src)][text()]').map(el => {
        let cloned = el.cloneNode(true);
        cloned.original = el;
        el.textContent = ''
        Object.defineProperty(cloned, 'parentNode', {
            value: el.parentNode
        });
        return cloned;
    });
    if (before_dom.cancelBubble || before_dom.defaultPrevented) return target;
    if (new_node && (new_node.tagName || '').toLowerCase() == "html") {
        //dom.namespaceURI == "http://www.w3.org/1999/xhtml"
        //xover.dom.setEncryption(new_node, 'UTF-7');
        new_node.select('//text()[.="�"]').remove();
        let iframe;
        if (document.activeElement.tagName.toLowerCase() == 'iframe') {
            iframe = document.activeElement;
            target = (document.activeElement || {}).contentDocument.querySelector('main,table,div,span');
            target.parentElement.replaceChild(new_node.querySelector(target.tagName.toLowerCase()), target);
        } else {
            //target.replaceChildren();
            if (target.tagName.toLowerCase() == "iframe") {
                iframe = target;
            } else {
                iframe = document.createElement('iframe');
                new_node.select(`.//@src|.//@href`).forEach(attr => attr.value = xover.URL(attr.value).toString());
                //iframe.width = "100%"
                //iframe.height = "1000"
                iframe.setAttributeNS(null, "xo-source", tag);
                //stylesheet_href && iframe.setAttributeNS(null, "xo-stylesheet", stylesheet_href);
                iframe.style.backgroundColor = 'white';
                xover.xml.combine(target, iframe);
                Object.entries(xover.listener).forEach(([event_name, handler]) => iframe.addEventListener(event_name, handler));
                //iframe.addEventListener('focusout', xover.listeners.dom.onfocusout);
                //iframe.addEventListener('change', xover.listeners.dom.onchange);
            }
            let url = xover.dom.getGeneratedPageURL({
                html: xover.xml.fromHTML(new_node),//xover.string.htmlDecode(new_node.toString()),
                css: (new_node.querySelector('style') || {}).innerHTML,
                js: `var xover = (xover || parent.xover); document.xover_global_refresh_disabled=true; let iframe=parent.document.querySelector('iframe'); iframe.height=document.querySelector('body').scrollHeight+10; iframe.width=document.querySelector('body').scrollWidth+10; xover.modernize(iframe.contentWindow); document.querySelector('body').setAttributeNS(null, "xo-source", '${tag}');` //+ js//((dom.querySelector('script') || {}).innerHTML || "")
                //window.top.document.querySelector('body').setAttributeNS(null, "xo-source", window.top.location.hash)
            });
            iframe.src = url;
        }
        target = iframe;
    } else {
        //let coordinates = active_element.scrollPosition;

        //target.observer && target.observer.disconnect();
        [...target.querySelectorAll("input[type=text][value]")].filter(input => input !== document.activeElement && input.value != input.getAttribute("value")).forEach(input => input.value = input.getAttribute("value"));
        for (let [[curr_node, new_node]] of changes) {
            if ((curr_node instanceof HTMLElement || curr_node instanceof SVGElement) && curr_node !== target && curr_node.hasAttribute("xo-stylesheet")) {
                continue;
            }
            if (!curr_node.parentNode) continue;
            if (!curr_node.ownerDocument.contains(curr_node)) continue;
            let target_preceding_siblings = [];
            let new_node_preceding_siblings = [];
            if (target === curr_node) {
                target_preceding_siblings = curr_node.select("preceding-sibling::comment()").filter(el => el.relatedNode = target);
                new_node_preceding_siblings = new_node.select("preceding-sibling::comment()");
            }
            let result;
            let active_element = document.activeElement;
            let selector, selection, current_value;
            if (curr_node.contains(document.activeElement)) {
                current_value = active_element instanceof HTMLInputElement && active_element.value || undefined;
                selector = active_element.selector;
                selection = xover.dom.getCaretPosition(active_element)
            }
            if (document.startViewTransition && (curr_node instanceof Element && curr_node.querySelector("[style*=view-transition-name]") || new_node instanceof Element && new_node.querySelector("[style*=view-transition-name]"))) {
                curr_node.querySelectorAll("[style*=view-transition-name][id]").toArray().map(item => [item, new_node.querySelector(`[id=${item.id}]`)]).filter(([, matched]) => matched).forEach(([curr, matched]) => matched.style.viewTransitionName = curr.style.viewTransitionName);
                try {
                    let view_transition = document.startViewTransition(() => result = xover.xml.combine(curr_node, new_node));
                    await view_transition.finished;//.then(() => img.style.viewTransitionName = '');
                } catch (e) {
                    result = xover.xml.combine(curr_node, new_node)
                    if (!(e && e.name == 'AbortError')) {
                        throw (e)
                    }
                }
            } else {
                result = xover.xml.combine(curr_node, new_node);
            }
            if (selector && active_element !== document.activeElement) {
                active_element = (document.querySelector(selector) || document.createElement("p"));
                if (current_value) {
                    active_element.value = current_value;
                }
                let focus_attr = active_element.getAttributeNode("onfocus");
                focus_attr && focus_attr.remove()
                if (selection) {
                    xover.dom.setCaretPosition(active_element, selection);
                } else {
                    active_element.focus();
                }
                setTimeout(() => {
                    active_element.addEventListener('focus', function (event) {
                        event.stopImmediatePropagation();
                    }, { once: true });

                    active_element.addEventListener('focusin', function (event) {
                        event.stopImmediatePropagation();
                    }, { once: true });
                }, 0);
                focus_attr && active_element.setAttributeNode(focus_attr)
            }
            //!(active_element.cloneNode().isEqualNode(document.activeElement.cloneNode())) && new_node.focus();

            if (new_node_preceding_siblings.length) {
                new_node_preceding_siblings.forEach(node => node.relatedNode = result);
                result.before(...new_node_preceding_siblings)
            }
            if (target === curr_node) {
                target = result;
            }
        }
        //if (coordinates) coordinates.target.scrollPosition = { behavior: 'instant', top: coordinates.y, left: coordinates.x };

        xover.delay(1).then(() => _applyScripts(document, post_render_scripts));
        //if (other_scripts.length) {
        //    _applyScripts(document, other_scripts);
        //}
    }

    //if (window.MathJax) {/*TODO: Mover este código a algún script diferido*/
    //    MathJax.typeset && MathJax.typeset();
    //} else if (target.selectSingleNode('//mml:math') || ((target || {}).textContent || '').match(/(?:\$\$|\\\(|\\\[|\\begin\{.*?})/)) { //soporte para MathML
    //    if (!window.MathJax) {
    //        window.MathJax = {
    //            loader: { load: ['[mml]/mml3'] }
    //        }
    //    }
    //    let script = document.createElement('script');
    //    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    //    document.head.appendChild(script);
    //}

    let unbound_elements = target.querySelectorAll('[xo-source=""],[xo-scope=""],[xo-slot=""]');
    if (unbound_elements.length) {
        console.warn(`There ${unbound_elements.length > 1 ? 'are' : 'is'} ${unbound_elements.length} disconnected element${unbound_elements.length > 1 ? 's' : ''}`, unbound_elements)
    }
    //let invalid_scope = target.querySelectorAll('[xo-source][xo-scope],[xo-stylesheet][xo-scope]');
    //if (invalid_scope.length) {
    //    console.warn(`There ${invalid_scope.length > 1 ? 'are' : 'is'} ${invalid_scope.length} misconfigured element${invalid_scope.length > 1 ? 's' : ''}`, invalid_scope)
    //}

    _applyScripts(document, scripts);
    xover.initializeElementListeners(target);
    dependants = [...target.querySelectorAll('[xo-source],[xo-stylesheet]')];
    dependants.forEach(el => el.render());
    return target;

    ///*TODO: Mover este código a algún script diferido*/
    //target.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (tooltipTriggerEl) {
    //    return new bootstrap.Tooltip(tooltipTriggerEl)
    //})
}

xover.xml.createElement = function (tagName) {
    let { prefix } = xover.xml.getAttributeParts(tagName);
    let target_document = xover.stores.active.document;
    let namespace = (target_document.documentElement || target_document).resolveNS(prefix)
    return document.implementation.createDocument(namespace || "", tagName, null).documentElement;
}

xover.xml.clone = function (source) {
    return xover.xml.createDocument(source);
}

xover.xml.fromHTML = function (element) {
    let xhtml = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "", null);
    if (element) {
        xhtml.appendChild(xhtml.importNode(element.documentElement || element, true));
    }
    return xhtml
}

xover.data.createMessage = function (message_content, message_type) {
    let message = xover.xml.createDocument('<xo:message xmlns:xo="http://panax.io/xover" type="' + (message_type || "exception") + '"/>').seed();
    if (message_content instanceof HTMLElement) {
        message.documentElement.set(message_content)
    } else if ({}.constructor === message_content.constructor) {
        message = xover.xml.fromJSON(message_content, { mode: 'elements' });
    } else {
        message.documentElement.set(message_content.toString());
    }
    console.trace();
    return message;
}

xover.sources.defaults["styles.css"] = xover.xml.createDocument(`
<style>
iframe {
    display: block;       
    background: #000;
    border: none;         
    height: 100vh;        
    width: 100vw;
    resize: both;
}

dialog {
  max-width: 50ch;
}
dialog > * {
  margin: 0 0 0.5rem 0;
}

dialog::-webkit-backdrop {
  background: rgba(0, 0, 0, 0.4);
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
}

form {
  display: grid;
  gap: 1em;
}

footer {
    position: fixed !important;
    bottom: 0px;
    display: block;
    margin-bottom: 15px;
}

header {
    position: fixed !important;
    top: 0px;
    display: block;
    margin-top: 15px;
}
</style>`);

xover.sources.defaults["error.xslt"] = xover.xml.createDocument(`
<xsl:stylesheet version="1.0"                                                                           
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    
    xmlns="http://www.w3.org/1999/xhtml">                                                               
    <xsl:output method="xml" indent="no" />                                                             
    <xsl:template match="node()">
    <div class="jumbotron">                                                                             
        <div class= "container text-center" style="padding-top:30pt; padding-bottom:30pt;">             
            <h2 class="text-center">Parece que la versión que usas ha cambiado o contiene errores en este módulo. Por favor actualiza tus librerías o repórtalo con el administrador.</h2>    
            <br/><button type="button" class="btn btn-primary btn-lg text-center" onclick="xover.stores.active.sources.reload()">Actualizar librerías</button>                               
            <br/><br/><button type="button" class="btn btn-primary btn-lg text-center" onclick="xover.session.save()">Reportar</button>                                    
        </div>                                                                                          
    </div>                                                                                              
    </xsl:template>                                                                                     
    <xsl:template match="text()|processing-instruction()|comment()"/>
</xsl:stylesheet>`);

xover.sources.defaults["empty.xslt"] = xover.xml.createDocument(`
<xsl:stylesheet version="1.0"                                                                           
    xmlns:xo="http://panax.io/xover"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    
    xmlns:js="http://panax.io/xover/javascript"                                                    
    xmlns="http://www.w3.org/1999/xhtml">                                                               
    <xsl:output method="xml" indent="no" />
    <xsl:param name="js:snapshots"><![CDATA[self.store && self.store.snapshots.length || 0]]></xsl:param>
    <xsl:template match="xo:empty">
    <div class="jumbotron">                                                                             
        <div class= "container text-center" style="padding-top:30pt; padding-bottom:30pt;">             
            <h2 class="text-center">El documento está vacío.</h2>    
            <xsl:if test="$js:snapshots&gt;0">
            <br/><button type="button" class="btn btn-primary btn-lg text-center" onclick="this.store.undo()">Deshacer último cambio</button>
            <br/><br/><button type="button" class="btn btn-primary btn-lg text-center" onclick="this.store.document.fetch()">Descargar desde la fuente</button>
            </xsl:if>
        </div>                                                                                          
    </div>                                                                                              
    </xsl:template>                                                                                     
    <xsl:template match="text()|processing-instruction()|comment()"/>
</xsl:stylesheet>`);

xover.sources.defaults["shell.xslt"] = xover.xml.createDocument(`
<xsl:stylesheet version="1.0"                                                                           
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    
    xmlns="http://www.w3.org/1999/xhtml">                                                               
    <xsl:output method="xml" indent="no" />                                                             
    <xsl:template match="node()">
    <main><div class="p-5 mb-4 bg-light rounded-3">
      <div class="container-fluid py-5">
        <h1 class="display-5 fw-bold">Welcome to xover!</h1>
        <p class="col-md-8 fs-4">Please create your templates in your own transformation file.</p><p>Starting with shell.xslt is a good idea.</p>
        <a href="https://xover.dev" target="_blank">Show me how!</a>
      </div>
    </div>
    </main>
    </xsl:template>                                                                                     
    <xsl:template match="text()|processing-instruction()|comment()"/>
</xsl:stylesheet> `);

xover.sources.defaults["login.xslt"] = xover.xml.createDocument(`
<xsl:stylesheet version="1.0"                                                                           
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    
    xmlns="http://www.w3.org/1999/xhtml">                                                               
    <xsl:output method="xml" indent="no" />                                                             
    <xsl:template match="node()">
    <div class="p-5 mb-4 bg-light rounded-3">
      <div class="container-fluid py-5">
        <h1 class="display-5 fw-bold">Welcome to xover!</h1>
        <p class="col-md-8 fs-4">It looks like login feature is enabled and requires a template.</p><p>Please create your templates in your own transformation file.</p><p>Starting with login.xslt is a good idea.</p>
        <a href="https://xover.dev" target="_blank">Show me how!</a>
      </div>
    </div>
    </xsl:template>                                                                                     
    <xsl:template match="text()|processing-instruction()|comment()"/>
</xsl:stylesheet>`);

xover.sources.defaults["loading.xslt"] = xover.xml.createDocument(`
<xsl:stylesheet version="1.0"                                                                           
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:js="http://panax.io/xover/javascript"
    xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="js">
    <xsl:output method="xml" indent="no" />
    <xsl:param name="js:icon"><![CDATA[[...document.querySelectorAll('link[type = "image/x-icon"]')].map(el => el && el.getAttribute("href"))[0]]]></xsl:param>
    <xsl:template match="node()">
    <div class="loading xo-loading" onclick="this.remove()" role="alert" aria-busy="true"/>
    </xsl:template>                                                                                     
    <xsl:template match="text()|processing-instruction()|comment()"/>
</xsl:stylesheet>`);

xover.sources.defaults["message.xslt"] = xover.xml.createDocument(`
<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xo="http://panax.io/xover"
  xmlns:xson="http://panax.io/xson"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="xsl xo"
>
  <xsl:output method="xml"
     omit-xml-declaration="yes"
     indent="yes" standalone="no"/>

  <xsl:template match="/*">
    <dialog open="open" style="width: fit-content; max-width: 600px; margin: 0 auto; top: 25vh; padding: 1rem; overflow: auto; position: fixed; z-index: var(--zindex-modal, 1055);" role="alertdialog"><header style="display:flex;justify-content: end;"><button type="button" formmethod="dialog" aria-label="Close" onclick="this.closest('dialog').remove();" style="background-color:transparent;border: none;"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-x-circle text-primary_messages" viewBox="0 0 24 24"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></button></header><form method="dialog" onsubmit="closest('dialog').remove()"><h4 style="margin-left: 3rem !important;"><xsl:apply-templates/></h4></form></dialog>
  </xsl:template>

  <xsl:template match="html:*"><xsl:copy-of select="."/></xsl:template>
  <xsl:template match="xson:object/*"><li><strong><xsl:value-of select="name()"/>: </strong> <xsl:apply-templates select="text()"/></li></xsl:template>
</xsl:stylesheet>`);

xover.data.default = xover.xml.createDocument('<?xml-stylesheet type="text/xsl" href="shell.xslt" role="shell" target="body"?><shell:shell xmlns:xo="http://panax.io/xover" xmlns:shell="http://panax.io/shell" xmlns:state="http://panax.io/state" xmlns:source="http://panax.io/source" xo:id="shell" xo:hash=""></shell:shell>');

xover.xml.Empty = function () {
    if (!(this instanceof xover.xml.Empty)) return new xover.xml.Empty();
    return xover.xml.createDocument();
}

xover.xml.safeEntities = {
    "<": "&lt;"
}

xover.xml.encodeEntities = function (text) {
    new_text = text;
    new_text = new_text.replace(/</g, xover.xml.safeEntities["<"]);
    return new_text;
}

xover.dom.setEncryption = function (dom, encryption) {
    encryption = (encryption || "UTF-7")
    if (typeof (dom.selectSingleNode) != 'undefined') {
        let meta_encoding = dom.selectSingleNode('//*[local-name()="meta" and @http-equiv="Content-Type" and not(contains(@content,"' + encryption + '"))]');
        if (meta_encoding) {
            meta_encoding.setAttributeNS(null, "content", "text/html; charset=" + encryption);
        }
    } else {
        let metas = dom.querySelectorAll('meta[http-equiv="Content-Type"]');
        if (metas.length && metas[0].content.indexOf(encryption) != -1) {
            metas[0].content.content = "text/html; charset=" + encryption
        }
    }
}

xover.dom.refresh = async function () {
    let { forced } = (arguments[0] || {});
    if (forced) {
        xover.stores.active.sources.clear(true);
    }
    return xover.stores.active.render(forced);
}

Object.defineProperty(xover.dom.refresh, 'interval', {
    value: function (seconds) {
        let self = this;
        //xover.session.live.running = live;
        let refresh_rate;
        let _seconds = seconds;
        this.seconds = _seconds;
        if (this.Interval) window.clearInterval(this.Interval);
        if (seconds == 0) {
            window.console.info('Auto refresh stopped.');
        } else {
            window.console.info(`Starts refresh of ${xover.stores.active.tag} for every ${seconds} seconds.`);
        }
        if (!seconds) return;

        refresh_rate = (refresh_rate || 5);
        refresh_rate = (refresh_rate * 1000);
        let refresh = async function () {
            if (!this.seconds) {
                if (this.Interval) window.clearInterval(this.Interval);
                window.console.info('Auto refresh stopped.');
                return;
            }
            window.console.info('Checking for changes in session...');
            await xover.dom.refresh({ forced: true });
        };

        self.Interval = setInterval(function () {
            refresh.apply(self)
        }, refresh_rate);
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.dom.refresh, 'stop', {
    value: function () {
        xover.dom.refresh.seconds = undefined;
        if (xover.dom.refresh.Interval) {
            window.clearInterval(xover.dom.refresh.Interval);
            xover.dom.refresh.Interval = undefined;
        }
        window.console.info('Auto refresh stopped.');
    },
    writable: false, enumerable: false, configurable: false
});

xover.dom.clear = function (target) {
    if (target === undefined) {
        target = document.querySelector('body');
    } else if (typeof (target) == "string") {
        target = document.querySelector(target);
    }
    if (!(target && target.innerHTML)) return;
    target.innerHTML = '';
}

xover.data.getFirstRecord = function (xml) {
    let oXML = xover.xml.createDocument(xover.stores.active);
    try {
        return oXML.selectSingleNode('/*/*[1]');
    } catch (e) {
        for (let nodeItem = oXML.childNodes.length; nodeItem > 0; --nodeItem) {
            let nodeElement = oXML.childNodes[nodeItem - 1];
            if (nodeElement.nodeType == 1) {
                return nodeElement.firstElementChild; //Equivalente a /*/*[1]
            }
        }
    }
}

xover.Store = function (xml, ...args) {
    if (!(this instanceof xover.Store)) return new xover.Store(xml, args[0]);
    let self = this;
    let store = this;
    let _this_arguments = args;
    if (!(xml instanceof Document)) return Promise.reject(`A Store should be created with a document`);
    let __document = xml; //Before: xover.xml.createDocument(xml); //Now should remain reference for current 
    if (__document.source instanceof xover.Source && !__document.source.hasOwnProperty("save")) {
        Object.defineProperty(__document.source, 'save', {
            value: async function () {
                xover.storehouse.write('sources', __document.source.tag, __document);
            },
            writable: false, enumerable: false, configurable: false
        })
    }
    let _undo = [];
    let _redo = [];
    let config = args[0] && args[0].constructor === {}.constructor && args[0] || {};
    let _tag;
    let _hash = config && config['hash'] || undefined;
    let _initiator = config && config["initiator"] || undefined;
    let _store_stylesheets = [];
    let _sources = new Proxy({}, {
        get: function (self, key) {
            if (key in self) {
                return self[key];
            }
            self[key] = self[key] || xover.sources[key];//.cloneNode(true)
            //if (!self.hasOwnProperty(key)) {
            //    self[key] = self[key] || xover.sources[key].cloneNode(true);
            //}
            //if (self[key] instanceof Document) {
            //    self[key].store = store;
            //}
            return self[key];
        },
        set: function (self, key, value) {
            return self[key] = value //|| target[name]; //Ahora se permite que se asigne undefined para que funcione el método clear.
        }
    });

    let _async_save;
    if (!this.hasOwnProperty('save')) {
        Object.defineProperty(this, 'save', {
            value: async function () {
                //let source = __document.source;
                //if (source) {
                //    xover.session.setKey(store.tag, { source: source.tag });
                //    source.save();
                //} else {
                await xover.storehouse.write('sources', store.tag, __document);
                //}
            },
            writable: false, enumerable: false, configurable: false
        })
    }

    if (!this.hasOwnProperty('source')) {
        Object.defineProperty(this, 'source', {
            get: function () {
                return __document.source
            }
        });
    }

    if (!this.hasOwnProperty('get')) {
        Object.defineProperty(this, 'get', {
            value: function (name) {
                return __document.selectFirst(`//*[@name="${name}"]`)
            }, writable: true
        });
    }

    if (!this.hasOwnProperty('remove')) {
        Object.defineProperty(this, 'remove', {
            value: function () {
                delete xover.stores[_tag];
            }
        });
    }

    Object.defineProperty(_sources, 'clear', {
        value: function (forced) {
            for (let [, document] of Object.entries(this)) {
                document.source.clear()
            }
            xover.site.sections.filter(section => section.store === xover.stores.active).forEach(section => [(section.stylesheet || {}).source].filter(source => source).pop().delete());
            return _sources;
        },
        writable: false, enumerable: false, configurable: false
    })

    Object.defineProperty(this, 'ready', {
        enumerable: false,
        get: async function () {
            try {
                let document = this.document;
                if (!document.childNodes.length) {
                    await this.fetch()
                }
                return document.hasChildNodes();
            } catch (e) {
                return Promise.reject(e)
            }
        }
    })

    Object.defineProperty(_sources, 'load', {
        value: async function (list) {
            //store.state.loading = true;
            let stylesheets = await Promise.all(store.stylesheets.getDocuments().map(async document => await document.ready && document));
            return stylesheets;
        },
        writable: false, enumerable: false, configurable: false
    })

    Object.defineProperty(_sources, 'reload', {
        value: async function () {
            _sources.clear(true);
            store.render();
            return _sources;
        },
        writable: false, enumerable: false, configurable: false
    })

    Object.defineProperty(_sources.reload, 'interval', {
        value: function (seconds) {
            let self = this;
            //xover.session.live.running = live;
            let refresh_rate;
            this.paused = false;
            let _seconds = (seconds || 3);
            this.seconds = _seconds;
            if (self.Interval) {
                window.clearInterval(self.Interval);
                self.Interval = undefined;
            }
            if (seconds == 0) {
                window.console.info('Auto refresh stopped.');
                return;
            } else {
                window.console.info(`Start refresh of ${xover.stores.active.tag} for every ${this.seconds} seconds.`);
            }

            refresh_rate = this.seconds;
            refresh_rate = (refresh_rate * 1000);
            let refresh = async function () {
                if (!this.seconds) {
                    if (this.Interval) window.clearInterval(this.Interval);
                    window.console.info('Auto refresh stopped.');
                    return;
                }
                if (!this.paused) {
                    window.console.info('Checking for changes in session...');
                    this();
                    store.render();
                }
            };

            self.Interval = setInterval(function () {
                if (!self.interval.hasOwnProperty('stop')) {
                    Object.defineProperty(self.interval, 'stop', {
                        value: function () {
                            self.seconds = undefined;
                            if (self.Interval) {
                                window.clearInterval(self.Interval);
                                self.Interval = undefined;
                            }
                            delete self.interval["stop"];
                            delete self.interval["pause"];
                            delete self.interval["continue"];
                            window.console.info('Auto refresh stopped.');
                        },
                        writable: false, enumerable: false, configurable: true
                    });
                }
                if (!self.interval.hasOwnProperty('pause')) {
                    Object.defineProperty(self.interval, 'pause', {
                        value: function () {
                            self.paused = true;
                            if (!self.interval.hasOwnProperty('continue')) {
                                Object.defineProperty(self.interval, 'continue', {
                                    value: function () {
                                        self.paused = false;
                                        delete self.interval["continue"];
                                    },
                                    writable: false, enumerable: false, configurable: true
                                });
                            }
                            window.console.info('Auto refresh paused.');
                        },
                        writable: false, enumerable: false, configurable: true
                    });
                }
                refresh.apply(self)
            }, refresh_rate);
        },
        writable: false, enumerable: false, configurable: false
    });

    //for (let endpoint in xover.manifest.server) {
    //    Object.defineProperty(store, endpoint, {
    //        value: async function (...arguments) {
    //            let args = arguments;
    //            if (args.length === 1) {
    //                if (args[0].apply) {
    //                    args = args[0].apply(store, args);
    //                }
    //                if (!args) { console.error(`Method ${endpoint} should be executed with arguments.`) }
    //            }
    //            return xover.server[endpoint].apply(store, args);
    //        },
    //        writable: true, enumerable: false, configurable: true
    //    });
    //}

    var _isActive = undefined;

    this.state = new Proxy({}, {
        get: function (target, name) {
            if (!__document.documentElement) return target[name];
            try {
                return JSON.parse(__document.documentElement.getAttribute(`state:${name}`)) //name in target && target[name];
            } catch (e) {
                return (__document.documentElement.getAttribute(`state:${name}`));
            }
        },
        set: function (target, name, value) {
            if (value && ['function'].includes(typeof (value))) {
                throw (new Error('State value is not valid type'));
            }
            let old_value = store.state[name]
            if (old_value == value) return;
            target[name] = value;
            if (!__document.documentElement) return;
            __document.documentElement.setAttributeNS(xover.spaces["state"], `state:${name}`, value);
        }
    })

    __document.status = "loading"

    Object.defineProperty(this, 'sources', {
        get: function () {
            _sources.merge(this.stylesheets.reduce((obj, curr) => { obj[curr.href] = _sources[curr.href]; return obj }, {}));
            return _sources;
        }
    })

    Object.defineProperty(this, 'tag', {
        get: function () {
            return '#' + _tag.split(/^#/).pop();
        },
        set: function (input) {
            return _tag = input;
        }
    })

    Object.defineProperty(this, 'hash', {
        get: function () {
            return [_hash, xover.manifest.getSettings(this, 'hash').pop(), config.tag/* && store.tag*/ || ''].coalesce();
            /*return '#' + Array.prototype.coalesce(_hash, __document.documentElement && Array.prototype.coalesce(__document.documentElement.getAttributeNS("http://panax.io/xover", "hash"), __document.documentElement.getAttributeNS("http://panax.io/xover", "tag"), __document.documentElement.localName.toLowerCase()), _tag).split(/^#/).pop();*/
        },
        set: function (input) {
            //if (__document.documentElement) {
            //    __document.documentElement.setAttributeNS(xover.spaces["x"], "xo:hash", input);
            //}
            _hash = input;
            xover.site.hash = _hash;
        }
    });

    Object.defineProperty(this, 'snapshots', {
        get: function () {
            return _undo;
        }
    });

    Object.defineProperty(this, 'findById', {
        value: function (xid) {
            return __document.selectSingleNode('//*[@xo:id="' + xid + '"]')
        }
    });

    Object.defineProperty(this, 'takeSnapshot', {
        value: function () {
            _undo.push(__document.cloneNode(true));
            _redo = [];
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'undo', {
        value: function () {
            let snapshot = _undo.pop();
            if (snapshot) {
                _redo.unshift(__document.cloneNode(true));
                __document = snapshot;
                //__document.store = this;
                //xover.dom.refresh({ trigger_bindings: false })
                this.render(/*true*/);
            }
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'redo', {
        value: function () {
            let snapshot = _redo.shift();
            if (snapshot) {
                _undo.push(__document.cloneNode(true));
                __document = snapshot;
                //__document.store = this;
                //xover.dom.refresh({ trigger_bindings: false })
                this.render(/*true*/);
            }
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'initiator', {
        get: function () {
            return _initiator;
        },
        set: function (input) {
            _initiator = input;
        }
    });

    Object.defineProperty(this, 'document', {
        get: function () {
            if (!__document) {
                __document = (__document || xover.xml.createDocument(""));
            }
            __document.store = this;
            return __document;
        },
        set: function (input) {
            //input.href = input.href || __document.href;
            //input.url = input.url || __document.url;
            //__document = input;
            //if (typeof (input) == 'string') {
            //    __document = xover.xml.createDocument(input)
            //}
            //if (__document.documentElement) {
            //    __document.documentElement.setAttributeNS(xover.spaces["x"], "xo:tag", (this.tag.replace(/^#/, '') || ""));
            //    //__document.documentElement.setAttributeNS(xover.spaces["state"], "state:refresh", "true");
            //}
            //xover.stores[this.tag] = self;
            if (!(input instanceof Document)) {
                return Promise.reject(`Invalid input document for store`)
            }
            input.seed();
            if (input instanceof Document) {
                __document.replaceBy(input)
            } else {
                __document = input;
            }
            __document.observe();
            //let store = self;
            //const distinctMutations = function (mutations) {
            //    return mutations.filter((mutation, index, self) => {
            //        const matchingMutation = self.find((otherMutation) => {
            //            return (
            //                otherMutation.type === mutation.type &&
            //                otherMutation.target === mutation.target &&
            //                otherMutation.attributeName === mutation.attributeName &&
            //                otherMutation.attributeNamespace === mutation.attributeNamespace
            //            );
            //        });
            //        return matchingMutation === mutation;
            //    });
            //}

            //const callback = async (mutationList) => {
            //    let observer = __document.observer;
            //    if (observer && observer.disconnected) return;
            //    if (event) await xover.delay(1);
            //    mutationList = mutationList.filter(mutation => !mutation.target.silenced && !mutation.target.disconnected && !(mutation.type == 'attributes' && mutation.target.getAttributeNS(mutation.attributeNamespace, mutation.attributeName) === mutation.oldValue || mutation.type == 'childList' && [...mutation.addedNodes, ...mutation.removedNodes].filter(item => !item.nil).length == 0) && !["http://panax.io/xover", "http://www.w3.org/2000/xmlns/"].includes(mutation.attributeNamespace))//.filter(mutation => !(mutation.target instanceof Document));
            //    //mutationList = distinctMutations(mutationList); //removed to allow multiple removed nodes
            //    if (!mutationList.length) return;
            //    if (event && event.type == 'input') {
            //        event.srcElement.preventChangeEvent = true;
            //    }
            //    if (event && event.type == 'change' && event.srcElement.preventChangeEvent) {
            //        event.srcElement.preventChangeEvent = undefined;
            //    }
            //    let sections_to_render = xover.site.sections.filter(section => section.store === self && !(section.matches(".xo-static")));

            //    mutated_targets = new Map();
            //    //for (let mutation of mutationList) {
            //    //    let inserted_ids = [];
            //    //    let target = mutation.target instanceof Text && mutation.target.parentNode || mutation.target;
            //    //    let value = mutated_targets.get(target) || {};
            //    //    if (mutation.target instanceof Text) {
            //    //        value.texts = value.texts || new Map();
            //    //        if (!value.texts.has(mutation.target)) {
            //    //            value.texts.set(mutation.target, `${mutation.target}`)
            //    //        }
            //    //    } else if (mutation.type == "attributes") {
            //    //        value.attributes = value.attributes || new Map();
            //    //        let attr = target.getAttributeNodeNS(mutation.attributeNamespace, mutation.attributeName);
            //    //        if (!attr) {
            //    //            attr = target.createAttributeNS(mutation.attributeNamespace, mutation.attributeName, null);
            //    //        }
            //    //        if (attr.value !== mutation.oldValue) {
            //    //            value.attributes.set(attr, mutation.oldValue)
            //    //        }
            //    //    }
            //    //    value.removedNodes = value.removedNodes || [];
            //    //    value.removedNodes.push(...mutation.removedNodes);
            //    //    value.addedNodes = value.addedNodes || [];
            //    //    value.addedNodes.push(...mutation.addedNodes);
            //    //    mutated_targets.set(target, value);
            //    //    [...mutation.addedNodes].forEach((addedNode) => {
            //    //        inserted_ids = inserted_ids.concat(addedNode.select(`.//@xo:id`).map(node => node.value));
            //    //    })
            //    //}
            //    for (let section of sections_to_render) {
            //        section.render()
            //    }

            //    if (mutationList.filter(mutation => mutation.target instanceof Document && mutation.type === 'childList' && [...mutation.removedNodes, ...mutation.addedNodes].find(el => el instanceof ProcessingInstruction)).length) {
            //        self.render()
            //    }
            //};

            //const config = { characterData: true, attributes: true, childList: true, subtree: true, attributeOldValue: true, characterDataOldValue: true };
            //const mutation_observer = new MutationObserver(callback);
            //mutation_observer.observe(__document, config);
            //const _observer = {}
            //Object.defineProperty(self, 'observer', {
            //    get: function () {
            //        return _observer;
            //    }
            //})
            //if (!self.observer.hasOwnProperty('disconnect')) {
            //    Object.defineProperty(self.observer, 'disconnect', {
            //        value: function (ms = 2) {
            //            let mutations = mutation_observer.takeRecords()
            //            mutation_observer.disconnect();
            //            if (ms || mutations.length) {
            //                xover.delay(ms || 2).then(async () => {
            //                    ms && mutation_observer.observe(__document, config);
            //                    mutations.length && callback(mutations);
            //                });
            //            }
            //        },
            //        writable: false, enumerable: false, configurable: false
            //    });
            //}
            //if (!self.observer.hasOwnProperty('connect')) {
            //    Object.defineProperty(self.observer, 'connect', {
            //        value: function () {
            //            mutation_observer.observe(__document, config);
            //        },
            //        writable: false, enumerable: false, configurable: false
            //    });
            //}
        }
    })

    Object.defineProperty(this, 'documentElement', {
        get: function () {
            //if (__document.documentElement) {
            return __document.documentElement;
            //} else if (__document.source) {
            //    __document.store = store;
            //    return __document.fetch()/*new Promise(async resolve => {
            //        await this.initialize();
            //        resolve(__document.documentElement);
            //    })*/;
            //}
        }
    })

    Object.defineProperty(this, 'load', {
        value: async function (input) {
            throw (new Error("Load method is deprecated"));
        }
    });

    Object.defineProperty(this, 'disconnect', {
        value: async function () {
            __document.disconnect()
        }
    });

    Object.defineProperty(this, 'connect', {
        value: async function () {
            __document.connect()
        }
    });

    let _render_manager;
    Object.defineProperty(this, 'isRendering', {
        get: function () {
            return !!(_render_manager instanceof Promise);
        }
    });

    Object.defineProperty(this, 'seed', {
        value: function () {
            let start_date = new Date();
            let data = this.document;
            if (data.documentElement instanceof HTMLHtmlElement) return;
            return data.seed();
            //        if (!data.documentElement) return data;
            //        let xsl = xover.xml.createDocument(`
            //<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xo="http://panax.io/xover">
            // <xsl:key name="xid" match="*" use="@xo:id" />
            // <xsl:template match="*|processing-instruction()|comment()">
            //  <xsl:copy>
            //   <xsl:copy-of select="@*[not(name()='xo:id')]"/>
            //   <xsl:apply-templates/>
            //  </xsl:copy>
            // </xsl:template>
            // <xsl:template match="*[count(key('xid',@xo:id)[1] | .)=1]">
            //  <xsl:copy>
            //   <xsl:copy-of select="@*"/>
            //   <xsl:apply-templates/>
            //  </xsl:copy>
            // </xsl:template>
            //</xsl:stylesheet>
            //`); // removes duplicate xids
            //        data = data.transform(xsl);
            //        let xsl_duplicates = xover.xml.createDocument(`
            //<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xo="http://panax.io/xover">
            // <xsl:key name="xid" match="*" use="@xo:id" />
            // <xsl:template match="/">
            //  <result>
            //   <xsl:apply-templates/>
            //  </result>
            // </xsl:template>
            // <xsl:template match="text()|processing-instruction()|comment()"/>
            // <xsl:template match="*"><xsl:apply-templates/></xsl:template>
            // <xsl:template match="*[@xo:id and count(key('xid',@xo:id)[1] | .)=2]">
            //  <xsl:copy>
            //   <xsl:copy-of select="@*"/>
            //  </xsl:copy>
            // </xsl:template>
            //</xsl:stylesheet>
            //`);
            //        let duplicate_id = (data.transform(xsl_duplicates).documentElement || {}).firstChild;
            //        if (duplicate_id) {
            //            console.warn("Document contains duplicate ids")
            //        }
            //        if (((arguments || {}).callee || {}).caller === this.seed || !(data && data.selectSingleNode('/*') && data.selectSingleNode('//*[not(@xo:id)]'))) {
            //            return data;
            //        }

            //        data = data.seed();
            //        data.href = __document.href;
            //        data.url = __document.url;
            //        __document = data;

            //        return this.seed();
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'addStylesheet', {
        value: async function (definition, refresh = false) {
            let style_definition, pi;
            let document = (this.document || this);
            if (definition instanceof ProcessingInstruction) {
                pi = definition;
            }
            else if (definition.constructor === {}.constructor) {
                definition = xover.json.merge({ type: 'text/xsl' }, definition);
                style_definition = xover.json.toAttributes(definition);
                pi = document.createProcessingInstruction('xml-stylesheet', style_definition);
                //pi.document.then(document => document.parentNode = store);
            } else {
                throw (new Error("Not a valid stylesheet"));
            }
            pi.store = store;
            Object.defineProperty(pi, 'parentNode', {
                value: store,
                writable: true, enumerable: false, configurable: true
            });
            if (!(_store_stylesheets.find(el => el.isEqualNode(pi)) || document.stylesheets.find(el => el.isEqualNode(pi)))) {
                _store_stylesheets.push(pi);
            }
            if (refresh) {
                store.render();
            }
            let stylesheet = this.getStylesheet(definition.href);
            return stylesheet;//.document.documentElement && stylesheet.document || stylesheet.document.fetch();
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'removeStylesheet', {
        value: async function (definition_or_stylesheet) {
            let style_definition, pi;
            let document = (this.document || this);
            if (definition_or_stylesheet instanceof ProcessingInstruction) {
                pi = definition_or_stylesheet;
            }
            else if (definition_or_stylesheet.constructor === {}.constructor) {
                pi = this.document.getStylesheet(definition_or_stylesheet.href);
            } else {
                throw (new Error("Not a valid stylesheet"));
            }
            _store_stylesheets = _store_stylesheets.filter(el => !el.isEqualNode(pi));
            if (pi.ownerDocument.getStylesheet(pi)) {
                pi.remove();
            }
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'stylesheets', {
        get: function () {
            let stylesheets_nodes = _store_stylesheets.concat(__document.stylesheets);
            Object.defineProperty(stylesheets_nodes, 'getDocuments', {
                value: function () {
                    let docs = []
                    for (let stylesheet of this) {
                        docs.push(stylesheet.document);
                    }
                    return docs;
                },
                writable: false, enumerable: false, configurable: false
            });

            Object.defineProperty(stylesheets_nodes, 'toJSON', {
                value: function () {
                    let json = []
                    for (let stylesheet of this) {
                        json[stylesheet.href] = stylesheet
                    }
                    return json;
                },
                writable: false, enumerable: false, configurable: false
            });

            return new Proxy(stylesheets_nodes, {
                get: function (target, prop) { //para búsquedas por href
                    if (prop in target) {
                        return target[prop];
                    }
                    return target.find(stylesheet => stylesheet.href == prop);
                }
            })
            return stylesheets_nodes
        }
    });

    Object.defineProperty(this, 'getStylesheet', {
        value: function (href) {
            return store.stylesheets.find(stylesheet => stylesheet.href === href)
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'toString', {
        value: function (href) {
            let doc = __document.cloneNode(true);
            _store_stylesheets.reverse().forEach(stylesheet => doc.prepend(stylesheet));
            return doc.toString();
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'toClipboard', {
        value: function (href) {
            let doc = __document.cloneNode(true);
            _store_stylesheets.reverse().forEach(stylesheet => doc.prepend(stylesheet));
            return doc.toClipboard();
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'fetch', {
        value: async function () {
            await xover.storehouse.read('sources', store.tag).then((stored_document) => {
                if (stored_document && stored_document.firstChild) {
                    //__document.disconnect();
                    __document.replaceContent(...stored_document.childNodes)
                }
            })
            await __document.ready;
            await this.initialize();
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'initialize', {
        value: async function () {
            _store_stylesheets.filter(stylesheet => stylesheet.role == 'init' && !__document.selectSingleNode(`comment()[.="Initialized by ${stylesheet.href}"]`)).forEach(async stylesheet => {
                let _document_stylesheet = __document.stylesheets[stylesheet.href];
                if (_document_stylesheet) {
                    _document_stylesheet.replaceBy(__document.createComment('Initialized by ' + stylesheet.href));
                }

                let new_document = __document.transform(await stylesheet.document.fetch());
                if ((((new_document.documentElement || {}).namespaceURI || '').indexOf("http://www.w3.org") == -1)) {
                    /*La transformación no debe regresar un html ni otro documento del estándar*/
                    this.document = new_document;
                } else {
                    delete stylesheet["role"];
                    __document.addStylesheet(stylesheet);
                    console.warn("Initial transformation shouldn't yield a html or any other document from the w3 standard.");
                }
            });
            store.seed();
        },
        writable: false, enumerable: false, configurable: false
    });

    if (!__document) throw (new Error("__document is empty"));
    if (typeof (__document) == 'string') {
        __document = xover.xml.createDocument(__document)
    }
    let render_manager = new Map()
    Object.defineProperty(this, 'render', {
        value: async function (target) {
            await xover.ready;
            let progress;
            let tag = self.tag;
            render_manager.set(target, render_manager.get(target) || xover.delay(1).then(async () => {
                //if (xover.stores.seed === self && !xover.site.sections[tag].length) {
                //    progress = xover.sources['loading.xslt'].render({ action: "append" });
                //}
                let active_store = xover.stores.active
                if (active_store === self) {
                    xover.site.hash = self.hash;
                }
                if (!__document.firstChild) {
                    await store.fetch();
                }
                let document = __document.cloneNode(true);
                window.top.dispatchEvent(new xover.listener.Event('beforeRender', { store: this, tag, document }, this));
                let renders = [];
                let sections = !target && xover.site.sections.filter(el => el.store && el.store === self) || [];
                let stylesheets = [..._store_stylesheets, ...document.stylesheets].distinct();
                if (sections.length) {
                    renders = renders.concat(sections.map(el => el.render()));
                }
                if (stylesheets.length) {
                    stylesheets = stylesheets.map(stylesheet => Object.fromEntries(Object.entries(xover.json.fromAttributes(stylesheet.data)).concat([["document", stylesheet.document], ["store", tag]])));
                    if (target) {
                        for (let stylesheet of stylesheets) {
                            stylesheet.srcElement = target;
                        }
                    }
                    renders = renders.concat(document.render(stylesheets))
                }
                renders = await Promise.all(renders);
                if (!renders.length && (target || active_store === self)) document.render({ target: target || window.document.body, store: self });
                return renders;
            }).then((renders) => {
                window.top.dispatchEvent(new xover.listener.Event('domLoaded', { targets: renders }, this));
                return renders.flat().filter(el => el)
            }).catch((e) => {
                let tag = self.tag;
                e = e || {}
                if (e instanceof Response || e instanceof Node || e instanceof Error || typeof (e) === 'string') {
                    if ([401].includes(e.status) && e.statusText) {
                        console.error(e.statusText)
                    } else {
                        return Promise.reject(e);
                    }
                } else {
                    //e = e instanceof Error && e || e.message || e || `Couldn't render store ${tag}`
                    return Promise.reject();
                }
            }).finally(async () => {
                //xover.site.restore();
                render_manager.delete(target);
                progress = await progress || [];
                progress.forEach(item => item.remove());
            }));
            return render_manager.get(target);
        },
        writable: true, enumerable: false, configurable: false
    });

    for (let prop of ['$', '$$', 'cloneNode', 'normalizeNamespaces', 'contains', 'querySelector', 'querySelectorAll', 'selectSingleNode', 'selectNodes', 'select', 'selectFirst', 'evaluate', 'getStylesheets', 'createProcessingInstruction', 'firstElementChild', 'insertBefore', 'resolveNS', 'xml']) {
        let prop_desc = Object.getPropertyDescriptor(__document, prop);
        if (!prop_desc) {
            continue
        } else if (prop_desc.value) {
            Object.defineProperty(this, prop, {
                value: function () { return __document[prop].apply(__document, arguments) }
                , enumerable: true, configurable: false
            });
        } else if (prop_desc.get) {
            Object.defineProperty(this, prop, {
                get: function () { return __document[prop] }
                , enumerable: true, configurable: false
            });
        }

    }
    this.document = __document;
    let source = __document.source;
    _tag = config['tag'] || source && source.tag || this.generateTag.call(this, __document) || xover.cryptography.generateUUID();
    _tag = _tag.split(/\?/)[0];
    //this.seed();
    xover.manifest.getSettings(this, 'stylesheets').flat().forEach(stylesheet => store.addStylesheet(stylesheet, false));
    window.top.dispatchEvent(new xover.listener.Event('storeLoaded', { store: this }, this));
    xover.stores[_tag] = this;
    return this;
}

xover.Store.prototype.onLoad = function () {
    console.log("Do nothing");
}

Object.defineProperty(xover.Store.prototype, 'fetch', {
    value: async function (input) {
        _fetch_url = (_fetch_url || input);
        if (!_fetch_url) {
            throw (new Error("No url initialized."));
        }
        let data = await xover.fetch(_fetch_url).then(response => response.body);
        this.document = data;
        if (xover.stores.active === this) {
            this.render(/*true*/);
        }
    }
})

Object.defineProperty(xover.Store.prototype, 'isActive', {
    get: function () {
        return (this === xover.stores.active || xover.site.activeTags().includes(this.tag) || this.isRendered || !window.document.querySelector("[xo-source]"));
    },
    set: function (input) {
        if (input) {
            history.state.active = this.tag;
        } else {
            delete history.state.active;
        }
    }
});

Object.defineProperty(xover.Store.prototype, 'isRendered', {
    get: function () {
        return !!document.querySelector(`[xo-source="${this.tag}"]`);
    }
});

Object.defineProperty(xover.Store.prototype, 'find', {
    value: function (reference) {
        if (!reference) return null;
        let ref = reference;
        if (typeof (reference) == "string") {
            ref = this.document.selectSingleNode('//*[@xo:id="' + reference + '" ]')
            if (!ref) {
                ref = this.document.selectSingleNode(reference)
            }
        }
        if (!ref) return;
        let exists = false;
        let return_value;
        if (this.document.contains(ref) || ref.nodeType == 2 && this.document.contains(ref.selectSingleNode('..'))) {
            return ref;
        }
        if (ref.nodeType == 2) {
            return this.document.selectSingleNode('//*[@xo:id="' + (ref.ownerElement || document.createElement('p')).getAttributeNS("http://panax.io/xover", "id") + '"]/@' + ref.name);
        } else {
            return (this.document.selectSingleNode('//*[@xo:id="' + (ref.documentElement || ref instanceof Element && ref || document.createElement('p')).getAttributeNS("http://panax.io/xover", "id") + '"]')); // || xover.stores.active.selectSingleNode(xover.xml.getXpath(ref))
        }
    },
    writable: false, enumerable: false, configurable: false
});

xover.Store.prototype.generateTag = function (document) {
    if (!(document && document.documentElement)) {
        return xover.cryptography.generateUUID()
    }
    return (document.documentElement && (document.documentElement.getAttributeNS("http://panax.io/xover", "tag") || document.documentElement.getAttributeNS("http://panax.io/xover", "id") || document.documentElement.localName.toLowerCase())).split(/^#/).pop();
}

xover.xml.getAttributeParts = function (attribute = "") {
    let name, prefix;
    if (attribute instanceof Attr) {
        prefix = attribute.prefix;
        name = attribute.localName;
    } else {
        [name, prefix] = attribute.split(':', 2).reverse();
    }
    return { "prefix": prefix, "name": name }
}

xover.post = {}
xover.post.to = async function (request, payload, settings = {}) {
    settings["body"] = payload;
    return xover.fetch(request, settings);
}

xover.xml.fromCSV = function (csv, settings = {}) {
    let { dataset = "dataset", row = "row", cell = "cell" } = settings;
    let xml = xover.xml.createDocument(`<${dataset}><${row}>` + csv.replace(new RegExp('(,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))', 'g'), `</${row}>$1<${row}><${cell}>$2</${cell}>`).replace(new RegExp(`</${row}>,<${row}>`, 'ig'), '').replace(new RegExp(`<(${cell})>"([^"]*)"</\\1>`, 'ig'), `<$1>$2</$1>`) + `</${row}></${dataset}>`);
    xml.selectNodes('*/*[1]').removeAll();
    return xml
}

xover.json.toXML = function (json) {
    if (typeof (json) == "string") {
        json = json.replace(/\r\n/g, "")
    } else if (json.constructor == {}.constructor || json.constructor == [].constructor) {
        json = JSON.stringify(json);
    } else {
        throw (new Error("Not a valid json"));
    }
    let raw_xson = xover.xml.createDocument(
        xover.string.replace(
            xover.string.replace(
                xover.string.replace(
                    xover.string.replace(
                        xover.string.replace(
                            xover.string.replace(
                                xover.string.replace(
                                    xover.string.replace(
                                        xover.string.replace(
                                            xover.string.replace(xover.string.replace(xover.string.replace(xover.string.replace(json.replace(/</g, '&lt;'), '\\t', '<t/>', 1), '\\n', '<r/>', 1), '\\r', '<r/>', 1), ',', '<c/>', 1)
                                            , '&', '&amp;')
                                        , '\\(.)', '<e>$1</e>', 1)
                                    , '[', '<l>')
                                , ']', '</l>')
                            , '{', '<o>')
                        , '}', '</o>')
                    , '"([^"]+?)"\\:\\s*', '<a>$1</a>', 1)
                , '\\s', '<s/>', 1)
            , '<l>([^<]+)</l>', '<l>$1</l>', 1)
    );

    let reformated_xson = raw_xson.transform(xover.xml.createDocument(`<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="" version="1.0" id="raw_json_compatibility">
	<xsl:variable name="node_name">olsc</xsl:variable>
	<xsl:variable name="translate-o">{[ ,</xsl:variable>
	<xsl:variable name="translate-c">}] </xsl:variable>
	<xsl:template match="/">
		<xsl:apply-templates/>
	</xsl:template>
	<xsl:template match="*" mode="value">
		<xsl:copy>
			<xsl:copy-of select="@*"/>
			<xsl:apply-templates/>
		</xsl:copy>
	</xsl:template>
	<xsl:template match="o|l|c" mode="value">
		<xsl:param name="is_string" select="false()"/>
		<xsl:value-of select="translate(name(),$node_name,$translate-o)"/>
		<xsl:apply-templates select="(text()|*)[1]" mode="value">
			<xsl:with-param name="is_string" select="$is_string"/>
		</xsl:apply-templates>
		<xsl:value-of select="translate(name(),$node_name,$translate-c)"/>
		<xsl:apply-templates select="(following-sibling::text()|following-sibling::*)[1]" mode="value">
			<xsl:with-param name="is_string" select="$is_string"/>
		</xsl:apply-templates>
	</xsl:template>
	<xsl:template match="s" mode="value">
		<xsl:param name="is_string" select="false()"/>
		<xsl:value-of select="' '"/>
		<xsl:if test="$is_string">
			<xsl:apply-templates select="(following-sibling::text()|following-sibling::*)[1]" mode="value">
				<xsl:with-param name="is_string" select="$is_string"/>
			</xsl:apply-templates>
		</xsl:if>
	</xsl:template>
	<xsl:template match="r|f" mode="value">
		<xsl:param name="is_string" select="false()"/>
		<xsl:text>\n</xsl:text>
		<xsl:apply-templates select="(text()|*)[1]" mode="value">
			<xsl:with-param name="is_string" select="$is_string"/>
		</xsl:apply-templates>
		<xsl:apply-templates select="(following-sibling::text()|following-sibling::*)[1]" mode="value">
			<xsl:with-param name="is_string" select="$is_string"/>
		</xsl:apply-templates>
	</xsl:template>
	<xsl:template match="e" mode="value">
		<xsl:param name="is_string" select="false()"/>
		<xsl:text>\\</xsl:text>
		<xsl:value-of select="text()"/>
		<xsl:apply-templates select="(following-sibling::text()|following-sibling::*)[1]" mode="value">
			<xsl:with-param name="is_string" select="$is_string"/>
		</xsl:apply-templates>
	</xsl:template>
	<xsl:template match="text()" mode="value">
		<xsl:param name="is_string" select="false()"/>
		<xsl:copy/>
		<xsl:if test="$is_string and not(substring(.,string-length(.),1)='&quot;')">
			<xsl:apply-templates select="(following-sibling::text()|following-sibling::*)[1]" mode="value">
				<xsl:with-param name="is_string" select="$is_string"/>
			</xsl:apply-templates>
		</xsl:if>
	</xsl:template>
	<xsl:template match="text()[substring(.,1,1)='&quot;']" mode="value">
		<xsl:param name="is_string" select="false()"/>
		<xsl:copy/>
		<xsl:if test="$is_string = false() and (string-length(.)=1 or not(substring(.,string-length(.),1)='&quot;'))">
			<xsl:apply-templates select="(following-sibling::text()|following-sibling::*)[1]" mode="value">
				<xsl:with-param name="is_string" select="true()"/>
			</xsl:apply-templates>
		</xsl:if>
	</xsl:template>
	<xsl:template match="l/text()">
		<xsl:element name="v">
			<xsl:apply-templates mode="value" select="."/>
		</xsl:element>
	</xsl:template>
	<xsl:template match="l">
		<xsl:copy>
			<xsl:copy-of select="@*"/>
			<xsl:apply-templates select="o|text()[normalize-space(.)!='']|c"/>
		</xsl:copy>
	</xsl:template>
	<xsl:template match="o">
		<xsl:copy>
			<xsl:copy-of select="@*"/>
			<xsl:apply-templates select="a"/>
		</xsl:copy>
	</xsl:template>
	<xsl:template match="a">
		<xsl:variable name="following" select="(following-sibling::text()[normalize-space(.)!='']|following-sibling::*[not(self::f or self::r or self::c or self::s)])[1]"/>
		<xsl:copy>
			<xsl:element name="n">
				<xsl:value-of select="text()"/>
			</xsl:element>
			<xsl:choose>
				<xsl:when test="$following/self::o or $following/self::l">
					<xsl:apply-templates select="$following"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:element name="v">
						<xsl:apply-templates select="$following" mode="value"/>
					</xsl:element>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:copy>
	</xsl:template>
</xsl:stylesheet>`));

    let xson = reformated_xson.transform(xover.xml.createDocument(`<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xson="http://panax.io/xson" xmlns="" version="1.0" id="PrettifyJSON"><xsl:variable name="validChars" select="'abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789-_'"/><xsl:template match="/"><xsl:apply-templates mode="raw-to-xson"/></xsl:template><xsl:template match="*" mode="raw-to-xson"><xsl:apply-templates mode="raw-to-xson"/></xsl:template><xsl:template match="o|l" mode="raw-to-xson"><xsl:apply-templates mode="raw-to-xson"/></xsl:template><xsl:template match="l/v" mode="raw-to-xson"><xsl:element name="xson:item"><xsl:apply-templates mode="raw-to-xson"/></xsl:element></xsl:template><xsl:template match="a" mode="raw-to-xson"><xsl:variable name="name"><xsl:choose><xsl:when test="number(translate(n,'&quot;',''))=translate(n,'&quot;','')"><xsl:value-of select="concat('@',translate(n,'&quot;',''))"/></xsl:when><xsl:otherwise><xsl:value-of select="translate(translate(n,'&quot;',''),translate(n,$validChars,''),'@@@@@@@@@@@@@@@')"/></xsl:otherwise></xsl:choose></xsl:variable><xsl:element name="{translate($name,'@','_')}"><xsl:if test="contains($name,'@')"><xsl:attribute name="xson:originalName"><xsl:value-of select="translate(n,'&quot;','')"/></xsl:attribute></xsl:if><xsl:if test="l"><xsl:attribute name="xsi:type">xson:array</xsl:attribute></xsl:if><xsl:apply-templates select="*" mode="raw-to-xson"/></xsl:element></xsl:template><xsl:template match="text()" mode="raw-to-xson"><xsl:value-of select="."/></xsl:template><xsl:template match="text()[starts-with(.,'&quot;')]" mode="raw-to-xson"><xsl:value-of select="substring(.,2,string-length(.)-2)"/></xsl:template><xsl:template match="text()[.='null']|*[.='']" mode="raw-to-xson"/><xsl:template match="text()[.='null']" mode="raw-to-xson"><xsl:attribute name="xsi:nil">true</xsl:attribute></xsl:template><xsl:template match="n" mode="raw-to-xson"/><xsl:template match="a[v='true' or v='false']/n" mode="raw-to-xson"><xsl:attribute name="xsi:type">boolean</xsl:attribute></xsl:template><xsl:template match="e" mode="raw-to-xson"><xsl:value-of select="@v"/></xsl:template><xsl:template match="a[number(v)=v]/n" mode="raw-to-xson"><xsl:attribute name="xsi:type">numeric</xsl:attribute></xsl:template><xsl:template match="a[starts-with(v,'&quot;')]/n" mode="raw-to-xson"><xsl:attribute name="xsi:type">string</xsl:attribute></xsl:template><xsl:template match="a[l]/n" mode="raw-to-xson"><xsl:attribute name="xsi:type">xson:array</xsl:attribute></xsl:template><xsl:template match="a[o]/n" mode="raw-to-xson"><xsl:attribute name="xsi:type">xson:object</xsl:attribute></xsl:template><xsl:template match="o[not(preceding-sibling::n)]" mode="raw-to-xson"><xsl:element name="xson:object"><xsl:apply-templates mode="raw-to-xson"/></xsl:element></xsl:template><xsl:template match="l[not(preceding-sibling::n)]" mode="raw-to-xson"><xsl:element name="xson:array"><xsl:apply-templates mode="raw-to-xson"/></xsl:element></xsl:template></xsl:stylesheet>`));

    xson.normalizeNamespaces();
    return xson;
}

xover.xml.fromJSON = function (json, options = {}) {
    options = options || {};
    options = { nodeName: undefined, mode: ["attributes", "attr", "elements", "elem"], typed: ["nulls", "elements", "none"], ...options }
    let nodeName = options.nodeName;
    let mode = [options.mode].flat().shift().substring(0, 4);
    let typed = [options.typed].flat().shift().substring(0, 4);

    let target = this instanceof Node && this || window.document.implementation.createDocument('http://panax.io/xson', '', null);
    let node;
    try {
        node = (target.ownerDocument || target).createElementNS(nodeName ? null : "http://panax.io/xson", nodeName || json instanceof Array && "xson:array" || `xson:${typeof (json)}`);
        if (nodeName) {
            if (json instanceof Object) {
                if (!["attr"].includes(mode) || ['full'].includes(typed)/* && json instanceof Object || json instanceof Array*/ || json instanceof Array && !json.length) {
                    node.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:type", `xson:${json instanceof Array ? "array" : "object"}`)
                }
            } else {
                if (mode == 'attr') {
                    node = node.createAttribute(nodeName);
                }
            }
        }
    } catch (e) {
        if (e instanceof DOMException && (e.message || "").indexOf("'createElementNS'") != -1) {
            node = (target.ownerDocument || target).createElementNS("http://panax.io/xson", "xson:attr");
            node.setAttribute("name", nodeName, { silent: true })
        } else {
            throw (e)
        }
    }
    if (node instanceof Element && json instanceof Array) {
        let frag = xover.xml.createFragment()
        nodeName = !['full'].includes(typed) && json.every(item => item instanceof Object) && nodeName || null;
        for (let item of json) {
            let child = xover.xml.fromJSON.call(node, item, { ...options, nodeName: nodeName });
            frag.appendChild(child)
        }
        if (nodeName && frag.childElementCount && !(target instanceof Document)) {
            node = frag
            if (nodeName && frag.childElementCount == 1 && !frag.firstElementChild.hasAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "type")) {
                frag.firstElementChild.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:type", "xson:array")
            }
        } else {
            if ((node.getAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "type") || node.nodeName) != 'xson:array') {
                node.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:type", "xson:array")
            }
            node.appendChild(frag)
        }
    } else if (node instanceof Attr) {
        node.value = json
    } else if (node.namespaceURI == "http://panax.io/xson" && node.localName == 'attr') {
        node.appendChild(xover.xml.fromJSON.call(node, json, options))
    } else if (node instanceof Element && json && json.constructor && json.constructor === {}.constructor) {
        if (!Object.keys(json).length) {
            node.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:type", "xson:object")
        } else {
            for (let attr in json) {
                let child = xover.xml.fromJSON.call(node, json[attr], { ...options, nodeName: attr });
                if (child instanceof Attr) {
                    node.setAttributeNode(child.cloneNode(true))
                } else if (mode == 'attr' && child instanceof Text) {
                    node.setAttribute(attr, child, { silent: true })
                } else {
                    node.appendChild(child)
                }
            }
        }
    } else if (json == null) {
        if (['elem', 'null'].includes(typed)) {
            node.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:nil", true)
        }
    } else {
        if (['elem'].includes(typed) || !['none', 'null'].includes(typed) && !['string'].includes(typeof (json))) node.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:type", `xson:${typeof (json)}`)
        node.appendChild(new Text(typeof (json) == 'string' ? json.replace(/"/g, "&quot;") : json))
    }
    if (target instanceof Document) {
        target.appendChild(node);
    }
    return target instanceof Document ? target : node;
}

xover.xml.toJSON = function (xson) {
    let xson_to_json = xson.transform(xover.xml.createDocument(`<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:xson="http://panax.io/xson"
xmlns=""
>
  <xsl:template name="escape-quote">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="contains($string, '&quot;')">
        <xsl:value-of select="substring-before($string, '&quot;')" />
        <xsl:text>\\"</xsl:text>
        <xsl:call-template name="escape-quote">
          <xsl:with-param name="string"
                          select="substring-after($string, '&quot;')" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$string" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">
    <result>
      <xsl:apply-templates mode="toJSON"/>
    </result>
  </xsl:template>

  <xsl:template mode="toJSON" match="*/text()">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template mode="toJSON" match="*[contains(text(),'&quot;')]/text()">
    <xsl:call-template name="escape-quote">
      <xsl:with-param name="string">
        <xsl:value-of select="."/>
      </xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template mode="toJSON" match="*[number(text())=text()]/text()">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template mode="toJSON" match="*[@xsi:type='xson:raw' or starts-with(text(),'{')]/text()">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template mode="toJSON" match="*">
    <xsl:if test="position()&gt;1">
      <xsl:text>,</xsl:text>
    </xsl:if>
    <xsl:apply-templates mode="toJSON.name" select="self::*"/>
    <xsl:apply-templates mode="toJSON"/>
  </xsl:template>

  <xsl:template mode="toJSON" match="*[not(*)][not(text())]">
    <xsl:if test="position()&gt;1">
      <xsl:text>,</xsl:text>
    </xsl:if>
    <xsl:apply-templates mode="toJSON.name" select="self::*"/>
    <xsl:text>null</xsl:text>
  </xsl:template>

  <xsl:template mode="toJSON" match="*[contains(@xsi:type,'string')]|*[string(@xsi:type)=''][number(text())!=text()]">
    <xsl:if test="position()&gt;1">
      <xsl:text>,</xsl:text>
    </xsl:if>
    <xsl:apply-templates mode="toJSON.name" select="self::*"/>
    <xsl:text>"</xsl:text>
    <xsl:apply-templates mode="toJSON"/>
    <xsl:text>"</xsl:text>
  </xsl:template>

  <xsl:template mode="toJSON" match="xson:array|*[@xsi:type='xson:array']">
    <xsl:if test="position()&gt;1">
      <xsl:text>,</xsl:text>
    </xsl:if>
    <xsl:apply-templates mode="toJSON.name" select="self::*"/>
    <xsl:text>[</xsl:text>
    <xsl:apply-templates mode="toJSON"/>
    <xsl:text>]</xsl:text>
  </xsl:template>

  <xsl:template mode="toJSON" match="xson:object|*[@xsi:type='xson:object']|*[not(xson:*)][string(@xsi:type)=''][*]">
    <xsl:if test="position()&gt;1">
      <xsl:text>,</xsl:text>
    </xsl:if>
    <xsl:apply-templates mode="toJSON.name" select="self::*"/>
    <xsl:text>{</xsl:text>
    <xsl:apply-templates mode="toJSON"/>
    <xsl:text>}</xsl:text>
  </xsl:template>

  <xsl:template mode="toJSON" match="xson:item">
    <xsl:if test="position()&gt;1">
      <xsl:text>,</xsl:text>
    </xsl:if>
    <xsl:apply-templates mode="toJSON.name" select="self::*"/>
    <xsl:apply-templates mode="toJSON"/>
  </xsl:template>

  <xsl:template mode="toJSON.name" match="*">
    <xsl:text>"</xsl:text>
    <xsl:value-of select="local-name()"/>
    <xsl:text>":</xsl:text>
  </xsl:template>

  <xsl:template mode="toJSON.name" match="*[@xson:originalName]">
    <xsl:text>"</xsl:text>
    <xsl:value-of select="@xson:originalName"/>
    <xsl:text>":</xsl:text>
  </xsl:template>

  <xsl:template mode="toJSON.name" match="text()|xson:*">
  </xsl:template>
</xsl:stylesheet>`));
    let content = xson_to_json.firstElementChild && xson_to_json.firstElementChild.textContent;
    let json = JSON.parse(content.replace(/\n/g, '\\n'));
    return json
}

xover.json.merge = function (...args) {
    let result = args.shift() || {};
    for (let object of args) {
        if (object && object.constructor == {}.constructor) {
            for (let key in object) {
                if (object[key] && object[key].constructor == {}.constructor) {
                    result[key] = xover.json.merge(result[key], object[key]);
                } else {
                    result[key] = object[key];
                }
            }
        }
    }
    return result;
}

xover.json.combine = function (...args) { /*experimental*/
    let result = {};
    for (let object of args) {
        if (object && typeof (object) == 'object') {
            for (let prop in object) {
                if (typeof (result[prop]) == 'object' && !(result[prop] instanceof Node) && typeof (object[prop]) == 'object') {
                    for (let [key, value] of object[prop].entries ? object[prop].entries() : Object.entries(object[prop])) {
                        /*if (typeof (result[prop].append) == 'function' && typeof (object[prop].append) !== 'function') {
                            result[prop].append(key, value)
                        } else */if (typeof (result[prop].set) == 'function') {
                            result[prop].set(key, value)
                        } else if (typeof (object[prop].get) == 'function') {
                            result[prop][key] = object[prop].get(key)
                        } else {
                            result[prop][key] = object[prop][key]
                        }
                    }
                } else if (result[prop] && object[prop] && typeof (object[prop]) != 'string' && typeof (object[prop].concat) != 'undefined') {
                    result[prop] = result[prop].concat(object[prop]);
                } else if (object[prop] && object[prop].constructor == {}.constructor) {
                    result[prop] = xover.json.combine(result[prop] || {}, object[prop]);
                } else {
                    let new_value = object[prop];
                    result[prop] = (new_value !== undefined ? new_value : result[prop])
                }
            }
        }
    }
    return result;
}

xover.json.parse = function (...args) { /*experimental*/
    let result = (args[0] || {})
    for (let object of args) {
        if (object && typeof (object) == 'object') {
            for (let prop in object) {
                if (object[prop] && typeof (object[prop]) == 'object' && (object[prop].constructor == {}.constructor || object[prop] instanceof Array)) {
                    result[prop] = xover.json.parse(result[prop] || {}, object[prop]);
                } else if (object[prop] && typeof (object[prop].entries) == 'function') {
                    result[prop] = Object.fromEntries(object[prop].entries());
                } else {
                    let new_value = object[prop];
                    result[prop] = (new_value !== undefined ? new_value : result[prop])
                }
            }
        }
    }
    return result;
}

xover.json.difference = function () {
    let response = (arguments[0] || {})
    for (let a = 1; a < arguments.length; a++) {
        let object = arguments[a]
        if (object && object.constructor == {}.constructor) {
            for (let key in object) {
                if (response.hasOwnProperty(key)) {
                    delete response[key];
                }
            }
        }
    }
    return response;
}

xover.json.toAttributes = function (json) {
    json = Object.entries(json).reduce((filtered, [key, value]) => { if (value !== undefined) { filtered[key] = value; } return filtered; }, {})
    let attribs = new URLSearchParams(json);
    //let dummy = document.createElement("p");
    //[...attribs.entries()].forEach(([attr, value]) => dummy.setAttribute(attr, value));
    //return dummy.outerHTML.replace(/^<p\s|><\/p>$/g, '') //TODO: Evaluate what approach is better
    return [...attribs.entries()].reduce((params, entry) => { params.push(`${entry[0]}=${JSON.stringify(entry[1])}`); return params }, []).join(" ")
}

xover.json.fromAttributes = function (attributes) {
    return JSON.parse('{' + (attributes.match(/(\w+)=(["'])([^\2]*?)\2/ig) || []).join(", ").replace(/(\w+)=(["'])([^\2]*?)\2/ig, '"$1":$2$3$2') + '}')
}

//xover.json.fromAttributes = function (attributes) { //Version with createNode, witch is slower.
//    let json = {}
//    let node = xover.xml.createNode(`<node ${attributes} />`);
//    [...node.attributes].map(attr => json[attr.nodeName] = attr.nodeValue);
//    return json
//}

xover.xml.getXpath = function (node) {
    let xpath = '';
    xpath = (node.firstElementChild || node).nodeName;
    if (node.parentElement) {
        xpath = xover.xml.getXpath(node.parentElement) + '/' + xpath;
    }
    return xpath;
}

xover.data.search = function (xpath, dataset) {
    let ref;
    dataset = (dataset || xover.stores.active || xover.Store().document)
    if (typeof (xpath) == "string") {
        ref = dataset.selectSingleNode(xpath)
    }
    return ref;
}

xover.data.find = function (ref, dataset) {
    dataset = (dataset || xover.stores.active || xover.Store())
    if (typeof (ref) == "string") {
        ref = dataset.selectSingleNode('//*[@xo:id="' + ref + '" ]')
    }
    if (!ref) return;
    let exists = false;
    let return_value;
    if (dataset.contains(ref) || ref.nodeType == 2 && dataset.contains(ref.selectSingleNode('..'))) {
        return ref;
    }
    if (ref.nodeType == 2) {
        return dataset.selectSingleNode('//*[@xo:id="' + (ref.ownerElement || document.createElement('p')).getAttributeNS("http://panax.io/xover", "id") + '"]/@' + ref.name);
    } else {
        return (dataset.selectSingleNode('//*[@xo:id="' + (ref.documentElement || ref || document.createElement('p')).getAttributeNS("http://panax.io/xover", "id") + '"]') || xover.stores.active.selectSingleNode(xover.xml.getXpath(ref)));
    }
}

xover.data.deepFind = function (ref) {
    let target = xover.stores.active.find(ref);
    if (target) {
        return target;
    }
    //xover.stores.filter((nombre, document) => document.selectSingleNode(`//*[@xo:id="${typeof (ref) == 'string' ? ref : ref.getAttributeNS("http://panax.io/xover", "id")}"]`))
    for (let xDocument in xover.stores) {
        target = xover.stores[xDocument].find(ref);
        if (target) {
            return target;
        }
    }
    return target;
}

xover.dom.allowDrop = function (ev) {
    ev.preventDefault();
}

xover.dom.drag = function (ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

xover.dom.drop = function (ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

xover.storage.clearCache = function (document_name) {
    if (typeof (Storage) !== "undefined") {
        localStorage.clear();
    } else {
        console.error('Storage is not supported by your browser');
    }
}

xover.storage.setKey = function (key, value) {
    if (typeof (Storage) !== "undefined") {
        let session_id = (xover.session.network_id && `${xover.session.network_id}/` || `${location.hostname}${location.pathname.replace(/[^/]+$/, "")}`);
        if (!key) return;
        key = `${session_id}${key}`;
        if (value === undefined) {
            localStorage.removeItem(key);
        } else if (value instanceof Attr) {
            localStorage.setItem(key, JSON.stringify({ attribute: value.name, value: value.value, target: (value.selectSingleNode("../@xo:id") || {}).value, parent: (value.selectSingleNode("../../@xo:id") || {}).value, preceding_sibling: (value.selectSingleNode("../preceding-sibling::*/@xo:id") || {}).value }));
        } else if ((value instanceof Node || value instanceof xover.Store) && value.toString) {
            localStorage.setItem(key, JSON.stringify(value.toString()));
        } else if (value instanceof Node && value.outerHTML) {
            localStorage.setItem(key, JSON.stringify(value.outerHTML));
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } else {
        console.error('Storage is not supported by your browser')
    }
}

xover.storage.getKey = function (key) {
    //if (!eval(xover.storage.enabled) && key != 'xover.storage.enabled') return;
    if (typeof (Storage) !== "undefined") {
        let session_id = (xover.session.network_id && `${xover.session.network_id}/` || `${location.hostname}${location.pathname.replace(/[^/]+$/, "")}`);
        let document = JSON.parse(localStorage.getItem(`${session_id}${key}`));
        if (document) {
            return document;
        }
    } else {
        console.error('Storage is not supported by your browser')
    }
}

xover.network = {}
Object.defineProperty(xover.network, 'broadcast', {
    value: function (package) {
        if (event.srcEvent instanceof StorageEvent) return;
        let json_rpc, json_rpc_params;
        if (package instanceof Attr) {
            json_rpc_params = { attribute: package.name, namespace: package.namespaceURI, value: package.value, target: package.parentNode.getAttribute("xo:id"), "store": (package.ownerDocument.store || {}).tag };
            json_rpc = xover.network.createCall("set", json_rpc_params)
        } else if ((package instanceof Node || package instanceof xover.Store) && package.toString) {
            if (package.parentElement) {
                json_rpc_params = { value: package.toString(), namespace: package.namespaceURI, target: (package.parentNode.selectSingleNode("@xo:id") || {}).value, parent: (package.selectSingleNode("../@xo:id") || {}).value, preceding_sibling: (package.previousElementSibling || document.createElement("p")).getAttribute("xo:id"), "store": (package.ownerDocument.store || {}).tag };
                json_rpc = xover.network.createCall("set", json_rpc_params)
            } else {
                json_rpc = xover.network.createCall("remove", { "target": package.getAttribute("xo:id"), "store": (package.ownerDocument.store || {}).tag })
            }
        } else if (package.constructor === {}.constructor && package.hasOwnProperty("jsonrpc")) {
            json_rpc = package
        } else {
            json_rpc = xover.network.createCall("apply", package)
        }
        xover.storage.setKey("rpc:json", json_rpc);
        xover.storage.setKey("rpc:json", undefined);
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.network, 'connect', {
    value: function (input) {
        xover.session.network_id = (input || xover.session.network_id || xover.cryptography.generateUUID());
        return xover.session.network_id;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.network, 'createCall', {
    value: function (method, params) {
        return { "jsonrpc": "2.0", "method": method, "params": params, "id": xover.cryptography.generateUUID() }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.network, 'createResponse', {
    value: function (id, response, error_code = 500) {
        if (error_code) {
            return { "jsonrpc": "2.0", "error": { "code": error_code, "message": response }, "id": id }
        } else {
            return { "jsonrpc": "2.0", "result": response, "id": xover.cryptography.generateUUID() }
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.network, 'id', {
    get: function () {
        return xover.session.network_id;
    }
});

Object.defineProperty(xover.network, 'disconnect', {
    value: function () {
        xover.session.network_id = undefined;
        return xover.session.network_id;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xover.network, 'listener', {
    value: function (event) {
        if (!event) { event = window.event; }
        if (event.newValue === null) return;
        let session_id = (xover.session.network_id && `${xover.session.network_id}/` || `${location.hostname}${location.pathname.replace(/[^/]+$/, "")}`);
        if (event.key.match(new RegExp(`^${session_id}`, 'i'))) {
            let key = event.key.replace(new RegExp(`^${session_id}`, 'i'), '');
            let new_value = JSON.parse(event.newValue);
            if (["network_id"].includes(key)) return;
            if (key === "rpc:json") {
                if (new_value.method) {
                    let store = new_value.params.store;
                    let target_id = new_value.params.target;
                    let action = new_value.method;
                    let ref_node;
                    switch (action) {
                        case 'remove':
                            ref_node = xover.stores[store].find(target_id);
                            ref_node && ref_node.remove();
                            break;
                        case 'insert':
                            ref_node = xover.stores[store].find(target_id);
                            ref_node && ref_node.insertAfter(xover.xml.createNode(target_node.value), target_node.find(new_value.find(new_value.params.preceding_sibling)));
                            break;
                        case 'set':
                            let attribute = new_value.params.attribute;
                            let namespace = new_value.params.namespace;
                            if (new_value.params.attribute) {
                                ref_node = xover.stores[store].find(target_id);
                                ref_node && ref_node.setAttributeNS(namespace, attribute, new_value.params.value);
                            } else {
                                let new_node = xover.xml.createNode(new_value.params.value);
                                ref_node = xover.stores[store].find(new_value.params.preceding_sibling);
                                if (ref_node) {
                                    ref_node.appendAfter(new_node)
                                    break;
                                }
                                ref_node = xover.stores[store].find(new_value.params.parent);
                                if (ref_node) {
                                    ref_node.appendChild(new_node)
                                    break;
                                }
                                if (!ref_node) {

                                }
                            }
                            break;
                        default:
                            console.error("No se pudo sincronizar la solicitud")
                    }
                    if (!ref_node) {
                        xover.network.broadcast(xover.network.createResponse(new_value.id, "No se pudo completar el proceso"));
                    }
                } else {
                    window.top.dispatchEvent(new xover.listener.Event('rpcResponse', new_value));
                }
            } else {
                xover.session[key] = new_value;
            }
        }
    },
    writable: false, enumerable: false, configurable: false
});

if (window.addEventListener) {
    window.addEventListener("storage", xover.network.listener, false);
} else {
    window.attachEvent("onstorage", xover.network.listener);
};

//xover.listener.on('beforeRemoveHTMLElement', function ({ target }) {
//    let xo_store = target.getAttribute("xo-source");
//    if (xo_store) {
//        delete xover.stores[xo_store];
//    } else {
//        if (target.classList && target.classList.contains("loading") || ["alert", "alertdialog"].includes(String(target.role).toLowerCase())) {
//            let store = target.store;
//            if (store && (store.state.submitting || store.state.busy)) {
//                event.preventDefault();
//                [store.stylesheets['loading.xslt']].removeAll();
//            };
//        }
//    }
//})

//xover.listener.on('remove', function ({ target }) { //Se quita para que no borre stores accidentalmente (si se borra el nodo raíz). Si la intención es borrar el store o el nodo, mejor realizar un element.scope.remove()
//    let scope = target.scope; 
//    if (scope instanceof Element) {
//        scope && scope.remove();
//    }
//})

xover.listener.on('dialog::iframe', function () {
    let iframe = this;
    let style = iframe.contentDocument.querySelector("style");
    if (style && !iframe.style.minWidth && (iframe.contentDocument.title || '').match(/IIS|Detailed Error/)) {
        iframe.contentDocument.firstElementChild.classList.add("dialog")
        style.after(document.createElement("style").set("type", "text/css").set(document.createTextNode(`.content-container:has(fieldset ul), .content-container:has(fieldset p a) {display: none;}`)))
        iframe.style.minWidth = '80vw'
        iframe.style.height = (iframe.contentDocument.firstElementChild.offsetHeight + 0) + 'px';
        iframe.style.width = (iframe.contentDocument.firstElementChild.scrollWidth + 100) + 'px';
    }
})

xover.listener.on('importFailure::~.xslt', function ({ response = {}, request = {} }) {
    let document = response.document;
    let source = request
    if (document instanceof Document) {
        let details = document.querySelector("#details-right");
        let ref = details && details.selectFirst("//tr/th[.='Physical Path']");
        if (details && ref) {
            details.setAttribute("id", "details");
            new NodeSet(document.querySelector("#details-left")).remove();
            ref.innerText = 'Source file';
            ref.nextElementSibling.innerHTML = `&nbsp;&nbsp;&nbsp;${request}`;
        }
    }
})

xover.listener.click = {}

xover.listener.keypress = function (e = {}) {
    xover.listener.keypress.ctrlKey = e.ctrlKey;
    xover.listener.keypress.shiftKey = e.shiftKey;
    xover.listener.keypress.altKey = e.altKey;
    xover.listener.keypress.tabKey = (e.keyCode == 9);
    xover.listener.keypress.escKey = (e.keyCode == 27);
    if (xover.debug["xover.listener.keypress"]) {
        console.log(String.fromCharCode(e.keyCode) + " --> " + e.keyCode)
    }
    if (event.keyCode == xover.listener.keypress.last_key) {
        ++xover.listener.keypress.streak_count;
    } else {
        xover.listener.keypress.last_key = event.keyCode;
        xover.listener.keypress.streak_count = 1;
    }
}

xover.listener.keypress.last_key = undefined;
xover.listener.keypress.streak_count = 0;

document.addEventListener('keydown', xover.listener.keypress)
document.addEventListener('keyup', xover.listener.keypress)

//document.onkeydown = function (event) {
//    if (![9].includes(event.keyCode)) {
//        xover.delay(1).then(() => {
//            xover.site.save(event.srcElement.selector);
//        })
//    }
//    if (event.keyCode == xover.listener.keypress.last_key) {
//        ++xover.listener.keypress.streak_count;
//    } else {
//        xover.listener.keypress.last_key = event.keyCode;
//        xover.listener.keypress.streak_count = 1;
//    }
//    if (xover.debug["xover.listener.keypress.keydown"]) {
//        if (!xover.debug["xover.listener.keypress"]) {
//            console.log("key pressed: " + event.keyCode)
//        }
//        console.log("xover.listener.keypress.streak_count: " + xover.listener.keypress.streak_count)
//    }
//    xover.listener.keypress(event);
//    if (xover.listener.keypress.altKey || xover.listener.keypress.shiftKey || xover.listener.keypress.ctrlKey) {
//        if (this.keyInterval != undefined) {
//            window.clearTimeout(this.keyInterval);
//            this.keyInterval = undefined;
//        }
//        this.keyInterval = window.setTimeout(function () {
//            xover.listener.keypress();
//            this.keyInterval = undefined;
//        }, 1000);
//        return;
//    } //if combined with alt/shift/ctrl keys 
//    // in grids, this function will allow move up and down between elements
//    let srcElement = event.srcElement;
//    if (event.keyCode == 40 && !(event.srcElement instanceof HTMLTextAreaElement || srcElement.hasAttribute("contenteditable"))) {
//        if (srcElement.nodeName.toLowerCase() == 'select' && (srcElement.size || xover.browser.isIE() || xover.browser.isEdge())) return;
//        currentNode = srcElement.source;
//        if (!currentNode) return false;
//        nextNode = currentNode.selectSingleNode('../following-sibling::*[not(@xo:deleting="true")][1]/*[local-name()="' + currentNode.nodeName + '"]')
//        if (nextNode) {
//            let nextElement = document.getElementById(nextNode.getAttribute('xo:id'));
//            nextElement && nextElement.focus();
//        }
//        event.preventDefault();
//    } else if (event.keyCode == 38 && !(event.srcElement instanceof HTMLTextAreaElement || srcElement.hasAttribute("contenteditable"))) {
//        if (srcElement.nodeName.toLowerCase() == 'select' && (srcElement.size || xover.browser.isIE() || xover.browser.isEdge())) return;
//        currentNode = srcElement.source;
//        if (!currentNode) return false;
//        nextNode = currentNode.selectSingleNode('../preceding-sibling::*[not(@xo:deleting="true")][1]/*[local-name()="' + currentNode.nodeName + '"]')
//        if (nextNode) {
//            let nextElement = document.getElementById(nextNode.getAttribute('xo:id'));
//            nextElement && nextElement.focus();
//        }
//        event.preventDefault();
//    }
//    if (srcElement.nodeName.toLowerCase() == 'select') {//disable behaviour that changes options with arrows, preventing unwanted changes
//        let key = event.which || event.keyCode;
//        if (key == 37) {
//            event.preventDefault();
//        } else if (key === 39) {
//            event.preventDefault();
//        }
//    }
//    //if ((document.activeElement || {}).value) {
//    //    xover.dom.activeElementCaretPosition = parseFloat(String(xover.dom.getCaretPosition(document.activeElement)).split(",").pop()) + 1;
//    //}
//};

document.onkeyup = function (e) {
    //xover.listener.keypress.last_key = e.keyCode;
    //xover.listener.keypress(e);
    //window.setTimeout(function () { xover.listener.keypress(e); }, 300);
    if (e.key == 'Escape') {
        [...document.querySelectorAll('dialog:not([open])')].removeAll()
    }
};

// TODO: Modificar listeners para que funcion con el método de XOVER
xover.dom.beforeunload = function (e) {
    /*Might cause the state to be deleted --> */ //history.replaceState({ ...history.state }, {}, location.pathname + location.search + (location.hash || ''));
    ////history.replaceState(history.state || {}, {}, (window.top || window).location.hash || '/');
    //event.returnValue = `Are you sure you want to leave?`;

    //console.log("checking if we should display confirmation dialog");
    //let shouldCancel = false;
    //if (shouldCancel) {
    //    console.log("displaying confirmation dialog");
    //    e.preventDefault();
    //    e.returnValue = false;
    //}
};

var eventName = xover.browser.isIOS() ? "pagehide" : "beforeunload";

window.addEventListener(eventName, xover.dom.beforeunload);

xover.dom.print = function () {
    let iframes = document.querySelectorAll('iframe');

    if (iframes) {
        for (let f = 0; f < iframes.length; ++f) {
            let iframe = iframes[f];
            if (iframe.classList.contains("non-printable")) {
                continue;
            }
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            f = iframes.length;
        }
    } else {
        window.print()
    }
}

xover.listener.on('fetch::xo:message[.!=""]', function ({ target, attribute: key }) {
    this.render()
});

xover.listener.on('fetch::~.xslt', function ({ tag }) {
    document.querySelectorAll(`[xo-stylesheet='${tag.replace(/^#/, '')}']`).forEach(section => section.render())
});

xover.listener.on('xover.Source:fetch', async function ({ settings = {} }) {
    let progress = await settings.progress;
    progress && progress.remove();
})

xover.listener.on('change::#state:scrollRestoration', function ({ value }) {
    history.scrollRestoration = value;
})

xover.listener.on('change::@state:*', async function ({ target, attribute: key }) {
    if (event.defaultPrevented || !(target && target.parentNode)) return;
    let stylesheets = target.parentNode.stylesheets
    if (!stylesheets) return;
    let documents = stylesheets.getDocuments();
    documents = await Promise.all(documents.map(document => document.documentElement || document.fetch())).then(document => document);
    documents.filter(stylesheet => stylesheet && stylesheet.selectSingleNode(`//xsl:stylesheet/xsl:param[starts-with(@name,'state:${key}')]`)).forEach(stylesheet => stylesheet.store.render());
});

xover.listener.on('change::@xo-source', function ({ element }) {
    let section = element.section;
    section && section.render()
});

xover.listener.on('change::@state:busy', function ({ target, value }) {
    if (event.defaultPrevented) return;
    let store = target.store;
    if (store instanceof xover.Store && store.isActive) {
        if (value && JSON.parse(value)) {
            //targetDocument = ((document.activeElement || {}).contentDocument || document);
            //xover.sources["loading.xslt"].render({ target: , action: "append" });
            let last_stylesheet = store.stylesheets.pop();
            let document = store.document;
            document.render(document.createProcessingInstruction('xml-stylesheet', { type: 'text/xsl', href: "loading.xslt", target: last_stylesheet && last_stylesheet.target || 'body', action: "append" }));
        } else {
            let attrib = target.getAttributeNode("state:busy");
            attrib && attrib.remove();
        }
    }
});

xover.listener.on('remove::@state:busy', function ({ target, value }) {
    let store = target.store;
    if (store instanceof xover.Store && store.isActive) {
        [...document.querySelectorAll(`[xo-source="${store.tag}"][xo-stylesheet='loading.xslt']`)].removeAll();
    }
});

//xover.listener.on("focusout", function (event) {
//    if (event.defaultPrevented) return;
//    xover.dom.lastBluredElement = event.target;

//    //if (((arguments || {}).callee || {}).caller === xover.dom.clear) {
//    //    xover.dom.activeElement = event.target;
//    //} else {
//    xover.dom.bluredElement = event.target;
//    if (xover.debug["focusout"]) {
//        console.log(event.target);
//    }
//    //}
//})

Object.defineProperty(xover.listener, 'contentEdited', {
    value: function (event) {
        let elem = event.srcElement;
        let source = elem && elem.scope || null
        if (source instanceof Attr || source instanceof Text) {
            if (elem.isContentEditable) {
                source.set(elem.textContent, false)
            } else {
                source.set(elem.value, false)
            }
        }
    }, writable: true, enumerable: false, configurable: false
})

xover.listener.on('input', function (event) {
    if (event.defaultPrevented) return;
    let elem = event.srcElement;
    if (elem.isContentEditable) {
        elem.addEventListener('blur', xover.listener.contentEdited);
    }
})

xover.listener.on('click::*[ancestor-or-self::a[@href="#"]]', function (event) {
    if (event.defaultPrevented) return;
    if (!this.closest("menu,.autoscroll-disabled")) {
        window.scrollTo({ top: 0 });
    }
    event.preventDefault();
})

xover.listener.on('click::*[ancestor-or-self::a[@scroll-restoration]]', function (event) {
    let scrollRestoration = this.closest("a[scroll-restoration]").getAttribute("scroll-restoration");
    xover.delay(100).then(() => {
        let meta = window.document.querySelector(`head meta[name=scroll-restoration]`) || window.document.head.appendChild(xover.xml.createNode(`<meta name="scroll-restoration" content="${scrollRestoration}"/>`));
        meta.setAttribute("content", scrollRestoration);
    })
})

xover.listener.on('click::*[ancestor-or-self::a]', function (event) {
    if (event.defaultPrevented) return;
    xover.listener.click.target = event.target;
    xover.delay(250).then(() => xover.listener.click.target = undefined)
    let srcElement = event.target.closest("[href]");
    let hashtag = (srcElement ? srcElement.getAttribute("href") : "");

    if (!hashtag.match(/^#./)) {
        return;
    }
    custom_event = new xover.listener.Event('beforeHashChange', [hashtag, (window.top || window).location.hash])
    if (hashtag !== undefined && hashtag != (window.top || window).location.hash) {
        window.top.dispatchEvent(custom_event);
    }
    if (custom_event.defaultPrevented) {
        return event.preventDefault();
    }
});

//xover.listener.on(["change", "click"], function (event) {
//    if (event.defaultPrevented) return;
//    xover.dom.bluredElement = event.target;
//    xover.delay(40).then(() => {
//        xover.dom.triggeredByTab = xover.listener.keypress.tabKey;
//    })
//})

//xover.listener.on("click", function (event) {
//    if (event.defaultPrevented) return;
//    xover.delay(40).then(() => {
//        let target_store = event.target.store;
//        if (target_store) {
//            if (target_store.sources.reload.interval.continue) {
//                target_store.sources.reload.interval.continue();
//            }
//            if (xover.listener.keypress.ctrlKey && !xover.listener.keypress.shiftKey && !xover.listener.keypress.altKey/* && target_tag !== (window.top || window).location.hash)*/) {
//                let target_tag = target_store.tag;
//                xover.site.update({ active: target_tag, hash: target_tag });
//            }
//        }
//    })
//})

xover.listener.on(["contextmenu", "focusin"], function (event) {
    if (event.defaultPrevented) return;
    xover.delay(40).then(() => {
        let target = event.target;
        let target_store = target.store;
        if (target_store instanceof xover.Store && (event.type == 'contextmenu' || target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
            if (target_store.sources.reload.interval.pause) {
                target_store.sources.reload.interval.pause();
            }
        }
    })
})

var _Network_state = true;
xover.browser.updateIndicator = function () {
    if (navigator.onLine) {
        console.info("online")
        _Network_state = true;
    } else {
        console.warn("offline")
        _Network_state = false;
    }
}
xover.listener.on(["online", "offline"], xover.browser.updateIndicator);
xover.browser.updateIndicator();

Object.defineProperty(xover.string, 'replace', {
    value: function (input, search_text, replace_text, is_regex) {
        let result;
        if (is_regex) {
            let regex = new RegExp(search_text.replace(/([\\"])/, '\\$1'), "ig");
            result = String(input).replace(regex, replace_text)
        } else if (String(input).replaceAll) {
            result = String(input).replaceAll(search_text, replace_text)
        } else {
            let regex = new RegExp(search_text.replace(/([\[\]\(\)\\"])/, '\\$1'), "ig");
            result = String(input).replace(regex, replace_text)
        }
        return result;
    },
    writable: true, enumerable: false, configurable: false
})

xover.string.trim = function (text) {
    if (typeof (text) != "string") return text;
    return text.replace(/\s+$/, '').replace(/^\s+/, '')
}

xover.string.toTitleCase = function (str) {
    /*Code obtained from https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript */
    let i, j, lowers, uppers;
    if (!str) return str;
    if (xover.string.isEmail(str)) {
        return str.toLowerCase();
    } else if (xover.string.isRFC(str) || xover.string.isCURP(str)) {
        return str.toUpperCase();
    }

    str = str.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless 
    // they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
        'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With', 'A', 'De', 'Y', 'O'];
    for (let i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
            function (txt) {
                return txt.toLowerCase();
            });

    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id', 'Tv', 'RFC', 'CURP', 'Sa', 'Cv', 'Rl'];
    for (let i = 0, j = uppers.length; i < j; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
            uppers[i].toUpperCase());

    return str;
}

xover.string.isRFC = function (str) {
    if (/^([A-Z,Ñ,&]{3,4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[A-Z|\d]{3})$/.test(str)) {
        return (true)
    }
    return (false)
}

xover.string.isEmail = function (str) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str)) {
        return (true)
    }
    return (false)
}

xover.string.isCURP = function (str) {
    if (/^([A-Z]{4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[A-Z]{3}[0-9A-Z]\d)$/.test(str)) {
        return (true)
    }
    return (false)
}

function isNumericOrMoney(sValue) {
    let sCurrencyPath = /^(?:\$)?(?:\-)?\d{1,3}((?:\,)\d{3})*\.?\d*$/
    return (String(sValue).search(sCurrencyPath) != -1)
}

function isFunction(a) {
    return typeof a == 'function';
}

function existsFunction(function_name) {
    try {
        return eval(`typeof ${function_name}`) === "function"
    } catch (e) {
        return false;
    }
}

function isObject(a) {
    return (a && typeof a == 'object') || isFunction(a);
}

function isEmpty(str) {
    return (!str || /^\s*$/.test(str));
}

function isNumber(value) {
    return parseFloat(value) == value
}

xover.dom.getCaretPosition = function (elem) {
    let caret_pos, caret_start, caret_end;
    elem = elem instanceof Element && elem || typeof (elem) == 'string' && document.querySelector(elem);
    if (!(elem && elem.value)) return [0];
    if (elem.isContentEditable || (elem.selectionStart || elem.selectionStart == 0)) {
        caret_start = elem.selectionStart;
        caret_end = elem.selectionEnd;
        caret_direction = elem.selectionDirection;
        if (caret_start == caret_end) {
            caret_pos = [caret_start];
        } else if (caret_start > caret_end || caret_direction == 'backward') {
            caret_pos = [caret_end, caret_start];
        } else {
            caret_pos = [caret_start, caret_end];
        }
    }
    else if (document.selection) {
        elem.focus();
        let selection = document.selection.createRange();
        selection.moveStart('character', -elem.value.length);
        caret_pos = selection.text.length;
    }
    return caret_pos;
}

xover.dom.setCaretPosition = function (elem, caret_pos) {
    if (elem && elem.focus) {
        if (!(elem.isContentEditable || (elem.selectionStart || elem.selectionStart == 0) || document.selection)) {
            elem.focus();
        }
        else if (typeof (elem.value) != "undefined") {
            let [start, end] = caret_pos || [];
            if (elem.createTextRange) {
                let range = elem.createTextRange();
                if (end) {
                    if (start > end) {
                        elem.setSelectionRange(end, start, "backward");
                    } else {
                        elem.setSelectionRange(start, end);
                    }
                    xover.site.activeCaret = [start, end];
                } else {
                    range.move('character', start);
                    range.select();
                    xover.site.activeCaret = [start];
                }
            }
            else if (start != null && elem.setSelectionRange) {
                elem.focus();
                if (end) {
                    if (start > end) {
                        elem.setSelectionRange(end, start, "backward");
                    } else {
                        elem.setSelectionRange(start, end);
                    }
                    xover.site.activeCaret = [start, end];
                } else {
                    elem.setSelectionRange(start, start);
                    xover.site.activeCaret = [start];
                }
            } else {
                elem.focus();
            }
        }
    }
}

xover.dom.elementVisible = function (el, container) {
    if (container.scrollTop > el.offsetTop || container.scrollLeft > el.offsetLeft) {
        return false;
    }
    return true;
}

//xover.data.getScrollPosition = async function (target) {
//    let coordinates = ((target || await xover.stores.active.documentElement || document.createElement('p')).selectNodes('@state:x-position|@state:y-position') || []).reduce((json, attr) => { json[attr.localName.replace('-position', '')] = attr.value; return json; }, {});
//    return coordinates;
//}

xover.dom.getScrollPosition = function (el) {
    let targetDocument = ((document.activeElement || {}).contentDocument || document);
    el = (el || targetDocument.activeElement || targetDocument.querySelector('body'));//(el || window);
    scrollParent = (xover.dom.getScrollParent(el) || targetDocument.querySelector('body'));
    let coordinates =
    {
        x: (scrollParent.pageXOffset !== undefined ? scrollParent.pageXOffset : scrollParent.scrollLeft),
        y: (scrollParent.pageYOffset !== undefined ? scrollParent.pageYOffset : scrollParent.scrollTop),
        target: scrollParent.selector
    }
    return coordinates;
}


xover.dom.setScrollPosition = function (el, coordinates) {
    el = (typeof (el) == 'string' && document.querySelector(el) || el);
    if (el) {
        if (!(coordinates && el.scrollTo)) {
            return;
        }
        el.scrollTo(coordinates.x, coordinates.y);
    }/* else {
        Object.entries(xover.site.get("scrollableElements", {})).map(([selector, coordinates]) => {
            xover.dom.setScrollPosition(selector, coordinates)
        })
    }*/
}

xover.dom.getScrollParent = function (el) {
    if (el == null) {
        return null;
    }
    if (el.scrollHeight > el.clientHeight && (el.scrollTop || el.scrollLeft)) {
        return el;
    } else {
        return xover.dom.getScrollParent(el.parentNode);
    }
}

Object.defineProperty(xover.site, 'getScrollableElements', {
    value: function (scope) {
        let target = (scope || (document.activeElement || {}).contentDocument || document);
        function isScrollable(el) {
            //return el.scrollHeight >= el.clientHeight && (el.scrollTop || el.scrollLeft);
            // Check if the element has overflow and overflow-y set to auto or scroll
            if (!(el instanceof HTMLElement)) return false;
            const overflowY = window.getComputedStyle(el).overflowY;
            const overflowX = window.getComputedStyle(el).overflowX;
            return (overflowY === 'scroll' || overflowY === 'auto' ||
                overflowX === 'scroll' || overflowX === 'auto');
        }

        //xover.stores.active.selectNodes("//*[@state:x-position]").filter(node => {
        //    (node.getAttribute("state:x-position") > 0 || node.getAttribute("state:y-position") > 0)/* && document.querySelector(`#${node.getAttributeNS("http://panax.io/xover", "id")}`)*/
        //});
        return [...(scope && [scope] || []), ...target.querySelectorAll("*")].filter(scope => isScrollable(scope));
    }
})

//xover.dom.updateScrollableElements = function (el) {
//    let target = (el || (document.activeElement || {}).contentDocument || document);
//    Object.keys(xover.site.scrollableElements).filter(selector => document.querySelector(selector)).forEach(selector => xover.site.scrollableElements[selector] = xover.dom.getScrollPosition(document.querySelector(selector))); //Updates all scrollable elements in sight even if they are not longer scrollable.
//    let scrollable = xover.site.getScrollableElements(target);
//    scrollable.map(el => {
//        let coordinates = xover.dom.getScrollPosition(el);
//        path = el.selector;
//        xover.site.scrollableElements[path] = { x: coordinates.x, y: coordinates.y }
//    });
//    //xover.site.scrollableElements = xover.site.scrollableElements;
//    ////xover.stores.active.selectNodes("//*[@state:x-position]").filter(node => {
//    ////    return (node.getAttribute("state:x-position") > 0 || node.getAttribute("state:y-position") > 0)/* && document.querySelector(`#${node.getAttributeNS("http://panax.io/xover", "id")}`)*/
//    ////}).map(node => {
//    ////    xover.site.scrollableElements[node.getAttributeNS("http://panax.io/xover", "id")] = {}
//    ////    xover.site.scrollableElements[node.getAttributeNS("http://panax.io/xover", "id")]["x"] = node.getAttribute("state:x-position");
//    ////    xover.site.scrollableElements[node.getAttributeNS("http://panax.io/xover", "id")]["y"] = node.getAttribute("state:y-position");
//    ////});
//}

xover.dom.getNextElement = function (src) {
    src = (src || document.activeElement)
    context = (/*document.querySelector('main form') || */document.querySelector('main'));
    let focussableElements = 'a:not([disabled]), button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    if (src) {
        let focussable = Array.prototype.filter.call(context.querySelectorAll(focussableElements),
            function (element) {
                //check for visibility while always include the current activeElement 
                return element.offsetWidth > 0 || element.offsetHeight > 0 || element === src
            });
        focussable = focussable.filter(el => el.tabIndex != -1);
        let index = focussable.indexOf(src);
        if (index > -1) {
            let nextElement = focussable[index + 1] || focussable[0];
            return nextElement;
        }
    }
}

xover.dom.getPrecedingElement = function (src) {
    src = (src || document.activeElement)
    context = (/*document.querySelector('main form') || */document.querySelector('main'));
    let focussableElements = 'a:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    if (src) {
        let focussable = Array.prototype.filter.call(context.querySelectorAll(focussableElements),
            function (element) {
                //check for visibility while always include the current activeElement 
                return element.offsetWidth > 0 || element.offsetHeight > 0 || element === src
            });
        focussable = focussable.filter(el => el.tabIndex != -1);
        let index = focussable.indexOf(src);
        if (index > -1) {
            let nextElement = focussable[index - 1] || focussable[0];
            return nextElement;
        }
    }
}

xover.dom.focusNextElement = function () {
    let nextElement = xover.dom.getNextElement();
    nextElement.focus();
}

xover.debug.brokenXmlAttributes = function (node) {
    return node.selectNodes(`@*`).filter(attr => (!attr.prefix && attr.name.indexOf(':') != -1))
}

class TimeoutError extends Error {
    constructor(message = 'Timeout waiting for condition to be met!') {
        super(message);
        this.name = 'TimeoutError';
    }
}

//xover.listener.on('mouseup::textarea', function () {
//    let el = event.srcElement;
//    let scope = el.scope;
//    if (!scope) return;
//    if (scope instanceof Attr) {
//        scope.parentNode.set(`height:${scope.localName}`, el.offsetHeight, { silent: true });
//        scope.parentNode.set(`width:${scope.localName}`, el.offsetWidth, { silent: true });
//    } else {
//        scope.set('state:height', el.offsetHeight, { silent: true });
//        scope.set('state:width', el.offsetWidth, { silent: true });
//    }
//});

xover.listener.on(['change::*[xo-slot]:not([onchange])'], function () {
    if (this.type === 'date' && this.value != '' && !isValidISODate(this.value) || this.preventChangeEvent) {
        this.preventChangeEvent = undefined;
        event.preventDefault();
        return;
    }
    let srcElement = this;
    let scope = this.scope;
    if (!scope) return;
    let _attribute = scope instanceof Attr && scope.name || scope instanceof Text && 'text()' || undefined;
    let value = (srcElement instanceof HTMLInputElement && ['checkbox', 'radio'].includes(srcElement.type)) ? srcElement.checked && srcElement.value || null : (srcElement instanceof HTMLSelectElement ? srcElement.options[srcElement.selectedIndex].getAttribute("value") : srcElement.value);
    //if (srcElement.defaultPrevented) {

    //}
    if (scope instanceof Attr || scope instanceof Text) {
        scope.set(value);
    } else if (scope instanceof Node) {
        _attribute && scope.set(_attribute, value);
    }
})

//xover.listener.on(['change::input[type="file"]'], async function () {
//    let srcElement = this;
//    if (!(srcElement.files && srcElement.files[0])) return;
//    let store = await xover.storehouse.files;
//    let scope = this.scope;
//    if (!scope) return;
//    let _attribute = scope instanceof Attr && scope.name || scope instanceof Text && 'text()' || undefined;
//    store.add(srcElement.files).forEach(record => {
//        [...srcElement.ownerDocument.querySelectorAll(`*[for="${srcElement.id}"] img`)].forEach(img => img.src = record.uid);
//        if (scope instanceof Text || _attribute === 'text') {
//            scope.set(record.uid);
//        } else if (scope instanceof Attr || _attribute) {
//            let { prefix, name: attribute_name } = xover.xml.getAttributeParts(_attribute);
//            scope = scope instanceof Attr ? scope.ownerElement : scope;
//            let metadata = Object.assign({}, xover.string.getFileParts(record.saveAs), record, { name: record.file["name"], type: record.file["type"] });
//            delete metadata["file"];
//            scope.set(_attribute, record.uid);
//            //scope.set(`metadata:${attribute_name}`, metadata);
//            if (metadata.name) {
//                scope.set(`text:${attribute_name}`, metadata.name);
//            }
//        }
//    })
//})

xover.dom.fileManager = async function (files) {
    if (!(files[0])) return [];
    let database = await xover.storehouse.files;
    let cached_files = database.add(files);
    let file_value = cached_files.map(record => {
        let metadata = Object.assign({}, xover.string.getFileParts(record.saveAs), record, { name: record.file["name"], type: record.file["type"] });
        return `${record.uid}?name=${metadata.name}`
    });
    return file_value;
}

xover.listener.on(['change::input[type="file"]'], async function () {
    let srcElement = this;
    let scope = this.scope;
    if (!scope) return;
    let file_string = await xover.dom.fileManager(srcElement.files);
    scope.set(file_string.join(";"));
})

xover.modernize();

xover.dom.toExcel = (function (table, name) {
    if (!table.nodeType) table = document.getElementById(table);
    table = table.cloneNode(true);
    [...table.querySelectorAll('.non_printable,input,select,textarea')].forEach(el => el.remove());
    let myBlob = new Blob(["\ufeff" + table.outerHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
    let url = window.URL.createObjectURL(myBlob);
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = name.replace(/^[^\d\w]/, '');
    a.click();
    setTimeout(function () { window.URL.revokeObjectURL(url); }, 0);
});

//document.addEventListener('mousedown', function (event) {
//    if (event.shiftKey) {
//        event.preventDefault();
//    }
//});
xover.listener.on(['load', 'change::meta[name=scroll-restoration]'], function () {
    xover.site.scrollRestoration = (document.querySelector('meta[name=scroll-restoration]') || document.createElement('p')).getAttribute("content") || history.scrollRestoration
});

xover.listener.on('Response:reject', function ({ response, request = {} }) {
    if (!response.ok && ((request.url || {}).pathname || '').indexOf(`.manifest`) != -1) {
        event.preventDefault();
    }
})

xover.listener.on('ErrorEvent', function () {
    if (!event.lineno) return;
    let args = { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno }
    xover.dom.alert(args);
    console.error(event.message, args)
    event.preventDefault();
})

xover.listener.on('Response:failure?status=499', function ({ statusText }) {
    event.preventDefault()
})

xover.listener.on(['unhandledrejection', 'error'], async (event) => {
    if (event.defaultPrevented || event.cancelBubble) {
        return;
    }
    event.preventDefault && event.preventDefault();
    if (event.type == 'error') {
        let error_event = new xover.listener.Event(event.constructor.name, {}, event);
        window.top.dispatchEvent(error_event);
        if (error_event.defaultPrevented || error_event.cancelBubble) return;
    }
    await xover.ready;
    try {
        let reason = event.message || event.reason;
        if (!reason || reason == 'Script error.') return;
        if (!(/*typeof (reason) == 'string' || */reason instanceof Error)) {
            let unhandledrejection_event = new xover.listener.Event(`reject`, {}, reason);
            window.top.dispatchEvent(unhandledrejection_event);
            if (unhandledrejection_event.defaultPrevented) return;
        }
        if (reason && reason.stack) console.error(reason.stack)
        if (reason instanceof TypeError || reason instanceof DOMException) {
            String(reason).alert()
            console.error(reason.stack || reason)
        } else if (reason instanceof HTMLElement) {
            xover.dom.alert(reason);
        } else if (typeof (reason.render) != 'undefined') {
            reason.render();
        } else {
            String(reason).alert()
        }
    } catch (e) {
        console.error(e);
    }
});