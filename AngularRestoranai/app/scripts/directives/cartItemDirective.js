'use strict';

angular.module('menuApp').directive('cartItemDirective', function(){
    return {
        scope:{
            imageLink :'@',
            title : '@',
            count : '@',
            price : '@',
            removeFn : '&',
            addFn : '&',
            removeAllFn : '&'
        },
        templateUrl: 'views/directives/cartItemDirective.html',
        link: function(scope, element, attributes){
            scope.imageLink = attributes.imagelink;
            scope.parsePrice = function(){
                return parseFloat(parseFloat(scope.price)*scope.count).toFixed(2);
            }
        }
    }
});
