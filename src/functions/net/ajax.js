module.exports = function ajaxRequest(conf) {
    return new Promise((ok, ko) => {
        conf.onerror = (err) => ko(err);
        conf.onload = (res) => res.status < 400 ? ok(res) : ko(`${res.status} - ${res.statusText}`);
        GM_xmlhttpRequest(conf);
    })
        .then(res=>res.response);
};