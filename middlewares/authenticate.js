const jwt = require('jsonwebtoken');
const { User } = require('../models');

function raise403(res) {
  return res.status(403).json({ error: "JWT token required or invalid" });
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return raise403(res);
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_PRIVATE_TOKEN, async (err, payload) => {
    if (err) {
      return raise403(res);
    }
    try {
      const user = await User.findByPk(payload.userId);
      if (!user) {
        return raise403(res);
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Error in authenticate middleware:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}

module.exports = authenticate;
