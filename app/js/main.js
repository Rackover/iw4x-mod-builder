var glob = require("glob");
var path = require("path");
var _pack = require('../package.json');
const toolkit = require('./js/toolkit');

function loadMaps(scope, apply) {
    var cod4dir = global.game.cod4.getPath();
    var mw2dir = global.game.mw2.getPath();

    if (global.game.cod4.isValid() && global.game.mw2.isValid()) {
        scope.stockmaps = glob.sync("**/mp_*.ff", {
            "cwd": path.join(cod4dir, "zone", global.game.cod4.getLanguage()),
            "nodir": true,
        }).filter(function(map) {
            return !map.endsWith("_load.ff");
        }).map(function(map) {
            return path.basename(map, ".ff");
        });

        var cleanFolder = function(map) {
            return map.split("/")[0];
        }

        scope.usermaps = glob.sync("*/", {
            "cwd": path.join(cod4dir, "usermaps")
        }).map(cleanFolder);

        scope.othermaps = glob.sync("mp_*/", {
            "cwd": path.join(mw2dir, "mods")
        }).map(cleanFolder);
    }

    if (apply) scope.$apply();
}

var modBuilder = angular.module('modBuilder', ['ngRoute']);
modBuilder.config(
    [
        '$compileProvider',
        function($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
        }
    ]).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'pages/home.html',
            controller: 'mainController'
        }).when('/map', {
            templateUrl: 'pages/map.html',
            controller: 'mapController'
        }).when('/mod', {
            templateUrl: 'pages/mod.html',
            controller: 'modController'
        }).when('/settings', {
            templateUrl: 'pages/settings.html',
            controller: 'settingsController'
        }).when('/about', {
            templateUrl: 'pages/about.html',
            controller: 'aboutController'
        });
    }
]);

modBuilder.controller('mainController', function($scope) {});
modBuilder.controller('mapController', function($scope) {
    loadMaps($scope, false);
    global.registerKeyHandler($scope);
});
modBuilder.controller('modController', function($scope) {});
modBuilder.controller('settingsController', function($scope) {});
modBuilder.controller('aboutController', function($scope) {
    $scope.version = _pack.version;
    $scope.author = _pack.author;
});

$(document).ready(function() {
    var gui = require('nw.gui');
    var win = gui.Window.get();
    win.title = _pack.title;

    if (!win.shown) {
        win.show();
        win.shown = true;
        win.movDir = false;

        win.on('restore', function() {
            win.movDir = !win.movDir;
            win.moveBy((win.movDir ? 1 : -1), 0);
        });
    }

    $(".nav > a").click(function(event) {
        if (!$(this).hasClass("active")) {
            $("a").removeClass("active");
            $(this).addClass("active");
        } else {
            event.preventDefault();
        }
    });

    $("#minimize").click(function() {
        win.minimize();
    });

    $("#close").click(function() {
        win.close();
    });
});

global.setWorking = function(working) {
    if (working) {
        if (!global.isWorking()) {
            $("html").addClass("working");
        }
    } else {
        if (global.isWorking()) {
            $("html").removeClass("working");
        }
    }
};

global.isWorking = function() {
    return $("html").hasClass("working");
};

global.registerKeyHandler = function(scope) {
    if (!global.keyHandlerRegistered) {
        global.keyHandlerRegistered = true;
        $(window).keydown(function(event) {
            if (event.which == 116) {
                loadMaps(scope, true);
            }
        });
    }
}