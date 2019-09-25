/**
 * Object containing methods to send ajax requests
 *
 * @requires grant: GM_xmlhttpRequest
 */
const ajax = {};

ajax.request = function ajaxRequest(conf) {
    return new Promise((ok, ko) => {
        conf.onerror = (err) => ko(err);
        conf.onload = (res) => res.status < 400 ? ok(res) : ko(`${res.status} - ${res.statusText}`);
        GM_xmlhttpRequest(conf);
    })
        .then(res=>res.response);
};
ajax.get = function ajaxGet(url, query, responseType, extraConf) {
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
    return ajax.request(conf);
};
ajax.post = function ajaxPost(url, data, responseType, extraConf) {
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
    return ajax.request(conf);
};