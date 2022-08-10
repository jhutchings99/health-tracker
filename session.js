// PULL IN EXPRESS SESSION
const session = require("express-session");

// PULL IN CONFIG
const config = require("./config");

// SET UP EXPRESS SESSION
const setUpSession = function (app) {
  app.use(
    session({
      secret: config.authsecret,
      resave: false,
      saveUninitialized: false,
    })
  );
};

// EXPORT SETUPSESSION FUNCTION
module.exports = setUpSession;