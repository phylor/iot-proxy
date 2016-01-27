var httpProxy = require('http-proxy');
var async = require('async');

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

exports.addService = function(service) {
  services.push(service);
}
