'use strict'

angular.module('menuApp').config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://localhost:5000/**'
  ]);
});

angular.module('menuApp').controller('cartController', function(httpService, stateShareService, $mdDialog){
  var vm = this;
  vm.basketPrice = 0;
  vm.basket = stateShareService.order;

  vm.addDish = function(dishId){
    httpService.getDish(dishId)
      .then(function success(response){
          if (response.errMsg){
            window.alert(response.errMsg);
          }
          else{
            var dish = response.rows[0];
            var found = false;
            vm.basket.forEach(function(item) {
              if (item.itemId == dish.key) {
                item.count += 1;
                vm.basketPrice = (parseFloat(vm.basketPrice) + parseFloat(dish.value[1])).toFixed(2);
                found = true;
              }
            });
            if (!found){
              vm.basketPrice = (parseFloat(vm.basketPrice) + parseFloat(dish.value[1])).toFixed(2);
              vm.basket.push({name:dish.value[0], itemId:dish.key, price: dish.value[1], count: 1});
            }
          }
      });
  };

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

  vm.getMenu = function(){
    if (vm.menuRetrieved === 2){
      window.alert('Menu already retrieved!');
      return;
    }
    else if (vm.menuRetrieved === 1){
      window.alert('Menu is being retrieved!');
      return;
    }
    vm.menuRetrieved = 1;
    httpService.getMenu()
      .then(function success(response){
        if (response){
          if (response.errMsg){
            vm.menuRetrieved = 0;
            window.alert(response.errMsg);
          }
          else if (response.data){
            vm.menu = response.data;
            vm.menuRetrieved = 2;
          }
        }
        else{
          vm.menuRetrieved = 0;
          window.alert('Uncaught error!');
        }
      });
  };

  vm.finishOrder = function(){
    if (vm.basket.length == 0){
      window.alert('Cart is empty!');
      return;
    }
    var foods = [];
    for (var i = 0; i < vm.basket.length; i++){
      foods.push({ count : vm.basket[i].count, dish : vm.basket[i].itemId });
    }
    var orderObj=angular.toJson({dishes: foods, buyer: vm.buyerName, total: vm.basketPrice });
    httpService.sendOrder(orderObj)
      .then(function success(res){
        if (res.data.err){
          window.alert("Can't find DB.");
        }
        else{
          var index = vm.orders.indexOf(order);
          vm.orders.splice(index,1);
        }
      }, function error(res){
        window.alert(res);
      });
  };

  vm.showPrompt = function() {
    $mdDialog.show({
      controller : 'cartAuthController',
      templateUrl : 'views/extra/cartAuthDialogView.html'
    });
  };
});
