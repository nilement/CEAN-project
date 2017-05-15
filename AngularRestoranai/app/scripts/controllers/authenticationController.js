'use strict'

angular.module('menuApp').controller('authenticationController', function($scope, $mdDialog, vcRecaptchaService, httpService){

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
//TODO: Handle recaptcha fail
  $scope.submitForm = function(){
    let recaptcha = { response : $scope.response };
    $scope.response = null;
    httpService.sendRecaptcha(recaptcha).then(
      function success(){
        $mdDialog.hide();
      }, function fail(){

        });
  };
//TODO: Handle authRequest fail
  $scope.submitAuth = function(){
      var data = { phoneNumber: $scope.phoneNumber, recaptcha: $scope.response};
      httpService.sendAuthentication(data).then(
          function success(response){
              console.log(response);
              $scope.changeState();
          });
  };

  $scope.submitCode = function(){
      httpService.sendCode($scope.phoneCode)
  };

  $scope.dataLog = function(){
    console.log('response is : ' + $scope.response);
    console.log('widget is: '+ $scope.widgetId);
  };

});
