module.exports = function Hashcash (difficulty) {
  var crypto = require('sha3');
  
  function isValid (input) {
    console.log('is input valid?', input);

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
    console.log('incoming hashcash:', req.headers);
    
    var cash = req.headers['X-Hashcash'];
    if (!cash) return res.status(500).send('Not enough hashcash.  Please try again.');
    
    var valid = isValid(cash);
    if (!valid) return res.status(500).send('Insufficient difficulty.  Please try again.');
    
    return next();
    
  };
}