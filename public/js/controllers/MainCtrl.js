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
          $scope.isAuthenticated();
          $scope.user = {};
          toastr.success('')
          $location.path('/settings');
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
          $scope.isAuthenticated();
          $scope.user = {};
          $location.path('/profile')
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
          $scope.isAuthenticated();
          var user = $auth.getPayload()
          if(user.loginCount == 0) {
            $location.path('/settings')  
          } else {
            $location.path('/profile')
          }
        })
        .catch(function(response) {
          console.log(response)
        });
    };

    $scope.logout = function() {
      $auth.logout()
        .then(function() {
          $auth.logout();
          $scope.currentUser = null;
          toastr.info('See you next time', 'Logged Out');
          $location.path('/')
        });
    };
  }]);
