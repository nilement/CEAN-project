angular.module('menuApp').factory('stateShareService', function() {
    return {
        order: [],
        historyRetrieved: false,
        history : {},
        expandLatest : false
    }
});