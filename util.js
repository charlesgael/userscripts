(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g._util = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = new Proxy({}, {
    get(target, prop) {
        if (target[prop]) {
            return target[prop]
        } else {
            const appendNode = function (el, child) {
                if (typeof child === "string") {
                    const span = document.createElement('span');
                    span.innerHTML = child;
                    child = span;
                }
                el.append(child);
            };

            return function (clazz, ...children) {
                if (clazz != null && typeof clazz !== "string") {
                    children.unshift(clazz);
                    clazz = null;
                }
                if (!children) children = [];

                const el = document.createElement(prop);
                el.className = clazz;

                // specificities
                switch(prop) {
                    case 'a':
                        const href = children.shift();
                        if (href) el.href = href;
                        break;
                    case 'img':
                        const url = children.shift();
                        if (url) el.src = url;
                        break;
                }

                children
                    .flat()
                    .forEach(child=>appendNode(el, child));
                return el;
            }
        }
    }
});
},{}],2:[function(require,module,exports){
module.exports = function waitElement(selector, timeout) {

    return new Promise((ok, ko) => {
        if (!selector) {
            ko('No selector');
            return;
        }
        if (!timeout) timeout = 10;
        const start = new Date();

        const check = function(selector, start, timeout) {
            const el = $(selector);
            if (el) {
                ok(el);
            }
            else if (new Date() - start > timeout * 1000) {
                ko('Timeout');
            }
            else {
                setTimeout(() => check(selector, start, timeout), 100);
            }
        };

        check(selector, start, timeout);
    });
};
},{}],3:[function(require,module,exports){
module.exports = function ajaxRequest(conf) {
    return new Promise((ok, ko) => {
        conf.onerror = (err) => ko(err);
        conf.onload = (res) => res.status < 400 ? ok(res) : ko(`${res.status} - ${res.statusText}`);
        GM_xmlhttpRequest(conf);
    })
        .then(res=>res.response);
};
},{}],4:[function(require,module,exports){
ajax = require('./ajax');

module.exports = function ajaxGet(url, query, responseType, extraConf) {
    if (typeof responseType === "object"){
        extraConf = responseType;
        responseType = null;
    }

    if (query && Object.keys(query).length) {
        const queryStr = Object.keys(query)
            .reduce((acc,el)=>
                    acc.concat([`${encodeURI(el)}=${encodeURI(query[el])}`]),
                [])
            .join('&');
        url = `${url}?${queryStr}`;
    }
    const conf = Object.assign({}, extraConf || {}, {
        url,
        method: 'GET',
        responseType
    });
    return ajax(conf);
};
},{"./ajax":3}],5:[function(require,module,exports){
ajax = require('./ajax');

module.exports = function ajaxPost(url, data, responseType, extraConf) {
    if (typeof responseType === "object"){
        extraConf = responseType;
        responseType = null;
    }

    const conf = Object.assign({}, extraConf || {}, {
        url,
        method: 'POST',
        data,
        responseType
    });
    return ajax(conf);
};
},{"./ajax":3}],6:[function(require,module,exports){
module.exports = function isNotNull(obj) {
    return obj != null;
};
},{}],7:[function(require,module,exports){
module.exports = function optionalAccess(obj, path, def) {
    const groups = [...path.matchAll(/\[([^\]]+)\]/gm)]
        .map(x=>x[1]);
    let pathWithGroups = groups
        .reduce((acc, el, idx)=>acc.replace(`[${el}]`, `.$${idx}`), path);
    if (pathWithGroups.startsWith('.')) pathWithGroups = pathWithGroups.substring(1);
    return pathWithGroups
        .split('.')
        .map(x=>x.startsWith('$') ? groups[x.substr(1)] : x)
        .reduce((acc, prop) => acc[prop] || def, obj);
};
},{}],8:[function(require,module,exports){
const props = {
    mkdom: require('./functions/dom/mkdom'),
    waitDom: require('./functions/dom/wait-dom'),
    ajax: require('./functions/net/ajax'),
    get: require('./functions/net/get'),
    post: require('./functions/net/post'),
    util: {
        isNotNull: require('./functions/util/is-not-null'),
        optionalAccess: require('./functions/util/optional-access')
    }
};

module.exports = new Proxy(()=>{}, {
    apply(target, thisArg, argumentsList) {
        return document.querySelector(...argumentsList);
    },
    get(target, p, receiver) {
        if (props[p]) return props[p];
    }
});


},{"./functions/dom/mkdom":1,"./functions/dom/wait-dom":2,"./functions/net/ajax":3,"./functions/net/get":4,"./functions/net/post":5,"./functions/util/is-not-null":6,"./functions/util/optional-access":7}]},{},[8])(8)
});
