/* eslint no-irregular-whitespace: "off" */
'use strict';

const path = require('path');
const pluralize = require('pluralize');
const load = require('./load');

// suffix support string or array
// 'controller|ctrl' or ['controller', 'ctrl']
function parserBuilder(suffix) {
  if (!suffix || !suffix.length) return;

  let suffixes;

  if (Array.isArray(suffix)) {
    suffixes = suffix;
  } else if (typeof suffix === 'string') {
    suffixes = suffix.split('|');
  } else {
    return;
  }

  return function parser(paths, file) {
    if (paths && paths.length) {
      let _paths = paths.slice();
      let filename = _paths[_paths.length - 1];
      let _filename = filename;

      suffixes.forEach(function(s) {
        if (_filename !== filename) return;
        let pattern = new RegExp(`_?${s.toLowerCase()}$`, 'i');
        _filename = _filename.replace(pattern, '');
      });

      _paths[_paths.length - 1] = _filename;

      return [_paths, file];
    } else {
      return [paths, file];
    }
  };
}

const DEFAULT_DIRS = ['entities', 'schemas', 'middlewares', 'services'];

/**
 * App structures
 * ├── app
 * │   ├── controllers
 * │   │   └── v1
 * │   │       ├── roles_api.js
 * │   │       └── users_api.js
 * │   ├── entities
 * │   │   └── v1
 * │   │       ├── role_entity.js
 * │   │       └── user_entity.js
 * │   ├── schemas
 * │   │   └── user_schema.js
 * │   │   └── role_schema.js
 * │   └── middlewares
 * │       └── authentication.js
 * ├── common
 * │   └── helpers.js
 * ├── config
 * │   ├── config.js
 * │   ├── environments
 * │   │   ├── development.js
 * │   │   ├── production.js
 * │   │   └── test.js
 * │   ├── index.js
 * │   ├── initializers
 * │   │   ├── functional.js
 * │   │   └── init.js
 * │   └── extra.config.json
 */
// Support dirs: ['services', ['controllers', 'controller|ctrl']]
module.exports = function autoload(baseDir, dirs) {
  dirs = dirs || DEFAULT_DIRS;

  if (!Array.isArray(dirs)) dirs = [dirs];

  let result = Object.create(null);

  dirs.forEach(function(dir) {
    let _dir, suffix;

    if (Array.isArray(dir)) {
      _dir = dir[0];
      suffix = dir[1];
    } else {
      _dir = dir;
      suffix = pluralize.singular(dir);
    }

    _dir = pluralize(_dir);

    result[_dir] = load(
      path.join(baseDir, _dir),
      '**',
      [],
      parserBuilder(suffix)
    );
  });

  return result;
};
