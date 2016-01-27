var fs = require('fs');
var http = require('http');
var async = require('async');
var https = require('https');
var serviceRouter = require('./lib/ServiceRouter');

exports = module.exports = {};


var server;

exports.server = function() {
  return server;
}

exports.start = function(callbackWhenServerStarted) {
fs.readFile('conf/services.json', {encoding:'utf-8'}, function(error, data) {
	if(error) { console.log(error.message); return; }

	var jsonData = JSON.parse(data);
	async.each(jsonData, function(service, callback) {
    serviceRouter.addService(service);

    console.log("Registering " + service.endpoint.url + " to source " + service.source.url);

    callback()
	})


  fs.readFile('conf/server.json', {encoding:'utf-8'}, function(error, data) {
  	if(error) { console.log(error.message); return; }
  
    var serverConfig = JSON.parse(data)

    if(serverConfig.listen.https.enabled) {
      var options = {
        key: fs.readFileSync(serverConfig.authentication.ssl.server_key),
        cert: fs.readFileSync(serverConfig.authentication.ssl.server_certificate),
        requestCert: true,
        ca: [ fs.readFileSync(serverConfig.authentication.ssl.ca_certificate) ]
      };
  
      server = https.createServer(options, function(req, res) {
        serviceRouter.route(req, res)
      })

      var port = serverConfig.listen.https.port

      if(port === undefined)
        port = 8443;

      console.log("Running HTTPS on port " + port);
      server.listen(port);
    }
    else {
      server = http.createServer(function(req, res) {
        serviceRouter.route(req, res)
      });

      var port = serverConfig.listen.http.port

      if(port === undefined)
        port = 8000;

      console.log("Running HTTP on port " + port);
      server.listen(port);
      callbackWhenServerStarted();
    }
  })
});
}
