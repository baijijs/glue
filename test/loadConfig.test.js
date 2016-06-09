var chai = require('chai');
var config = require('./sample_app/config');

var expect = chai.expect;

describe('loadConfig', function() {
  it('should have loggers', function() {
    expect(config.logger).to.have.property('access');
    expect(config.logger).to.have.property('error');
  });

  it('should have envs', function() {
    expect(config.env).to.have.property('NODE_ENV', 'development');
    expect(config.env).to.have.property('isDevelopment');
    expect(config.env).to.have.property('isProduction');
    expect(config.env).to.have.property('isTest');
  });

  it('should have config', function() {
    expect(config).to.have.property('sample', true);
  });

  it('shoule have loaded initializers', function() {
    expect(config).to.have.deep.property('__loadedInitializers.init');
  });
});
