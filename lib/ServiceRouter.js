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
      var routableUrl = req.url;
      console.log('Checking service ' + service.endpoint.url + ' against ' + routableUrl);
      if(routableUrl.startsWith(service.endpoint.url)) {
        var partialRequestUrl = routableUrl.slice(service.endpoint.url.length);
        var requestUrl = service.source.url + partialRequestUrl;
      console.log('ROUTABLE ' + routableUrl + ' PARTIAL ' + partialRequestUrl + ' REQUEST ' + requestUrl);

        if(service.endpoint.disable_cache)
          requestUrl += '?t=' + new Date().getTime()

        req.url = requestUrl;
        proxy.web(req, res, { 
          target: requestUrl,
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
