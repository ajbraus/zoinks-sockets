/*
 * SOCKETS BASE.JS
 */

var Zoink = require('../models/zoink.js')
var User = require('../models/user.js')
var config = require('../config') 
var _ = require('lodash')

'use strict';

module.exports = function (io, app) {  
  // io.set('forigins', '*localhost:1337');
  
  io.on('connection', function (socket){
    // console.log('user connected');
    
    // JOINING AND LEAVING ZOINK
    
    function getClientCount(roomName) {
      //GET ROOM USER COUNT SOCKET.IO >=1.3.5
      var room = io.sockets.adapter.rooms[roomName]; 
      if (room) {
        return Object.keys(room).length;  
      } else {
        return 0;
      }
    }
    
    // PUBLISH JOINING ROOM
    socket.on('publish:joinRoom', function (data) {
      // console.log('user joined room', data._id);
      socket.join(data._id);

      var clientsCount = getClientCount(data._id)
      
      io.sockets.in(data._id).emit('joinRoom', clientsCount)
    });

    // PUBLISH LEAVING ROOM
    socket.on('publish:leaveRoom', function (data) {
      console.log('user left room ', data._id);
      socket.leave(data._id);

      var clientsCount = getClientCount(data._id)

      io.sockets.in(data._id).emit('leaveRoom', clientsCount)
    });


    // INVITES
    socket.on('publish:addInvite', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        var invite = { displayName: data.displayName, email: data.email };

        User.findOne({ displayName: data.displayName }, function(err, user) {
          if (user) {
            invite.picture = user.picture;
          }

          zoink.invites.push(invite);
          zoink.save(function(err) {
            // SEND INVITE EMAIL
            app.mailer.send('emails/new-invite', {
              to: data.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.  
              subject: 'Zoinks! A New Invite', // REQUIRED. 
              zoink: zoink,  // All additional properties are also passed to the template as local variables. 
              userName: data.displayName
            }, function (err) {
              if (err) { console.log(err); return }
            });

            io.sockets.in(data.zoinkId).emit('addInvite', zoink.invites)
          });
        })
      })
    })

    socket.on('publish:rmInvite', function (data) {
      Zoink.findByIdAndUpdate(data.zoinkId, {
        $pull: {
          invites: {_id: data.invite._id}
        }
      }, function(err, zoink) {
        io.sockets.in(data.zoinkId).emit('rmInvite', zoink.invites)
      });
    })

    // RSVPS
    socket.on('publish:addRsvp', function (data) {
      var user = data.user;
      Zoink.findById(data.zoinkId, function(err, zoink) {
        // ADD RSVPED USER
        zoink.rsvps.push(user._id);

        // REMOVE INVITE (FILTER INVITE BY MATCHING EMAIL)
        zoink.invites = _.filter(zoink.invites, _.matches({ email: user.email }));

        zoink.save();

        io.sockets.in(data.zoinkId).emit('addRsvp', data.user);
      });
    });

    socket.on('publish:rmRsvp', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        // REMOVE RSVP
        var index = data.user._id.indexOf(zoink.rsvps);
        zoink.rsvps.splice(index, 1);

        // ADD NEW INVITE BASED ON RSVP
        var invite = {
          name: data.user.displayName,
          email: data.user.email,
          picture: data.user.picture
        }
        zoink.invites.push(invite);
        console.log(zoink)

        zoink.save();

        io.sockets.in(data.zoinkId).emit('rmRsvp', data.user);
      });
    });

    // MESSAGES
    socket.on('publish:addMessage', function (data) {
      console.log("new message", data)
      Zoink.findById(data.zoinkId, function(err, zoink) {
        zoink.messages.push(data);
        zoink.save();
        io.sockets.in(data.zoinkId).emit('addMessage', data)
      })
    })

    socket.on('publish:rmMessage', function (data) {
      var message = data.message
      Zoink.findByIdAndUpdate(data.zoinkId, {
        $pull: {
          messages: {_id: message._id}
        }
      }, function(err, zoink) {
        io.sockets.in(data.zoinkId).emit('rmMessage', message);
      });
    });

    // CARPOOLS
    socket.on('publish:addCar', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        zoink.carpools.push(data.car);

        zoink.save();

        io.sockets.in(data.zoinkId).emit('addCar', zoink.carpools);
      });
    });

    socket.on('publish:rmCar', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        var rmObj = zoink.carpools.id(data.car._id);
        rmObj.remove();
        zoink.save();

        io.sockets.in(data.zoinkId).emit('rmCar', zoink.carpools);
      });
    });

    socket.on('publish:rmCar', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        var rmObj = zoink.carpools.id(data.car._id);
        rmObj.remove();
        zoink.save();

        io.sockets.in(data.zoinkId).emit('rmCar', zoink.carpools);
      });
    });

    // REQS
    socket.on('publish:addReq', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        zoink.reqs.push({title: data.req});

        zoink.save();

        io.sockets.in(data.zoinkId).emit('addReq', zoink.reqs);
      });
    });

    socket.on('publish:rmReq', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        var rmObj = zoink.reqs.id(data.req._id);
        rmObj.remove();
        zoink.save();

        io.sockets.in(data.zoinkId).emit('rmReq', zoink.reqs);
      });
    });

    socket.on('publish:clReq', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
          var clObj = zoink.reqs.id(data.req._id);
          clObj.userName = data.user.displayName;
          clObj.userPic = data.user.picture;
          zoink.save();

          io.sockets.in(data.zoinkId).emit('clReq', zoink.reqs);
          
      });
    });

    socket.on('publish:unclReq', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
          var clObj = zoink.reqs.id(data.req._id);
          clObj.userName = undefined;
          clObj.userPic = undefined;
          zoink.save();

          io.sockets.in(data.zoinkId).emit('clReq', zoink.reqs);
      });
    });

    // TODOS
    socket.on('publish:addTodo', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        zoink.todos.push(data.todo);

        zoink.save();

        io.sockets.in(data.zoinkId).emit('addTodo', zoink.todos);
      });
    });

    socket.on('publish:rmTodo', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        var index = zoink.todos.indexOf(data.todo);
        zoink.todos.splice(index, 1);
        zoink.save();

        io.sockets.in(data.zoinkId).emit('rmTodo', zoink.todos);
      });
    });

    // PURCHASES
    socket.on('publish:addPur', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        zoink.purchases.push(data.purchase);

        zoink.save();

        io.sockets.in(data.zoinkId).emit('addPur', zoink.purchases);
      });
    });

    socket.on('publish:rmPur', function (data) {
      Zoink.findById(data.zoinkId, function(err, zoink) {
        var rmObj = zoink.purchases.id(data.purchase._id);
        rmObj.remove();
        zoink.save();

        io.sockets.in(data.zoinkId).emit('rmPur', zoink.purchases);
      });
    });

    // QUESTIONQUEUE

    socket.on('join.room', function (data) {
      io.sockets.in(data.zoinkId).emit('broadcast.join_room', data)
    });

    socket.on('publish:comment', function (data) {
      Zoink.findById(data.post_id, function (err, post) {
        var comment = new Comment({ body: data.body });
        post.comments.unshift(comment);
        post.save(function (err, post) {
          if(err) { 
            return io.sockets.in(data.zoinkId).emit('error', comment); 
          }
          return io.sockets.in(data.zoinkId).emit('broadcast.comment', post);
        })
      })
    });
    
    // PUBLISH POST
    socket.on('publish:post', function (data) {
      var post = new Zoink({
          body: data.body
        , room_name: data.room_name.toLowerCase()
      });
      post.save(function (err, post) {
        if (err) { 
          return io.sockets.in(data.zoinkId).emit('error', post); 
        }

        io.sockets.in(data.zoinkId).emit('broadcast.post', post);
      });
    });

    // VOTE UP
    socket.on('vote_up.post', function (data) {
      Zoink.findByIdAndUpdate(data.id, { $inc: { votes_count: 1 } } , function (err, post) {
        if (err) { 
          return io.sockets.in(data.zoinkId).emit('error', post); 
        }
        io.sockets.in(data.zoinkId).emit('broadcast.vote_up', post);
      });
    });

    socket.on('vote_down.post', function (data) {
      Zoink.findByIdAndUpdate(data.id, { $inc: { votes_count: -1 } } , function (err, post) {
        if (err) { 
          return io.sockets.in(data.zoinkId).emit('error', post); 
        }
        io.sockets.in(data.zoinkId).emit('broadcast.vote_down', post);
      });
    });

    socket.on('disconnect', function (data) {
      // console.log('user disconnected');
      io.sockets.in(data.zoinkId).emit('broadcast.user_disconnected', data)
    });
  });
}