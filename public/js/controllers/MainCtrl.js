'use strict';

/* MAIN Controller */

angular.module('zoinks')
  .controller('MainCtrl', ['$scope', '$rootScope', '$location', 'Zoink', '$auth', '$http', 'Invite', 'toastr',  function ($scope, $rootScope, $location, Zoink, $auth, $http, Invite, toastr) {
    // NEW ZOINK
    $scope.zoink = {};
    
    $scope.createZoink = function() {
      var zoink = new Zoink($scope.zoink)
      zoink.$save(function(zoink) {
        console.log('zoink id', zoink)
        $location.path('/zoinks/' + zoink._id)
        $('#new-zoink').modal('hide');
        $scope.zoinks = Zoink.query();

        toastr.success('Success', 'Zoink created');
      });
    }

    // LOGIN/REGISTER
    $scope.signupMode = false;
    $scope.user = {};

    // upon load, check if auth token there. 
    // If auth token there check if authentic and load current user from token into rootscope
    // Upon signup/login, load currentUser into rootscope 

    $scope.isAuthenticated = function() {
      if ($auth.isAuthenticated()) {
        $http.get('/api/me').then(
          function (response) { // SUCCESS
            if (!!response.data) {
              console.log(response.data)
              $scope.currentUser = response.data;  
              $scope.zoinks = Zoink.query();
              $scope.invites = Invite.query();
            } else {
              $auth.logout();
              $location.path('/');
            }
          }, 
          function (response) { // ERROR
            $auth.logout();
            $location.path('/');
          }
        );
      }
    };

    $scope.isAuthenticated();

    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
          $('#login-modal').modal('hide');
          $scope.isAuthenticated();
          $scope.user = {};
          toastr.success('');
        })
        .catch(function(response) {
          toastr.error(response.data.message);
        });
    };

    $scope.login = function() {
      $auth.login($scope.user)
        .then(function(response) {
          toastr.success("Logged in", 'Success');
          $auth.setToken(response.data.token);
          $('#login-modal').modal('hide');
          $scope.isAuthenticated();
          $scope.user = {};
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        });
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function (response) {
          $auth.setToken(response.data.token);
          toastr.success("Logged in with " + provider, 'Success');
          $('#login-modal').modal('hide');
          $scope.isAuthenticated();
          $location.path('/profile')
        })
        .catch(function(response) {
          console.log(response)
        });
    };

    $scope.logout = function() {
      $auth.logout()
        .then(function() {
          toastr.info('See you next time', 'Logged Out');
          $auth.logout();
          $scope.currentUser = null;
          $location.path('/')
        });
    };
  }]);
