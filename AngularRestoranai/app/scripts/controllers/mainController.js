'use strict'

angular.module('menuApp').controller('mainController', function($scope, stateSharingService){
  var vm = this;
  vm.orderCount = stateSharingService.orders.length;

  $scope.$watch(function(){ return stateSharingService.orders.length; }, function(){
    vm.orderCount = stateSharingService.orders.length;
  });
});
