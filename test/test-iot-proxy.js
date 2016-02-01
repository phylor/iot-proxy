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
  });
});