'use strict'

angular.module('menuApp').controller('historyController', function(httpService, stateShareService, $mdDialog){
  var vm = this;
  /*vm.history = [{date: '2017-04-15 15:33', orderId: '3345', price: 34.25, buyer: 'Matas', dishes:
    [{name:'Burokas', price:6.66, count:5, itemId: 12, imageLink: 'images/fish.png'},
      {name:'Kopustas', price:10.15, count:1, itemId: 5, imageLink: 'images/fish.png'}]},
    {date: '2017-12-12 16:45', orderId: '3', price: 105.25, buyer: 'Kulkovas', dishes:
      [{name:'Kiaušiniai', price:12.33, count:5, itemId: 10, imageLink: 'images/fish.png'}]}];
      */
  vm.history = [];

  vm.noOrdersFound = true;
  vm.buyerName = '';
  vm.historyRetrieved = stateShareService.historyRetrieved;

  vm.authPhoneNumber = '';
  vm.authPassword = '';

  vm.toggleOrder = function(index){
    for (var i = 0; i < vm.history.length; i++){
      if (i !== index){
        vm.history[i].expanded = false;
      }
      else{
        vm.history[i].expanded = !(vm.history[i].expanded);
      }
    }
  };

  vm.setRetrieved = function(){
    vm.historyRetrieved = !vm.historyRetrieved;
    stateShareService.historyRetrieved = vm.historyRetrieved;
  };

  vm.retrieveHistory = function(){
    vm.history = [];
    var authObj = { phoneNumber : vm.authPhoneNumber, password : vm.authPassword };
    httpService.retrieveHistory(authObj)
      .then(function (response){
        if (response.data.err){
          window.alert(response.data.err);
          return;
        }
        vm.history = response.data.orders;
        vm.setRetrieved();
        console.log(vm.history);
    });
  };

  vm.showPrompt = function() {
    $mdDialog.show({
        controller : 'passwordResetController',
        templateUrl : 'views/extra/passwordResetDialogView.html'
    });
  };

});
