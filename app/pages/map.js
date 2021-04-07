var fs = require("fs");
var path = require("path");
var mv = require('mv');
var gui = require('nw.gui');
var spawn = require('child_process').spawn;
var JSZip = require('jszip');
var mkdirp = require('mkdirp');

$("#generate-iwd").click(function () {
  if (global.isWorking()) return;

  var selection = $("#map-selection").val();
  if (selection == null) return;

  if (!global.game.mw2.isValid()) return;
  global.setWorking(true);

  var mw2Path = global.game.mw2.getPath();
  var mapname = selection.trim();

  $('#map-output').text("");
  var appendText = function (text) {
    $('#map-output').append(text);
    $('#map-output').scrollTop($('#map-output')[0].scrollHeight);
  }

  appendText("Loading required images...\n");

  var output = "";
  const process = spawn(path.join(mw2Path, 'iw4x.exe'), ['-zonebuilder', '-stdout', '-nosteam', '+iwidump', mapname, '+quit'],
    {
      cwd: mw2Path
    });

  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    output += data.toString();
  });

  process.on('error', (err) => {
    alert('Failed to start process: ' + err);
    global.setWorking(false);
  });

  process.on('exit', (code) => {
    appendText("Building IWD...\n");

    var zip = new JSZip();

    output = output.split("------------------- BEGIN IWI DUMP -------------------")[1].split("------------------- END IWI DUMP -------------------")[0];

    var images = JSON.parse(output);

    // // Write preview material and image
    // const material = {
    //     "animationX": 1,
    //     "animationY": 1,
    //     "cameraRegion": 4,
    //     "constantTable": null,
    //     "gameFlags": 0,
    //     "maps": [
    //         {
    //             "firstCharacter": 99,
    //             "image": `preview_${mapname}`,
    //             "lastCharacter": 112,
    //             "sampleState": -30,
    //             "semantic": 0,
    //             "typeHash": 2695565377
    //         }
    //     ],
    //     "name": `preview_${mapname}`,
    //     "sortKey": 34,
    //     "stateFlags": 3,
    //     "stateMap": [
    //         [
    //             403867666,
    //             3759013890
    //         ]
    //     ],
    //     "surfaceTypeBits": 0,
    //     "techniqueSet->name": "2d",
    //     "unknown": 0
    // };

    // const materialDir = path.join(mw2Path, "mods", mapname, "materials");
    // mkdirp.sync(materialDir);

    const previewPath = path.join(mw2Path, "mods", mapname, "images", `preview_${mapname}.iwi`);
    const loadingPath = path.join(mw2Path, "mods", mapname, "images", `loadscreen_${mapname}.iwi`);
    
    fs.copyFileSync(loadingPath, previewPath);
    images.push(path.join("images", `preview_${mapname}.iwi`));

    var chainImages = function (index, callback) {
      try{
        if (index < images.length) {
          var image = images[index];
          appendText("Adding " + image + "\n");
          zip.file(image, fs.readFileSync(path.join(mw2Path, "mods", mapname, image)),
            {
              binary: true
            });

          setTimeout(function () {
            chainImages(index + 1, callback);
          }, 1);
        }
        else {
          callback();
        }
      }
      catch(e){
        console.log(e);
      }
    };

    chainImages(0, function () {
      var endPath = path.join(mw2Path, "usermaps", mapname);
      mkdirp.sync(endPath);

      appendText("Compressing...\n");
      setTimeout(function () {
        zip.generateAsync(
          {
            type: "nodebuffer",
            compression: "DEFLATE"
          })
          .then(function (content) {
            fs.writeFileSync(path.join(endPath, mapname + ".iwd"), content);
            global.setWorking(false);
            appendText("Done\n");
          });
      }, 1);
    });
  });
});

$("#edit-csv").click(function () {
  if (global.isWorking()) return;

  var selection = $("#map-selection").val();
  if (selection == null) return;

  if (!global.game.mw2.isValid()) return;

  var mw2Path = global.game.mw2.getPath();
  var mapname = selection.trim();
  var csvPath = path.join(mw2Path, "zone_source", mapname + ".csv");
  gui.Shell.openItem(csvPath);
});

$("#edit-arena").click(function () {
  if (global.isWorking()) return;

  var selection = $("#map-selection").val();
  if (selection == null) return;

  if (!global.game.mw2.isValid()) return;

  var mw2Path = global.game.mw2.getPath();
  var mapname = selection.trim();
  var arenaPath = path.join(mw2Path, "usermaps", mapname, mapname + ".arena");
  gui.Shell.openItem(arenaPath);
});

$("#open-build").click(function () {
  if (global.isWorking()) return;

  var selection = $("#map-selection").val();
  if (selection == null) return;

  if (!global.game.mw2.isValid()) return;

  var mw2Path = global.game.mw2.getPath();
  var mapname = selection.trim();
  var buildPath = path.join(mw2Path, "usermaps", mapname);
  gui.Shell.openItem(buildPath);
});

$("#open-export").click(function () {
  if (global.isWorking()) return;

  var selection = $("#map-selection").val();
  if (selection == null) return;

  if (!global.game.mw2.isValid()) return;

  var mw2Path = global.game.mw2.getPath();
  var mapname = selection.trim();
  var exportPath = path.join(mw2Path, "mods", mapname);
  gui.Shell.openItem(exportPath);
});

