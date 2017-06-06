angular.module('menuApp').factory('stateShareService', function() {
    return {
        menu : [],
        order: {},
        orderLength : 0,
        menuRetrieved: false,
        historyRetrieved: false,
        history : {},
        expandLatest : false
    }
});