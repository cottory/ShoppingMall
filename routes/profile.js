const express = require('express');
const router = express.Router();
const models = require('../models');
const passwordHash = require('../libs/passwordHash');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const passport = require('passport');

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user,done) {
    done(null, user);
});

router.get('/', csrfProtection, (req,res) => {
    res.render('profile/index', { user : req.user, csrfToken: req.csrfToken() });
});
  
router.get('/edit', csrfProtection, (req,res) => {
    res.render('profile/form', { user: req.user, csrfToken: req.csrfToken() });
});
  
router.post('/edit', csrfProtection, async(req,res) => {
    
    try {

      if (!req.body.displayname) {
        req.body.displayname = req.uyser.displayname;
      } 

      if (req.body.password) {
        req.body.password = passwordHash(req.body.password);
      } else {
        req.body.password = req.user.password;  
      }
      
      await models.User.update(
          req.body, 
          { 
              where: { id: req.user.id }
          }
      )

      var user = await models.User.findOne({
          where : { id: req.user.id }
      })
    
      req.login(user, () => {
        res.redirect('/profile');
      });
  
    } catch(e) {
        throw(e);
    }
  
});
  
module.exports = router;
