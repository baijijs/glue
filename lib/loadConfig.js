'use strict';

const glob = require('glob');
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers');
const load = require('./load');

const DEFAULT_ENV = 'development';
const ENVIRONMENT_DIR = 'environments';
const DEFAULT_CONFIG_FILE = 'config.js';
const PATTERN = '**/*.js';
const LOGGER_DIR = '../logs';
const INITIALIZERS_DIR = 'initializers';

module.exports = function loadConfig(baseDir) {
  let env = {
    NODE_ENV: process.env.NODE_ENV || DEFAULT_ENV
  };

  let environmentDir = path.join(baseDir, ENVIRONMENT_DIR);

  let defaultConfig = require(path.join(baseDir, DEFAULT_CONFIG_FILE));
  // load environment.js config according to NODE_ENV
  let envConfig = require(path.join(environmentDir, env.NODE_ENV + '.js'));

  // add environment helper functions, such as: `isDevelopment()`
  let files = glob.sync(path.join(environmentDir, PATTERN));
  files.forEach(function(file) {
    let basename = helpers.basename(file);
    let envName = 'is_' + basename;
    envName = helpers.camelize(envName);
    env[envName] = function() {
      return basename === env.NODE_ENV;
    };
  });

  // add logger
  let loggerDir = path.join(baseDir, LOGGER_DIR);
  if (!fs.existsSync(loggerDir)) {
    fs.mkdirSync(loggerDir);
  }
  let logger = {
    access: fs.createWriteStream(path.join(loggerDir, [env.NODE_ENV, '_access', '.log'].join('')), { flags: 'a' }),
    error: fs.createWriteStream(path.join(loggerDir, [env.NODE_ENV, '_error', '.log'].join('')), { flags: 'a' })
  };

  let config = {};

  // load initializers
  let initializersDir = path.join(baseDir, INITIALIZERS_DIR);
  if (fs.existsSync(initializersDir)) {
    config.__loadedInitializers = load(initializersDir, '**/*.js');
  }

  config = Object.assign(config, defaultConfig);
  config = Object.assign(config, envConfig);
  config = Object.assign(config, { env, logger });

  return config;
};
