var chai = require('chai');
var config = require('./sample_app/config');
var winston = require('winston');

var expect = chai.expect;

describe('loadConfig', function() {
  describe('logger', function() {
    it('should have infoLogger as a winston custom logger', function() {
      expect(config.logger).to.have.property('infoLogger').to.be.instanceOf(winston.Logger);
    });

    it('should have errorLogger as a winston custom logger', function() {
      expect(config.logger).to.have.property('errorLogger').to.be.instanceOf(winston.Logger);
    });

    [
      'log',
      'warn',
      'info',
      'verbose',
      'debug',
      'silly',
      'error',
      'access.write',
      'error.write'
    ].forEach(function(methodName) {
      it('should have error.write method', function() {
        expect(config.logger).to.have.nested.property(methodName).to.be.a('function');
      });
    });
  });

  it('should have envs', function() {
    expect(config.env).to.have.property('NODE_ENV', 'development');
    expect(config.env).to.have.property('isDevelopment');
    expect(config.env).to.have.property('isProduction');
    expect(config.env).to.have.property('isTest');
  });

  it('should have config', function() {
    expect(config).to.have.property('sample', true);
    expect(config).to.have.nested.property('languages.en', 'English');
    expect(config).to.have.nested.property('languages.zh-CN', 'Chinese');
  });

  it('should have extra env config', function() {
    expect(config).to.have.nested.property('database.user', 'db_dev');
  });

  it('shoule have loaded initializers', function() {
    expect(config).to.have.nested.property('__loadedInitializers.init');
    expect(config).to.have.nested.property('functionalInitializerInvoked', true);
  });
});
