'use strict';

const winston = require('winston');

// default max size: 100m
const DEFAULT_MAX_SIZE = 1024 * 1024 * 100;
const DEFAULT_MAX_FILES = 2;

// Logger based on winston
module.exports = function createLogger(baseDir, nodeEnv, options) {
  options = options || {};

  // Enable color when env is development
  let colorize = options.colorize == null ?
    nodeEnv === 'development' :
    !!options.colorize;
  let maxsize = options.maxsize || options.maxSize || DEFAULT_MAX_SIZE;
  let zippedArchive = options.zippedArchive == null ? true : !!options.zippedArchive;
  let tailable = options.tailable == null ? true : !!options.tailable;
  let maxFiles = options.maxFiles || DEFAULT_MAX_FILES;

  // build logger by type: access, error, exception
  const buildTransports = function(type) {
    let filename = `${nodeEnv}_${type}.log`;
    let dirname = baseDir;

    let level = null;
    if (type === 'access') level = 'info';
    if (type === 'error') level = 'error';

    return [
      // Console
      new (winston.transports.Console)({
        level: 'debug',
        colorize
      }),

      // File
      new (winston.transports.File)({
        filename,
        dirname,
        tailable,
        level,
        colorize,
        zippedArchive,
        maxsize,
        maxFiles
      })
    ];
  };

  // Info logger for collecting non error logs
  let infoLogger = new (winston.Logger)({
    transports: buildTransports('access'),
    exitOnError: false
  });

  // Error logger for collecting error logs
  let errorLogger = new (winston.Logger)({
    transports: buildTransports('error'),
    exceptionHandlers: buildTransports('exception'),
    exitOnError: false
  });

  let logger = {
    // loggers
    infoLogger,
    errorLogger,

    log(type) {
      if (type === 'error') {
        return errorLogger.log.apply(errorLogger, arguments);
      }
      return infoLogger.log.apply(infoLogger, arguments);
    },

    error() {
      return errorLogger.error.apply(errorLogger, arguments);
    }
  };

  // Pass through levels
  [
    'warn',
    'info',
    'verbose',
    'debug',
    'silly'
  ].forEach(level => {
    logger[level] = function() {
      return infoLogger[level].apply(infoLogger, arguments);
    };
  });

  // For older apis ans simplest stream support, `access.write` and `error.write`
  logger.error.write = function() {
    return errorLogger.error.apply(errorLogger, arguments);
  };
  logger.access = {
    write: function() {
      return infoLogger.info.apply(infoLogger, arguments);
    }
  };

  return logger;
};
