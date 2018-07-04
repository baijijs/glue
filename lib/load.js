'use strict';

const glob = require('glob');
const path = require('path');
const fs = require('fs');
const magico = require('magico');
const helpers = require('./helpers');

/**
 * Analyze `baseDir` and output required files tree according to `pattern`
 * `index.js` will be ignored by default
 */
module.exports = function load(baseDir, pattern, excludedFiles, parser) {
  let result = Object.create(null);

  if (!pattern) pattern = '**';
  if (!baseDir) return result;

  parser = typeof parser === 'function' ? parser : function(paths, file) {
    return [paths, file];
  };

  baseDir = path.resolve(baseDir);

  if (!excludedFiles) excludedFiles = [path.join(baseDir, 'index.js')];
  if (!Array.isArray(excludedFiles)) excludedFiles = [excludedFiles];

  excludedFiles = excludedFiles.map(function(file) {
    return path.relative(baseDir, path.resolve(baseDir, file));
  });

  if (!fs.existsSync(baseDir)) return result;

  // fetch base dir info
  let baseDirStat = fs.lstatSync(baseDir);

  // if base dir is a directory then walk through it's children folders
  if (baseDirStat.isDirectory()) {
    let files = glob.sync(path.join(baseDir, pattern));
    files.forEach(function(file) {
      if (fs.lstatSync(file).isFile()) {
        let relativeFilePath = path.relative(baseDir, file);

        // Exclude files
        if (~excludedFiles.indexOf(relativeFilePath)) return;

        // Parse relative dir paths
        let relativeDirname = path.dirname(relativeFilePath);
        let relativeDirs = [];
        if (relativeDirname !== '.') relativeDirs = relativeDirname.split('/');

        // Add file name
        relativeDirs.push(helpers.basename(file));

        // Handle file path
        let parsedFile = parser(relativeDirs, require(file));

        // Assign file
        magico.set(result, parsedFile[0], parsedFile[1]);
      }
    });
  } else if (baseDirStat.isFile()) {
    // Handle file path
    let parsedFile = parser([], require(baseDir));
    magico.set(result, parsedFile[0], parsedFile[1]);
  }

  return result;
};
