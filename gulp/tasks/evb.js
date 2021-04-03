var path = require("path");
var evb = require("enigmavirtualbox");
var generateEvb = require('generate-evb');

exports.build = function(cb)
{
  var package = require("../../package.json");

  var exeName = package.name + ".exe";
  var evbPath = path.join("build", package.name + ".evb");
  var packPath = path.join("build", package.name, "win32");
  var inExe = path.join(packPath, exeName);
  var outExe = path.join("build", exeName);

  generateEvb(evbPath, inExe, outExe, packPath,
  {
    filter: function(fullPath, name, isDir)
    {
      return name != exeName;
    },
    evbOptions:
    {
      deleteExtractedOnExit: true,
      compressFiles: true,
    }
  });

  var callback = function(result)
  {
    console.log(result.stdout);
    console.error(result.stderr);

    // EVB errors, even on success
    if (result.stdout.indexOf("File successfully saved to") != -1)
    {
      result.error = undefined;
    }

    cb(result.error);
  };

  evb.cli(evbPath).then(callback, callback);
};
