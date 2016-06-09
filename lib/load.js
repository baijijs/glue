'use strict';

const glob = require('glob');
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers');

/**
 * Analyze `baseDir` and output files tree according to `pattern`
 */
module.exports = function load(baseDir, pattern, excludedFiles) {
  let result = {};
  if (!pattern) pattern = '**';
  if (!baseDir) return result;
  baseDir = path.resolve(baseDir);

  if (!excludedFiles) excludedFiles = [path.join(baseDir, 'index.js')];
  if (!Array.isArray(excludedFiles)) excludedFiles = [excludedFiles];
  excludedFiles = excludedFiles.map(function(file) {
    return path.relative(baseDir, path.resolve(file));
  });

  function recursiveAssign(targetObj, dirs, file) {
    let dir = dirs.shift();
    if (dir) {
      targetObj[dir] = targetObj[dir] || {};
      targetObj[dir] = recursiveAssign(targetObj[dir], dirs, file);
    } else {
      let moduleName = helpers.basename(file);
      targetObj[moduleName] = require(file);
    }
    return targetObj;
  }

  // fetch base dir info
  let baseDirStat = fs.lstatSync(baseDir);

  // if base dir is a directory then walk through it's children folders
  if (baseDirStat.isDirectory()) {
    let files = glob.sync(path.join(baseDir, pattern));
    files.forEach(function(file) {
      if (fs.lstatSync(file).isFile()) {
        let relativeFilePath = path.relative(baseDir, file);
        if (~excludedFiles.indexOf(relativeFilePath)) return;
        let relativeDirname = path.dirname(relativeFilePath);
        let relativeDirs = [];
        if (relativeDirname !== '.') {
          relativeDirs = relativeDirname.split('/');
        }
        result = recursiveAssign(result, relativeDirs, file);
      }
    });
  } else if (baseDirStat.isFile()) {
    result = recursiveAssign(result, [], baseDir);
  }

  return result;
};
