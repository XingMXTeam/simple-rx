/**
 * 订阅的对象（报纸，可以被订阅。指定送报纸的人subscriber,他需要知道订阅的人）
 *
 * 可以被订阅（订阅者observer作为入参，它可以是fn或者obj)，注意订阅的时候，如果非异步，会立即执行: subscribe；
 * 并且有被创建的方式（只创建了一个）： of, from；
 */
define(['../util.js', './subscription.js', '../promise.js'], function (u, Subscription, Promise, o1, o2, f) {
    /////////////////////////////////////////

    function Observable(subscriber) {
        if(!u._$isFunction(subscriber)) {
            throw new TypeError('Observable initializer must be a function');
        }
        this.subscriber = subscriber;
    }

    Observable.prototype.getInst = function() {
        return this;
    };

    // a way of creating Observables
    Observable.create = function(subscriber) {
        return new Observable(subscriber);
    };

    // Converts items to an Observable
    Observable.of = function() {
        var items = [].slice.call(arguments);
        return Observable.create(function (observer) {
            for (var i = 0; i < items.length; ++i) {
                observer.next(items[i]);
            }
            observer.complete();
        });
    };    

    // Converts an observable or iterable to an Observable
    Observable.from = function (x) {
        // x is an observable
        var observableInst = x instanceof Observable ? x.getInst() : null;
        if(observableInst) {
            return Observable.create(function (observer) {
                return observableInst.subscribe(observer);
            });
        }
        // x is an array
        else if(u._$isArray(x)) {
            return Observable.create(function(observer) {
                for (var i = 0; i < x.length; ++i) {
                    observer.next(x[i]);
                }
                observer.complete();
            });
        }
    };

    // Subscribes to the sequence with an observer
    Observable.prototype.subscribe = function (observer) {
        if (!u._$isObject(observer)) {
            observer = {
                next: observer || f,
                error: arguments[1] || f,
                complete: arguments[2] || f
            };
        }
        return new Subscription(observer, this.subscriber);
    };

    // Returns a new Observable that emits the results of calling the callback argument for every value in the stream
    Observable.prototype.map = function (fn) {
        var that = this;
        if (!u._$isFunction(fn)) {
            throw new TypeError(fn + ' is not a function');
        }
        return Observable.create(function (observer) {
            return that.subscribe({
                next: function (x) {
                    var value;
                    try {
                        value = fn(x);
                    }catch(e) {
                        return observer.error(e);
                    }
                    return observer.next(value);
                },
                error: function (err) {
                    return observer.error(err);
                },
                complete: function () {
                    return observer.complete();
                }
            });
        });
    }

    // Returns a new Observable that emits all values which pass the test implemented by the callback argument.
    Observable.prototype.filter = function (fn) {
        var that = this;
        if (!u._$isFunction(fn)) {
            throw new TypeError(fn + ' is not a function');
        }
        return Observable.create(function (observer) {
            return that.subscribe({
                next: function (value) {
                    try {
                        if (!fn(value)) return;
                    }catch(e) {
                        return observer.error(e);
                    }
                    return observer.next(value);
                },
                error: function (err) {
                    return observer.error(err);
                },
                complete: function () {
                    return observer.complete();
                }
            });
        });
    }

    // Subscribes to the observable and returns a Promise for the completion value of the stream.
    // The callback argument is called once for each value in the stream.
    // 注意，返回的是一个Promise
    Observable.prototype.forEach = function (fn) {
        var that = this;
        return new Promise(function (resolve, reject) {
            if (!u._$isFunction(fn)) {
                reject(new TypeError(fn + ' is not a function'));
                return;
            }
            var subscription = that.subscribe({
                next: function next(value) {
                    try {
                        fn(value, function () {
                            subscription.unsubscribe();
                            resolve();
                        });
                    } catch (e) {
                        reject(e);
                        subscription.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve
            });
        });
    }

    // Observable.prototype.pipe = function () {
    //     var fns = [].slice.call(arguments);
    //     if(!fns) return this;
    //     var pipeFromArray = function (fns) {
    //         if (!fns) {
    //             return f;
    //         }
    //         if (fns.length === 1) {
    //             return fns[0];
    //         }
    //         return function piped(input) {
    //             return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    //         };
    //     }
    //     return pipeFromArray(fns)(this);
    // };

    return Observable;
});
