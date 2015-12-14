/*
 * INTERCEPTORS
 */

'use strict';

var app = angular.module('myApp.interceptors', []);

app.factory('authInterceptor', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers['X-Parse-Application-Id'] = 'JrC7tEcVEZpJwPgGdEBmRokLG1vv1MAnfdJhkx9V';
      config.headers['X-Parse-REST-API-Key'] = 'NfRdeQRSOdVJAkLIM4BjAQ1ekZcpuZYbH0GF4SgQ';
      
      // ADD SESSION TOKEN TO REQUESTS
      if (localStorage.getItem('sessionToken')) {
        config.headers['X-Parse-Session-Token'] = localStorage.getItem('sessionToken')
      }
      
      return config;
    },
    response: function (response) {
      return response || $q.when(response);
    }
  };
})

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});