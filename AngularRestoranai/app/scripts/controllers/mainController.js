'use strict';

angular.module('menuApp').controller('mainController', function($rootScope, $scope, stateShareService, $state){
    var vm = this;
    vm.state = 'cart';
    vm.itemsCount = stateShareService.orderLength;

    $scope.$on('stateChange', function(event, nextState){
        vm.state = nextState;
    });

    $scope.$watch(function(){
        return stateShareService.orderLength;
    }, function(){
        vm.itemsCount = stateShareService.orderLength;
    });
});