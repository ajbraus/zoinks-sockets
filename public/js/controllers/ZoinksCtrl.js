'use strict';

/* ZOINKS Controllers */

angular.module('zoinks')
  .controller('ZoinkShowCtrl', ['$scope', '$routeParams', 'Zoink', 'socket', '$auth', 'Auth', function($scope, $routeParams, Zoink, socket, $auth, Auth) {
    if ($auth.isAuthenticated()) {
      var currentUser = Auth.currentUser()
    }

    Zoink.get({ id: $routeParams.id }, function(data) {
      $scope.zoink = data
      socket.emit('publish:joinRoom', $scope.zoink);

      $scope.rsvped = _.includes(_.pluck($scope.zoink.rsvps, '_id'), currentUser._id);
      $scope.invited = _.includes(_.pluck($scope.zoink.invites, '_id'), currentUser._id);
    });

    $scope.$on('socket:joinRoom', function (event, clientsCount) {
      $scope.clientsCount = clientsCount;
    })

    // INVITES

    // NEW INVITE
    $scope.toggleNewInvite = function() {
      $scope.newInvite = !$scope.newInvite;
    }

    $scope.invite = { zoinkId: $routeParams.id }
    $scope.addInvite = function() {
      socket.emit('publish:addInvite', $scope.invite)
      $scope.invite = { zoinkId: $routeParams.id }
      $scope.toggleNewInvite();
    }

    $scope.$on('socket:addInvite', function (event, invite) {
      // display error if already invited
      $scope.$apply(function() {
        $scope.zoink.invites.push(invite);
      });
    });

    // REMOVE INVITE
    $scope.rmInvite = function(invite) {
      var invite = { zoinkId: $routeParams.id, invite: invite }
      socket.emit('publish:rmInvite', invite)
    }

    $scope.$on('socket:rmInvite', function (event, invite) {
      $scope.$apply(function() {
        _.remove($scope.zoink.invites, function(el) {
          el._id == invite._id
        })
      });
    });

    
    // CHAT

    // ADD MESSAGE
    $scope.message = {zoinkId: $routeParams.id}
    $scope.addMessage = function() {
      socket.emit('publish:addMessage', $scope.message)
    }

    $scope.$on('socket:addMessage', function (event, message) {
      console.log('message added')
      // if (invite.zoinkId == $scope.zoink._id) {
        $scope.$apply(function() {
          $scope.zoink.messages.push(message);
          $scope.message.content = '';
        });
      // };
    });

    // REMOVE MESSAGE
    $scope.rmMessage = function(content) {
      var message = { zoinkId: $routeParams.id, content: content }
      socket.emit('publish:rmMessage', message)
    }

    $scope.$on('socket:rmMessage', function (event, message) {
      // if (invite.zoinkId == $scope.zoink._id) {
        $scope.$apply(function() {
          var index = $scope.zoink.messages.indexOf(message);
          $scope.zoink.messages.splice(index, 1);
        });
      // };
    });

    // RSVP

    // RSVP IN
    $scope.rsvp = function() {
      var rsvp = { zoinkId: $routeParams.id, user: currentUser };
      socket.emit('publish:addRsvp', rsvp);
    }

    $scope.$on('socket:addRsvp', function (event, user) {
      console.log('Rsvp Added')
      $scope.$apply(function() {
        // ADD TO RSVPS
        console.log(user)
        $scope.zoink.rsvps.push(user);

        // REMOVE FROM INVITES (if in invites)
        var index = $scope.zoink.invites.indexOf(user.email);
        if (index > -1) {
          $scope.zoink.invites.splice(index, 1);
        }
        
        $scope.rsvped = true;
        $scope.invited = false;
      });
    });

    // RSVP OUT
    $scope.unrsvp = function() {
      var rsvp = { zoinkId: $routeParams.id, user: currentUser }
      socket.emit('publish:rmRsvp', rsvp) 
    }

    $scope.$on('socket:rmRsvp', function (event, user) {
      console.log('Rsvp Removed')
      $scope.$apply(function() {
        // ADD BACK TO INVITES
        $scope.zoink.invites.push(user.email);

        // REMOVE FROM RSVPS
        var index = user._id.indexOf(_.pluck($scope.zoink.rsvps, '_id'));
        $scope.zoink.rsvps.splice(index, 1);

        $scope.rsvped = false;
        $scope.invited = true;
      });
    });
    
    // CARPOOLS

    $scope.joinCar = function(carpool) {
      // TODO
      // carpool.push(currenUser);
    }

    // CARPOOLS
    $scope.toggleNewCarpool = function() {
      $scope.newCarpool = !$scope.newCarpool;
    };
    $scope.addCarpool = function() {
      // carpool.driver = currentUser;
      $scope.zoink.carpools.unshift($scope.carpool)
      $scope.newCarpool = false;
      $scope.carpool = {};
    };

    // REQUIREMENTS NEW
    $scope.toggleNewRequirement = function() {
      $scope.newRequirement = !$scope.newRequirement;
    };

    $scope.addRequirement = function() {
      var req = { zoinkId: $routeParams.id, req: $scope.requirement };
      socket.emit('publish:addReq', req);
      $scope.requirement = [];
    };

    $scope.$on('socket:addReq', function (event, reqs) {
      $scope.$apply(function() {
        // UPDATE all the reqs
        $scope.zoink.reqs = reqs;
      });
    });

    // REQUIREMENTS DELETE
    $scope.removeRequirement = function(rmReq) {
      var req = { zoinkId: $routeParams.id, req: rmReq };
      socket.emit('publish:rmReq', req);
    };

    $scope.$on('socket:rmReq', function (event, reqs) {
      $scope.$apply(function() {
        // UPDATE all the reqs
        $scope.zoink.reqs = reqs;
      });
    });

    // REQUIREMENTS CLAIM
    $scope.claimRequirement = function(req) {
      var data = { zoinkId: $routeParams.id, req: req, user: currentUser };
      socket.emit('publish:clReq', data);
    };

    $scope.$on('socket:clReq', function (event, reqs) {
      $scope.$apply(function() {
        // UPDATE all the reqs
        $scope.zoink.reqs = reqs;
      });
    });

    // REQUIREMENTS UNCLAIM
    $scope.unclaimRequirement = function(req) {
      var data = { zoinkId: $routeParams.id, req: req, user: currentUser };
      socket.emit('publish:unclReq', data);
    };

    $scope.$on('socket:unclReq', function (event, reqs) {
      $scope.$apply(function() {
        // UPDATE all the reqs
        $scope.zoink.reqs = reqs;
      });
    });

    // TODOS
    $scope.toggleNewTodo = function() {
      $scope.newTodo = !$scope.newTodo;
    }

    // ADD TODO
    $scope.addTodo = function() {
      var todo = { zoinkId: $routeParams.id, todo: $scope.todo };
      socket.emit('publish:addTodo', todo);
      $scope.todo = [];
    };

    $scope.$on('socket:addTodo', function (event, todos) {
      $scope.$apply(function() {
        // UPDATE all the todos
        $scope.zoink.todos = todos;
      });
    });

    // DELETE TODO
    $scope.removeTodo = function(rmTodo) {
      var todo = { zoinkId: $routeParams.id, todo: rmTodo };
      socket.emit('publish:rmTodo', todo);
    };

    $scope.$on('socket:rmTodo', function (event, todos) {
      $scope.$apply(function() {
        // UPDATE all the todos
        $scope.zoink.todos = todos;
      });
    });
 
  }])

   ;