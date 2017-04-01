module.exports = function(difficulty) {
  
  function isValid(input) {
    var parts = input.split(':');
    
    if (parts[1] < difficulty) {
      return false;
    }
    
    return true;
  }
  
  return function(req, res, next) {
    var cash = req.headers['X-Hashcash'];
    if (!cash) return res.error('Not enough hashcash.  Please try again.');
    
    var valid = isValid(cash);
    if (!valid) return res.error('Insufficient difficulty.  Please try again.');
    
    return next();
    
  };
}