'use strict';
//TODO: Add fail handlers
angular.module('menuApp').factory('httpService', function($http){
	return {
			backendAddress : 'http://localhost:5000',
			getDish : function (dishId){
		        return $http({
		          url: this.backendAddress + '/api/getDish?dishId=' + dishId,
		          method: 'GET'
		        })
		        .then(function successCallback(res) {
                    return res.data;
                }, function failCallback(err) {
		            return err;
		          });
		    },
			retrieveHistory : function(name){
            return $http({
                    url: this.backendAddress + '/api/retrieveHistory?name=' + name,
                    method: 'GET'
                    })
            .then(function successCallback(res){
                    return res;
                }, function failCallback(err){
                    return err;
                });
            },
			sendOrder : function(orderObj){
				return $http({
		          url: this.backendAddress + '/api/sendOrder',
		          method: 'POST',
		          data : orderObj,
		          headers: {
		            'Content-Type': 'application/json'
	            }
		        }).then(function successCallback(res){
		            return res;
                }, function errorCallback(err){
                  return err;
                });
            },
			requestAuthentication : function (authData){
			    return $http({
			        url: this.backendAddress + '/api/requestAuthentication',
                    method: 'POST',
                    data: authData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function successCallback(res){
                   return res;
                }, function failCallback(err){
                    return err;
                });
            },
            resetPassword : function(requestObj){
                return $http({
                    url: this.backendAddress + '/api/resetPassword',
                    method: 'POST',
                    data: requestObj,
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }).then(function successCallback(res){
                    return res;
                }, function failCallback(err){
                   return err;
                });
            }
	};
});
