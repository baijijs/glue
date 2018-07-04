'use strict';

const chai = require('chai');
const path = require('path');
const autoload = require('../lib/autoload');

const expect = chai.expect;

describe('autoload', function() {
  it('should have all files in target dir as tree structure and parsed', function() {
    const result = autoload(path.resolve(__dirname, './sample_app/api'));

    expect(result).to.have.property('entities');
    expect(result).to.have.property('middlewares');
    expect(result).to.have.property('schemas').deep.eq({});
    expect(result).to.have.property('services').deep.eq({});

    expect(result).to.not.have.property('controllers');

    expect(result).to.have.nested.property('entities.v1');
    expect(result).to.have.nested.property('entities.v1.user');
    expect(result).to.have.nested.property('entities.v1.role');
    expect(result).to.have.nested.property('middlewares.authentication');

  });
});
