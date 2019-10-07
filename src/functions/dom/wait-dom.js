module.exports = function waitElement(selector, timeout) {

    return new Promise((ok, ko) => {
        if (!selector) {
            ko('No selector');
            return;
        }
        if (!timeout) timeout = 10;
        const start = new Date();

        const check = function(selector, start, timeout) {
            const el = document.querySelector(selector);
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
