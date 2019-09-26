module.exports = new Proxy({
    mkdom: require('./functions/dom/mkdom'),
    waitDom: require('./functions/dom/wait-dom'),
    ajax: require('./functions/net/ajax'),
    get: require('./functions/net/get'),
    post: require('./functions/net/post'),
    util: {
        isNotNull: require('./functions/util/is-not-null'),
        optionalAccess: require('./functions/util/optional-access')
    }
}, {
    apply(target, thisArg, argumentsList) {
        return document.querySelector.apply(thisArg, argumentsList);
    }
});

