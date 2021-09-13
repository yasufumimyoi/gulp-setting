const { src, series, parallel, dest, watch } = require("gulp");
const imageMin = require("gulp-imagemin");

function copyFiles() {
  return src("./src/index.html").pipe(dest("dist"));
}

function imageTask() {
  return src("./src/images/*").pipe(imageMin()).pipe(dest("dist/images"));
}

exports.copyFiles = copyFiles;
exports.imageTask = imageTask;
exports.default = copyFiles;
