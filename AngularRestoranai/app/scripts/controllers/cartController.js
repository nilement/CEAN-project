'use strict'

angular.module('menuApp').config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://localhost:5000/**'
  ]);
});

angular.module('menuApp').controller('cartController', function(httpService, stateShareService, $mdDialog){
  var vm = this;
  vm.basketPrice = stateShareService.orderPrice;
  vm.basket = stateShareService.order;

  vm.removeDishSingle = function(dish){
    var index = vm.basket.indexOf(dish);
    vm.basket[index].count -= 1;
    if (vm.basket[index].count === 0){

      vm.basket.splice(index,1);
    }
    vm.basketPrice = (parseFloat(vm.basketPrice) - parseFloat(dish.price)).toFixed(2);
  };

  vm.removeDishAll = function(dish){
    var index = vm.basket.indexOf(dish);
    vm.basketPrice = (parseFloat(vm.basketPrice) - parseFloat(parseFloat(dish.price) * dish.count)).toFixed(2);
    vm.basket[index].count = 0;
    vm.basket.splice(index,1);
  };

  vm.sendOrder = function(){
    var foods = [];
    for (var i = 0; i < vm.basket.length; i++){
      foods.push({ count : vm.basket[i].count, dish : vm.basket[i].itemID, price : vm.basket[i].price, name : vm.basket[i].name });
    }
    var orderObj=angular.toJson({dishes: foods, total: vm.basketPrice, phoneNumber: '860401485' });
    httpService.sendOrder(orderObj)
      .then(function (res){
        if (res.data.err){
          window.alert("Can't find DB.");
        }
        else{
          vm.basketPrice = 0;
          vm.basket.splice(0, vm.basket.length);
        }
      });
  };

  vm.showPrompt = function() {
    if (vm.basket.length == 0){
      window.alert('Cart is empty!');
      return;
    }
    $mdDialog.show({
      controller : 'cartAuthController',
      templateUrl : 'views/extra/cartAuthDialogView.html'
    });
  };
});
