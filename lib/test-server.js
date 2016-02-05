var express = require('express');
var passport = require('passport');
var DigestStrategy = require('passport-http').DigestStrategy;

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
  
  app.use(passport.initialize());
  app.use('/', router);
  app.listen(port);
}
