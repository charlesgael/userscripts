/**
 * Simplify the creation of doms element by calling dom.div('myclass', child1, child2)
 */
const createElement = new Proxy({}, {
    get(target, prop) {
        if (target[prop]) {
            return target[prop]
        } else {
            const appendNode = function (el, child) {
                if (typeof child === "string") {
                    const span = dom.span();
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