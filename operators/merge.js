/**
 * Emits all values from all inputs in parallel
 */
define(['../util.js', '../observable.js'], function(u, Observable) {
    var merge = function() {
        var observables = [].slice.call(arguments), subscriptions = [];
        return Observable.create(function(observer) {
            u._$forEach(observables, function (observable) {
                subscriptions.push(observable.subscribe(observer));
            });
            return function unsubscribe() {
                subscriptions.forEach(function(s) {
                    return s.unsubscribe();
                });
            }
        });
    };
    return merge;
});
