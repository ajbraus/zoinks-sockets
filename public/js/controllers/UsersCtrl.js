'use strict';

/* ZOINKS Controllers */

angular.module('zoinks')
  .controller('ProfileCtrl', ['$scope', '$http', 'Zoink', 'Invite', '$auth', 'Auth', function($scope, $http, Zoink, Invite, $auth, Auth) {
    $http.get('/api/me').then(function(data) {
      $scope.user = data.data;
    });
    $scope.zoinks = Zoink.query();
    $scope.invites = Invite.query();
  }])

  .controller('SettingsCtrl', ['$scope', '$http', '$location', 'Zoink', 'Invite', '$auth', 'Auth', function($scope, $http, $location, Zoink, Invite, $auth, Auth) {
    $http.get('/api/me').then(function(data) {
      $scope.user = data.data;
    });

    $scope.onUCUploadComplete = function (info) {
      $scope.user.picture = info.originalUrl;
    }

    $scope.updateUser = function() {
      console.log($scope.user)
      $http.put('/api/me', $scope.user).then(function(data) {
        console.log(data)
        // $location.path('/profile');
      });      
    }
  }]);