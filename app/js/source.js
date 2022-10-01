var fs = require("fs");
var path = require("path");
var glob = require("glob");
var mkdirp = require('mkdirp');
const fse = require('fs-extra');

let mapInfo = {
  ambientPlay: "ambient_mp_rural",
  alliesChar: "us_army",
  axisChar: "opforce_composite",
  environment: "urban"
};

const originalMaps = [
  "mp_bog",
  "mp_bloc",
  "mp_backlot",
  "mp_crossfire",
  "mp_shipment",
  "mp_showdown",
  "mp_crash",
  "mp_countdown",
  "mp_strike",
  "mp_convoy",
  "mp_vacant",
  "mp_citystreets",
  "mp_cargoship",
  "mp_pipeline",
  "mp_overgrown",
  "mp_farm",
  "mp_carentan",
  "mp_broadcast",
  "mp_crash_snow",
  "mp_creek"
  ];

global.game = global.game ||
  {};

global.game.generateSource = function (mapname, force) {
  console.log("Generating source");
  if (!global.game.mw2.isValid()) return;

  var mw2Path = global.game.mw2.getPath();

  var zoneSource = path.join(mw2Path, "zone_source");
  mkdirp.sync(zoneSource);

  const mapInfoPath = path.join(mw2Path, "mods", mapname, "mapInfo.json");

  console.log(`Checking if map info path exists at ${mapInfoPath}`);

  if (fs.existsSync(mapInfoPath)){
    console.log(`Yes! Reading it`);
    mapInfo = JSON.parse(fs.readFileSync(mapInfoPath, 'utf8'));
  }
  else{
    console.log(`No, writing it`);
    try{
      fs.writeFileSync(mapInfoPath, JSON.stringify(mapInfo));
    }
    catch(e){
      console.log(e);
    }
  }

  console.log("Generating CSV...");
  generateMainCSV(mw2Path, zoneSource, mapname, force);

  console.log("Generating load assets...");
  generateLoadAssets(mw2Path, zoneSource, mapname, force);

  console.log("Generating main GSC...");
  try{
    generateMainGSC(mw2Path, mapname, force);
  }
  catch(e){
    console.log(e);
  }

  console.log("Generating arena...");
  try{
    generateArena(mw2Path, mapname, force);
  }
  catch(e){
    console.log(e);
  }
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

  if (!fs.existsSync(mainGscFile) || force){
    // Template for main GSC
    var data = fs.readFileSync(path.join("./app/data/gsc/", "main.gsc"), 'utf8');

    // Inject map name etc
    data = data
      .replace(/MAPNAME/g, mapname)
      .replace(/AMBIENT/g, mapInfo.ambientPlay);
      
    fs.writeFileSync(mainGscFile, data);
  }

    const fxGsc = `
//_createfx generated. Do not touch!
#include common_scripts\\utility;
#include common_scripts\\_createfx;

main()
{

}
    `;

    if (!fs.existsSync(fxGscFile) || force)  fs.writeFileSync(fxGscFile, fxGsc);
  
    var emptyGsc = `
main()
{
  
}
    `;

    if (!fs.existsSync(mainFxGscFile) || force)  fs.writeFileSync(mainFxGscFile, emptyGsc);
    if (!fs.existsSync(artGscFile) || force)  fs.writeFileSync(artGscFile, emptyGsc);
}

function generateLoadAssets(mw2Path, zoneSource, mapname, force) {
  var materialPath = path.join(mw2Path, "mods", mapname, "materials");
  mkdirp.sync(materialPath);

  var loadFile = path.join(zoneSource, mapname + "_load.csv");
  
  if (!fs.existsSync(loadFile) || force) {
    var data ="material,$levelbriefing";

    fs.writeFileSync(loadFile, data);
  }
  
    let loadfileData = fs.readFileSync(path.join("./app/data/load/", "$levelbriefing.iw4x.json"), 'utf8');

    // Inject map name etc
    loadfileData = loadfileData
      .replace(/MAPNAME/g, mapname)
      
  
  fs.writeFileSync(path.join(materialPath, "$levelbriefing.iw4x.json"), loadfileData);
}

function generateFxList(mw2Path, mapname) {
	
  let result = "";
  const basePath = path.join(mw2Path, "mods", mapname, "fx");
  
  if (fs.existsSync(basePath))
  {
    const fxList = 
      toolkit.walk(basePath)
      .map(function (fx) {
        return fx.substring(basePath.length +1).replace(".iw4xFx", "");
      });


    if (fxList.length > 0) {
      result += "\n";

      fxList.forEach(function (fx) {
        result += "fx," + fx + "\n";
      });
    }

  }
  
  return result;
}

function generateArena(mw2Path, mapname, force) {
  var usermapsPath = path.join(mw2Path, "usermaps", mapname);
  var arenaFile = path.join(usermapsPath, mapname + ".arena");
  mkdirp.sync(usermapsPath);

  if (!fs.existsSync(arenaFile) || force) {

    const isOfficial = originalMaps.includes(mapname);
    const longName = isOfficial ? `MPUI_${mapname.toUpperCase()}` : `${capitalizeFirstLetter(mapname.substring(3))}`;
    const description = isOfficial ? `MPUI_DESC_MAP_${mapname.substring(3).toUpperCase()}` : `Custom map ${mapname}`;

    var data = `
{ 
  map         ${name}   
  longname    ${longName}
  gametype    dm war sab sab2 dom sd sd2 hc thc ctf koth dd oneflag gtnw
  description ${description}     
  mapimage    preview_${mapname}     
  mapoverlay  compass_overlay_map_blank 
  allieschar  ${mapInfo.alliesChar} 
  axischar    ${mapInfo.axisChar} 
  useteamzones true
  environment ${mapInfo.environment} 
}
`;

    fs.writeFileSync(arenaFile, data);
  }
}

