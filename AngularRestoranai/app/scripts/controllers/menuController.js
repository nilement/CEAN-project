'use strict'

angular.module('menuApp').controller('menuController', function(httpService, stateShareService){
    var vm = this;
    vm.menu = stateShareService.menu;

    vm.retrieveMenu = function(){
        httpService.retrieveMenu()
            .then(function (response){
                if (response.data.err){
                    window.alert(response.data.err);
                    return;
                }
                stateShareService.menu = response.data;
                vm.menu = response.data;
                stateShareService.menuRetrieved = true;
            });
    };
    if (!stateShareService.menuRetrieved) {
        vm.retrieveMenu();
    }

    vm.addDish = function(){

    }
});
