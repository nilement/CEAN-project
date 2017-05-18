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
		            if (res.data.err){
		              return {errMsg: res.data.err.errorMsg};
		            }
		            else{
		              if (res.data.rows) {
                    if (res.data.rows.length == 0) {
                      return {errMsg: "Invalid request id!"};
                    }
                    else {
                      return res.data.rows[0];
                    }
                  }
		            }
		          },
		        function errorCallback(res){
		            return {errMsg : 'Cant get from backend ' + res.data};
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
              }
              else{
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
		            return (res);
                }, function errorCallback(err){
                  return ('error sending to node: ' +err.data);
                });
			    },

			sendRecaptcha : function(recaptchaResponse) {
                return $http({
                    url: this.backendAddress + '/api/recaptcha',
                    method: 'POST',
                    data: recaptchaResponse,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function successCallback(res) {
                    return res;
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
                }). then(function successCallback(res){
                   return res;
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
                });
            }
	};
});