$("#run-map").click(function () {
  if (global.isWorking()) return;

  var selection = $("#map-selection").val();
  if (selection == null) return;

  if (!global.game.mw2.isValid()) return;

  var mw2Path = global.game.mw2.getPath();
  var mapname = selection.trim();
  spawn(path.join(mw2Path, 'iw4x.exe'), ['-console', '-nointro', '-nosteam', '+set', 'fs_game', 'mods/' + mapname, '+devmap', mapname],
    {
      cwd: mw2Path
    });
});

$("#open-tools").click(function () {
  if (global.isWorking()) return;

  if (!global.game.cod4.isValid()) return;

  var cod4Path = global.game.cod4.getPath();
  var ctPath = path.join(cod4Path, "bin", "CoD4CompileTools");
  spawn(path.join(ctPath, "CoD4CompileTools.exe"), [],
    {
      cwd: ctPath
    });
});

$("#open-radiant").click(function () {
  if (global.isWorking()) return;

  if (!global.game.cod4.isValid()) return;

  var cod4Path = global.game.cod4.getPath();
  var binPath = path.join(cod4Path, "bin");
  spawn(path.join(binPath, "CoD4Radiant.exe"), [],
    {
      cwd: binPath
    });
});

$("#build-map").click(function () {
  if (global.isWorking()) return;

  var selection = $("#map-selection").val();
  if (selection == null) return;

  if (!global.game.mw2.isValid()) return;
  global.setWorking(true);

  var mw2Path = global.game.mw2.getPath();
  var mapname = selection.trim();

  $('#map-output').text("");
  var appendText = function (text) {
    $('#map-output').append(text);
    $('#map-output').scrollTop($('#map-output')[0].scrollHeight);
  }

  const process = spawn(path.join(mw2Path, 'iw4x.exe'), ['-zonebuilder', '-stdout', '-nosteam', '+set', 'fs_game', 'mods/' + mapname, '+buildzone', mapname, '+buildzone', mapname + "_load", '+quit'],
    {
      cwd: mw2Path
    });

  process.stdout.on('data', (data) => {
    appendText(data.toString());
  });

  process.stderr.on('data', (data) => {
    appendText(data.toString());
  });

  process.on('error', (err) => {
    alert('Failed to start process: ' + err);
    global.setWorking(false);
  });

  process.on('exit', (code) => {
    if (code != 0) {
      appendText("Process failed");

      global.setWorking(false);
      var text = $('#map-output').text();

      if (text.indexOf("Missing techset: '") != -1) {
        var techset = text.split("Missing techset: '")[1];
        techset = techset.split("' not found")[0];

        var maps = global.game.getMapsForTechset(techset);
        var possibleMaps = global.game.getMapsForMappedTechset(techset);
        var message = "Techset '" + techset + "' is missing.\n";

        if (maps.length == 0) {
          if (possibleMaps.length == 0) {
            message += "Unfortunately it seems like no map contains it!";
          }
          else {
            message += "It seems like no map contains it\nThese maps however contain similar techsets which could be remapped:\n";
            possibleMaps.forEach(function (map) {
              message += "  " + map + "\n";
            });
          }
        }
        else {
          message += "It was found on following maps:\n";
          maps.forEach(function (map) {
            message += "  " + map + "\n";
          });
        }

        alert(message);
      }
    }
    else {
      appendText("Process terminated successfully");
      mv(path.join(mw2Path, "zone", mapname + ".ff"), path.join(mw2Path, "usermaps", mapname, mapname + ".ff"),
        {
          mkdirp: true
        }, function (err) {
          mv(path.join(mw2Path, "zone", mapname + "_load.ff"), path.join(mw2Path, "usermaps", mapname, mapname + "_load.ff"),
            {
              mkdirp: true
            }, function (err) {
              global.setWorking(false);
            });
        });
    }
  });
});

$("#export-map").click(function () {
  if (global.isWorking()) return;

  var selection = $("#map-selection").val();
  if (selection == null) return;

  if (!global.game.cod4.isValid() || !global.game.mw2.isValid()) return;
  global.setWorking(true);

  var cod4Path = global.game.cod4.getPath();
  var mw2Path = global.game.mw2.getPath();
  var mapname = selection.trim();

  const process = spawn(path.join(cod4Path, 'iw3xport.exe'), ['-stdout', '+set', 'export_path', path.join(mw2Path, "mods", mapname), '+dumpmap', mapname, '+quit'],
    {
      cwd: cod4Path
    });

  $('#map-output').text("");
  var appendText = function (text) {
    $('#map-output').append(text);
    $('#map-output').scrollTop($('#map-output')[0].scrollHeight);
  }

  process.stdout.on('data', (data) => {
    appendText(data.toString());
  });

  process.stderr.on('data', (data) => {
    appendText(data.toString());
  });

  process.on('error', (err) => {
    alert('Failed to start process: ' + err);
    global.setWorking(false);
  });

  process.on('exit', (code) => {
    appendText(`Process terminated with result ${code}`);
    try{
      global.game.generateSource(mapname, false);
      global.setWorking(false);
    }
    catch(e){
      console.log(e);
    }
  });
});
