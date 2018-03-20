var chai = require('chai');
var path = require('path');
var load = require('../lib/load');

var expect = chai.expect;

describe('load', function() {
  it('should have all files in target dir as tree structure and required', function() {
    var result = load(path.resolve(__dirname, './sample_app/api'), '**/*.js');

    expect(result).to.have.property('controllers');
    expect(result).to.have.property('entities');
    expect(result).to.have.property('middlewares');
    expect(result).to.have.nested.property('controllers.v1');
    expect(result).to.have.nested.property('controllers.v1.users_api');
    expect(result).to.have.nested.property('controllers.v1.roles_api');
    expect(result).to.have.nested.property('entities.v1');
    expect(result).to.have.nested.property('entities.v1.user_entity');
    expect(result).to.have.nested.property('entities.v1.role_entity');
    expect(result).to.have.nested.property('middlewares.authentication');
  });
});
