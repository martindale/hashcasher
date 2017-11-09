module.exports = function Hashcash (difficulty) {
  var crypto = require('sha3');

  
  function isValid (input) {
    var difficulty = 2;
    var parts = input.split(':');
    var claim = parts[1];
    
    if (claim < difficulty) {
      return false;
    }
    
    var hash = new crypto.SHA3Hash();
    hash.update(input);
    var digest = hash.digest('hex');
    var match = digest.match(/^(0+)/);
    var bits = (match) ? match[0].length : 0;
    
    if (bits < difficulty) {
      return false;
    }
    
    return true;
  }
  
  return function HashcashMiddleware (req, res, next) {
    var cash = req.headers['x-hashcash'];
    var valid = isValid(cash);

    if (!cash) return res.status(402).send('Not enough hashcash.  Please try again.');
    if (!valid) return res.status(402).send('Insufficient difficulty.  Please try again.');

    return next();
  };
}
