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

describe("iot-proxy", function() {
  before(function (done) {
    iotproxy.start(function() {
      testServer.startTestServerOnPort(4000);
      done();
    });
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
  });
});
