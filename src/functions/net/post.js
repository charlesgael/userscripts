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