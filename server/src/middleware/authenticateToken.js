const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authorization = req.get('Authorization');
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Authentication is not configured.' });
  }

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    if (!payload || payload.id === undefined || payload.id === null) {
      return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
    req.user = { id: payload.id };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

module.exports = authenticateToken;
