/*
 * ZOINK MODEL
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
    content     : { type: String, required: true }
  , displayName : { type: String, required: true }
  , picture     : { type: String, required: true }
  , createdAt   : { type: Date }
});

var RequirementSchema = new Schema({
    title         : { type: String, required: true }
  , userName    : String
  , userPic     : String
});

var InviteSchema = new Schema({
    displayName : String
  , email       : { type: String, select: false }
  , picture     : String
  , createdAt   : Date
});

var ZoinkSchema = new Schema({
    user        : { type : Schema.Types.ObjectId, ref : 'User' }
  , slug        : { type: String, default: '', trim: true, unique: true }
  , createdAt   : Date
  , updatedAt   : Date
  , location    : String
  , startsAt    : Date
  , endsAt      : Date
  , inviteOnly  : { type: Boolean, default: false }
  , title       : { type: String, required: true, trim: true }
  , desc        : String
  , invites     : [InviteSchema]
  , rsvps       : [{ type : Schema.Types.ObjectId, ref : 'User' }]
  , todos       : []
  , messages    : [MessageSchema]
  , purchases   : []
  , carpools    : []
  , reqs        : [RequirementSchema]
});

MessageSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  now = new Date();
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

InviteSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  now = new Date();
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

ZoinkSchema.pre('save', function(next){
  // SET slug
  var slug = (this.title + this.location).replace(/\s+/g, '-').toLowerCase();
  Zoink.find({ slug: slug}).exec(function(zoinks) {
    if (zoinks) {
      slug = slug + "-" + zoinks.length
    }
    this.slug = slug
  })

  // SET createdAt AND updatedAt
  now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

var Zoink = mongoose.model('Zoink', ZoinkSchema);

module.exports = Zoink;