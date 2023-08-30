const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('./database');
const bcrypt = require('bcryptjs');

module.exports = ((passport) => {
    passport.use(new LocalStrategy((username, password, done) => {
        // Match Username
        let query = { username: username };
        User.findOne(query)
            .then((user) => {
                if (!user) {
                    return done(null, false, { message: 'No user found' });
                }

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Wrong password' });
                    }
                });
            })
            .catch((err) => { throw err; });

    }));

    // Grabbed from https://www.passportjs.org/concepts/authentication/sessions/
    passport.serializeUser(function (user, cb) {
        process.nextTick(function () {
            return cb(null, {
                id: user.id,
                username: user.username,
                picture: user.picture
            });
        });
    });

    passport.deserializeUser(function (user, cb) {
        process.nextTick(function () {
            return cb(null, user);
        });
    });
});
