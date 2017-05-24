'use strict';

/**
 * @ngdoc overview
 * @name angularRestoranaiApp
 * @description
 * # angularRestoranaiApp
 *
 * Main module of the application.
 */
angular
  .module('menuApp', [
    'ngMaterial',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.router',
    'vcRecaptcha'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    $urlRouterProvider.otherwise('/cart');
    $stateProvider
      .state('root', {
        url: '',
        templateUrl: 'views/mainView.html',
        controller: 'mainController',
        controllerAs: 'vm',
        abstract: true
      })
      .state('root.cart', {
        url: '/cart',
        templateUrl: 'views/cartView.html',
        controller: 'cartController',
        controllerAs: 'vm'
      })
      .state('root.history', {
        url: '/history',
        templateUrl: 'views/historyView.html',
        controller: 'historyController',
        controllerAs: 'vm'
      })
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://localhost:5000/**'
    ]);
  });

