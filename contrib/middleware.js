var crypto = require('sha3');

module.exports = function Hashcash (difficulty) {
  
  function isValid (input) {
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
    
    if (bits < difficult) {
      return false;
    }
    
    return true;
  }
  
  return function HashcashMiddleware (req, res, next) {
    var cash = req.headers['X-Hashcash'];
    if (!cash) return res.error('Not enough hashcash.  Please try again.');
    
    var valid = isValid(cash);
    if (!valid) return res.error('Insufficient difficulty.  Please try again.');
    
    return next();
    
  };
}