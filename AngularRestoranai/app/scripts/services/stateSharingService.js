'use strict'

angular.module('menuApp').factory('stateSharingService', function(){
  return {
    orders : [],
    orderPrice : 0
  };
});
