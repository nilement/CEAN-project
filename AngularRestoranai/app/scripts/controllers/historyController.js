'use strict'

angular.module('menuApp').controller('historyController', function(httpService, $cookies){
  var vm = this;
  vm.history = [{date: '2017-04-15 15:33', orderId: '3345', price: 34.25, buyer: 'Matas', dishes:
    [{name:'Burokas', price:6.66, count:5, itemId: 12, imageLink: 'images/fish.png'},
      {name:'Kopustas', price:10.15, count:1, itemId: 5, imageLink: 'images/fish.png'}]},
    {date: '2017-12-12 16:45', orderId: '3', price: 105.25, buyer: 'Kulkovas', dishes:
      [{name:'Kiaušiniai', price:12.33, count:5, itemId: 10, imageLink: 'images/fish.png'}]}];

  vm.noOrdersFound = true;
  vm.buyerName = '';

  vm.toggleOrder = function(index){
    for (var i = 0; i < vm.history.length; i++){
      if (i !== index){
        vm.history[i].expanded = false;
      }
      else{
        vm.history[i].expanded = !(vm.history[i].expanded);
      }
    }
  }

  vm.getUserOrders = function(name){
    vm.noOrdersFound = false;
    vm.history = [];
    httpService.getUserOrders(name)
      .then(function success(response){
        if (response.msg){
          window.alert(response.msg);
          return;
        }
        response.forEach(function (n) {
          n.expanded = false;
          vm.history.push(n);
        });
        if (vm.history.length === 0){
          vm.noOrdersFound = true;
        }
      });
  };

  vm.cancelOrder = function(order){
    httpService.cancelOrder(order.id)
      .then(function success(res){
        if (res.err){
          window.alert(res.err);
        }
        else {
          vm.history.splice(vm.history.indexOf(order), 1);
          window.alert(res);
        }
      }, function error(res){
        window.alert(res);
      });
  };
});
