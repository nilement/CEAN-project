'use strict'

angular.module('menuApp').directive('orderItemDirective', function(){
  return {
    scope:{
      imageLink :'@',
      title : '@',
      count : '@',
      price : '@',
    },
    templateUrl: 'views/directives/orderItemDirective.html',
    link: function(scope, element, attributes){
      scope.imageLink = attributes.imagelink;
      scope.parsePrice = function(){
        return parseFloat(parseFloat(scope.price)*scope.count).toFixed(2)
      }
    }
  }
});
