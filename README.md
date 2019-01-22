Glue
====

[![Build Status](https://travis-ci.org/baijijs/glue.svg?branch=master)](https://travis-ci.org/baijijs/glue)
[![npm version](https://badge.fury.io/js/baiji-glue.svg)](https://badge.fury.io/js/baiji-glue)
[![npm](https://img.shields.io/npm/dt/baiji-glue.svg)]()
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/lyfeyaj/baiji-glue/master/LICENSE.md)

Magic glue that makes baiji components work together

## Installation

```bash
npm install baiji-glue --save
```

## How glue works

```bash
#
# Load config files by predefined pattern and orders:
#
# 1. Load `config.{js,json}`
#
# 2. Load `[extraConfig].config.{js,json}`
#
# 3. Load `[environment].{js,json}` file according to `process.env.NODE_ENV`, default
#    is `development`, such as: environments/development.js
#
# 4. Load `[extra].env.{js,json}` file according to `process.env.NODE_ENV`, default
#    is `development`, such as: database.env.js
#
# 5. Generate environment related method according to file names under `environments`
#    folder, such as:
#    ├── environments
#    ...├── development.js
#    ...├── production.js
#    ...└── test.js
#    method `isDevelopment`, `isProduction`, `isTest` will be generated according
#    to above folder structure
#
# 6. Add logger folder and related files
#    ├── logs
#    ...├── [environment]_access.js => development_access.log
#    ...└── [environment]_error.js => development_error.log
#
# 7. Combine above configs by following structure:
#    {
#       env: {
#          NODE_ENV: 'development',
#          isDevelopment() {},
#          isProduction() {},
#          isTest() {},
#       },
#       logger: {}
#          error() {},
#          warning() {},
#          info() {},
#          verbose() {},
#          debug() {},
#          silly() {},
#          infoLogger: winston.Logger instance...,
#          errorLogger: winston.Logger instance...
#       },
#       ... other configs from environment related config file and default config file
#    }
#
# 8. Load initializer files under `initializers` folder and invoke functional
#    initializers with `config` as parameter
#
# 9. Return combined config
#
```

## Usage & APIs

#### `glue(dir)`

```javascript
const glue = require('glue');

module.exports = glue(__dirname);
```

#### `load(baseDir, pattern, excludedFiles)`

```javascript
const load = require('glue').load;

const models = load(__dirname, '*.js', ['index.js'])
```
