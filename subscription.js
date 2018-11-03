/**
 * 订阅过程（谁订阅了: observer是谁， subscriber是送报员）
 */
define(['../util.js', './util.js', './proxyObserver.js'], function(u, util, ProxyObserver) {
    function Subscription(observer, subscriber) {
        this._observer = observer;
        this._state = 'initializing';

        try {
            // initializing process can call `next, complete, error`
            this._cleanupfn = subscriber(new ProxyObserver(this));// 这里不要把this._observer直接传给subscriber而是应该封装个新的对象
        } catch(e) {
            this._observer.error(e);
        }

        // initialize ok, then ready
        this._state = 'ready';
    }

    // Cancels the subscription
    Subscription.prototype.unsubscribe = function () {
        this._closeSubscription();
        this._cleanup();
    };

    Subscription.prototype._closeSubscription = function() {
        this._observer = undefined;
        this._queue = undefined;
        this._state = 'closed';
    };

    Subscription.prototype._cleanup = function() {
        try {
            if(this._cleanupfn && u._$isFunction(this._cleanupfn)) {
                this._cleanupfn.call(this);
            }
            else if(this.cleanup && this.cleanup['unsubscribe']) {
                this.cleanup['unsubscribe'].call(this.cleanup);
            }
            this._cleanup = undefined;
        } catch (e) {
            throw e;
        }
    };

    // notify observer
    Subscription.prototype._notify = function (type, value) {
        if(this._state === 'closed') {
            return;
        }
        if(this._state === 'buffering') {
            this._queue.push({type: type, value: value});
            return;
        }
        // if state is initializing or running, buffering and change state to buffering
        if(this._state !== 'ready') {
            this._state = 'buffering';
            this._queue = [{ type: type, value: value }];
            util.enqueue(function () {
                if(!this._queue) return;
                u._$forIn(this._queue, function (item) {
                    this._concreteNotify(item.type, item.value);
                    return this._state === 'closed';
                }, this);
                this._queue = undefined;
                this._state = 'ready';
            }._$bind(this));
            return;
        }
        this._concreteNotify(type, value);
    };

    // concrete notify method
    Subscription.prototype._concreteNotify = function (type, value) {
        //state is running now
        this._state = 'running';
        var observer = this._observer,
            fn = observer[type];
        if(!u._$isFunction(fn)) {
            throw new TypeError(type + ' must be a function');
        }

        switch(type) {
            case 'next':
                try {
                    fn.call(observer, value);
                }catch (e) {
                    throw e;
                }
                break;
            case 'error':
                try {
                    fn.call(observer, value);
                }catch (e) {
                    this.unsubscribe();
                    throw e;
                }
                break;
            case 'complete':
                try {
                    fn.call(observer);
                    this.unsubscribe();
                }catch (e) {
                    this.unsubscribe();
                    throw e;
                }
                break;
        }

        if (this._state === 'running') {
            this._state = 'ready';
        }
    };

    return Subscription;
});

