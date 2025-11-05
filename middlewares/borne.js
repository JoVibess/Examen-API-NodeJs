module.exports = function detectBorne(req, res, next) {
    const userAgent = req.headers['user-agent']?.toLowerCase() || '';
  
    req.expiration = userAgent.includes('borne') ? '1h' : '30d';
  
    next();
  };