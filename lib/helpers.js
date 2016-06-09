'use strict';

const path = require('path');

// Helpers

exports.camelize = function camelize(str) {
  return (String(str) || '').trim().replace(/[-_\s]+(.)?/g, function(match, c) {
    return c ? c.toUpperCase() : '';
  });
};

exports.titleize = function titleize(str) {
  return (String(str) || '').toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
    return c.toUpperCase();
  });
};

exports.capitalize = function capitalize(str, lowercaseRest) {
  str = String(str) || '';
  let remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();
  return str.charAt(0).toUpperCase() + remainingChars;
};

exports.basename = function basename(file) {
  let extname = path.extname(file);
  return path.basename(file, extname);
};
