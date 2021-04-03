const { series } = require('gulp');

function performTask(cb, task) {
  require('./' + task).build(cb);
}

function css(cb) {
  performTask(cb, 'css');
}

function nw(cb) {
  performTask(cb, 'nw');
}

function evb(cb) {
  performTask(cb, 'evb');
}

exports.build = series(css, nw, evb);
