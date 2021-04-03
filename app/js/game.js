var fs = require("fs");
var path = require("path");
var glob = require("glob");
var mkdirp = require('mkdirp');

function Game(setting) {
  this.setting = setting;
}

Game.prototype.getSetting = function () {
  return this.setting;
};

Game.prototype.getPath = function () {
  return global.getSetting(this.setting);
};

Game.prototype.setPath = function (path) {
  return global.setSetting(this.setting, path);
};

Game.prototype.getLocalizationPath = function () {
  var _path = this.getPath();
  if (!_path) return undefined;
  return path.join(_path, "localization.txt");
};

Game.prototype.isValid = function () {
  var _path = this.getLocalizationPath();
  if (!_path) return false;
  return fs.existsSync(_path);
};

Game.prototype.getLanguage = function () {
  if (this.isValid()) {
    var _path = this.getLocalizationPath();
    if (!_path) return false;

    var data = fs.readFileSync(_path);
    return data.toString().split("\r\n")[0];
  }

  return "";
};

global.game = global.game ||
  {};
global.game.mw2 = new Game("mw2-folder");
global.game.cod4 = new Game("cod4-folder");

global.game.isValid = function (folder) {
  return fs.existsSync(path.join(folder, "localization.txt"));
}

global.game.cod4.validate = function (folder) {
  if (!folder) folder = this.getPath();
  if (!folder) return false;

  var validate = function (file) {
    return fs.existsSync(path.join(folder, file));
  }

  return validate("iw3x.dll") && validate("iw3xport.exe") && global.game.isValid(folder);
}

global.game.mw2.validate = function (folder) {
  if (!folder) folder = this.getPath();
  if (!folder) return false;

  var validate = function (file) {
    return fs.existsSync(path.join(folder, file));
  }

  return validate("iw4x.dll") && validate("iw4x.exe") && global.game.isValid(folder);
}

global.game.techsets = {};
global.game.getMapsForTechset = function (techset) {
  var maps = [];

  Object.keys(global.game.techsets).forEach(function (key) {
    var include = false;
    global.game.techsets[key].forEach(function (value) {
      if (value == techset) include = true;
    });

    if (include) maps.push(key);
  });

  return maps;
};

global.game.getMapsForMappedTechset = function (techset) {
  var maps = [];

  Object.keys(global.game.techsets).forEach(function (key) {
    var include = false;
    global.game.techsets[key].forEach(function (value) {
      if (value.startsWith(techset + "_")) include = true;
    });

    if (include) maps.push(key);
  });

  return maps;
};

glob.sync("*.json",
  {
    "cwd": "./app/data/techset/",
    "nodir": true,
  }).forEach(function (map) {
    var techsets = JSON.parse(fs.readFileSync(path.join("./app/data/techset/", map)).toString());
    var mapname = map.replace(".json", "");

    global.game.techsets[mapname] = techsets;
  });

// This is only required to parse the dumped txts
function parseTechsets() {
  glob.sync("*.txt",
    {
      "cwd": "./app/data/techset/",
      "nodir": true,
    }).forEach(function (map) {
      var data = fs.readFileSync(path.join("./app/data/techset/", map));
      var lines = data.toString().replace("\r", "").split("\n");
      lines = lines.filter(function (line) {
        return line.indexOf("techset: ") != -1 && line.indexOf("techset: ,") == -1;
      }).map(function (line) {
        return line.substring(line.indexOf("techset: ") + 9);
      });

      fs.writeFileSync(path.join("./app/data/techset/", map.replace(".txt", ".json")), JSON.stringify(lines, null, 2));
    });
};
