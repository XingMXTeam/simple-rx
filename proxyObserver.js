/**
 * 内部observer
 */
define(function() {
    function ProxyObserver(subscription) {
        this._subscription = subscription;
    }

    // Sends the next value in the sequence
    ProxyObserver.prototype.next = function (value) {
        this._subscription._notify('next', value);
    };

    // Sends the sequence error
    ProxyObserver.prototype.error = function (e) {
        this._subscription._notify('error', e);
    };

    // Sends the completion notification
    ProxyObserver.prototype.complete = function () {
        this._subscription._notify('complete');
    };

    return ProxyObserver;
});
