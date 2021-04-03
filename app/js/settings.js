var fs = require("fs");
var path = require("path");

global.getSetting = function (key) {
  var settings = loadSettings();
  return settings[key];
}

global.setSetting = function (key, value) {
  var settings = loadSettings();
  settings[key] = value;
  storeSettings(settings);
}

function loadSettings() {
  var settings = {};
  var file = path.join(process.env.LOCALAPPDATA, "IW4x", "settings.json");

  if (fs.existsSync(file)) {
    var loadedSettings = JSON.parse(fs.readFileSync(file));
    Object.keys(loadedSettings).forEach(function (key) {
      settings[key] = loadedSettings[key];
    });
  }

  return settings;
}

function storeSettings(object) {
  var string = JSON.stringify(object, null, 2);
  var dir = path.join(process.env.LOCALAPPDATA, "IW4x");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, "settings.json"), string);
}
