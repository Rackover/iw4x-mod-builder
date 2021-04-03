(function () {
  var request = require('request');
  var urljoin = require('url-join');

  // TODO: Keep in sync with the client
  var urls = [
    "https://iw4x.org",
    "https://iw4xcachep26muba.onion.to",
    "https://iw4xcachep26muba.tor2web.xyz",
    "https://iw4xcachep26muba.onion.ws",
    "https://iw4xcachep26muba.onion.sh",
    "https://iw4xcachep26muba.onion.pet",
  ];

  // Doesn't work yet, in the client it does :(
  //var j = request.jar();
  //j.setCookie(request.cookie("disclaimer_accepted=1"), "https://www.onion.casa");
  //j.setCookie(request.cookie("disclaimer_accepted=1"), "https://www.hiddenservice.net");
  //var request = request.defaults({jar: j});

  global.getCache = function (path, callback, binary) {
    if (global.cacheUrl) {
      var options = {
        url: urljoin(global.cacheUrl, path)
      };

      if (binary) {
        options.encoding = null;
      }

      request(options, callback);
    }
    else {
      var index = 0;
      if (index >= urls.length) return;

      var urlIterator = function (error, response, body) {
        if (error) {
          console.error(error);

          if (index >= urls.length) {
            console.error("No more urls to query!");
            return;
          }

          request(urljoin(urls[++index], path), urlIterator);
        }
        else {
          global.cacheUrl = urls[index];
          callback(error, response, body);
        }
      };

      request(urljoin(urls[index], path), urlIterator);
    }
  };
})();
