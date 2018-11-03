define(['./observable.js', './subject.js', './subscription.js'],
function(Observable, Subject, Subscription) {
    return {
        Subscription: Subscription,
        Observable: Observable,
        Subject: Subject
    }
});
