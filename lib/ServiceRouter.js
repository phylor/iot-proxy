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

    async.each(services, function(service, asyncCallback) {
      var urlToRoute = req.url;

      if(urlToRoute === service.endpoint.url || urlToRoute.startsWith(service.endpoint.url + '/') || urlToRoute.startsWith(service.endpoint.url + '?')) {
        var partialRequestUrl = urlToRoute.slice(service.endpoint.url.length);
        var requestUrl = service.source.url + partialRequestUrl;

        if(service.source.disable_cache)
          requestUrl += '?t=' + new Date().getTime()

        req.url = requestUrl;

        if(service.source.method)
          req.method = service.source.method;

        if(service.source.authentication) {
          if(service.source.authentication.digest)
            requestWithDigest(requestUrl, res, service.source.authentication.digest.username, service.source.authentication.digest.password, req.method);
          else if(service.source.authentication.basic)
            requestWithBasic(requestUrl, res, service.source.authentication.basic.username, service.source.authentication.basic.password, req.method);
        }
        else {
          proxy.web(req, res, { 
            target: requestUrl,
            prependPath: false,
            changeOrigin: true
          });
        }

        proxyFound = true
      }

      asyncCallback()
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

function requestWithDigest(url, res, username, password, method) {
  requestWithAuthentication(url, res, username, password, true, method);
}

function requestWithBasic(url, res, username, password, method) {
  requestWithAuthentication(url, res, username, password, false, method);
}

function requestWithAuthentication(url, res, username, password, isDigest, method) {
  var options = {
    uri: url,
    method: method,
    auth: {
      user: username,
      pass: password,
      sendImmediately: !isDigest
    }
  };
  request(options, function(error, response, body){
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(body);
    res.end();
  });
}
