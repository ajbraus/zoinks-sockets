var port = process.env.PORT;

module.exports = {
  port: port,
  db: process.env.MONGOLAB_URI,
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  email: "zoinksapp@gmail.com",
  emailpass: process.env.EMAIL_PASSWORD,
  defaultFromAddress: 'Zoinks App <zoinksapp@gmail.com>'
};