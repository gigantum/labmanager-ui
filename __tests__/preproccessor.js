var config = require('./../config/webpack.config.dev.js');
var aliasPreprocessor = require('jest-alias-preprocessor')(config);
var babel = require('babel-jest');
console.log(config)
module.exports = {
  process: function(src, path) {
    src = aliasPreprocessor.process(src, path);
    src = babel.process(src, path);

    return src;
  },
};