function generateMainCSV(mw2Path, zoneSource, mapname, force) {
  const mapfile = path.join(zoneSource, mapname + ".csv");

  if (!fs.existsSync(mapfile) || force) {
    const visionExists = fs.existsSync(path.join(mw2Path, "mods", mapname, "vision", mapname + ".vision"));
    const sunExists = fs.existsSync(path.join(mw2Path, "mods", mapname, "sun", mapname + ".sun"));
    const hasMinigun = fs.existsSync(path.join(mw2Path, "mods", mapname, "HAS_MINIGUN"));
    const needsXmodelFix = fs.existsSync(path.join(mw2Path, "mods", mapname, "HAS_BROKEN_XMODELS"));
    

    const additionalModelsPath = path.join(mw2Path, "mods", mapname, "additionalModels.txt");
    const hasAdditionalModels = fs.existsSync(additionalModelsPath);

    let data = "";
    
    if (hasMinigun)
    {
      data += "require,minigun\n";
    }
    
    if (needsXmodelFix)
    {
      data += "# This zone is present in the mod builder directory/data/support_zones. You will need to copy it to iw4x_full_game/zone/english to be able to build the map properly. If you cannot, you can replace the below line with 'require,mp_vacant', but it might have undesirable side effects. \nrequire,xmodels_fix\n";
    }

    data +=
      "map_ents,maps/mp/" + mapname + ".d3dbsp\n" +
      "col_map_mp,maps/mp/" + mapname + ".d3dbsp\n" +
      "fx_map,maps/mp/" + mapname + ".d3dbsp\n" +
      "com_map,maps/mp/" + mapname + ".d3dbsp\n" +
      "game_map_mp,maps/mp/" + mapname + ".d3dbsp\n" +
      "gfx_map,maps/mp/" + mapname + ".d3dbsp\n\n" +

      "material,compass_map_" + mapname + "\n" +
      (visionExists ? "" : "#") + "rawfile,vision/" + mapname + ".vision\n" +
      (sunExists ? "" : "#") + "rawfile,sun/" + mapname + ".sun\n\n" +

      "rawfile,maps/mp/" + mapname + ".gsc\n" +
      "rawfile,maps/mp/" + mapname + "_fx.gsc\n" +
      "rawfile,maps/createfx/" + mapname + "_fx.gsc\n" +
      "rawfile,maps/createart/" + mapname + "_art.gsc\n" + 
    generateFxList(mw2Path, mapname);

    // generic ambient sounds
    // this increases the size of the ff of a few megs but ensures most of the sounds will be present
    fse.copySync("./app/data/generic_sounds", path.join(mw2Path, "mods", mapname), {overwrite:true}, function (err) {
      console.log(err);
    });
    
    try{
      data += generateSoundsSource(path.join(mw2Path, "mods", mapname));
    }
    catch(e){
      console.log(e);
    }

    // Extra destroyable vehicles?
    let vehicleData = "";
    const vehicleModelListPath = path.join(mw2Path, "mods", mapname, "VEHICLES_XMODELS");
    if (fs.existsSync(vehicleModelListPath)){
      let doneVehicles = {};
      const vehiclesList = fs.readFileSync(vehicleModelListPath, 'utf8').split("\n");

      for(i in vehiclesList){
        const vehicle = vehiclesList[i];
        if (doneVehicles[vehicle]){
          continue;
        }

        if (vehicle.length <= 0){
          continue;
        }

        doneVehicles[vehicle] = true;
        vehicleData += `xmodel,${vehicle}\n`;
      }
    }

    data += "\n\n# Destroyables\n"+vehicleData;

    // Minigun turrets
    if (hasMinigun){
      const minigunData = fs.readFileSync(path.join("./app/data/csv/", "minigun_include.csv"), 'utf8');
      data += "\n"+minigunData;

      fse.copySync("./app/data/minigun", path.join(mw2Path, "mods", mapname), {overwrite:true}, function (err) {
        console.log(err);
      });
    }


    // Extra FX mentioned in the GSC, like com_barrel_piece2
    if (hasAdditionalModels){
      data += "\n\n# GSC models";
      
      const additionalModelsStr = fs.readFileSync(additionalModelsPath, 'utf8');
      const list = additionalModelsStr.split("\n");
      for(k in list)
      {
        if (list[k].length > 0)
        {
          data += "\nxmodel," + list[k];
        }
      }
      
      data += "\n";
    }
    
    fs.writeFileSync(mapfile, data);
  }
}

function generateSoundsSource(basePath){
  const soundAliasesRoot = path.join(basePath, "sounds");
  let source = [];

  const soundAliases = fs.readdirSync(soundAliasesRoot);
  for(i in soundAliases){
	const snd = soundAliases[i].replace(basePath, "").replace(".json", "");
    source.push(`sound,${snd}`);
  }

  return source.join("\n");
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
