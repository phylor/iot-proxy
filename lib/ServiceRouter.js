var httpProxy = require('http-proxy');
var async = require('async');
var request = require('request');

exports = module.exports = {};

var services = []

exports.route = function(req, res) {
  try {
    var proxy = httpProxy.createProxyServer({})
  
    proxy.on('error', function(e) {
      console.log('Failed to proxy request: ' + e);
    });

    var proxyFound = false

    async.each(services, function(service, callback) {
      var routableUrl = req.url;
      console.log('Checking service ' + service.endpoint.url + ' against ' + routableUrl);
      if(routableUrl.startsWith(service.endpoint.url)) {
        var partialRequestUrl = routableUrl.slice(service.endpoint.url.length);
        var requestUrl = service.source.url + partialRequestUrl;

        if(service.source.authentication && service.source.authentication.digest) {
          var user = service.source.authentication.digest.username;
          var password = service.source.authentication.digest.password;
          var options = {
            uri: requestUrl,
            auth: {
              user: user,
              pass: password,
              sendImmediately: false
            }
          };
          request(options, function(error, response, body){
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(body);
            res.end();
          });
        }
        else {
          if(service.source.method)
            req.method = service.source.method;

          if(service.endpoint.disable_cache)
            requestUrl += '?t=' + new Date().getTime()

          req.url = requestUrl;

          proxy.web(req, res, { 
            target: req.url,
            prependPath: false,
            changeOrigin: true
          });
        }
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

exports.addService = function(service) {
  services.push(service);
}
