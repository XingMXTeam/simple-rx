define(['../observable.js','../subscription.js'], function(Observable, Subscription) {
    var g = window;
    var interval = function (interval) {
        return Observable.create(function(observer) {
            var i = 0, timer;
            timer = g.setInterval(function() {
                observer.next(i++);
            }, interval);
            return function unsubcribe() {
                clearInterval(timer)
            };
        });
    };
    // Observable.prototype.interval = interval;
    return interval;
});
