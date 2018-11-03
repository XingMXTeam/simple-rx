/**
 * 订阅代理（可以将报纸传递给所有的订阅者。类比EventEmitter）
 */
define(['../klass.js', '../util.js', './observable.js', './subscription.js'], function(k, u, Observable, Subscription, o1, o2, f) {
    var Subject = k._$klass();
    var pro = Subject._$extend(Observable);
    pro.__init = function() {
        this.observers = [];
    };

    pro.subscribe = function(observer) {
        if (!u._$isObject(observer)) {
            observer = {
                next: observer,
                error: arguments[1] || f,
                complete: arguments[2] || f
            };
        }
        this.observers.push(observer);
        var that = this;
        return new Subscription(observer, function subscriber(observer) {
            // 并没有消费数据
            return function unsubscribe() {
                var index = that.observers.indexOf(observer);
                if (index >= 0) {
                    that.observers.splice(index, 1);
                }
            }
        });
    };

    pro.next = function(x) {
        this._notify('next', x);
    };

    pro.error = function(x) {
        this._notify('error', x);
    };

    pro.complete = function(x) {
        this._notify('complete', x);
    };

    pro._notify = function (type, value) {
        try {
            var fn;
            u._$forEach(this.observers, function(observer) {
                fn = observer[type];
                if(fn && u._$isFunction(fn)) {
                    fn(value);
                }
            });
        }catch (e) {
            throw e;
        }
    };

    return Subject;
});
