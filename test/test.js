define([
    '../index.js',
    '../operators/interval.js',
    '../operators/merge.js',
    '../operators/take.js'
], function(
    Rx,
    interval,
    merge,
    take,
    o1, o2, f
) {
    describe('Observable', function() {
        it('it should be ok to create an Observable', function(done) {
            this.timeout(4000);
            var observable = new Rx.Observable(function subscriber(observer) {
                var timer = setTimeout(function () {
                    observer.next('hello');
                    observer.complete();
                }, 1000);
                return function () {
                    clearTimeout(timer);
                }
            }).subscribe(function (value) {
                console.log(value);
                setTimeout(function () {
                    done();
                }, 2000);
            });
        });

        it('it should be ok to call Rx.Observable.create', function(done) {
            var observable = Rx.Observable.create(function subscriber(observer) {
                var timer = setTimeout(function () {
                    observer.next('world');
                    observer.complete();
                }, 1000);
                return function () {
                    clearTimeout(timer);
                }
            }).subscribe({
                next: function (value) {
                    console.log(value);
                },
                complete: function () {
                    done();
                }
            });
        });

        it('throws if the argument is not callable', function() {
            assert.throws(function() {
                return new Rx.Observable({})
            });
        });

        it('subscriber function should not be called when Observable not be subscribed', function() {
            var called = 0;
            new Rx.Observable(function() { called++ });
            assert.equal(called, 0);
        });

        it('it should be ok to call Rx.Observable.of', function() {
            Rx.Observable.of(1, 2, 3).subscribe(function(value) {
                console.log(value);
            });
        });

        it('it should be ok to call Rx.Observable.from', function() {
            var list = [4, 5, 6];
            Rx.Observable.from(list).subscribe(function(value) {
                console.log(value);
            });
        });

        it('it should be ok to call forEach', function() {
            Rx.Observable.from(['呵呵呵', '呵呵呵+']).forEach(function(value) {
                console.log('received value: '+value);
            }).then(function() {
                console.log('Finished sucessfully');
            }).catch(function (reason) {
                console.log('Finished with error');
            });
        });

        it('it should be ok to call filter', function() {
            Rx.Observable.of(1, 2, 3).filter(function(value) {
                return value > 2;
            }).subscribe(function(value) {
                console.log(value);
            });
        });

        it('it should be ok to call map', function() {
            Rx.Observable.of(1, 2, 3).map(function(value) {
                return value * 2;
            }).subscribe(function(value) {
                console.log(value);
            });
        });

        it('fulfilledValue should be undefined when called complete', async function() {
            var outObserver;
            var promise = new Rx.Observable(function(observer) {
                observer.next('12333');
                outObserver = observer;
            }).forEach(f);
            outObserver.complete();
            assert.equal(await promise, undefined);
        });

        it('it should be ok when called from with Observable instance', async function() {
            Rx.Observable.from(new Rx.Observable(function (observer) {
                observer.next('success');
            })).subscribe(function (value) {
                console.log(value);
            });
        });

        it('does not forward when the subscription is complete', function() {
            var count = 0, observer;
            new Rx.Observable(function(x) { observer = x }).subscribe({
                complete: function () {
                    count++
                }
            });
            observer.complete();
            observer.complete();
            assert.equal(count, 1);
        });

        it('does not forward when the subscription is cancelled', function() {
            var count = 0, observer;
            var subscription = new Rx.Observable(function(x) { observer = x }).subscribe({
                complete: function() {
                    count++;
                }
            });
            subscription.unsubscribe();
            observer.complete();
            assert.equal(count, 0);
        });

        it('queues if the subscription is not initialized', async function() {
            var completed = false;
            new Rx.Observable(function(observer) {
                observer.complete();
            }).subscribe({
                complete: function() {
                    completed = true
                }
            });
            assert.equal(completed, false);
            await null;
            assert.equal(completed, true);
        });

        it('queues if the observer is running', async function() {
            var observer, completed = false
            new Rx.Observable(function(x) { observer = x }).subscribe({
                next: function() { observer.complete() },
                complete: function() { completed = true },
            });
            observer.next();
            assert.equal(completed, false);
            await null;
            assert.equal(completed, true);
        });

        it('delivers arguments to next in a job', async function() {
            var values = [];
            Rx.Observable.of(1, 2, 3, 4).subscribe(function (v) {
                values.push(v);
            });
            assert.equal(values.length, 0);
            await null;
            assert.deepEqual(values, [1, 2, 3, 4]);
        });

        it('it should be ok to new a Subject', function () {
            var subject = new Rx.Subject();

            subject.subscribe({
                next: function(v) {
                    console.log('observerA: ' + v)
                }
            });
            subject.subscribe({
                next: function(v) {
                    console.log('observerB: ' + v)
                }
            });
            subject.next(1);
            subject.next(2);
        });

        it('it should be ok that subject used as an observer', function () {
            var subject = new Rx.Subject();

            subject.subscribe({
                next: function(v) {
                    console.log('observerA: ' + v)
                }
            });
            subject.subscribe({
                next: function(v) {
                    console.log('observerB: ' + v)
                }
            });

            var observable = Rx.Observable.from([1, 2, 3]);

            observable.subscribe(subject);
        });

        it('it should be ok to call merge', function () {
            take.call(merge(interval(2500), interval(1000)), 5).subscribe(function (value) {
                console.log(value);
            });
        });
    });
});