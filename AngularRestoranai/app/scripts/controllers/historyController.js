'use strict'

angular.module('menuApp').controller('historyController', function(httpService, stateShareService, $mdDialog){
  var vm = this;
  vm.history = stateShareService.history;
  vm.historyRetrieved = stateShareService.historyRetrieved;

  vm.authPhoneNumber = '';
  vm.authPassword = '';

  if (stateShareService.expandLatest){
      vm.history[0].expanded = true;
      stateShareService.expandLatest = false;
  }

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
    });
  };

  vm.showPrompt = function() {
    $mdDialog.show({
        controller : 'passwordResetController',
        templateUrl : 'views/extra/passwordResetDialogView.html'
    });
  };

});
