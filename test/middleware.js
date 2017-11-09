var assert = require('assert');
var expect = require('chai').expect;
var request = require('supertest');

var Hashcash = require('../contrib/middleware.js');
var express = require('express');
var app = express();

var hashcasher = new Hashcash(2);
//var middleware = hashcasher.middleware;
var middleware = hashcasher;

var cash = '2:4:sha3:20171109:{"timestamp":"2017-11-09T20:52:00.047Z","content":"Hello, world!"}::dfjnr:75153';
var fake = '2:2:sha3:20171109:{"timestamp":"2017-11-09T20:52:00.047Z","content":"Hello, world!"}::dfjnr:75153';
var bits = 2;
var input = 'foo=bar';

app.post('/some-endpoint', middleware, function(req, res, next) {
  res.send({ status: 'success' });
});

describe('Middleware', function() {
  before(function(ready) {
    app.listen(ready);
  });

  it('should not validate an incorrect proof of work', function(done) {
    request(app)
      .post('/some-endpoint')
      .set('X-Hashcash', fake)
      .expect(402)
      .end(function(err, res) {
        if (err) throw err;
        done();
      });
  });

  it('should validate a correct proof of work', function(done) {
    request(app)
      .post('/some-endpoint')
      .set('X-Hashcash', cash)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        done();
      });
  });
});
