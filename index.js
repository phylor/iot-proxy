var iotproxy = require('./iotproxy');

fs.readFile('conf/services.json', {encoding:'utf-8'}, function(error, data) {
	if(error) { console.log(error.message); return; }

	var servicesConfig = JSON.parse(data);

  fs.readFile('conf/server.json', {encoding:'utf-8'}, function(error, data) {
  	if(error) { console.log(error.message); return; }
  
    var serverConfig = JSON.parse(data);
    
    iotproxy.start(function() {}, serverConfig, servicesConfig);
  }
}
