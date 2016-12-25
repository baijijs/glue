'use strict';

const path = require('path');
const winston = require('winston');

// Logger based on winston
module.exports = function createLogger(baseDir, nodeEnv) {
  let accessFile = path.join(baseDir, `${nodeEnv}_access.log`);
  let errorFile = path.join(baseDir, `${nodeEnv}_error.log`);
  let exceptionFile = path.join(baseDir, `${nodeEnv}_exception.log`);

  // Enable color when env is development
  let colorize = nodeEnv === 'development';

  // File options, default max size: 500mb
  let maxsize = 1024 * 1024 * 500;
  let zippedArchive = true;
  let maxFiles = 5;
  let tailable = true;

  let infoLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: 'debug',
        colorize
      }),
      new (winston.transports.File)({
        filename: accessFile,
        level: 'info',
        colorize,
        maxsize,
        zippedArchive,
        maxFiles,
        tailable
      })
    ],
    exitOnError: false
  });

  let errorLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: 'debug',
        colorize
      }),
      new (winston.transports.File)({
        filename: errorFile,
        level: 'error',
        colorize,
        maxsize,
        zippedArchive,
        maxFiles,
        tailable
      })
    ],

    exceptionHandlers: [
      new (winston.transports.Console)({
        level: 'debug',
        colorize
      }),
      new (winston.transports.File)({
        filename: exceptionFile,
        colorize,
        maxsize,
        zippedArchive,
        maxFiles,
        tailable
      })
    ],

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

  // For old apis, `access.write` and `error.write`
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
