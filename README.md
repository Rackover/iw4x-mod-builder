# IW4x: Mod-Builder

## How to compile
(Windows only; requires [Node.js](https://nodejs.org) to be installed)

### Production
- Install [Gulp.js](http://gulpjs.com/) via `npm install gulp-cli -g` (required only once)
- Install the dependencies `npm install`
- Build the binary `gulp default`
- The final binary should be in the `build` folder

### Development
- Grab the latest SDK build of [NW.js](https://nwjs.io/)
- Clone this repo inside the extracted nw.js package as `iw4x-mod-builder` (or any folder name you like)
- Install the dependencies via `npm install` in the cloned `iw4x-mod-builder` repo
- Run the app via `nw.exe iw4x-mod-builder`
