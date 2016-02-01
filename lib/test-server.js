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
    if(req.query.days === undefined)
      res.json({ message: 'Forecast for Zurich' });
    else
      res.json({ message: 'Forecast for Zurich, ' + req.query.days + ' days starting ' + req.query.start });
  });
  
  app.use('/', router);
  app.listen(port);
}
