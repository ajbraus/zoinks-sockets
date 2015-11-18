var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    Schema = mongoose.Schema;

// GETTER
function toLower (v) {
  return v.toLowerCase();
}

var UserSchema = new Schema({
    created_at    : { type: Date }
  , updated_at    : { type: Date }
  , first         : { type: String, trim: true }
  , last          : { type: String, trim: true }
  , notifications : { type: Number, default: 2 }
  , phone         : { type: String, trim: true }
  , picture       : { type: String, required: true }
  , displayName   : { type: String, required: true, unique: true, trim: true, set: toLower }
  , email         : { type: String, required: true, unique: true, trim: true, set: toLower }
  , password      : { type: String, select: false }
  , facebook      : { type: String, select: false }
  , google        : { type: String, select: false }
})

UserSchema.virtual('fullname').get(function() {
  return this.first + ' ' + this.last;
});

UserSchema.pre('save', function(next){
  // SET CREATED_AT AND UPDATED_AT
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }

  // ENCRYPT PASSWORD
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});


UserSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

UserSchema.statics.findUniqueUsername = function(displayName, suffix, callback) {
  var _this = this;
  var possibleUsername = displayName + (suffix || '');

  _this.findOne(
    {displayName: possibleUsername},
    function(err, user) {
      if (!err) {
        if (!user) {
          callback(possibleUsername);
        }
        else {
          return _this.findUniqueUsername(displayName, (suffix || 0) + 1, callback);
        }
      }
      else {
        callback(null);
      }
    }
  );
};

// SETTER
// function obfuscate (cc) {
//   return '****-****-****-' + cc.slice(cc.length-4, cc.length);
// }

// var AccountSchema = new Schema({
//   creditCardNumber: { type: String, get: obfuscate }
// });

var User = mongoose.model('User', UserSchema);

module.exports = User;