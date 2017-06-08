'use strict'

angular.module('menuApp').config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://localhost:5000/**'
  ]);
});

angular.module('menuApp').controller('cartController', function($scope, httpService, stateShareService, $mdDialog){
  var vm = this;
  vm.basketPrice = stateShareService.orderPrice;
  vm.basket = stateShareService.order;
  vm.orderLength = stateShareService.orderLength;

  vm.removeDishSingle = function(dish){
    vm.basket[dish.itemID].count -= 1;
    if (vm.basket[dish.itemID].count === 0){
      delete vm.basket[dish.itemID];
    }
    stateShareService.orderPrice = (parseFloat(stateShareService.orderPrice) - parseFloat(dish.price)).toFixed(2);
    stateShareService.orderLength--;
  };

  vm.addDishSingle = function(dish){
      vm.basket[dish.itemID].count += 1;
      stateShareService.orderPrice = (parseFloat(stateShareService.orderPrice) + parseFloat(dish.price)).toFixed(2);
      stateShareService.orderLength++;
  };

  vm.removeDishAll = function(dish){
    stateShareService.orderPrice = (parseFloat(stateShareService.orderPrice) - parseFloat(parseFloat(dish.price) * dish.count)).toFixed(2);
    stateShareService.orderLength -= dish.count;
    delete vm.basket[dish.itemID];
  };

  vm.showPrompt = function() {
    if (stateShareService.orderLength == 0){
      window.alert('Cart is empty!');
      return;
    }
    $mdDialog.show({
      controller : 'cartAuthController',
      templateUrl : 'views/extra/cartAuthDialogView.html'
    });
  };

    $scope.$watch(function(){
        return stateShareService.orderPrice;
    }, function(){
        vm.basketPrice = stateShareService.orderPrice;
    });

    $scope.$watch(function(){
        return stateShareService.orderLength;
    }, function(){
        vm.orderLengt = stateShareService.orderLength;
    });
});
