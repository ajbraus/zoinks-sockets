var port = 1337;

module.exports = {
  port: port,
  db: 'mongodb://localhost/zoinks',
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  email: "zoinksapp@gmail.com",
  emailpass: process.env.EMAIL_PASSWORD,
  defaultFromAddress: 'Zoinks App <zoinksapp@gmail.com>'
};