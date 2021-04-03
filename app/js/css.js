var fs = require('fs');
var path = require('path');

global.is_nwjs = function () {
  return process.versions["nw-flavor"] !== undefined;
}

global.is_dev = function () {
  return process.versions["nw-flavor"] === "sdk";
}

if (global.is_nwjs()) {
  if (global.is_dev()) {
    renderCSSToFile();
  }

  $('head').append('<link rel="stylesheet" href="css/main.css" />');
}

function renderCSSToFile() {
  fs.writeFileSync("./app/css/main.css", renderCSS());
}

function renderCSS() {
  var sass = require('sass');
  var result = sass.renderSync(
    {
      file: path.join(process.cwd(), './app/css/src/main.scss'),
      importer: function(file) {
        var src = path.join(process.cwd(), './app/css/src/' + file + '.scss');
        var data = fs.readFileSync(src);
        return {
          contents: data.toString(),
        };
      },
    });

  return result.css;
}

if (!global.is_nwjs()) {
  module.exports = renderCSSToFile;
}
