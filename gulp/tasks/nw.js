var gulp = require('gulp');
var glob = require("glob");
var path = require("path");
var rcedit = require('rcedit');
var Promise = require('bluebird');
var NWBuilder = require('nw-builder');

function includeDependenciesAll() {
  var modules = [
    "./node_modules/**/*",
  ];

  var package = require(path.join(process.cwd(), "package.json"));

  Object.keys(package.devDependencies).forEach(dependency => {
    modules.push("!./node_modules/" + dependency + "/**/*");
  });

  return modules;
}

function includeDependencies() {
  var deps = [];
  walkDependencies(deps);
  
  return deps.map(function (module) {
    return "./node_modules/" + module + "/**/*";
  })
}

function walkDependencies(deps, modulePath, rootPath) {
  if (!modulePath) modulePath = process.cwd();
  if (!rootPath) rootPath = modulePath;

  var package = require(path.join(modulePath, "package.json"));
  if(!package.dependencies) return;

  Object.keys(package.dependencies).forEach(dep => {
    if(!deps.includes(dep)) {
      deps.push(dep);

      const modPath = path.join(rootPath, "node_modules", dep);
      walkDependencies(deps, modPath, rootPath);
    }
  });
};

exports.build = function (cb) {
  var nw = new NWBuilder(
    {
      files: [
        "./package.json",
        "./app/**/*",
        "!./app/css/src/**/*.scss",
      ].concat(includeDependencies()).concat([
        //"!./**/*.exe",
        //"!./**/*.ts",
        //"!./**/*.map",
      ]),
      cacheDir: "./build/cache",
      platforms: ["win32"],
      winIco: "./app/img/iw4x.ico",
      checkVersions: false,
      flavor: "normal"
    });

  // Hook into the building process to edit the resources
  var handleWin = nw.handleWinApp;
  nw.handleWinApp = function () {
    var promises = [];
    var package = require(path.join(process.cwd(), "package.json"));

    this._forEachPlatform((function (name, platform) {
      var file = path.join(platform.releasePath, this.options.appName + ".exe");
      console.log("Patching " + file + "...");

      promises.push(rcedit(file,
        {
          'version-string':
          {
            'CompanyName': 'IW4x',
            'FileDescription': package.description,
            'LegalCopyright': 'Copyright ' + new Date().getFullYear() + ' The IW4x Team. All rights reserved.',
            'ProductName': package.title,
            'OriginalFilename': package.name + ".exe",
            'InternalName': package.name
          },
          'file-version': package.version,
          'product-version': package.version,
        }));
    }).bind(this));

    return Promise.all(promises).then(handleWin.bind(this));
  };

  nw.on("log", function (msg) {
    console.log(msg);
  });

  nw.build(function (err) {
    if (err) {
      console.error(err)
    }

    cb(err);
  });
};
