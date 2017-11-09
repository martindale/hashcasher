var rest = require('restler');
var express = require('express');
var Hashcash = require('../lib/hashcash');

var app = express();
var hashcash = new Hashcash(4);

//app.post('/messages', hashcash.middleware, function(req, res, next) {
app.post('/messages', function (req, res, next) {
  console.log('incoming hashcash:', req.headers);
  var self = this;
  var cash = req.headers['x-hashcash'];
  
  console.log('cash:', cash);
  
  if (!cash) return res.status(500).send('Not enough hashcash.  Please try again.');

  var valid = hashcash.validate(cash);
  
  console.log('validity:', valid);
  
  if (!valid) return res.status(500).send('Insufficient difficulty.  Please try again.');

  return next();
}, function(req, res, next) {
  console.log('[SERVER]', 'passed all checks!');
  res.send({
    status: "success"
  });
});

app.listen(3000, async function () {
  
  var data = {
    timestamp: new Date(),
    content: 'Hello, world!'
  };
  
  console.log('grinding...');
  var cash = await hashcash.mine(JSON.stringify(data));
  
  rest.post('http://localhost:3000/messages', {
    data: data,
    headers: {
      'x-hashcash': cash
    }
  }).on('complete', function (data) {
    console.log('response:', data);
  });
});
