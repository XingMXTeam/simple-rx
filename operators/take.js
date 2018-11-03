/**
 * run next limit time
 */
define(['../observable.js'], function(Observable) {
    var take = function (max) {
        var that = this;
        return Observable.create(function(observer) {
            var count = 0;
            return that.subscribe({
               next: function (x) {
                   count++;
                   if(count < max) {
                       observer.next(x);
                   } else if(count === max) {
                       observer.next(x);
                       observer.complete()
                   }
               },
               error: observer.error,
               complete: observer.complete
            });
        });
    }
    return take;
});
