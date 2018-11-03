/**
 * Emits arrays containing the matching index values from each input
 */
define(['../observable.js'], function(Observable) {
    var zip = function() {
        var sources = [].slice.call(arguments);
        return new Observable(function(observer) {
            if (sources.length === 0) return Observable.from([]);

            var queues = sources.map(function() {
                return [];
            });

            function done() {
                return queues.some(function(q, i) {
                    return q.length === 0 && subscriptions[i].closed;
                });
            }

            var subscriptions = sources.map(function(source, index) {
                return Observable.from(source).subscribe({
                    next: function next(v) {
                        queues[index].push(v);
                        if (queues.every(function(q) {
                            return q.length > 0;
                        })) {
                            observer.next(queues.map(function(q) {
                                return q.shift();
                            }));
                            if (done()) observer.complete();
                        }
                    },
                    error: function error(e) {
                        observer.error(e);
                    },
                    complete: function complete() {
                        if (done()) observer.complete();
                    }
                });
            });

            return function unsubscribe() {
                subscriptions.forEach(function(s) {
                    return s.unsubscribe();
                });
            };
        });
    };
    return zip;
});
