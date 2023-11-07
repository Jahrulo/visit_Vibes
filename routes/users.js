const express = require('express');
const router = express.Router();
const passport = require('passport');
// require catchAsync if something goes wrong
const catchAsync = require('../utils/catchAsync');
const User = require('../Models/user');
const Users = require("../controllers/users");

// register route that renders the form or serves a form
router.get('/register', (Users.reenderRegister));

// register route logic from a POST method

router.post('/register', catchAsync(Users.register));

// logic route that serves the form
router.get('/login', (Users.loginPage));

// login route logic from a POST method
router.post('/login', 
    // passport middleware with a local strategy and some options if things gp wrong.
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    (Users.login));

// logout route middleware 
router.get('/logout', (Users.logout));

module.exports = router;