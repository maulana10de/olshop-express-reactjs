const jwt = require('jsonwebtoken');

module.exports = {
  readToken: (req, res, next) => {
    // console.log('token ===>', req.token);
    jwt.verify(req.token, 'luissaha', (err, decoded) => {
      if (err) {
        return res.status(401).send('User Not Authorization');
      }
      req.user = decoded;
      next();
    });
  },
};
