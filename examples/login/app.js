var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , CoinbaseStrategy = require('passport-coinbase').Strategy
  , logger = require('morgan')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , methodOverride = require('method-override')
  , session = require('express-session'); 

var COINBASE_CLIENT_ID = "--insert-coinbase-client-id-here--";
var COINBASE_CLIENT_SECRET = "--insert-coinbase-client-secret-here--";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Coinbase profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the CoinbaseStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken and refreshToken),
//   and invoke a callback with a user object.
passport.use(new CoinbaseStrategy({
    clientID: COINBASE_CLIENT_ID,
    clientSecret: COINBASE_CLIENT_SECRET,
      //remove these Sandbox URLs to switch to production
    authorizationURL: 'https://sandbox.coinbase.com/oauth/authorize',
    tokenURL: 'https://api.sandbox.coinbase.com/oauth/token',
    userProfileURL : 'https://api.sandbox.coinbase.com/v2/user',
    
    callbackURL: "--insert-callbackURL-here--",
    scope: ["wallet:user:read wallet:user:email"]
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Coinbase profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Coinbase account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




var app = express();

// configure Express
app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs');
app.use(logger('combined'));

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(session({ 
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true
  })
);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

//app.use(express.static(__dirname + '/public'));



app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/coinbase
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Coinbase authentication will involve redirecting
//   the user to coinbase.com.  After authorization, Coinbase will redirect the user
//   back to this application at /auth/coinbase/callback
app.get('/auth/coinbase',
  passport.authenticate('coinbase'),
  function(req, res){
    // The request will be redirected to Coinbase for authentication, so this
    // function will not be called.
  });

// GET /auth/coinbase/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/coinbase/callback', 
  passport.authenticate('coinbase', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(process.env.PORT, process.env.IP);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
