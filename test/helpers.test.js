var chai = require('chai');
var helpers = require('../lib/helpers');

var expect = chai.expect;

describe('helpers', function() {
  it('should have specific functions', function() {
    expect(helpers).to.respondTo('titleize');
    expect(helpers).to.respondTo('capitalize');
    expect(helpers).to.respondTo('camelize');
    expect(helpers).to.respondTo('basename');
  });

  describe('#titleize', function() {
    it('should be titleized', function() {
      expect(helpers.titleize('baiji-glue')).to.equal('baiji-Glue');
    });
  });

  describe('#capitalize', function() {
    it('should be capitalized', function() {
      expect(helpers.capitalize('baiji_glue')).to.equal('baiji_glue');
    });
  });

  describe('#camelize', function() {
    it('should be camelized', function() {
      expect(helpers.camelize('baiji_glue')).to.equal('baijiGlue');
    });
  });

  describe('#basename', function() {
    it('should get path\'s basename', function() {
      expect(helpers.basename('./my-path/file.js')).to.equal('file');
    });
  });
});
