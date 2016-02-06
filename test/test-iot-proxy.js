var chai = require('chai');
var expect = chai.expect;
var iotproxy = require("../iotproxy");
var async = require('async');
var testServer = require('../lib/test-server');
var should = chai.should();
var chaiHttp = require('chai-http');
chai.config.includeStack = true;
chai.use(chaiHttp);

var app = chai.request('http://localhost:8000');

var serverConfig = 
{
  "listen": {
    "http": {
      "enabled": true
    },
    "https": {
      "enabled": false
    }
  }
};

var servicesConfig = 
[
  {
    "endpoint": {
      "url": "/testserver"
    },
    "source": {
      "url": "http://localhost:4000/"
    }
  },
  {
    "endpoint": {
      "url": "/weather"
    },
    "source": {
      "url": "http://localhost:4000/testapis/weather"
    }
  },
  {
    "endpoint": {
      "url": "/webcam"
    },
    "source": {
      "url": "https://placehold.it/640x480?text=Webcam",
      "method": "GET"
    }
  },
  {
    "endpoint": {
      "url": "/post_request"
    },
    "source": {
      "url": "http://localhost:4000/testapis/post",
      "method": "POST"
    }
  },
  {
    "endpoint": {
      "url": "/proxied_post_request"
    },
    "source": {
      "url": "http://localhost:4000/testapis/post"
    }
  },
  {
    "endpoint": {
      "url": "/digest_auth_request"
    },
    "source": {
      "url": "http://localhost:4000/testapis/auth/digest",
      "authentication": {
        "digest": {
          "username": "testuser",
          "password": "testpassword"
        }
      }
    }
  },
  {
    "endpoint": {
      "url": "/basic_auth_request"
    },
    "source": {
      "url": "http://localhost:4000/testapis/auth/basic",
      "authentication": {
        "basic": {
          "username": "testuser",
          "password": "testpassword"
        }
      }
    }
  },
  {
    "endpoint": {
      "url": "/basic_auth_post_request"
    },
    "source": {
      "url": "http://localhost:4000/testapis/auth/basic",
      "authentication": {
        "basic": {
          "username": "testuser",
          "password": "testpassword"
        }
      }
    }
  },
  {
    "endpoint": {
      "url": "/basic_auth_forced_post_request"
    },
    "source": {
      "url": "http://localhost:4000/testapis/auth/basic",
      "authentication": {
        "basic": {
          "username": "testuser",
          "password": "testpassword"
        }
      },
      "method": "POST"
    }
  },
  {
    "endpoint": {
      "url": "/basic_auth_request_disable_cache"
    },
    "source": {
      "url": "http://localhost:4000/testapis/auth/basic/cache/disabled",
      "authentication": {
        "basic": {
          "username": "testuser",
          "password": "testpassword"
        }
      },
      "disable_cache": true
    }
  },
  {
    "endpoint": {
      "url": "/disable_cache"
    },
    "source": {
      "url": "http://localhost:4000/testapis/cache/disabled",
      "disable_cache": true
    }
  }
];

describe("iot-proxy", function() {
  before(function (done) {
    iotproxy.start(function() {
      testServer.startTestServerOnPort(4000);
      done();
    }, serverConfig, servicesConfig);
  });

  describe(".start()", function() {
    it("should start an HTTP server on default port", function(done) {
      app
        .get('/')
        .end(function(err, res) {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe(".route()", function() {
    it("should return a response for a valid service", function(done) {
      app
        .get('/weather')
        .end(function(err, res) {
          res.should.have.status(200);
          done();
        });
    });

    it('should be able to talk to the test server', function(done) {
      app.get('/testserver')
      .end(function(err, res) {
        res.should.have.status(200);
        expect(res.body.message).to.equal('Test API');
        done();
      });
    });

    it('should return a response for a concatinated GET request', function(done) {
      app
        .get('/weather/zurich/forecast')
        .end(function(err, res) {
          res.should.have.status(200);
          expect(res.body.message).to.equal('Forecast for Zurich');
          done();
        });
    });

    it('should return a response for a GET request having parameters', function(done) {
      app.get('/weather/zurich/forecast?days=5&start=today')
        .end(function(err, res) {
          res.should.have.status(200);
          expect(res.body.message).to.equal('Forecast for Zurich, 5 days starting today');
          done();
        });
    });

    it('should make a POST request if specified', function(done) {
      app.get('/post_request')
        .end(function(err, res) {
          res.should.have.status(200);
          expect(res.body.message).to.equal('POST request answer.');
          done();
        });
    });

    it('should make a POST request if a POST request is made to the proxy server', function(done) {
      app.post('/proxied_post_request')
        .end(function(err, res) {
          res.should.have.status(200);
          expect(res.body.message).to.equal('POST request answer.');
          done();
      });
    });

    it('should be able to make digest authentication requests', function(done) {
      app.get('/digest_auth_request')
        .end(function(err, res) {
          res.should.have.status(200);
          expect(res.body.message).to.equal('Digest authentication succeeded.');
          done();
        });
    });

    it('should be able to make basic authentication requests', function(done) {
      app.get('/basic_auth_request')
        .end(function(err, res) {
          res.should.have.status(200);
          expect(res.body.message).to.equal('Basic authentication with GET succeeded.');
          done();
        });
    });

    it('should be able to make basic authentication requests with proxied POST', function(done) {
      app.post('/basic_auth_post_request')
        .end(function(err, res) {
          res.should.have.status(200);
          expect(res.body.message).to.equal('Basic authentication with POST succeeded.');
          done();
        });
    });

    it('should be able to make basic authentication requests with configured POST', function(done) {
      app.get('/basic_auth_forced_post_request')
        .end(function(err, res) {
          res.should.have.status(200);
          expect(res.body.message).to.equal('Basic authentication with POST succeeded.');
          done();
        });
    });

    it('should make different requests when disable_cache is set', function(done) {
      app.get('/disable_cache')
        .end(function(err, res) {
          res.should.have.status(200);

          var firstResponse = res.body.message;

          app.get('/disable_cache')
            .end(function(err, res) {
              res.should.have.status(200);

              var secondResponse = res.body.message;

              expect(firstResponse).to.not.equal(secondResponse);
              done();
            });
        });
    });

    it('should make different requests when disable_cache is set, even with basic authentication', function(done) {
      app.get('/basic_auth_request_disable_cache')
        .end(function(err, res) {
          res.should.have.status(200);

          var firstResponse = res.body.message;

          app.get('/basic_auth_request_disable_cache')
            .end(function(err, res) {
              res.should.have.status(200);

              var secondResponse = res.body.message;

              expect(firstResponse).to.not.equal(secondResponse);
              done();
            });
        });
    });
  });
});
