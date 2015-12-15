
var User = require('../models/user.js')
  , qs = require('querystring')
  , jwt = require('jwt-simple')
  , request = require('request')
  , config = require('../config.js')
  , moment = require('moment')
  , auth = require('./auth')
  , Zoink = require('../models/zoink.js')

module.exports = function(app) {

  app.get('/api/me', auth.ensureAuthenticated, function(req, res) {
    User.findById(req.userId, function(err, user) {
      console.log(user)
      res.send(user);
    });
  });

  app.put('/api/me', auth.ensureAuthenticated, function(req, res) {
    User.update(req.userId, req.body, function(err, user) {
      if (!user) {
        return res.status(400).send({ message: 'User not found' });
      } else if (err) {
        return res.status(400).send({ message: err });
      } else {
        return res.send({ token: auth.createJWT(user) });
      }
    });
  });

  app.post('/auth/login', function(req, res) {
    User.findOne({ email: req.body.email }, '+password', function(err, user) {
      if (!user) {
        return res.status(401).send({ message: 'Wrong email or password' });
      }
      user.comparePassword(req.body.password, function(err, isMatch) {
        console.log(isMatch)
        if (!isMatch) {
          return res.status(401).send({ message: 'Wrong email or password' });
        }
        res.send({ token: auth.createJWT(user) });
      });
    });
  });

  app.post('/auth/signup', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        return res.status(409).send({ message: 'Email is already taken' });
      }
      var user = new User({
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.displayName,
        picture: "http://placehold.it/50x50"
      });
      user.save(function(err) {
        if (err) { return res.status(400).send({err: err}) }

        // SEND WELCOME EMAIL
        app.mailer.send('emails/welcome', {
          to: user.email,
          subject: 'Welcome to Zoinks!'
        }, function (err) {
          if (err) { console.log(err); return }
        });

        res.send({ token: auth.createJWT(user) });
      });
    });
  });


  // look up user by fb id
    // if there authenticate
    // if not there, look up by email
    // if there, add fb id and authenticate
    // if not there, create user

  app.post('/auth/facebook', function(req, res) {
    var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.3/me?fields=id,email,first_name,gender,last_name,link,name';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.FACEBOOK_SECRET,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: accessToken.error.message });
      }

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
        if (response.statusCode !== 200) {
          return res.status(500).send({ message: profile.error.message });
        }
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = auth.createJWT(existingUser);
            return res.send({ token: token });
          } else {
            User.findOne({ email: profile.email }, function(err, existingUser) {
              if (existingUser) {
                existingUser.facebook = profile.id
                existingUser.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';

                existingUser.save(function(err, user) {
                  var token = auth.createJWT(existingUser);
                  return res.send({ token: token });                  
                })
              } else {
                var user = new User();
                user.facebook = profile.id;
                user.email = profile.email;
                user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
                user.displayName = profile.first_name + profile.last_name;
                user.first = profile.first_name;
                user.last = profile.last_name;
                user.save(function (err) {
                  if (err) { return res.status(400).send({ message: "there was an err: " + err})}
                  var token = auth.createJWT(user);
                  res.send({ token: token });
                });
              }
            })
          }  
        });
      });
    });
  });

  app.post('/auth/google', function(req, res) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.GOOGLE_SECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
      var accessToken = token.access_token;
      var headers = { Authorization: 'Bearer ' + accessToken };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
        if (profile.error) {
          return res.status(500).send({message: profile.error.message});
        }

        // Step 3a. Link user accounts.
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            var token = auth.createJWT(existingUser);
            return res.send({ token: token });                  
          } else {
            User.findOne({ email: profile.email }, function(err, existingUser) {
              if (existingUser) {
                existingUser.google = profile.sub
                existingUser.picture = profile.picture.replace('sz=50', 'sz=200');

                existingUser.save(function(err, user) {
                  var token = auth.createJWT(existingUser);
                  return res.send({ token: token });                  
                })
              } else {
                var user = new User();
                user.google = profile.sub;
                user.first = profile.given_name;
                user.last = profile.family_name;
                user.picture = profile.picture.replace('sz=50', 'sz=200');
                user.displayName = profile.name;
                user.email = profile.email;
                user.save(function (err) {
                  console.log('err:', err);
                  var token = auth.createJWT(user);
                  res.send({ token: token });
                });
              }
            });
          }
        })
      });
    });
  });
}