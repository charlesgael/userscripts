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

