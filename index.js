var fs = require('fs');
var http = require('http');
var httpProxy = require('http-proxy');
var async = require('async');
var https = require('https');

var services = []

fs.readFile('services.json', {encoding:'utf-8'}, function(error, data) {
	if(error) { console.log(error.message); return; }

	var jsonData = JSON.parse(data);
	async.each(jsonData, function(service, callback) {
    services.push(service)

    callback()
	})


  fs.readFile('server.json', {encoding:'utf-8'}, function(error, data) {
  	if(error) { console.log(error.message); return; }
  
    var serverConfig = JSON.parse(data)

    if(serverConfig.listen.https.enabled) {
      var options = {
        key: fs.readFileSync(serverConfig.authentication.ssl.server_key),
        cert: fs.readFileSync(serverConfig.authentication.ssl.server_certificate),
        requestCert: true,
        ca: [ fs.readFileSync(serverConfig.authentication.ssl.ca_certificate) ]
      };
  
      var server = https.createServer(options, function(req, res) {
        route(req, res)
      })

      var port = serverConfig.listen.https.port

      server.listen(port);
    }
    else {
      var server = http.createServer(function(req, res) {
        route(req, res)
      });

      var port = serverConfig.listen.http.port

      server.listen(port);
    }
  })
});

function route(req, res) {
    var proxy = httpProxy.createProxyServer({})
  
    var proxyFound = false

    async.each(services, function(service, callback) {
      if(service.endpoint === req.url) {

        if(service.endpoint.disable_cache)
          service.source.url += '?t=' + new Date().getTime()

        req.url = service.source.url
        proxy.web(req, res, { target: service.source.url, forward: service.source.url, prependPath: false });
        proxyFound = true
      }

      callback()
    })

    if(!proxyFound) {
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.write('404')
      res.end()
    }
}
