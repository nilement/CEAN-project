'use strict';

angular.module('menuApp').directive('menuItemDirective', function(){
    return {
        scope:{
            imageLink :'@',
            title : '@',
            count : '@',
            price : '@',
        },
        templateUrl: 'views/directives/menuItemDirective.html',
        link: function(scope, element, attributes){
            scope.imageLink = attributes.imagelink;
        }
    }
});
