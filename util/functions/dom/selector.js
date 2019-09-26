var $; if (!$)$ = {};


/**
 * Find an element using a selector
 */
$ = new Proxy($, {
    apply(target, thisArg, argumentsList) {
        return document.querySelector.apply(thisArg, argumentsList);
    }
});

/**
 * Promise that resolves when element described by selector apprears on page.
 *
 * @param selector document selector to wait for
 * @param timeout Max time to wait in seconds
 */
$.waitElement = function waitElement(selector, timeout) {

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