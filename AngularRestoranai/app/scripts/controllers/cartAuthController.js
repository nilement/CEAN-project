'use strict'

angular.module('menuApp').controller('cartAuthController', function($scope, $mdDialog, $state, vcRecaptchaService, httpService, stateShareService){

  $scope.siteKey = "6LdCmh0UAAAAAOCCmuEpb8C0edrrl6kgl3x7MBJ0";

  $scope.phoneNumber = null;
  $scope.phoneCode = null;

  $scope.response = null;
  $scope.widgetId = null;

  $scope.showPhone = true;
  $scope.showCode = false;

  $scope.changeState = function(){
    $scope.showPhone = $scope.showCode;
    $scope.showCode = !$scope.showPhone;
  };


  $scope.closeDialog = function(){
    $mdDialog.hide();
  };

  $scope.setWidgetId = function(widgetId){
    $scope.widgetId = widgetId;
  };

  $scope.setResponse = function(response){
    $scope.response = response;
  };

  $scope.cbExpiration = function() {
    vcRecaptchaService.reload($scope.widgetId);
    $scope.response = null;
  };

  $scope.requestCode = function(){
      var data = { phoneNumber: $scope.phoneNumber, recaptcha: $scope.response};
      httpService.requestAuthentication(data).then(
          function (response){
              $scope.changeState();
          });
  };

  $scope.sendOrder = function(){
      var orderObj = { phoneCode : $scope.phoneCode, order : stateShareService.order, phoneNumber : $scope.phoneNumber };
      httpService.sendOrder(orderObj).then(
         function (response){
             if (response.data.phone && response.data.password) {
                 $mdDialog.hide();
                 stateShareService.phoneNumber = response.data.phone;
                 stateShareService.password = response.data.password;
                 $state.go('root.history');
             }
         });
  };

});
