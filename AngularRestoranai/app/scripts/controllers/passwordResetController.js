'use strict'

angular.module('menuApp').controller('passwordResetController', function($scope, $mdDialog, vcRecaptchaService, httpService, stateShareService){

    $scope.siteKey = "6LdCmh0UAAAAAOCCmuEpb8C0edrrl6kgl3x7MBJ0";

    $scope.phoneNumber = null;

    $scope.response = null;
    $scope.widgetId = null;


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
    $scope.requestReset = function(){
        var data = { phoneNumber: $scope.phoneNumber, recaptcha: $scope.response};
        httpService.resetPassword(data).then(
            function success(response){
                $scope.changeState();
            });
    };

});
