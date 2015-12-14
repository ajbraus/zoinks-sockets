/*
 * INTERCEPTORS
 */

'use strict';

var app = angular.module('zoinks.interceptors', []);

app.factory('authInterceptor', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
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