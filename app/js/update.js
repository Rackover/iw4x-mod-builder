(function () {
  var fs = require("fs");
  var spawn = require('child_process').spawn;
  var compareVersions = require('compare-versions');

  function moveProcessMain() {
    if (process.argv[0].endsWith(".up.exe")) {
      setTimeout(function () {
        var name = process.argv[0].substr(0, process.argv[0].length - (".up.exe").length);

        if (fs.existsSync(name)) {
          fs.unlinkSync(name);
        }

        fs.writeFileSync(name, fs.readFileSync(process.argv[0], 'binary'), 'binary');
        spawn(name, [],
          {
            detached: true,
            cwd: process.cwd()
          }).unref();
        process.exit(0);
      }, 2000);
    }
    else {
      setTimeout(function () {
        var dirtyFile = process.argv[0] + ".up.exe";
        if (fs.existsSync(dirtyFile)) {
          fs.unlinkSync(dirtyFile);
        }
      }, 2000);
    }
  }

  moveProcessMain();

  function updateClient() {
    if (global.is_dev()) {
      alert("Your client is not updatable!");
      return;
    }

    global.setWorking(true);

    global.getCache("/iw4x-mod-builder/iw4x-mod-builder.exe", function (error, response, body) {
      global.setWorking(false);
      if (error) {
        alert("Failed to update: " + error + "!");
      }
      else {
        fs.writeFileSync(process.argv[0] + ".up.exe", body, 'binary');
        spawn(process.argv[0] + ".up.exe", [],
          {
            detached: true,
            cwd: process.cwd()
          }).unref();
        process.exit(0);
      }
    }, true);
  }

  global.updateIW3 = function (callback) {
    global.setWorking(true);

    if (!global.game.cod4.isValid()) {
      global.setWorking(false);
      if (callback) callback();
      return;
    }

    global.getCache("/iw4x-mod-builder/iw3xport.exe", function (error, response, body) {
      if (error) {
        alert("Failed to update: " + error + "!");
        global.setWorking(false);
      }
      else {
        fs.writeFileSync(path.join(global.game.cod4.getPath(), 'iw3xport.exe'), body, 'binary');

        global.getCache("/iw4x-mod-builder/iw3x.dll", function (error, response, body) {
          if (error) {
            alert("Failed to update: " + error + "!");
            global.setWorking(false);
          }
          else {
            global.setWorking(false);
            fs.writeFileSync(path.join(global.game.cod4.getPath(), 'iw3x.dll'), body, 'binary');
            if (callback) callback();
          }
        }, true);
      }
    }, true);
  }

  global.getCache("/iw4x-mod-builder/version.json", function (error, response, body) {
    if (process.argv[0].endsWith(".up.exe")) return;

    if (compareVersions(require('../package.json').version, JSON.parse(body).version) == -1) {
      if (confirm('An update is available, do you want to install it?')) {
        global.updateIW3(updateClient);
      }
    }
  });

  global.getChangelog = function (callback) {
    if (global.changelog) callback(global.changelog);
    else {
      global.getCache("/iw4x-mod-builder/changelog.html", function (error, response, body) {
        if (!error) global.changelog = body;
        else body = "Error loading changelog!";
        callback(body, error);
      });
    }
  }
})();
