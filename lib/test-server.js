var express = require('express');

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
    res.json({ message: 'Forecast for Zurich' });
  });
  
  app.use('/', router);
  app.listen(port);
}
