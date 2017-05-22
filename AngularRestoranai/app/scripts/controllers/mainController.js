'use strict';

angular.module('menuApp').controller('mainController', function($rootScope, $scope, stateShareService, $state){
    var vm = this;
    vm.state = 'cart';

    /*$rootScope.$on('$stateChangeStart', function (event, toState) {
        if (toState.name === 'root.history' && stateShareService.historyRetrieved){
            event.preventDefault();
            $state.go('root.retrievedHistory')
        }
    });*/

    $scope.$on('stateChange', function(event, nextState){
        vm.state = nextState;
    });
});