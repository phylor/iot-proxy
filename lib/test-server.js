var express = require('express');
var passport = require('passport');
var DigestStrategy = require('passport-http').DigestStrategy;
var BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new DigestStrategy(
  { qop: 'auth' },
  function(username, callback) {
    return callback(null, 'testuser', 'testpassword');
  },
  function(params, callback) {
    // validate nonces as necessary
    callback(null, true);
  }
));
passport.use(new BasicStrategy(
  function(username, password, done) {
    if(username === 'testuser' && password === 'testpassword')
      return done(null, 'testuser');
    else
      return done(null, false);
  }
));

exports.startTestServerOnPort = function(port) {
  var app = express();
  var router = express.Router();
  
  router.get('/', function(req, res) {
    res.json({ message: 'Test API' });
  });

  router.get('/testapis/weather', function(req, res) {
    res.json({ message: 'Weather API' });
  });
  router.get('/testapis/weather/zurich/forecast', function(req, res) {
    if(req.query.days === undefined)
      res.json({ message: 'Forecast for Zurich' });
    else
      res.json({ message: 'Forecast for Zurich, ' + req.query.days + ' days starting ' + req.query.start });
  });
  router.get('/testapis/post', function(req, res) {
    res.json({ message: 'Only POST allowed. Failed.' });
  });
  router.post('/testapis/post', function(req, res) {
    res.json({ message: 'POST request answer.' });
  });

  router.get('/testapis/auth/digest', 
    passport.authenticate('digest', { session: false }), 
    function(req, res) {
      res.json({ message: 'Digest authentication succeeded.' });
    }
  );
  router.get('/testapis/auth/basic', 
    passport.authenticate('basic', { session: false }), 
    function(req, res) {
      res.json({ message: 'Basic authentication succeeded.' });
    }
  );

  router.get('/testapis/auth/basic/cache/disabled', 
    passport.authenticate('basic', { session: false }), 
    function(req, res) {
      res.json({ message: 'Basic authentication, with cache disabled with timestamp ' + req.query.t });
    }
  );

  router.get('/testapis/cache/disabled', function(req, res) {
    res.json({ message: 'Cache disabled with timestamp ' + req.query.t });
  });
  
  app.use(passport.initialize());
  app.use('/', router);
  app.listen(port);
}
