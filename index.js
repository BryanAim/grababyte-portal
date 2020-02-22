// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");

const expressSession = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

require('dotenv').config();

const authRouter = require('./auth')

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";

/**
 * Session Configuration
 */
const session = {
  secret: "LoxodontaElephasMammuthusPalaeoloxodonPrimelephas",
  cookie: {},
  resave: false,
  saveUninitialized: false
};

if (app.get('env') ==='production') {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true;
}

/**
 * Passport Configuration
 */
const strategy = new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL || "http://localhost:3000/callback"
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile);
  }
);

/**
 *  App Configuration ie configuring express to use Pug as the view template engine
 */
app.set("views",path.join(__dirname,"views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname,"public")));

app.use(expressSession(session));

// initialize Passport and modify the persistent login session using Passport
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// Storing and retrieving user data from the session
// support login sessions by serializing and deserializing user instances to and from the session
passport.serializeUser((user,done)=> {
  done(null, user);
});

passport.deserializeUser((user, done)=>{
  done(null, user);
});

// Creating custom middleware with Express
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// Router mounting
app.use("/", authRouter);



/**
 * Routes Definitions
 */
app.get('/', (req, res) => {
  res.render('index', {title: "Home"});
});
app.get('/user', (req, res) => {
  res.render('user', {title: "Profile", userProfile: {nickname: "Isale"}})
});


/**
 * Server Activation
 */
app.listen(port, ()=> {
  console.log(`Listening to requests on http://localhost:${port}`);
  
});