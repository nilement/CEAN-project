'use strict'

angular.module('menuApp').controller('ordersController', function(httpService, stateSharingService) {
  var vm = this;
  vm.orderPrice = stateSharingService.orderPrice;
  vm.orders = stateSharingService.orders;
  vm.selectedIndex = -1;

  vm.sendOrder = function(order){
    if (vm.orders.length == 0){
      window.alert('Cart is empty!');
      return;
    }
    var orderObj=angular.toJson({dishes: order.foods, buyer: order.buyerName});
    httpService.sendOrder(orderObj)
      .then(function success(res){
        if (res.data.err){
          window.alert("Can't find DB.");
        }
        else{
          var index = vm.orders.indexOf(order);
          vm.orders.splice(index,1);
          window.alert(res.data);
        }
      }, function error(res){
        window.alert(res);
      });
  };

  vm.sendSelectedOrder = function(){
    vm.sendOrder(vm.orders[vm.selectedIndex]);
  }

});
