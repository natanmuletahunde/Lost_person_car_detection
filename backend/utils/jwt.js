const jwt = require('jsonwebtoken');
const config = require('../config');

const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

module.exports = {
  signToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
