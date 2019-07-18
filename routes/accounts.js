const express = require('express');
const router = express.Router();
const models = require('../models');
var csrf = require('csurf');  //csrf셋팅
var csrfProtection = csrf({ cookie: true });

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passwordHash = require('../libs/passwordHash');


passport.serializeUser(  (user, done) => {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(  (user, done) => {
    const result = user;
    result.password = "";
    console.log('deserializeUser');
    done(null, result);
});

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField : 'password',
    passReqToCallback : true
}, 
async ( req , username , password, done) => {

    // 조회
    const user = await models.User.findOne({
        where: {
            username,
            password : passwordHash(password),
        },
        // attributes: { exclude: ['password'] }
    });

    // 유저에서 조회되지 않을시
    if(!user){
        return done(null, false, { message: '일치하는 아이디 패스워드가 존재하지 않습니다.' });

    // 유저에서 조회 되면 세션등록쪽으로 데이터를 넘김
    }else{
        return done(null, user.dataValues );
    }
    
}
));

router.get('/', ( _ , res) => {
    res.send('account app');
});

router.get('/join', csrfProtection, ( req, res) => {
    res.render('accounts/join', { csrfToken: req.csrfToken() });
});

router.post('/join', async(req, res) => {
    try{

        await models.User.create(req.body);
        res.send('<script>alert("회원가입 성공");location.href="/accounts/login";</script>');

    }catch(e){
        console.log(e);
    }
});

router.get('/login', csrfProtection, (req, res) => {
    res.render('accounts/login', { flashMessage : req.flash().error, csrfToken: req.csrfToken() });
});

router.post('/login' , 
    passport.authenticate('local', { 
        failureRedirect: '/accounts/login', 
        failureFlash: true 
    }), 
    ( _ , res) => {
        res.send('<script>alert("로그인 성공");location.href="/";</script>');
    }
);

router.get('/success', (req, res) => {
    res.send(req.user);
});


router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/accounts/login');
});

module.exports = router;