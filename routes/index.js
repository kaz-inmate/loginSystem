const express = require('express');
const router = express.Router();
const {ifLegal} = require('../config/auth');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');



router.get('/', (req, res) => {
    res.render('register.hbs');
});


router.post('/', (req, res) => {
    const { username, email, password, password2 } = req.body;
    let errors = [];
  
    if (!username || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
     
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (errors.length > 0) {
      res.render('register', {errors});
    } else {
      User.findOne({ email: email })
      .then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('register', {errors});
        } else {
          const newUser = new User({
            username,
            email,
            password
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              
              newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});


//login route
router.get('/login', (req, res) => {
    res.render('login.hbs');
});


router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/home',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
  });

//home route
router.get('/home', ifLegal, (req, res) => {
    res.render('home.hbs', {username: req.user.username});
  });

    
// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });


  module.exports = router;