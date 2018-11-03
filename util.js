NEJ.define(['../promise.js'], function (Promise) {
    var _module = {};
    // wrap fn with Promise
    _module.enqueue = function (fn) {
        Promise.resolve().then(function () {
            try {
                fn();
            } catch (e) {
                console.error(e);
            }
        });
    };
    return _module;
});
