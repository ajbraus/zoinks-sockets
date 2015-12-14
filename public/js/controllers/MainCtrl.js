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
      $http.get('/api/me').then(
        function (response) { // SUCCESS
          if (!!response.data) {
            console.log(response.data)
            $scope.currentUser = response.data;  
            $scope.zoinks = Zoink.query();
            $scope.invites = Invite.query();
            toastr.info("Successfully logged in", "Welcome Back" + $scope.currentUser.displayName)
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
    };

    $scope.isAuthenticated();

    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
          $('#login-modal').modal('hide');
          $scope.isAuthenticated();
          $scope.user = {};
          toastr.info('You have successfully created a new account and have been signed-in');
        })
        .catch(function(response) {
          toastr.error(response.data.message);
        });
    };

    $scope.login = function() {
      $auth.login($scope.user)
        .then(function(response) {
          toastr.success('You have successfully signed in');
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
          toastr.success('You have successfully signed in with ' + provider);
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
          toastr.info('You have been logged out');
          $auth.logout();
          $scope.currentUser = null;
          $location.path('/')
        });
    };
  }]);
