'use strict'

angular.module('menuApp').controller('authenticationController', function($scope, $mdDialog, vcRecaptchaService, httpService, stateShareService){

  $scope.siteKey = "6LdCmh0UAAAAAOCCmuEpb8C0edrrl6kgl3x7MBJ0";

  $scope.phoneNumber = null;
  $scope.phoneCode = null;
  $scope.buyerName = null;

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

//TODO: Handle authRequest fail
  $scope.requestCode = function(){
      console.log(stateShareService.order);
      var data = { phoneNumber: $scope.phoneNumber, recaptcha: $scope.response};
      httpService.sendAuthentication(data).then(
          function success(response){
              console.log(response);
              $scope.changeState();
          });
  };

  $scope.submitCode = function(){
      var orderObj = { phoneCode : $scope.phoneCode, order : stateShareService.order, buyerName : $scope.buyerName };
      httpService.sendCode(orderObj).then(
         function success(response){
             console.log(response);
         }
      )
  };

  $scope.dataLog = function(){
    console.log('response is : ' + $scope.response);
    console.log('widget is: '+ $scope.widgetId);
  };

});
