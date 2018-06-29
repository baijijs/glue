'use strict';

const glob = require('glob');
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers');
const load = require('./load');
const createLogger = require('./logger');

const DEFAULT_ENV = 'development';
const ENVIRONMENT_DIR = 'environments';
const DEFAULT_CONFIG_FILE = 'config.{js,json}';
const EXTRA_CONFIG_FILES = '*.config.{js,json}';
const ENVIRONMENT_PATTERN = '**/*.{js,json}';
const LOGGER_DIR = '../logs';
const INITIALIZERS_DIR = 'initializers';

/**
 * Load config files by predefined pattern and orders:
 *
 * 1. Load `config.{js,json}`
 *
 * 2. Load `[extraConfig].config.{js,json}`
 *
 * 3. Load `[environment].{js,json}` file according to `process.env.NODE_ENV`, default
 *    is `development`, such as: environments/development.js
 *
 * 4. Generate environment related method according to file names under `environments`
 *    folder, such as:
 *    ├── environments
 *    ...├── development.js
 *    ...├── production.js
 *    ...└── test.js
 *    method `isDevelopment`, `isProduction`, `isTest` will be generated according
 *    to above folder structure
 *
 * 5. Add logger folder and related files
 *    ├── logs
 *    ...├── [environment]_access.js => development_access.log
 *    ...└── [environment]_error.js => development_error.log
 *
 * 6. Combine above configs by following structure:
 *    {
 *       env: {
 *          NODE_ENV: 'development',
 *          isDevelopment() {},
 *          isProduction() {},
 *          isTest() {},
 *       },
 *       logger: {}
 *          error() {},
 *          warning() {},
 *          info() {},
 *          verbose() {},
 *          debug() {},
 *          silly() {},
 *          infoLogger: winston.Logger instance...,
 *          errorLogger: winston.Logger instance...
 *       },
 *       ... other configs from environment related config file and default config file
 *    }
 *
 * 7. Load initializer files under `initializers` folder and invoke functional
 *    initializers with `config` as parameter
 *
 * 8. Return combined config
 */
module.exports = function loadConfig(baseDir) {
  let env = {
    NODE_ENV: (process.env.NODE_ENV || DEFAULT_ENV).trim()
  };

  // Load default `config.{js,json}`
  let defaultConfig = {};
  glob.sync(path.join(baseDir, DEFAULT_CONFIG_FILE)).forEach(function(file) {
    defaultConfig = Object.assign(defaultConfig, require(file));
  });

  // Load `[extraConfig].config.{js,json}`
  let extraConfig = {};
  glob.sync(path.join(baseDir, EXTRA_CONFIG_FILES)).forEach(function(file) {
    extraConfig = Object.assign(extraConfig, require(file));
  });

  // Load [environment].js config according to NODE_ENV
  let environmentDir = path.join(baseDir, ENVIRONMENT_DIR);
  let envConfig = require(path.join(environmentDir, env.NODE_ENV + '.js'));

  // Add environment helper functions, such as: `isDevelopment()`
  let files = glob.sync(path.join(environmentDir, ENVIRONMENT_PATTERN));
  files.forEach(function(file) {
    let basename = helpers.basename(file);
    let envName = 'is_' + basename;
    envName = helpers.camelize(envName);
    env[envName] = function() {
      return basename === env.NODE_ENV;
    };
  });

  // Add logger folder and related files
  let loggerDir = path.join(baseDir, LOGGER_DIR);
  if (!fs.existsSync(loggerDir)) {
    fs.mkdirSync(loggerDir);
  }

  // Merge and overwrite default config with environment config
  let config = Object.assign(
    {},
    defaultConfig,
    extraConfig,
    envConfig
  );

  // Create logger according env and config
  let logger = createLogger(loggerDir, env.NODE_ENV, config.loggerOptions || {});

  // Add `env` and `logger` into config
  config = Object.assign(config, { env, logger });

  // Load initializers
  let initializersDir = path.join(baseDir, INITIALIZERS_DIR);
  if (fs.existsSync(initializersDir)) {
    const initializers = load(initializersDir, '**/*.js');
    config.__loadedInitializers = initializers;

    // Loop all initializers and invoke functional initialzers
    for (let name in initializers) {
      let initializer = initializers[name];
      if (typeof initializer === 'function') {
        initializer(config);
      }
    }
  }

  return config;
};
