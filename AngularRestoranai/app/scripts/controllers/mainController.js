'use strict';

angular.module('menuApp').controller('mainController', function($rootScope, $scope, stateShareService, $state){
    var vm = this;
    vm.state = 'cart';
    vm.itemsCount = stateShareService.order.length;

    $scope.$on('stateChange', function(event, nextState){
        vm.state = nextState;
    });
});