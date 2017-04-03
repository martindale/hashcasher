var assert = require('assert');
var expect = require('chai').expect;
var request = require('supertest');
var Hashcash = require('../contrib/middleware.js');
var express = require('express');
var app = express();
var requireProof = Hashcash(2);

var cash = '2:0:sha3:20170402:foo=bar::wgdkv:345';
var bits = 2;
var input = 'foo=bar';

app.post('/some-endpoint', requireProof, function(req, res, next) {
  res.send({ status: 'success' });
});

describe('Middleware', function() {
  before(function(ready) {
    app.listen(ready);
  });

  it('should validate a correct proof of work', function(done) {
    request(app)
      .set('X-Hashcash', cash)
      .set('X-Hashcash-Bits', bits)
      .set('X-Hashcash-Input', input)
      .post('/some-endpoint')
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        done();
      });
  });
});