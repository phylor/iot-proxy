var fs = require('fs');
var http = require('http');
var httpProxy = require('http-proxy');
var async = require('async');
var https = require('https');

var services = []

fs.readFile('conf/services.json', {encoding:'utf-8'}, function(error, data) {
	if(error) { console.log(error.message); return; }

	var jsonData = JSON.parse(data);
	async.each(jsonData, function(service, callback) {
    services.push(service)

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
  
      var server = https.createServer(options, function(req, res) {
        route(req, res)
      })

      var port = serverConfig.listen.https.port

      if(port === undefined)
        port = 8443;

      console.log("Running HTTPS on port " + port);
      server.listen(port);
    }
    else {
      var server = http.createServer(function(req, res) {
        route(req, res)
      });

      var port = serverConfig.listen.http.port

      if(port === undefined)
        port = 8000;

      console.log("Running HTTP on port " + port);
      server.listen(port);
    }
  })
});

function route(req, res) {
  try {
    var proxy = httpProxy.createProxyServer({})
  
    proxy.on('error', function(e) {
      console.log('Failed to proxy request: ' + e);
    });

    var proxyFound = false

    async.each(services, function(service, callback) {
      console.log('Checking service ' + service.endpoint.url + ' against ' + req.url);
      if(service.endpoint.url === req.url) {

        if(service.endpoint.disable_cache)
          service.source.url += '?t=' + new Date().getTime()

        req.url = service.source.url
        proxy.web(req, res, { 
          target: service.source.url,
          prependPath: false,
          changeOrigin: true
        });
        proxyFound = true
      }

      callback()
    })

    proxy.close();

    if(!proxyFound) {
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.write('404')
      res.end()
    }
  }
  catch(err) {
    console.log(err);
  }
}
