'use strict';

var SHA3 = require('sha3');

function Hashcash (difficulty) {
  this.difficulty = difficulty;
}

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + (mm[1]?mm:'0'+mm[0]) + (dd[1]?dd:'0'+dd[0]); // padding
};

Hashcash.prototype.mine = function grind (input) {
  var date = (new Date()).yyyymmdd();
  var bits = 0;
  var rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  var difficulty = this.difficulty;

  for (var counter = 0; bits < difficulty; counter++) {
    var chunks = [
      '2', // Hashcash version number.  Note that this is 2, as opposed to 1.
      difficulty, // asserted number of bits that this cash matches
      'sha3', // ADDITION FOR VERSION 2: specify the hash function used
      date, // YYYYMMDD format.  specification doesn't indicate HHMMSS or lower?
      input, // Input format protocol change, recommend casting any input to hex.
      '', // empty "meta" field
      rand, // random seed
      counter // our randomized input, the nonce (actually sequential)
    ];
    var cash = chunks.join(':');
    var hash = SHA3.SHA3Hash().update(cash).digest('hex');

    var match = hash.match(/^(0+)/);
    bits = (match) ? match[0].length : 0;
  }
  
  return cash;
}

Hashcash.prototype.middleware = function handler (req, res, next) {
  console.log('incoming hashcash:', req.headers);
  var self = this;
  var cash = req.headers['x-hashcash'];
  
  console.log('cash:', cash);
  
  if (!cash) return res.status(500).send('Not enough hashcash.  Please try again.');

  var valid = self.validate(cash);
  
  console.log('validity:', valid);
  
  if (!valid) return res.status(500).send('Insufficient difficulty.  Please try again.');

  return next();
};

Hashcash.prototype.compute = function hash (input) {
  
}

Hashcash.prototype.validate = function check (input) {
  var difficulty = this.difficulty;
  var parts = input.split(':');
  var claim = parts[1];
  
  if (claim < difficulty) {
    return false;
  }
  
  var hash = SHA3.SHA3Hash().update(input).digest('hex');
  var match = hash.match(/^(0+)/);
  var bits = (match) ? match[0].length : 0;
  
  console.log('hashes to:', hash);
  console.log('matches:', match);
  console.log('bits:', bits);
  
  if (bits < difficulty) {
    return false;
  }
  
  return true;
};

module.exports = Hashcash;
