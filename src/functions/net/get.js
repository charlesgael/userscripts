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