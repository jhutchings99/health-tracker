// PULL IN PASSPORT
const passport = require("passport");

// PULL IN PASSPORT LOCAL STRATEGY
const LocalStrategy = require("passport-local");

// PULL IN USER MODEL
const { User } = require("./persist/model");

// PULL IN BCRYPT
const bcrypt = require("bcrypt");

// SET UP PASSPORT LOCAL STRATEGY
passport.use(new LocalStrategy(async (username, password, done) => {
    let user;
    try {
        user = await User.findOne({username: username});
        if (!user) {
            return done(null, false);
        }
        const verifiedPassword = await bcrypt.compare(password, user.password);
        if (!verifiedPassword) {
            return done(null, false);
        } else {
            return done(null, user);
        }
    } catch (err) {
        return done(err);
    }
}));

// SET UP AUTHENTICATION FUNCTION
const setUpAuth = function (app) {
    app.use(passport.initialize());
    app.use(passport.authenticate("session"));

    passport.serializeUser(function (user, callback) {
        callback(null, {id: user._id, username: user.username, password: user.password, admin: user.admin});
    });

    passport.deserializeUser(function (user, callback){
        return callback(null, user);
    });

    app.post("/session", passport.authenticate("local"), (req,res) => {
        res.status(201).json({message: "Successfully Authenticated", id: req.user.id});
    });

    app.get("/session", (req, res) => {
        if (!req.user) {
            res.status(401).json({message: "Unauthorized"});
            return
        }
        res.status(200).json({message: "Authorized", id: req.user.id, email: req.user.username, password: req.user.password});
    });

    app.delete('/logout', function(req, res){
        req.logout(function(err) {
          if (err) { return next(err); }
          res.redirect('/');
        });
    });
}

// Export authentication setup
module.exports = setUpAuth