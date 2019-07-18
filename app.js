const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash'); //flash 메시지 관련
const passport = require('passport');   //passport 로그인 관련
const session = require('express-session'); //passport 로그인 관련
const dotenv = require('dotenv');

dotenv.config(); //LOAD CONFIG

/**
 * DATABASE
 */
const db = require('./models');

/**
 * DB authenticate()
 * You can use the .authenticate() function to test if the connection is OK:
 * 
 * If you want Sequelize to automatically create the table (or modify it as needed) 
 * according to your model definition, you can use the sync method.
 * 
 * Instead of calling sync() for every model, you can call sequelize.sync() which will automatically sync all models.
 */
db.sequelize.authenticate()
.then( () => {
    console.log('Connection has been established successfully.');
    return db.sequelize.sync();
})
.then( () => {
    console.log('DB Sync complete.');
})
.catch(err => {
    console.error('Unable to connect to the database:', err);
});

const admin = require('./routes/admin');
const accounts = require('./routes/accounts');
const home = require('./routes/home');
const products = require('./routes/products'); 
const cart = require('./routes/cart');
const checkout = require('./routes/checkout');
const profile = require('./routes/profile');

const app = express();
const port = process.env.PORT_NUMBER;

/**
 * VIEW 엔진 추가
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * Middle Ware Setting
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/uploads', express.static('uploads')); //업로드 path 추가
//          ↑이건 URL
//uploads란 url이 왔을 때 => uploads폴더에 있는걸 가리켜라는 의미입니다 :)

//static path 추가
//static으로 URL이 들어왔을 때 static 폴더에 있는 애를 정적 static으로 하겠다라는 의미입니다.
app.use('/static', express.static('static'));

app.use(session({   //session 관련 셋팅
    secret: 'cottory',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000 * 60 * 60 //지속시간 2시간
    }
}));

//passport 적용
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());   //플래시 메시지 관련

//로그인 정보:: 뷰에서만 변수로 셋팅, 전체 미들웨어는 router위에 두어야 에러가 나지 않습니다
app.use(function(req, res, next) {
    app.locals.isLogin = req.isAuthenticated();
    //app.locals.urlparameter = req.url; //현재 url 정보를 보내고 싶으면 주석을 해제하면 됩니다.
    app.locals.userData = req.user; //사용 정보를 보내고 싶으면 주석을 해제하면 됩니다.
    next();
});

/**
 * Routing
 */
app.use('/admin', admin);
app.use('/accounts', accounts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/checkout', checkout);
app.use('/profile', profile);
app.use('/', home);

app.listen(port, function() {
    console.log('express listening on port', port);
});