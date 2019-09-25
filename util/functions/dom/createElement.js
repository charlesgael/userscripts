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
                    children = [clazz].concat(children);
                    clazz = null;
                }
                if (!children) children = [];

                const el = document.createElement(prop);
                el.className = clazz;

                // specificities
                switch(prop) {
                    case 'a':
                        el.href = children.shift();
                        break;
                    case 'img':
                        el.src = children.shift();
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