var expect = require("chai").expect;
var request = require("supertest");
var iotproxy = require("../iotproxy");
var async = require('async');

var app = request('http://localhost:8000');

describe("iot-proxy", function() {
  before(function (done) {
    iotproxy.start(function() {
      done();
    });
  });

  describe(".start()", function() {
    it("should start an HTTP server on default port", function(done) {
      app
        .get('/')
        .expect('Content-Type', /text/)
        .expect('404')
        .expect(404, done)
    });
  });

  describe(".route()", function() {
    it("should return a response for a valid service", function(done) {
      app
        .get('/weather')
        .expect(200, done);
    });
  });
});
