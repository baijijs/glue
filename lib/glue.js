'use strict';

const loadConfig = require('./config');
const load = require('./load');
const autoload = require('./autoload');

module.exports = loadConfig;
module.exports.load = load;
module.exports.autoload = autoload;
