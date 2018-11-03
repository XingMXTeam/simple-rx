/**
 * create observable from event
 */
define(['../event.js' ,'../observable.js'], function(e, Observable) {
    var fromEvent = function (target, event) {
        return Observable.create(function(observer) {
            e._$addEvent(target, event, observer.next);
            return function unsubscribe() {
                e._$delEvent(target, event, observer.next);
            };
        });
    };
    return fromEvent;
});
