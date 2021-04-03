var fs = require("fs");
var path = require("path");
var glob = require("glob");
var mkdirp = require('mkdirp');

global.game = global.game ||
  {};

global.game.generateSource = function (mapname, force) {
  if (!global.game.mw2.isValid()) return;

  var mw2Path = global.game.mw2.getPath();

  var zoneSource = path.join(mw2Path, "zone_source");
  mkdirp.sync(zoneSource);

  generateMainCSV(mw2Path, zoneSource, mapname, force);
  generateLoadAssets(mw2Path, zoneSource, mapname, force);
  generateMainGSC(mw2Path, mapname, force);
  generateArena(mw2Path, mapname, force);
};

function generateMainGSC(mw2Path, mapname, force) {
  var mainGscPath = path.join(mw2Path, "mods", mapname, "maps", "mp");
  var fxGscPath = path.join(mw2Path, "mods", mapname, "maps", "createfx");
  var artGscPath = path.join(mw2Path, "mods", mapname, "maps", "createart");
  mkdirp.sync(mainGscPath);
  mkdirp.sync(fxGscPath);
  mkdirp.sync(artGscPath);

  var mainGscFile = path.join(mainGscPath, mapname + ".gsc");
  var mainFxGscFile = path.join(mainGscPath, mapname + "_fx.gsc");
  var fxGscFile = path.join(fxGscPath, mapname + "_fx.gsc");
  var artGscFile = path.join(artGscPath, mapname + "_art.gsc");

  if (!fs.existsSync(mainGscFile) || force) {
    var emptyGsc = "main()\n" +
      "{\n\n" +
      "}\n";

    var data =
      "#include common_scripts\\utility;\n\n" +

      "main()\n" +
      "{\n" +
      "\tmaps\\mp\\" + mapname + "_fx::main();\n" +
      "\tmaps\\createfx\\" + mapname + "_fx::main();\n" +
      "\tmaps\\createart\\" + mapname + "_art::main();\n" +
      "\tmaps\\mp\\_load::main();\n\n" +

      "\tgame[ \"attackers\" ] = \"allies\";\n" +
      "\tgame[ \"defenders\" ] = \"axis\";\n\n" +

      "\tambientPlay ( \"ambient_mp_rural\" );\n\n" +

      "\tsetdvar( \"compassmaxrange\", \"2100\" );\n" +
      "\tmaps\\mp\\_compass::setupMiniMap( \"compass_map_" + mapname + "\" );\n" +
      "}\n";

    fs.writeFileSync(mainGscFile, data);

    if (!fs.existsSync(mainFxGscFile)) fs.writeFileSync(mainFxGscFile, emptyGsc);
    if (!fs.existsSync(fxGscFile)) fs.writeFileSync(fxGscFile, emptyGsc);
    if (!fs.existsSync(artGscFile)) fs.writeFileSync(artGscFile, emptyGsc);
  }
}

function generateLoadAssets(mw2Path, zoneSource, mapname, force) {
  var materialPath = path.join(mw2Path, "mods", mapname, "materials");
  mkdirp.sync(materialPath);

  var loadFile = path.join(zoneSource, mapname + "_load.csv");
  var loadmaterial = path.join(materialPath, mapname + "_load.json");

  if (!fs.existsSync(loadFile) || force) {
    var data =
      "require,mp_rust_load\n" +
      "material," + mapname + "_load,$levelbriefing";

    fs.writeFileSync(loadFile, data);
  }

  if (!fs.existsSync(loadmaterial) || force) {
    var data = {
      "base": "$levelbriefing",
      "textures": [
        ["colorMap", "loadscreen_" + mapname]
      ]
    };

    fs.writeFileSync(loadmaterial, JSON.stringify(data));
  }
}

function generateFxList(mw2Path, mapname) {
  var fxList = glob.sync("**/*.iw4xFx",
    {
      "cwd": path.join(mw2Path, "mods", mapname, "fx"),
    }).map(function (fx) {
      return fx.replace(".iw4xFx", "");
    });

  var result = "";

  if (fxList.length > 0) {
    result += "\n";

    fxList.forEach(function (fx) {
      result += "fx," + fx + "\n";
    });
  }

  return result;
}

function generateArena(mw2Path, mapname, force) {
  var usermapsPath = path.join(mw2Path, "usermaps", mapname);
  var arenaFile = path.join(usermapsPath, mapname + ".arena");
  mkdirp.sync(usermapsPath);

  if (!fs.existsSync(arenaFile) || force) {
    var data =
      "{\n" +
      "\tmap         \"" + mapname + "\"\n" +
      "\tlongname    \"" + mapname.toUpperCase() + "\"\n" +
      "\tgametype    \"\"\n" +
      "\tdescription \"Custom map " + mapname + "\"\n" +
      "\tmapimage    \"preview_" + mapname + "\"\n" +
      "\tmapoverlay  \"compass_overlay_map_blank\"\n" +
      "\tallieschar  \"us_army\"\n" +
      "\taxischar    \"opforce_composite\"\n" +
      "\tenvironment \"urban\"\n" +
      "}\n";

    fs.writeFileSync(arenaFile, data);
  }
}

function generateMainCSV(mw2Path, zoneSource, mapname, force) {
  var mapfile = path.join(zoneSource, mapname + ".csv");

  if (!fs.existsSync(mapfile) || force) {
    var visionExists = fs.existsSync(path.join(mw2Path, "mods", mapname, "vision", mapname + ".vision"));
    var sunExists = fs.existsSync(path.join(mw2Path, "mods", mapname, "sun", mapname + ".sun"));

    var data =
      "require,contingency\n" +
      "require,co_hunted\n" +
      "require,mp_afghan\n" +
      "require,mp_strike\n" +
      "require,mp_rundown\n" +
      "require,mp_overgrown\n\n" +

      "# Those 2 maps below are necessary and always have to be the last required maps\n" +
      "# If you want to require additional maps, add them above!\n" +
      "require,mp_rust\n" +
      "require,iw4_credits\n\n" +

      "map_ents,maps/mp/" + mapname + ".d3dbsp\n" +
      "col_map_mp,maps/mp/" + mapname + ".d3dbsp\n" +
      "fx_map,maps/iw4_credits.d3dbsp,maps/mp/" + mapname + ".d3dbsp\n" +
      "com_map,maps/mp/" + mapname + ".d3dbsp\n" +
      "game_map_mp,maps/mp/mp_rust.d3dbsp,maps/mp/" + mapname + ".d3dbsp\n" +
      "gfx_map,maps/mp/" + mapname + ".d3dbsp\n\n" +

      "material,compass_map_" + mapname + "\n" +
      (visionExists ? "" : "#") + "rawfile,vision/" + mapname + ".vision\n" +
      (sunExists ? "" : "#") + "rawfile,sun/" + mapname + ".sun\n\n" +

      "rawfile,maps/mp/" + mapname + ".gsc\n" +
      "rawfile,maps/mp/" + mapname + "_fx.gsc\n" +
      "rawfile,maps/createfx/" + mapname + "_fx.gsc\n" +
      "rawfile,maps/createart/" + mapname + "_art.gsc\n" + generateFxList(mw2Path, mapname);

    fs.writeFileSync(mapfile, data);
  }
}
