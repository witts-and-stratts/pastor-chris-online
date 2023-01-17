/* eslint-disable func-names */
// import 
// const { series, src, dest, watch, parallel } = require("gulp");
import gulp from "gulp";
const { series, src, dest, watch, parallel } = gulp;
import pug from "gulp-pug-3";
import newer from "gulp-newer";
import gutil from "gulp-util";
import plumber from "gulp-plumber";
import notify from "gulp-notify"; 
import bs from "browser-sync";
const browserSync = bs.create();
import gulpSass from "gulp-sass";
import sass2 from "sass";
const sass = gulpSass(sass2);
import autoprefixer from "gulp-autoprefixer";
import sourcemaps from "gulp-sourcemaps";
import iconfont from "gulp-iconfont";
import iconfontCSS from "gulp-iconfont-css";
import imagemin from "gulp-imagemin";
import webpack from "webpack";
import gulpWebpack from "webpack-stream";
import * as webpackConfig from "./webpack.config.js";
// import run from "gulp-run"
/* ---------------------------------------------------------------
 *  Settings
 *  -------------------------------------------------------------*/
// All source files and folders are placed in the "src" directory,
// the processed files will be compiled to the "dist" folder

// The settings below specify the directory for the different
// languages handled by gulp

const settings = {
  pug: {
    src: "src/pug/**/*.pug",
    dest: "dist",
  },
  sass: {
    src: "src/sass/**/*.scss",
    dest: "dist/assets/css",
    includePaths: ["node_modules/foundation-sites/scss"],
    outputStyle: "expanded",
  },
  js: {
    src: "src/ts/**/*.ts",
    dest: "dist/assets/js",
  },
  fonts: {
    src: "src/fonts/**/*.*",
    dest: "dist/assets/fonts",
  },
  img: {
    src: "src/img/**/*.*",
    dest: "dist/assets/img",
  },
  iconfont: {
    src: "src/iconfonts/**/*.*",
    path: "src/icon-font-template.scss",
    dest: "dist/assets/fonts",
    fontName: "iconfonts",
    targetPath: "../../../src/sass/components/iconfonts.scss", // The path where the (S)CSS file should be saved, relative to the path used in gulp.dest() (optional, defaults to _icons.css).
    fontPath: "/assets/fonts/", // Directory of font files relative to generated (S)CSS file (optional, defaults to ./)
  },
};

// Utility Functions -----------------------------------------------------
// Task error handler
const onError = function (error, message) {
  notify({
    title: "Error in Build",
    message,
  }).write(error);

  gutil.log(gutil.colors.bgRed(message));
  this.emit("end");
};

/* ---------------------------------------------------------------
 *  Gulp Tasks
 *  -------------------------------------------------------------*/

/**
 * Pug Task
 * pugTask compiles pug to html
 */
function pugTask() {
  return src([settings.pug.src, "!src/pug/_*/**"]) // exclude files and folders that begins with "_"
    .pipe(
      plumber({
        errorHandler: onError,
      })
    )
    .pipe(pug({ basedir: "src/pug", cache: true, pretty: true }))
    .pipe(dest(settings.pug.dest));
}

/**
 * Typescript Task
 * iconfontTask converts SVG icons to icon fonts
 */
/**---------------------------------------------------------------- */

function typescriptTask() {
  return src(settings.js.src)
    .pipe(gulpWebpack(webpackConfig.config, webpack))
    .pipe(dest(settings.js.dest))
}

/**
 * Iconfont Task
 * iconfontTask converts SVG icons to icon fonts
 */
function iconfontTask() {
  return src(settings.iconfont.src)
    .pipe(
      plumber({
        errorHandler: onError,
      })
    )
    .pipe(
      iconfontCSS({
        path: settings.iconfont.path,
        fontName: settings.iconfont.fontName,
        targetPath: settings.iconfont.targetPath,
        fontPath: settings.iconfont.fontPath,
      })
    )
    .pipe(
      iconfont({
        fontName: settings.iconfont.fontName,
        prependUnicode: true,
        formats: ["ttf", "eot", "woff", "woff2", "svg"],
        timestamp: Math.round(Date.now() / 1000),
        normalize: true,
        fontHeight: 1001,
      })
    )
    .pipe(dest(settings.iconfont.dest))
}

/**
 * Sass Task
 * sassTask compiles sass files to css and auto-inject into open browsers
 */
function sassTask() {
  return src(settings.sass.src)
    .pipe(sourcemaps.init())
    .pipe(
      plumber({
        errorHandler: onError,
      })
    )
    .pipe(
      sass({
        outputStyle: settings.sass.outputStyle,
        includePaths: settings.sass.includePaths,
      })
    )
    .pipe(autoprefixer())
    .pipe(sourcemaps.write("./sass-maps"))
    .pipe(dest(settings.sass.dest))
    .pipe(browserSync.stream())
}

/**
 * Font Task
 * fontTask copies fonts placed in the source directory to the destination directory
 */
function fontTask() {
  return src(settings.fonts.src).pipe(dest(settings.fonts.dest));
}

/**
 * Image Task
 * imageTasks compresses optimises GIF, JPG, PNG and SVG images
 */
function imageTask() {
  return src(settings.img.src)
    .pipe(newer(settings.img.dest))
    .pipe(
      imagemin(
        [
          imagemin.gifsicle({
            interlaced: true,
          }),
          imagemin.mozjpeg({
            progressive: true,
          }),
          imagemin.optipng({
            optimizationLevel: 5,
          }),
          imagemin.svgo({
            plugins: [
              {
                removeViewBox: true,
              },
              {
                cleanupIDs: false,
              },
            ],
          }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(dest(settings.img.dest));
}

browserSync.init({
  server: {
    baseDir: "./dist",
  },
});

function reload(done) {
  browserSync.reload();
  return done();
}

export function build () {
  settings.sass.outputStyle = "compact";
  parallel(sassTask, fontTask, imageTask, iconfontTask);
};

export default {
  // Watch pugfile and transpile
  pug: watch(
    settings.pug.src,
    { ignoreInitial: false, delay: 100 },
    series(pugTask, reload)
  ),

  // Watch sass files
  sass: watch(settings.sass.src, { ignoreInitial: false, delay: 20 }, sassTask),

  // Watch font files
  fonts: watch(
    settings.fonts.src,
    { ignoreInitial: false, delay: 100 },
    fontTask
  ),

  // Watch image files
  image: watch(
    settings.img.src,
    { ignoreInitial: false, delay: 100 },
    imageTask
  ),

  // Watch icon files
  iconFonts: watch(
    settings.iconfont.src,
    { ignoreInitial: false, delay: 100 },
    iconfontTask
  ),

  // Watch JS files and reload
  watchJs: watch(
    settings.js.src,
    { ignoreInitial: false, delay: 100 },
    series(typescriptTask)
  ),

  reload: watch(`${settings.js.dest}/**/*.js`, reload),
};
