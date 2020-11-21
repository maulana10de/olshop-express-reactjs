const util = require('util');
const db = require('../database');

module.exports = {
  asyncQuery: util.promisify(db.query).bind(db),
};
