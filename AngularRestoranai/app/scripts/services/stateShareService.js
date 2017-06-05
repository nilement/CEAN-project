angular.module('menuApp').factory('stateShareService', function() {
    return {
        menu : [],
        order: [],
        menuRetrieved: false,
        historyRetrieved: false,
        history : {},
        expandLatest : false
    }
});