const { src, series, dest, watch } = require("gulp");
const imageMin = require("gulp-imagemin");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const browsersync = require("browser-sync");
const sourcemaps = require("gulp-sourcemaps");
const cssDeclarationSorter = require("css-declaration-sorter");
const concat = require("gulp-concat");
const gulpBabel = require("gulp-babel");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const changed = require("gulp-changed");
const eslint = require("gulp-eslint");

function copyFiles() {
  return src("./src/index.html").pipe(dest("dist"));
}

function imageTask() {
  return src("./src/images/*")
    .pipe(changed("./dist/assets/images"))
    .pipe(
      imageMin([
        pngquant({
          quality: [0.6, 0.7], // 画質
          speed: 1, // スピード
        }),
        mozjpeg({ quality: 65 }), // 画質
        imageMin.svgo(),
        imageMin.optipng(),
        imageMin.gifsicle({ optimizationLevel: 3 }),
      ])
    )
    .pipe(dest("dist/images"));
}

function scssTask() {
  return src("./src/sass/style.scss")
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([cssnano(), autoprefixer(), cssDeclarationSorter()]))
    .pipe(sourcemaps.write("."))
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(dest("./dist/css"));
}

function jsTask() {
  return src("./src/js/*")
    .pipe(sourcemaps.init())
    .pipe(gulpBabel())
    .pipe(terser())
    .pipe(concat("bundle.js"))
    .pipe(sourcemaps.write("."))
    .pipe(dest("./dist/js"));
}

function lint() {
  return src("./src/js/*")
    .pipe(eslint({ fix: true, useEslintrc: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(dest("./src/js"));
}

function browsersyncServer(cb) {
  browsersync.init({
    server: {
      baseDir: "./src",
    },
  });
  cb();
}

function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

function watchTask() {
  watch("./src/index.html", browsersyncReload);
  watch(
    ["./src/sass/*", "./src/js/*"],
    series(scssTask, jsTask, browsersyncReload)
  );
}

exports.default = series(
  copyFiles,
  imageTask,
  scssTask,
  jsTask,
  lint,
  browsersyncServer,
  watchTask
);
