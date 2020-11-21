const jwt = require('jsonwebtoken');

module.exports = {
  createJWTToken: (payload) => {
    return jwt.sign(payload, 'luissaha', {
      expiresIn: '12h',
    });
  },
};
