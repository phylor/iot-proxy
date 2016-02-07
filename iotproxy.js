var http = require('http');
var async = require('async');
var https = require('https');
var serviceRouter = require('./lib/ServiceRouter');

exports = module.exports = {};

exports.start = function(callbackWhenServerStarted, serverConfig, servicesConfig) {
  async.each(servicesConfig, function(service, asyncCallback) {
    serviceRouter.addService(service);

    console.log("Registering " + service.endpoint.url + " to source " + service.source.url);

    asyncCallback();
	});

  if(serverConfig.listen.https.enabled)
    startSecureServerOnPort(serverConfig.listen.https.port);
  if(serverConfig.listen.http.enabled)
    startServerOnPort(serverConfig.listen.http.port);

  callbackWhenServerStarted();
}

function startSecureServerOnPort(port) {
  var options = {
    key: fs.readFileSync(serverConfig.authentication.ssl.server_key),
    cert: fs.readFileSync(serverConfig.authentication.ssl.server_certificate),
    requestCert: true,
    ca: [ fs.readFileSync(serverConfig.authentication.ssl.ca_certificate) ]
  };

  server = https.createServer(options, function(req, res) {
    serviceRouter.route(req, res)
  })

  if(port === undefined)
    port = 8443;

  console.log("Running HTTPS on port " + port);
  server.listen(port);
}

function startServerOnPort(port) {
  var server = http.createServer(function(req, res) {
    serviceRouter.route(req, res)
  });
  
  if(port === undefined)
    port = 8000;
  
  console.log("Running HTTP on port " + port);
  server.listen(port);
}
