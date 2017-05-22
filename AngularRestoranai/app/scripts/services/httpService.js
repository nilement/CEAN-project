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

			getUserOrders : function(name){
            return $http({
                    url: this.backendAddress + '/api/getUserOrders?name=' + name,
                    method: 'GET'
                    })
            .then(function successCallback(res){
              if (res.data.err){
                window.alert('Error! Database is offline.');
                return [];
              } else {
                            return res.data.rows;
              }
                        },
                        function errorCallback(res){
                                return {msg: 'Backend is not responding ' + res.data};
                    });
            },

			cancelOrder : function(orderID){
                return $http({
                    url: this.backendAddress + '/api/deleteOrder?id=' + orderID,
                    method: 'POST'
                  })
                        .then(function successCallback(res){
                            return res.data;
                            },
                        function errorCallback(res){
                            return {msg: 'Cant get from backend ' + res.data};
                        });
            },

			sendOrder : function(orderObj){
				return $http({
		          url: this.backendAddress + '/api/postOrder',
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
			sendAuthentication : function (authData){
			    return $http({
			        url: this.backendAddress + '/api/authentication',
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
            sendCode : function(orderObj){
			    return $http({
			        url: this.backendAddress + '/api/phoneCode',
                    method: 'POST',
                    data: orderObj,
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
