'use strict';

// Declare app level module which depends on filters, and services
angular.module('zoinks', ['zoinks.filters', 
                         'zoinks.services', 
                         'zoinks.directives', 
                         'zoinks.interceptors',
                         'ngResource',
                         'ngTouch', 
                         'btford.socket-io',
                         'ngSanitize', 
                         'ngRoute',
                         'satellizer',
                         'ui.bootstrap.datetimepicker', //https://github.com/dalelotts/angular-bootstrap-datetimepicker
                         'ng-uploadcare',
                         'ui.bootstrap',
                         'ngAnimate',
                         'toastr'
                         ])

    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
      $routeProvider.when('/', {
        templateUrl: 'templates/splash'
      });
      
      $routeProvider.when('/zoinks/:id', {
        templateUrl: 'templates/zoink-show',
        controller: 'ZoinkShowCtrl'
      });

      $routeProvider.when('/profile', {
        templateUrl: 'templates/profile',
        controller: 'ProfileCtrl'
      });

      $routeProvider.when('/settings', {
        templateUrl: 'templates/settings',
        controller: 'SettingsCtrl'
      });
      
      $routeProvider.when('/how-it-works', {
        templateUrl: 'templates/how-it-works'
        // controller: 'PriCtrl'
      });

      $routeProvider.otherwise({redirectTo: '/'});

      $locationProvider.html5Mode(true);
    }])
    
    .config(function($authProvider) {
      $authProvider.facebook({
        clientId: '1184762851540712'
      });
      $authProvider.google({
        clientId: '1018771082011-nrcc6ejmh0n2coh166fdmncch5dnhj9q.apps.googleusercontent.com'
      });

      // Facebook
      $authProvider.facebook({
        url: '/auth/facebook',
        authorizationEndpoint: 'https://www.facebook.com/v2.3/dialog/oauth',
        redirectUri: (window.location.origin || window.location.protocol + '//' + window.location.host) + '/',
        requiredUrlParams: ['display', 'scope'],
        scope: ['email'],
        scopeDelimiter: ',',
        display: 'popup',
        type: '2.0',
        popupOptions: { width: 580, height: 400 }
      });

      // Google
      $authProvider.google({
        url: '/auth/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display'],
        scope: ['profile', 'email'],
        scopePrefix: 'openid',
        scopeDelimiter: ' ',
        display: 'popup',
        type: '2.0',
        popupOptions: { width: 452, height: 633 }
      });
    });
