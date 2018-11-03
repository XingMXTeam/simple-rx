/**
 * Emits arrays containing the most current values from each input
 */
define(['../observable.js'], function(Observable) {
    var combineLatest = function() {
        var sources = [].slice.call(arguments);
        return Observable.create(function(observer) {
            if (sources.length === 0) return Observable.from([]);

            var count = sources.length;
            var values = new Map();

            var subscriptions = sources.map(function(source, index) {
                return Observable.from(source).subscribe({
                    next: function next(v) {
                        values.set(index, v);
                        if (values.size === sources.length) observer.next(Array.from(values.values()));
                    },
                    error: function error(e) {
                        observer.error(e);
                    },
                    complete: function complete() {
                        if (--count === 0) observer.complete();
                    }
                });
            });

            return function() {
                return subscriptions.forEach(function(s) {
                    return s.unsubscribe();
                });
            };
        });
    };
    return combineLatest;
});
