'use strict'

angular.module('menuApp').config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://localhost:5000/**'
  ]);
});

angular.module('menuApp').controller('cartController', function(httpService, stateSharingService){
  var vm = this;
  vm.basketPrice = 0;
  vm.basket = [];

  vm.addDish = function(dishId){
    httpService.getDish(dishId)
      .then(function success(response){
          if (response.errMsg){
            window.alert(response.errMsg);
          }
          else{
            var found = false;
            vm.basket.forEach(function(item) {
              if (item.itemId == response.key) {
                item.count += 1;
                vm.basketPrice = (parseFloat(vm.basketPrice) + parseFloat(response.value[1])).toFixed(2);
                found = true;
                return;
              }
            });
            if (!found){
              vm.basketPrice = (parseFloat(vm.basketPrice) + parseFloat(response.value[1])).toFixed(2);
              vm.basket.push({name:response.value[0], itemId:response.key, price: response.value[1], count: 1});
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
    if (stateSharingService.orders.length > 0){
      window.alert("Jūs jau turite paruošta užsakymą!")
      return
    }
    var order = {};
    order.foods = [];
    while(vm.basket.length > 0){
      var ordered = { name : vm.basket[0].name, price : vm.basket[0].price, count : vm.basket[0].count,
        imageLink : vm.basket[0].imageLink, itemId : vm.basket[0].itemId};
      order.foods.push(ordered);
      vm.basket.splice(0,1);
    }
    order.price = vm.basketPrice;
    order.buyerName = vm.buyerName;
    vm.basketPrice = 0;
    vm.buyerName = '';
    stateSharingService.orders.push(order);
    console.log(stateSharingService.orders.length);
  };
});
