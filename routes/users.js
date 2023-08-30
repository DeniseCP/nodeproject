const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring User Schema
let User = require('../models/user');

// Register Form
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register User'
    });
});

// Register Process
router.post('/register', (req, resp) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('cpassword', 'Password does not match').equals(req.body.password);

    let errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        resp.render('register', {
            title: 'Register User',
            errors: errors
        });
    } else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (error, hash) => {
                if (error) {
                    console.log(error);
                } else {
                    newUser.password = hash;
                    newUser.save()
                        .then(() => {
                            req.flash('success', 'You are now resgistered and can log in');
                            resp.redirect('/users/login');
                        })
                        .catch((err) => {
                            console.log(err);
                            return;
                        });
                }
            });
        });

    }

});


// Login form
router.get('/login', (req, res) => {
    res.render('login');
});

// Login process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout;
    req.flash('success', 'You are logout');
    res.redirect('/users/login');
});
module.exports = router;
